const express = require('express')
const router  = express.Router()
const { getDatabase, expireMaturedEnrollments } = require('../database/db')

router.get('/', (req, res) => {
  expireMaturedEnrollments()
  const db    = getDatabase()
  const today = new Date().toISOString().slice(0, 10)
  const currentMonth = today.slice(0, 7)

  const activeStudents = db.prepare(
    "SELECT COUNT(*) AS n FROM students WHERE status = 'active'"
  ).get().n

  const activeEnrollments = db.prepare(
    "SELECT COUNT(*) AS n FROM enrollments WHERE status = 'active'"
  ).get().n

  const [cy, cm] = currentMonth.split('-').map(Number)
  const ny = cm === 12 ? cy + 1 : cy
  const nm = cm === 12 ? 1 : cm + 1
  const nextMonth = `${ny}-${String(nm).padStart(2, '0')}-01`

  const monthPayments = db.prepare(`
    SELECT COUNT(*) AS count, COALESCE(SUM(amount_paid), 0) AS total
    FROM payments
    WHERE paid_at >= ? AND paid_at < ?
  `).get(currentMonth + '-01', nextMonth)

  const overdue = db.prepare(`
    SELECT COUNT(*) AS count, COALESCE(SUM(i.amount), 0) AS total
    FROM installments i
    JOIN enrollments e ON e.id = i.enrollment_id
    WHERE i.status = 'pending' AND i.due_date < ?
  `).get(today)

  const unitStats = db.prepare(`
    SELECT u.slug, u.name,
           COUNT(*) AS total,
           SUM(CASE WHEN e.status = 'active' THEN 1 ELSE 0 END) AS active,
           SUM(CASE WHEN e.status = 'inactive' THEN 1 ELSE 0 END) AS inactive
    FROM enrollments e
    JOIN plans p ON p.id = e.plan_id
    JOIN units u ON u.id = p.unit_id
    GROUP BY u.id
    ORDER BY u.id
  `).all()

  const attentionInstallments = db.prepare(`
    SELECT i.id, i.competence, i.due_date, i.amount, i.status,
           s.name AS student_name,
           u.name AS unit_name, u.slug AS unit_slug
    FROM installments i
    JOIN enrollments e ON e.id = i.enrollment_id
    JOIN students s ON s.id = e.student_id
    JOIN plans p ON p.id = e.plan_id
    JOIN units u ON u.id = p.unit_id
    WHERE i.status = 'pending'
    ORDER BY i.due_date ASC
    LIMIT 10
  `).all()

  const formatted = attentionInstallments.map(i => ({
    id:           i.id,
    student_name: i.student_name,
    unit_name:    i.unit_name,
    unit_slug:    i.unit_slug,
    competence:   i.competence,
    due_date:     i.due_date,
    amount:       i.amount,
    is_overdue:   i.due_date < today,
  }))

  res.json({
    active_students:    activeStudents,
    active_enrollments: activeEnrollments,
    month_payments:     { count: monthPayments.count, total: monthPayments.total, month: currentMonth },
    overdue:            { count: overdue.count, total: overdue.total },
    unit_stats:         unitStats,
    attention:          formatted,
    reference_date:     today,
  })
})

module.exports = router
