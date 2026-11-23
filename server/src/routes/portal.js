const express = require('express')
const router  = express.Router()
const { getDatabase } = require('../database/db')

// ── Horários (mesma fonte que access.js) ────────────────────────────────────

const SCHEDULE = {
  power: {
    0: null, 1: [300, 1260], 2: [300, 1260], 3: [300, 1260],
    4: [300, 1260], 5: [300, 1260], 6: [480, 720],
  },
  evolution: {
    0: [480, 720], 1: [300, 1260], 2: [300, 1260], 3: [300, 1260],
    4: [300, 1260], 5: [300, 1260], 6: [420, 780],
  },
}

function toMinutes(h, m) { return h * 60 + m }

function isUnitOpen(slug, dow, mins) {
  const slot = SCHEDULE[slug]?.[dow]
  if (!slot) return false
  return mins >= slot[0] && mins < slot[1]
}

function checkAccess(db, studentId, unitSlug, dateISO, dayOfWeek, minutes) {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId)
  if (!student || student.status === 'inactive') {
    return { allowed: false, reason: 'Cadastro inativo.' }
  }

  const enrollment = db.prepare(`
    SELECT e.*, u.slug AS origin_slug
    FROM enrollments e
    JOIN plans p ON p.id = e.plan_id
    JOIN units u ON u.id = p.unit_id
    WHERE e.student_id = ? AND e.status = 'active'
  `).get(studentId)

  if (!enrollment) {
    return { allowed: false, reason: 'Sem matrícula ativa.' }
  }

  const overdue = db.prepare(`
    SELECT COUNT(*) AS n FROM installments
    WHERE enrollment_id = ? AND status = 'pending' AND due_date < ?
  `).get(enrollment.id, dateISO)

  if (overdue.n > 0) {
    return { allowed: false, reason: `${overdue.n} mensalidade${overdue.n > 1 ? 's' : ''} vencida${overdue.n > 1 ? 's' : ''}.` }
  }

  if (!isUnitOpen(unitSlug, dayOfWeek, minutes)) {
    return { allowed: false, reason: 'Fora do horário de funcionamento.' }
  }

  const origin = enrollment.origin_slug
  if (origin === 'evolution') {
    return { allowed: true, reason: 'Acesso autorizado.' }
  }
  if (origin === 'power' && unitSlug === 'power') {
    return { allowed: true, reason: 'Acesso autorizado.' }
  }
  if (origin === 'power' && unitSlug === 'evolution') {
    if (dayOfWeek === 0) {
      return { allowed: true, reason: 'Acesso autorizado aos domingos.' }
    }
    return { allowed: false, reason: 'Somente aos domingos.' }
  }
  return { allowed: false, reason: 'Regra não identificada.' }
}

// ── Helper: encontra student pelo account_id ────────────────────────────────

function getStudentByAccount(db, accountId) {
  return db.prepare('SELECT * FROM students WHERE account_id = ?').get(accountId)
}

// ── GET /api/portal/home ────────────────────────────────────────────────────

