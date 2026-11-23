const express = require('express')
const router  = express.Router()
const { getDatabase } = require('../database/db')

// ── Utilitários de data ──────────────────────────────────────────────────────

// Calcula due_date e competence a partir de um offset em meses sobre start_date.
// Usa aritmética de string para evitar problemas de timezone com o objeto Date.
function addMonths(startDate, offset) {
  const [yyyy, mm, dd] = startDate.split('-').map(Number)
  const rawMonth0  = (mm - 1) + offset          // meses 0-indexed acumulados
  const targetYear = yyyy + Math.floor(rawMonth0 / 12)
  const targetMon  = (rawMonth0 % 12)           // 0-indexed

  // Último dia do mês alvo
  const lastDay  = new Date(targetYear, targetMon + 1, 0).getDate()
  const actualDay = Math.min(dd, lastDay)

  const pad = n => String(n).padStart(2, '0')
  return {
    due_date:   `${targetYear}-${pad(targetMon + 1)}-${pad(actualDay)}`,
    competence: `${targetYear}-${pad(targetMon + 1)}`,
  }
}

// ── Formato de retorno ───────────────────────────────────────────────────────

function formatEnrollment(row) {
  return {
    id:             row.id,
    student_id:     row.student_id,
    plan_id:        row.plan_id,
    start_date:     row.start_date,
    end_date:       row.end_date,
    status:         row.status,
    inactivated_at: row.inactivated_at ?? null,
    created_at:     row.created_at,
    plan_name:          row.plan_name,
    plan_duration:      row.plan_duration,
    plan_monthly_price: row.plan_monthly_price,
    unit_id:   row.unit_id,
    unit_slug: row.unit_slug,
    unit_name: row.unit_name,
  }
}

const enrollmentQuery = `
  SELECT e.*,
         p.name            AS plan_name,
         p.duration_months AS plan_duration,
         p.monthly_price   AS plan_monthly_price,
         u.id   AS unit_id,
         u.slug AS unit_slug,
         u.name AS unit_name
  FROM enrollments e
  JOIN plans p ON p.id = e.plan_id
  JOIN units u ON u.id = p.unit_id
`

// ── GET /api/enrollments ─────────────────────────────────────────────────────
// Query: student_id, status (active|inactive|all), page, limit
router.get('/', (req, res) => {
  const db = getDatabase()
  const { student_id, status = 'all', page = 1, limit = 50 } = req.query

  const pageNum  = Math.max(1, parseInt(page)  || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 50))
  const offset   = (pageNum - 1) * pageSize

  const where  = []
  const params = []

  if (student_id) { where.push('e.student_id = ?'); params.push(Number(student_id)) }
  if (status !== 'all') { where.push('e.status = ?'); params.push(status) }

  const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const total = db.prepare(
    `SELECT COUNT(*) AS n FROM enrollments e ${clause}`
  ).get(...params).n

  const rows = db.prepare(
    `${enrollmentQuery} ${clause} ORDER BY e.created_at DESC LIMIT ? OFFSET ?`
  ).all(...params, pageSize, offset)

  res.json({
    enrollments: rows.map(formatEnrollment),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / pageSize),
  })
})

// ── GET /api/enrollments/:id ─────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const db  = getDatabase()
  const row = db.prepare(`${enrollmentQuery} WHERE e.id = ?`).get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Matrícula não encontrada.' })

  const installments = db.prepare(
    'SELECT * FROM installments WHERE enrollment_id = ? ORDER BY due_date ASC'
  ).all(row.id)

  res.json({ enrollment: formatEnrollment(row), installments })
})

// ── POST /api/enrollments ────────────────────────────────────────────────────
router.post('/', (req, res) => {
  const db = getDatabase()
  const { student_id, plan_id, start_date } = req.body

  // Validação de presença
  if (!student_id || !plan_id || !start_date) {
    return res.status(400).json({ error: 'student_id, plan_id e start_date são obrigatórios.' })
  }

  // Valida formato de data
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start_date)) {
    return res.status(400).json({ error: 'start_date deve estar no formato YYYY-MM-DD.' })
  }

  // Verifica aluno
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(student_id)
  if (!student) return res.status(404).json({ error: 'Aluno não encontrado.' })
  if (student.status === 'inactive') {
    return res.status(409).json({ error: 'Não é possível matricular um aluno inativo.' })
  }

  // Verifica plano
  const plan = db.prepare(
    'SELECT p.*, u.slug AS unit_slug, u.name AS unit_name FROM plans p JOIN units u ON u.id = p.unit_id WHERE p.id = ?'
  ).get(plan_id)
  if (!plan) return res.status(404).json({ error: 'Plano não encontrado.' })

  // Verifica matrícula ativa existente
  const existing = db.prepare(
    "SELECT id FROM enrollments WHERE student_id = ? AND status = 'active'"
  ).get(student_id)
  if (existing) {
    return res.status(409).json({ error: 'O aluno já possui uma matrícula ativa.' })
  }

  // Calcula end_date = due_date do último mês do plano
  const { due_date: end_date } = addMonths(start_date, plan.duration_months - 1)

  // Transação: cria matrícula + gera todas as mensalidades
  const insertEnrollment = db.prepare(`
    INSERT INTO enrollments (student_id, plan_id, start_date, end_date)
    VALUES (?, ?, ?, ?)
  `)
  const insertInstallment = db.prepare(`
    INSERT INTO installments (enrollment_id, competence, due_date, amount)
    VALUES (?, ?, ?, ?)
  `)

  let enrollmentId
  const run = db.transaction(() => {
    const result = insertEnrollment.run(student_id, plan_id, start_date, end_date)
    enrollmentId = result.lastInsertRowid

    for (let i = 0; i < plan.duration_months; i++) {
      const { due_date, competence } = addMonths(start_date, i)
      insertInstallment.run(enrollmentId, competence, due_date, plan.monthly_price)
    }
  })
  run()

  const created = db.prepare(`${enrollmentQuery} WHERE e.id = ?`).get(enrollmentId)
  res.status(201).json({ enrollment: formatEnrollment(created) })
})

// ── PATCH /api/enrollments/:id/inactivate ────────────────────────────────────
router.patch('/:id/inactivate', (req, res) => {
  const db  = getDatabase()
  const row = db.prepare(`${enrollmentQuery} WHERE e.id = ?`).get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Matrícula não encontrada.' })
  if (row.status === 'inactive') {
    return res.status(409).json({ error: 'A matrícula já está inativa.' })
  }

  const today = new Date().toISOString().slice(0, 10)  // 'YYYY-MM-DD'

  const run = db.transaction(() => {
    db.prepare(`
      UPDATE enrollments
      SET status = 'inactive', inactivated_at = datetime('now')
      WHERE id = ?
    `).run(row.id)

    // Cancela apenas mensalidades futuras pendentes (due_date > hoje)
    db.prepare(`
      UPDATE installments
      SET status = 'cancelled'
      WHERE enrollment_id = ? AND status = 'pending' AND due_date > ?
    `).run(row.id, today)
  })
  run()

  const updated = db.prepare(`${enrollmentQuery} WHERE e.id = ?`).get(row.id)
  res.json({ enrollment: formatEnrollment(updated) })
})

module.exports = router
