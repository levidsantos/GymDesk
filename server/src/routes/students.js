const express = require('express')
const router  = express.Router()
const { getDatabase } = require('../database/db')

// ── Helpers ─────────────────────────────────────────────────────────────────

function isEmailTaken(db, email, excludeStudentId = null) {
  const inAccounts = db.prepare(
    'SELECT 1 FROM accounts WHERE email = ?'
  ).get(email)
  if (inAccounts) return true

  const inStudents = excludeStudentId
    ? db.prepare('SELECT 1 FROM students WHERE email = ? AND id != ?').get(email, excludeStudentId)
    : db.prepare('SELECT 1 FROM students WHERE email = ?').get(email)
  return !!inStudents
}

function formatStudent(row) {
  return {
    id:         row.id,
    name:       row.name,
    email:      row.email      ?? null,
    phone:      row.phone      ?? null,
    birth_date: row.birth_date ?? null,
    status:     row.status,
    account_id: row.account_id ?? null,
    created_at: row.created_at,
  }
}

// ── GET /api/students ────────────────────────────────────────────────────────
// Query: search (nome ou e-mail), status (active|inactive|all), page, limit
router.get('/', (req, res) => {
  const db = getDatabase()
  const { search = '', status = 'active', page = 1, limit = 20 } = req.query

  const pageNum  = Math.max(1, parseInt(page)  || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 20))
  const offset   = (pageNum - 1) * pageSize

  let where = []
  let params = []

  if (status !== 'all') {
    where.push('s.status = ?')
    params.push(status === 'inactive' ? 'inactive' : 'active')
  }
  if (search.trim()) {
    where.push('(s.name LIKE ? OR s.email LIKE ?)')
    const term = `%${search.trim()}%`
    params.push(term, term)
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const total = db.prepare(
    `SELECT COUNT(*) AS n FROM students s ${whereClause}`
  ).get(...params).n

  const rows = db.prepare(
    `SELECT s.* FROM students s ${whereClause} ORDER BY s.name ASC LIMIT ? OFFSET ?`
  ).all(...params, pageSize, offset)

  res.json({
    students:   rows.map(formatStudent),
    total,
    page:       pageNum,
    totalPages: Math.ceil(total / pageSize),
  })
})

// ── GET /api/students/:id ────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const db  = getDatabase()
  const row = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Aluno não encontrado.' })
  res.json({ student: formatStudent(row) })
})

// ── POST /api/students ───────────────────────────────────────────────────────
router.post('/', (req, res) => {
  const db = getDatabase()
  const { name, email, phone, birth_date } = req.body

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'O nome é obrigatório.' })
  }

  const normalizedEmail = email?.trim().toLowerCase() || null

  if (normalizedEmail && isEmailTaken(db, normalizedEmail)) {
    return res.status(409).json({ error: 'Este e-mail já está em uso.' })
  }

  const result = db.prepare(`
    INSERT INTO students (name, email, phone, birth_date)
    VALUES (?, ?, ?, ?)
  `).run(name.trim(), normalizedEmail, phone?.trim() || null, birth_date || null)

  const created = db.prepare('SELECT * FROM students WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json({ student: formatStudent(created) })
})

// ── PUT /api/students/:id ────────────────────────────────────────────────────
router.put('/:id', (req, res) => {
  const db  = getDatabase()
  const row = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Aluno não encontrado.' })

  const { name, email, phone, birth_date } = req.body

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'O nome é obrigatório.' })
  }

  const normalizedEmail = email?.trim().toLowerCase() || null

  if (normalizedEmail && isEmailTaken(db, normalizedEmail, row.id)) {
    return res.status(409).json({ error: 'Este e-mail já está em uso.' })
  }

  // Se o aluno tem conta vinculada e o e-mail mudou, atualiza accounts também
  const updateStudent = db.prepare(`
    UPDATE students SET name = ?, email = ?, phone = ?, birth_date = ?
    WHERE id = ?
  `)
  const updateAccount = db.prepare(`
    UPDATE accounts SET email = ? WHERE id = ?
  `)

  const run = db.transaction(() => {
    updateStudent.run(name.trim(), normalizedEmail, phone?.trim() || null, birth_date || null, row.id)
    if (row.account_id && normalizedEmail && normalizedEmail !== row.email) {
      updateAccount.run(normalizedEmail, row.account_id)
    }
  })
  run()

  const updated = db.prepare('SELECT * FROM students WHERE id = ?').get(row.id)
  res.json({ student: formatStudent(updated) })
})

// ── PATCH /api/students/:id/inactivate ──────────────────────────────────────
router.patch('/:id/inactivate', (req, res) => {
  const db  = getDatabase()
  const row = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Aluno não encontrado.' })
  if (row.status === 'inactive') {
    return res.status(409).json({ error: 'O aluno já está inativo.' })
  }

  const today = new Date().toISOString().slice(0, 10)

  const run = db.transaction(() => {
    db.prepare("UPDATE students SET status = 'inactive' WHERE id = ?").run(row.id)

    const activeEnrollment = db.prepare(
      "SELECT id FROM enrollments WHERE student_id = ? AND status = 'active'"
    ).get(row.id)

    if (activeEnrollment) {
      db.prepare(`
        UPDATE enrollments SET status = 'inactive', inactivated_at = datetime('now')
        WHERE id = ?
      `).run(activeEnrollment.id)

      db.prepare(`
        UPDATE installments SET status = 'cancelled'
        WHERE enrollment_id = ? AND status = 'pending' AND due_date > ?
      `).run(activeEnrollment.id, today)
    }
  })
  run()

  const updated = db.prepare('SELECT * FROM students WHERE id = ?').get(row.id)
  res.json({ student: formatStudent(updated) })
})

// ── PATCH /api/students/:id/reactivate ─────────────────────────────────────
router.patch('/:id/reactivate', (req, res) => {
  const db  = getDatabase()
  const row = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Aluno não encontrado.' })
  if (row.status === 'active') {
    return res.status(409).json({ error: 'O aluno já está ativo.' })
  }

  db.prepare("UPDATE students SET status = 'active' WHERE id = ?").run(row.id)

  const updated = db.prepare('SELECT * FROM students WHERE id = ?').get(row.id)
  res.json({ student: formatStudent(updated) })
})

module.exports = router
