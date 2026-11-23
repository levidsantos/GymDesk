const express = require('express')
const router  = express.Router()
const { getDatabase, expireMaturedEnrollments } = require('../database/db')

// ── Horários de funcionamento ────────────────────────────────────────────────
// dayOfWeek: 0=domingo, 1=segunda … 6=sábado
// null = fechado; [open, close] em minutos desde 00:00 (close exclusivo)

const SCHEDULE = {
  power: {
    0: null,                // domingo: fechado
    1: [300, 1260],         // seg: 05:00–21:00
    2: [300, 1260],
    3: [300, 1260],
    4: [300, 1260],
    5: [300, 1260],
    6: [480, 720],          // sáb: 08:00–12:00
  },
  evolution: {
    0: [480, 720],          // dom: 08:00–12:00
    1: [300, 1260],         // seg: 05:00–21:00
    2: [300, 1260],
    3: [300, 1260],
    4: [300, 1260],
    5: [300, 1260],
    6: [420, 780],          // sáb: 07:00–13:00
  },
}

// Converte hora e minuto em minutos desde 00:00
function toMinutes(h, m) { return h * 60 + m }

function isUnitOpen(unitSlug, dayOfWeek, minutes) {
  const slot = SCHEDULE[unitSlug]?.[dayOfWeek]
  if (!slot) return false
  return minutes >= slot[0] && minutes < slot[1]
}

function formatSlot(slot) {
  if (!slot) return 'Fechado'
  const fmt = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
  return `${fmt(slot[0])} às ${fmt(slot[1])}`
}

// ── GET /api/access/check ────────────────────────────────────────────────────
// Query: student_id (obrigatório), unit_slug (obrigatório: power|evolution)
// Opcionais para testes: date (YYYY-MM-DD), time (HH:MM)
router.get('/check', (req, res) => {
  expireMaturedEnrollments()
  const db = getDatabase()
  const { student_id, unit_slug, date, time } = req.query

  if (!student_id || !unit_slug) {
    return res.status(400).json({ error: 'student_id e unit_slug são obrigatórios.' })
  }
  if (!['power', 'evolution'].includes(unit_slug)) {
    return res.status(400).json({ error: 'unit_slug deve ser "power" ou "evolution".' })
  }

  // Data/hora: parâmetros simulados só para admins
  const now = new Date()
  let dayOfWeek, minutes, dateISO

  if (date && time && req.role === 'admin') {
    const [y, m, d] = date.split('-').map(Number)
    const dt = new Date(y, m - 1, d)
    dayOfWeek = dt.getDay()
    const [hh, mm] = time.split(':').map(Number)
    minutes = toMinutes(hh, mm)
    dateISO = date
  } else {
    dayOfWeek = now.getDay()
    minutes   = toMinutes(now.getHours(), now.getMinutes())
    dateISO   = now.toISOString().slice(0, 10)
  }

  const unitNames = { power: 'Muscle Power', evolution: 'Muscle Evolution' }
  const dayNames  = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

  const base = {
    unit_slug,
    unit_name:  unitNames[unit_slug],
    checked_at: { date: dateISO, day: dayNames[dayOfWeek], minutes },
  }

  // 1. Verifica aluno
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(student_id)
  if (!student) {
    return res.json({ ...base, allowed: false, student_name: null, reason: 'Aluno não encontrado.' })
  }
  base.student_name = student.name

  if (student.status === 'inactive') {
    return res.json({ ...base, allowed: false, reason: 'Cadastro do aluno está inativo.' })
  }

  // 2. Verifica matrícula ativa
  const enrollment = db.prepare(`
    SELECT e.*, p.unit_id, u.slug AS origin_slug, u.name AS origin_name
    FROM enrollments e
    JOIN plans p ON p.id = e.plan_id
    JOIN units u ON u.id = p.unit_id
    WHERE e.student_id = ? AND e.status = 'active'
  `).get(student_id)

  if (!enrollment) {
    return res.json({ ...base, allowed: false, reason: 'O aluno não possui matrícula ativa.' })
  }
  base.origin_slug = enrollment.origin_slug
  base.origin_name = enrollment.origin_name

  // 3. Verifica mensalidades vencidas (due_date < hoje, não <=)
  const overdue = db.prepare(`
    SELECT COUNT(*) AS n FROM installments
    WHERE enrollment_id = ? AND status = 'pending' AND due_date < ?
  `).get(enrollment.id, dateISO)

  if (overdue.n > 0) {
    return res.json({
      ...base, allowed: false,
      reason: `O aluno possui ${overdue.n} mensalidade${overdue.n > 1 ? 's' : ''} vencida${overdue.n > 1 ? 's' : ''} e não paga${overdue.n > 1 ? 's' : ''}.`,
    })
  }

  // 4. Verifica horário de funcionamento da unidade pretendida
  if (!isUnitOpen(unit_slug, dayOfWeek, minutes)) {
    const slot = SCHEDULE[unit_slug][dayOfWeek]
    const horario = slot ? formatSlot(slot) : 'Fechado'
    return res.json({
      ...base, allowed: false,
      reason: `${unitNames[unit_slug]} não está em funcionamento. ${dayNames[dayOfWeek]}: ${horario}.`,
    })
  }

  // 5. Verifica permissão de acesso entre unidades
  const originSlug = enrollment.origin_slug
  const targetSlug = unit_slug

  // Evolution pode acessar as duas
  if (originSlug === 'evolution') {
    return res.json({ ...base, allowed: true, reason: 'Acesso autorizado.' })
  }

  // Power acessando Power
  if (originSlug === 'power' && targetSlug === 'power') {
    return res.json({ ...base, allowed: true, reason: 'Acesso autorizado.' })
  }

  // Power acessando Evolution — somente aos domingos
  if (originSlug === 'power' && targetSlug === 'evolution') {
    if (dayOfWeek === 0) {
      return res.json({ ...base, allowed: true, reason: 'Acesso autorizado. Alunos Muscle Power podem utilizar a Muscle Evolution aos domingos.' })
    } else {
      return res.json({
        ...base, allowed: false,
        reason: 'Alunos da Muscle Power só podem acessar a Muscle Evolution aos domingos.',
      })
    }
  }

  return res.json({ ...base, allowed: false, reason: 'Regra de acesso não identificada.' })
})

module.exports = router
