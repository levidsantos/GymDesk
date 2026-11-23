const express = require('express')
const router  = express.Router()
const { getDatabase } = require('../database/db')

// ── Query base de mensalidades ───────────────────────────────────────────────

const installmentQuery = `
  SELECT i.*,
         s.id   AS student_id,
         s.name AS student_name,
         u.id   AS unit_id,
         u.slug AS unit_slug,
         u.name AS unit_name,
         p.name AS plan_name,
         p.monthly_price AS plan_monthly_price,
         e.id   AS enrollment_id
  FROM installments i
  JOIN enrollments e ON e.id = i.enrollment_id
  JOIN students   s ON s.id = e.student_id
  JOIN plans      p ON p.id = e.plan_id
  JOIN units      u ON u.id = p.unit_id
`

function formatInstallment(row, today) {
  const isOverdue = row.status === 'pending' && row.due_date < today
  return {
    id:          row.id,
    competence:  row.competence,
    due_date:    row.due_date,
    amount:      row.amount,
    status:      row.status,
    is_overdue:  isOverdue,
    enrollment_id:      row.enrollment_id,
    student_id:         row.student_id,
    student_name:       row.student_name,
    unit_id:            row.unit_id,
    unit_slug:          row.unit_slug,
    unit_name:          row.unit_name,
    plan_name:          row.plan_name,
    plan_monthly_price: row.plan_monthly_price,
  }
}

// ── GET /api/installments ────────────────────────────────────────────────────
// Query: search (nome do aluno), status (pending|paid|cancelled|overdue|all),
//        unit_id, page, limit
router.get('/installments', (req, res) => {
  const db = getDatabase()
  const today = new Date().toISOString().slice(0, 10)

  const { search = '', status = 'all', unit_id, page = 1, limit = 30 } = req.query

  const pageNum  = Math.max(1, parseInt(page)  || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 30))
  const offset   = (pageNum - 1) * pageSize

  const where  = []
  const params = []

  if (search.trim()) {
    where.push('s.name LIKE ?')
    params.push(`%${search.trim()}%`)
  }

  if (unit_id) {
    where.push('u.id = ?')
    params.push(Number(unit_id))
  }

  // 'overdue' é um status virtual: pending com due_date < hoje
  if (status === 'overdue') {
    where.push("i.status = 'pending' AND i.due_date < ?")
    params.push(today)
  } else if (status !== 'all') {
    where.push('i.status = ?')
    params.push(status)
  }

  const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const countQuery = `
    SELECT COUNT(*) AS n FROM installments i
    JOIN enrollments e ON e.id = i.enrollment_id
    JOIN students   s ON s.id = e.student_id
    JOIN plans      p ON p.id = e.plan_id
    JOIN units      u ON u.id = p.unit_id
    ${clause}
  `
  const total = db.prepare(countQuery).get(...params).n

  const rows = db.prepare(
    `${installmentQuery} ${clause} ORDER BY i.due_date DESC LIMIT ? OFFSET ?`
  ).all(...params, pageSize, offset)

  res.json({
    installments: rows.map(r => formatInstallment(r, today)),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / pageSize),
  })
})

// ── POST /api/installments/:id/pay ───────────────────────────────────────────
router.post('/installments/:id/pay', (req, res) => {
  const db    = getDatabase()
  const today = new Date().toISOString().slice(0, 10)

  const inst = db.prepare(`${installmentQuery} WHERE i.id = ?`).get(req.params.id)
  if (!inst) return res.status(404).json({ error: 'Mensalidade não encontrada.' })

  if (inst.status === 'paid') {
    return res.status(409).json({ error: 'Esta mensalidade já foi paga.' })
  }
  if (inst.status === 'cancelled') {
    return res.status(409).json({ error: 'Não é possível registrar pagamento de mensalidade cancelada.' })
  }

  const { paid_at, amount_paid, notes } = req.body

  if (!paid_at || !amount_paid) {
    return res.status(400).json({ error: 'paid_at e amount_paid são obrigatórios.' })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(paid_at)) {
    return res.status(400).json({ error: 'paid_at deve estar no formato YYYY-MM-DD.' })
  }
  if (typeof amount_paid !== 'number' || amount_paid <= 0) {
    return res.status(400).json({ error: 'amount_paid deve ser um valor positivo.' })
  }

  // Verificação extra de pagamento duplicado (além do UNIQUE na tabela)
  const existing = db.prepare('SELECT 1 FROM payments WHERE installment_id = ?').get(inst.id)
  if (existing) {
    return res.status(409).json({ error: 'Esta mensalidade já possui um pagamento registrado.' })
  }

  const run = db.transaction(() => {
    db.prepare(`
      INSERT INTO payments (installment_id, paid_at, amount_paid, registered_by, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(inst.id, paid_at, amount_paid, req.accountId || null, notes?.trim() || null)

    db.prepare(`UPDATE installments SET status = 'paid' WHERE id = ?`).run(inst.id)
  })
  run()

  const updated = db.prepare(`${installmentQuery} WHERE i.id = ?`).get(inst.id)
  const payment = db.prepare('SELECT * FROM payments WHERE installment_id = ?').get(inst.id)

  res.status(201).json({
    installment: formatInstallment(updated, today),
    payment,
  })
})

// ── GET /api/payments ────────────────────────────────────────────────────────
// Histórico de pagamentos
router.get('/payments', (req, res) => {
  const db = getDatabase()
  const { page = 1, limit = 30 } = req.query

  const pageNum  = Math.max(1, parseInt(page)  || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 30))
  const offset   = (pageNum - 1) * pageSize

  const total = db.prepare('SELECT COUNT(*) AS n FROM payments').get().n

  const rows = db.prepare(`
    SELECT py.*,
           i.competence, i.due_date, i.amount AS installment_amount,
           s.name AS student_name,
           u.name AS unit_name, u.slug AS unit_slug,
           p.name AS plan_name
    FROM payments py
    JOIN installments i ON i.id = py.installment_id
    JOIN enrollments  e ON e.id = i.enrollment_id
    JOIN students     s ON s.id = e.student_id
    JOIN plans        p ON p.id = e.plan_id
    JOIN units        u ON u.id = p.unit_id
    ORDER BY py.paid_at DESC, py.id DESC
    LIMIT ? OFFSET ?
  `).all(pageSize, offset)

  res.json({
    payments: rows.map(r => ({
      id:           r.id,
      installment_id: r.installment_id,
      paid_at:      r.paid_at,
      amount_paid:  r.amount_paid,
      notes:        r.notes ?? null,
      competence:   r.competence,
      due_date:     r.due_date,
      student_name: r.student_name,
      unit_name:    r.unit_name,
      unit_slug:    r.unit_slug,
      plan_name:    r.plan_name,
    })),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / pageSize),
  })
})

module.exports = router