router.get('/home', (req, res) => {
  const db = getDatabase()
  const student = getStudentByAccount(db, req.accountId)

  if (!student) {
    return res.json({ student: null, enrollment: null, finance: null, access: null })
  }

  const today = new Date().toISOString().slice(0, 10)

  const enrollment = db.prepare(`
    SELECT e.*,
           p.name AS plan_name, p.duration_months AS plan_duration,
           p.monthly_price AS plan_monthly_price,
           u.slug AS unit_slug, u.name AS unit_name
    FROM enrollments e
    JOIN plans p ON p.id = e.plan_id
    JOIN units u ON u.id = p.unit_id
    WHERE e.student_id = ? AND e.status = 'active'
  `).get(student.id)

  let finance = null
  if (enrollment) {
    const overdueCount = db.prepare(`
      SELECT COUNT(*) AS n FROM installments
      WHERE enrollment_id = ? AND status = 'pending' AND due_date < ?
    `).get(enrollment.id, today).n

    const overdueAmount = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) AS total FROM installments
      WHERE enrollment_id = ? AND status = 'pending' AND due_date < ?
    `).get(enrollment.id, today).total

    const nextPending = db.prepare(`
      SELECT * FROM installments
      WHERE enrollment_id = ? AND status = 'pending' AND due_date >= ?
      ORDER BY due_date ASC LIMIT 1
    `).get(enrollment.id, today)

    finance = { overdue_count: overdueCount, overdue_amount: overdueAmount, next_pending: nextPending }
  }

  let access = null
  if (enrollment) {
    const now = new Date()
    const dow = now.getDay()
    const mins = toMinutes(now.getHours(), now.getMinutes())
    const dateISO = now.toISOString().slice(0, 10)

    access = {
      power:     checkAccess(db, student.id, 'power', dateISO, dow, mins),
      evolution: checkAccess(db, student.id, 'evolution', dateISO, dow, mins),
    }
  }

  res.json({
    student: { id: student.id, name: student.name, status: student.status },
    enrollment: enrollment ? {
      id: enrollment.id,
      plan_name: enrollment.plan_name,
      plan_duration: enrollment.plan_duration,
      plan_monthly_price: enrollment.plan_monthly_price,
      unit_slug: enrollment.unit_slug,
      unit_name: enrollment.unit_name,
      start_date: enrollment.start_date,
      end_date: enrollment.end_date,
      status: enrollment.status,
    } : null,
    finance,
    access,
  })
})

// ── GET /api/portal/finance ─────────────────────────────────────────────────

router.get('/finance', (req, res) => {
  const db = getDatabase()
  const student = getStudentByAccount(db, req.accountId)

  if (!student) {
    return res.json({ student: null, installments: [], payments: [] })
  }

  const today = new Date().toISOString().slice(0, 10)

  const installments = db.prepare(`
    SELECT i.*, e.id AS enrollment_id,
           p.name AS plan_name, u.name AS unit_name, u.slug AS unit_slug
    FROM installments i
    JOIN enrollments e ON e.id = i.enrollment_id
    JOIN plans p ON p.id = e.plan_id
    JOIN units u ON u.id = p.unit_id
    WHERE e.student_id = ?
    ORDER BY i.due_date DESC
  `).all(student.id)

  const formatted = installments.map(i => ({
    id:          i.id,
    competence:  i.competence,
    due_date:    i.due_date,
    amount:      i.amount,
    status:      i.status,
    is_overdue:  i.status === 'pending' && i.due_date < today,
    plan_name:   i.plan_name,
    unit_name:   i.unit_name,
    unit_slug:   i.unit_slug,
  }))

  const payments = db.prepare(`
    SELECT py.*, i.competence, i.amount AS installment_amount
    FROM payments py
    JOIN installments i ON i.id = py.installment_id
    JOIN enrollments e ON e.id = i.enrollment_id
    WHERE e.student_id = ?
    ORDER BY py.paid_at DESC
  `).all(student.id)

  res.json({
    student: { id: student.id, name: student.name },
    installments: formatted,
    payments: payments.map(p => ({
      id:          p.id,
      paid_at:     p.paid_at,
      amount_paid: p.amount_paid,
      competence:  p.competence,
      notes:       p.notes ?? null,
    })),
  })
})

// ── GET /api/portal/access ──────────────────────────────────────────────────

router.get('/access', (req, res) => {
  const db = getDatabase()
  const student = getStudentByAccount(db, req.accountId)

  if (!student) {
    return res.json({ student: null, enrollment: null, access: null, overdue_count: 0 })
  }

  const now = new Date()
  const dow = now.getDay()
  const mins = toMinutes(now.getHours(), now.getMinutes())
  const dateISO = now.toISOString().slice(0, 10)

  const enrollment = db.prepare(`
    SELECT e.*,
           p.name AS plan_name, p.monthly_price AS plan_monthly_price,
           u.slug AS unit_slug, u.name AS unit_name
    FROM enrollments e
    JOIN plans p ON p.id = e.plan_id
    JOIN units u ON u.id = p.unit_id
    WHERE e.student_id = ? AND e.status = 'active'
  `).get(student.id)

  let overdueCount = 0
  let nextPending = null
  if (enrollment) {
    overdueCount = db.prepare(`
      SELECT COUNT(*) AS n FROM installments
      WHERE enrollment_id = ? AND status = 'pending' AND due_date < ?
    `).get(enrollment.id, dateISO).n

    nextPending = db.prepare(`
      SELECT due_date FROM installments
      WHERE enrollment_id = ? AND status = 'pending' AND due_date >= ?
      ORDER BY due_date ASC LIMIT 1
    `).get(enrollment.id, dateISO)
  }

  let access = null
  if (enrollment) {
    access = {
      power:     checkAccess(db, student.id, 'power', dateISO, dow, mins),
      evolution: checkAccess(db, student.id, 'evolution', dateISO, dow, mins),
    }
  }

  res.json({
    student: { id: student.id, name: student.name },
    enrollment: enrollment ? {
      plan_name: enrollment.plan_name,
      plan_monthly_price: enrollment.plan_monthly_price,
      unit_slug: enrollment.unit_slug,
      unit_name: enrollment.unit_name,
    } : null,
    overdue_count: overdueCount,
    next_pending_due: nextPending?.due_date ?? null,
    access,
  })
})

module.exports = router
