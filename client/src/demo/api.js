// Mock API para modo demonstrativo — simula todos os endpoints do backend

import { createDemoData } from './data.js'

let db = createDemoData()
let currentAccount = null

function today() { return new Date().toISOString().slice(0, 10) }

function delay(ms = 150) {
  return new Promise(r => setTimeout(r, ms))
}

function ok(data) { return { ok: true, status: 200, data } }
function created(data) { return { ok: true, status: 201, data } }
function err(status, error) { return { ok: false, status, data: { error } } }

function getEnrollmentWithPlan(enrollmentId) {
  const e = db.enrollments.find(x => x.id === enrollmentId)
  if (!e) return null
  const p = db.plans.find(x => x.id === e.plan_id)
  return { ...e, plan_name: p.name, plan_duration: p.duration_months, plan_monthly_price: p.monthly_price, unit_id: p.unit_id, unit_slug: p.unit_slug, unit_name: p.unit_name }
}

function getActiveEnrollment(studentId) {
  return db.enrollments.find(e => e.student_id === studentId && e.status === 'active') || null
}

function countOverdue(enrollmentId) {
  const t = today()
  return db.installments.filter(i => i.enrollment_id === enrollmentId && i.status === 'pending' && i.due_date < t).length
}

function sumOverdue(enrollmentId) {
  const t = today()
  return db.installments.filter(i => i.enrollment_id === enrollmentId && i.status === 'pending' && i.due_date < t).reduce((s, i) => s + i.amount, 0)
}

function expireMaturedEnrollments() {
  const t = today()
  db.enrollments.forEach(e => {
    if (e.status === 'active' && e.end_date < t) {
      e.status = 'inactive'
      e.inactivated_at = t + ' 00:00:00'
    }
  })
}

// ── Horários ────────────────────────────────────────────────────────────────

const SCHEDULE = {
  power: { 0: null, 1: [300, 1260], 2: [300, 1260], 3: [300, 1260], 4: [300, 1260], 5: [300, 1260], 6: [480, 720] },
  evolution: { 0: [480, 720], 1: [300, 1260], 2: [300, 1260], 3: [300, 1260], 4: [300, 1260], 5: [300, 1260], 6: [420, 780] },
}

function isUnitOpen(slug, dow, mins) {
  const slot = SCHEDULE[slug]?.[dow]
  if (!slot) return false
  return mins >= slot[0] && mins < slot[1]
}

function formatSlot(slot) {
  if (!slot) return 'Fechado'
  const fmt = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
  return `${fmt(slot[0])} às ${fmt(slot[1])}`
}

function checkAccess(studentId, unitSlug, dateISO, dayOfWeek, minutes) {
  const student = db.students.find(s => s.id === studentId)
  if (!student || student.status === 'inactive') return { allowed: false, reason: 'Cadastro inativo.' }

  const enrollment = getActiveEnrollment(studentId)
  if (!enrollment) return { allowed: false, reason: 'Sem matrícula ativa.' }

  const plan = db.plans.find(p => p.id === enrollment.plan_id)
  const originSlug = plan.unit_slug

  const overdue = countOverdue(enrollment.id)
  if (overdue > 0) return { allowed: false, reason: `${overdue} mensalidade${overdue > 1 ? 's' : ''} vencida${overdue > 1 ? 's' : ''}.` }

  if (!isUnitOpen(unitSlug, dayOfWeek, minutes)) return { allowed: false, reason: 'Fora do horário de funcionamento.' }

  if (originSlug === 'evolution') return { allowed: true, reason: 'Acesso autorizado.' }
  if (originSlug === 'power' && unitSlug === 'power') return { allowed: true, reason: 'Acesso autorizado.' }
  if (originSlug === 'power' && unitSlug === 'evolution') {
    if (dayOfWeek === 0) return { allowed: true, reason: 'Acesso autorizado aos domingos.' }
    return { allowed: false, reason: 'Somente aos domingos.' }
  }
  return { allowed: false, reason: 'Regra não identificada.' }
}

// ── Roteador ────────────────────────────────────────────────────────────────

const routes = {}

function match(method, path) {
  const key = `${method} ${path}`
  for (const [pattern, handler] of Object.entries(routes)) {
    const [pMethod, pPath] = pattern.split(' ', 2)
    if (pMethod !== method) continue
    const regex = new RegExp('^' + pPath.replace(/:([^/]+)/g, '(?<$1>[^/]+)') + '$')
    const m = key.match(new RegExp('^' + method + ' '))
    if (!m) continue
    const urlPath = key.slice(method.length + 1)
    const match = urlPath.match(regex)
    if (match) return { handler, params: match.groups || {} }
  }
  return null
}

function route(method, path, handler) {
  routes[`${method} ${path}`] = handler
}

// ── POST /auth/login ────────────────────────────────────────────────────────

route('POST', '/auth/login', (body) => {
  const { email, password } = body
  if (!email || !password) return err(400, 'E-mail e senha são obrigatórios.')

  const account = db.accounts.find(a => a.email === email.trim().toLowerCase())
  if (!account || account.password !== password) return err(401, 'E-mail ou senha incorretos.')

  currentAccount = account

  const responseData = { id: account.id, email: account.email, role: account.role, must_change_password: account.must_change_password }

  if (account.role === 'student') {
    const student = db.students.find(s => s.account_id === account.id)
    if (student) {
      responseData.student_id = student.id
      responseData.student_name = student.name
      const enrollment = getActiveEnrollment(student.id)
      if (enrollment) {
        const plan = db.plans.find(p => p.id === enrollment.plan_id)
        responseData.unit_slug = plan.unit_slug
        responseData.unit_name = plan.unit_name
        responseData.plan_name = plan.name
      } else {
        responseData.unit_slug = null
        responseData.unit_name = null
        responseData.plan_name = null
      }
    }
  }

  return ok({ account: responseData })
})

// ── POST /auth/logout ───────────────────────────────────────────────────────

route('POST', '/auth/logout', () => {
  currentAccount = null
  return ok({ ok: true })
})

// ── GET /auth/me ────────────────────────────────────────────────────────────

route('GET', '/auth/me', () => {
  if (!currentAccount) return err(401, 'Não autenticado.')

  const responseData = { id: currentAccount.id, email: currentAccount.email, role: currentAccount.role, must_change_password: currentAccount.must_change_password }

  if (currentAccount.role === 'student') {
    const student = db.students.find(s => s.account_id === currentAccount.id)
    if (student) {
      responseData.student_id = student.id
      responseData.student_name = student.name
      const enrollment = getActiveEnrollment(student.id)
      if (enrollment) {
        const plan = db.plans.find(p => p.id === enrollment.plan_id)
        responseData.unit_slug = plan.unit_slug
        responseData.unit_name = plan.unit_name
        responseData.plan_name = plan.name
      } else {
        responseData.unit_slug = null
        responseData.unit_name = null
        responseData.plan_name = null
      }
    }
  }

  return ok({ account: responseData })
})

// ── POST /auth/change-password ──────────────────────────────────────────────

route('POST', '/auth/change-password', (body) => {
  if (!currentAccount) return err(401, 'Não autenticado.')
  const { new_password } = body
  if (!new_password || new_password.length < 6) return err(400, 'A nova senha deve ter pelo menos 6 caracteres.')

  currentAccount.password = new_password
  currentAccount.must_change_password = false
  return ok({ ok: true })
})

// ── GET /dashboard ──────────────────────────────────────────────────────────

route('GET', '/dashboard', () => {
  expireMaturedEnrollments()
  const t = today()
  const currentMonth = t.slice(0, 7)

  const activeStudents = db.students.filter(s => s.status === 'active').length
  const activeEnrollments = db.enrollments.filter(e => e.status === 'active').length

  const monthPaymentsArr = db.payments.filter(p => p.paid_at >= currentMonth + '-01' && p.paid_at < currentMonth + '-32')
  const monthPayments = { count: monthPaymentsArr.length, total: monthPaymentsArr.reduce((s, p) => s + p.amount_paid, 0), month: currentMonth }

  const overdueInst = db.installments.filter(i => i.status === 'pending' && i.due_date < t)
  const overdue = { count: overdueInst.length, total: overdueInst.reduce((s, i) => s + i.amount, 0) }

  const unitStatsMap = {}
  db.enrollments.forEach(e => {
    const plan = db.plans.find(p => p.id === e.plan_id)
    const key = plan.unit_slug
    if (!unitStatsMap[key]) unitStatsMap[key] = { slug: key, name: plan.unit_name, total: 0, active: 0, inactive: 0 }
    unitStatsMap[key].total++
    if (e.status === 'active') unitStatsMap[key].active++
    else unitStatsMap[key].inactive++
  })
  const unit_stats = Object.values(unitStatsMap).sort((a, b) => a.slug.localeCompare(b.slug))

  const pendingInst = db.installments.filter(i => i.status === 'pending').sort((a, b) => a.due_date.localeCompare(b.due_date)).slice(0, 10)
  const attention = pendingInst.map(i => {
    const e = db.enrollments.find(en => en.id === i.enrollment_id)
    const s = db.students.find(st => st.id === e.student_id)
    const plan = db.plans.find(p => p.id === e.plan_id)
    return { id: i.id, student_name: s.name, unit_name: plan.unit_name, unit_slug: plan.unit_slug, competence: i.competence, due_date: i.due_date, amount: i.amount, is_overdue: i.due_date < t }
  })

  return ok({ active_students: activeStudents, active_enrollments: activeEnrollments, month_payments: monthPayments, overdue, unit_stats, attention, reference_date: t })
})

// ── GET /students ───────────────────────────────────────────────────────────

route('GET', '/students', (_body, query) => {
  const { search = '', status = 'active', page = '1', limit = '20' } = query
  const pageNum = Math.max(1, parseInt(page) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 20))

  let filtered = [...db.students]
  if (status !== 'all') filtered = filtered.filter(s => s.status === (status === 'inactive' ? 'inactive' : 'active'))
  if (search.trim()) {
    const term = search.trim().toLowerCase()
    filtered = filtered.filter(s => s.name.toLowerCase().includes(term) || (s.email && s.email.toLowerCase().includes(term)))
  }

  filtered.sort((a, b) => a.name.localeCompare(b.name))
  const total = filtered.length
  const start = (pageNum - 1) * pageSize
  const students = filtered.slice(start, start + pageSize).map(s => ({
    id: s.id, name: s.name, email: s.email, phone: s.phone, birth_date: s.birth_date, status: s.status, account_id: s.account_id, created_at: s.created_at,
  }))

  return ok({ students, total, page: pageNum, totalPages: Math.ceil(total / pageSize) })
})

// ── GET /students/:id ───────────────────────────────────────────────────────

route('GET', '/students/:id', (_body, _query, params) => {
  const student = db.students.find(s => s.id === Number(params.id))
  if (!student) return err(404, 'Aluno não encontrado.')
  return ok({ student: { id: student.id, name: student.name, email: student.email, phone: student.phone, birth_date: student.birth_date, status: student.status, account_id: student.account_id, created_at: student.created_at } })
})

// ── POST /students ──────────────────────────────────────────────────────────

route('POST', '/students', (body) => {
  const { name, email, phone, birth_date } = body
  if (!name || !name.trim()) return err(400, 'O nome é obrigatório.')

  const normalizedEmail = email?.trim().toLowerCase() || null
  if (normalizedEmail) {
    const taken = db.accounts.some(a => a.email === normalizedEmail) || db.students.some(s => s.email === normalizedEmail)
    if (taken) return err(409, 'Este e-mail já está em uso.')
  }

  const student = { id: db.nextId(), name: name.trim(), email: normalizedEmail, phone: phone?.trim() || null, birth_date: birth_date || null, status: 'active', account_id: null, created_at: new Date().toISOString().replace('T', ' ').slice(0, 19) }
  db.students.push(student)
  return created({ student })
})

// ── PUT /students/:id ───────────────────────────────────────────────────────

route('PUT', '/students/:id', (body, _query, params) => {
  const student = db.students.find(s => s.id === Number(params.id))
  if (!student) return err(404, 'Aluno não encontrado.')

  const { name, email, phone, birth_date } = body
  if (!name || !name.trim()) return err(400, 'O nome é obrigatório.')

  const normalizedEmail = email?.trim().toLowerCase() || null
  if (normalizedEmail) {
    const taken = db.accounts.some(a => a.email === normalizedEmail && a.id !== student.account_id) || db.students.some(s => s.email === normalizedEmail && s.id !== student.id)
    if (taken) return err(409, 'Este e-mail já está em uso.')
  }

  student.name = name.trim()
  student.email = normalizedEmail
  student.phone = phone?.trim() || null
  student.birth_date = birth_date || null

  if (student.account_id && normalizedEmail) {
    const acc = db.accounts.find(a => a.id === student.account_id)
    if (acc) acc.email = normalizedEmail
  }

  return ok({ student: { id: student.id, name: student.name, email: student.email, phone: student.phone, birth_date: student.birth_date, status: student.status, account_id: student.account_id, created_at: student.created_at } })
})

// ── PATCH /students/:id/inactivate ──────────────────────────────────────────

route('PATCH', '/students/:id/inactivate', (_body, _query, params) => {
  const student = db.students.find(s => s.id === Number(params.id))
  if (!student) return err(404, 'Aluno não encontrado.')
  if (student.status === 'inactive') return err(409, 'O aluno já está inativo.')

  const t = today()
  student.status = 'inactive'

  const enrollment = getActiveEnrollment(student.id)
  if (enrollment) {
    enrollment.status = 'inactive'
    enrollment.inactivated_at = t + ' 00:00:00'
    db.installments.forEach(i => {
      if (i.enrollment_id === enrollment.id && i.status === 'pending' && i.due_date > t) i.status = 'cancelled'
    })
  }

  return ok({ student: { id: student.id, name: student.name, email: student.email, phone: student.phone, birth_date: student.birth_date, status: student.status, account_id: student.account_id, created_at: student.created_at } })
})

// ── PATCH /students/:id/reactivate ──────────────────────────────────────────

route('PATCH', '/students/:id/reactivate', (_body, _query, params) => {
  const student = db.students.find(s => s.id === Number(params.id))
  if (!student) return err(404, 'Aluno não encontrado.')
  if (student.status === 'active') return err(409, 'O aluno já está ativo.')

  student.status = 'active'
  return ok({ student: { id: student.id, name: student.name, email: student.email, phone: student.phone, birth_date: student.birth_date, status: student.status, account_id: student.account_id, created_at: student.created_at } })
})

// ── GET /plans ──────────────────────────────────────────────────────────────

route('GET', '/plans', () => {
  return ok({ plans: db.plans })
})

// ── GET /enrollments ────────────────────────────────────────────────────────

route('GET', '/enrollments', (_body, query) => {
  const { student_id, status = 'all', page = '1', limit = '50' } = query
  const pageNum = Math.max(1, parseInt(page) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 50))

  let filtered = [...db.enrollments]
  if (student_id) filtered = filtered.filter(e => e.student_id === Number(student_id))
  if (status !== 'all') filtered = filtered.filter(e => e.status === status)

  filtered.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  const total = filtered.length
  const start = (pageNum - 1) * pageSize
  const enrollments = filtered.slice(start, start + pageSize).map(e => {
    const plan = db.plans.find(p => p.id === e.plan_id)
    return { id: e.id, student_id: e.student_id, plan_id: e.plan_id, start_date: e.start_date, end_date: e.end_date, status: e.status, inactivated_at: e.inactivated_at, created_at: e.created_at, plan_name: plan.name, plan_duration: plan.duration_months, plan_monthly_price: plan.monthly_price, unit_id: plan.unit_id, unit_slug: plan.unit_slug, unit_name: plan.unit_name }
  })

  return ok({ enrollments, total, page: pageNum, totalPages: Math.ceil(total / pageSize) })
})

// ── POST /enrollments ───────────────────────────────────────────────────────

route('POST', '/enrollments', (body) => {
  const { student_id, plan_id, start_date } = body
  if (!student_id || !plan_id || !start_date) return err(400, 'student_id, plan_id e start_date são obrigatórios.')

  const student = db.students.find(s => s.id === Number(student_id))
  if (!student) return err(404, 'Aluno não encontrado.')
  if (student.status === 'inactive') return err(409, 'Não é possível matricular um aluno inativo.')

  expireMaturedEnrollments()
  const existing = getActiveEnrollment(student.id)
  if (existing) return err(409, 'O aluno já possui uma matrícula ativa.')

  const plan = db.plans.find(p => p.id === Number(plan_id))
  if (!plan) return err(404, 'Plano não encontrado.')

  const { due_date: end_date } = db.addMonths(start_date, plan.duration_months - 1)
  const enrollment = { id: db.nextId(), student_id: student.id, plan_id: plan.id, start_date, end_date, status: 'active', inactivated_at: null, created_at: new Date().toISOString().replace('T', ' ').slice(0, 19) }
  db.enrollments.push(enrollment)

  for (let i = 0; i < plan.duration_months; i++) {
    const { due_date, competence } = db.addMonths(start_date, i)
    db.installments.push({ id: db.nextId(), enrollment_id: enrollment.id, competence, due_date, amount: plan.monthly_price, status: 'pending' })
  }

  return created({ enrollment: { ...enrollment, plan_name: plan.name, plan_duration: plan.duration_months, plan_monthly_price: plan.monthly_price, unit_id: plan.unit_id, unit_slug: plan.unit_slug, unit_name: plan.unit_name } })
})

// ── PATCH /enrollments/:id/inactivate ───────────────────────────────────────

route('PATCH', '/enrollments/:id/inactivate', (_body, _query, params) => {
  const enrollment = db.enrollments.find(e => e.id === Number(params.id))
  if (!enrollment) return err(404, 'Matrícula não encontrada.')
  if (enrollment.status === 'inactive') return err(409, 'A matrícula já está inativa.')

  const t = today()
  enrollment.status = 'inactive'
  enrollment.inactivated_at = t + ' 00:00:00'

  db.installments.forEach(i => {
    if (i.enrollment_id === enrollment.id && i.status === 'pending' && i.due_date > t) i.status = 'cancelled'
  })

  const plan = db.plans.find(p => p.id === enrollment.plan_id)
  return ok({ enrollment: { ...enrollment, plan_name: plan.name, plan_duration: plan.duration_months, plan_monthly_price: plan.monthly_price, unit_id: plan.unit_id, unit_slug: plan.unit_slug, unit_name: plan.unit_name } })
})

// ── POST /accounts ──────────────────────────────────────────────────────────

route('POST', '/accounts', (body) => {
  const { student_id, password } = body
  if (!student_id || !password) return err(400, 'student_id e password são obrigatórios.')
  if (password.length < 6) return err(400, 'A senha deve ter pelo menos 6 caracteres.')

  const student = db.students.find(s => s.id === Number(student_id))
  if (!student) return err(404, 'Aluno não encontrado.')
  if (student.account_id) return err(409, 'Este aluno já possui uma conta.')
  if (!student.email) return err(400, 'O aluno precisa ter um e-mail cadastrado para criar uma conta.')
  if (db.accounts.some(a => a.email === student.email)) return err(409, 'Já existe uma conta com este e-mail.')

  const account = { id: db.nextId(), email: student.email, password, role: 'student', must_change_password: true }
  db.accounts.push(account)
  student.account_id = account.id

  return created({ account: { id: account.id, email: account.email, role: account.role, must_change_password: account.must_change_password, created_at: new Date().toISOString().replace('T', ' ').slice(0, 19) } })
})

// ── GET /installments ───────────────────────────────────────────────────────

route('GET', '/installments', (_body, query) => {
  const t = today()
  const { search = '', status = 'all', unit_id, due_date_from, due_date_to, page = '1', limit = '30' } = query
  const pageNum = Math.max(1, parseInt(page) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 30))

  let items = db.installments.map(i => {
    const e = db.enrollments.find(en => en.id === i.enrollment_id)
    const s = db.students.find(st => st.id === e.student_id)
    const plan = db.plans.find(p => p.id === e.plan_id)
    return { ...i, student_id: s.id, student_name: s.name, unit_id: plan.unit_id, unit_slug: plan.unit_slug, unit_name: plan.unit_name, plan_name: plan.name, plan_monthly_price: plan.monthly_price, enrollment_id: e.id }
  })

  if (search.trim()) {
    const term = search.trim().toLowerCase()
    items = items.filter(i => i.student_name.toLowerCase().includes(term))
  }
  if (unit_id) items = items.filter(i => i.unit_id === Number(unit_id))
  if (due_date_from) items = items.filter(i => i.due_date >= due_date_from)
  if (due_date_to) items = items.filter(i => i.due_date <= due_date_to)
  if (status === 'overdue') items = items.filter(i => i.status === 'pending' && i.due_date < t)
  else if (status !== 'all') items = items.filter(i => i.status === status)

  const summaryItems = [...items]
  const summary = {
    overdue: summaryItems.filter(i => i.status === 'pending' && i.due_date < t).length,
    pending: summaryItems.filter(i => i.status === 'pending' && i.due_date >= t).length,
    paid: summaryItems.filter(i => i.status === 'paid').length,
  }

  items.sort((a, b) => b.due_date.localeCompare(a.due_date))
  const total = items.length
  const start = (pageNum - 1) * pageSize
  const installments = items.slice(start, start + pageSize).map(i => ({
    id: i.id, competence: i.competence, due_date: i.due_date, amount: i.amount, status: i.status,
    is_overdue: i.status === 'pending' && i.due_date < t,
    enrollment_id: i.enrollment_id, student_id: i.student_id, student_name: i.student_name,
    unit_id: i.unit_id, unit_slug: i.unit_slug, unit_name: i.unit_name, plan_name: i.plan_name, plan_monthly_price: i.plan_monthly_price,
  }))

  return ok({ installments, total, page: pageNum, totalPages: Math.ceil(total / pageSize), summary })
})

// ── POST /installments/:id/pay ──────────────────────────────────────────────

route('POST', '/installments/:id/pay', (body, _query, params) => {
  const inst = db.installments.find(i => i.id === Number(params.id))
  if (!inst) return err(404, 'Mensalidade não encontrada.')
  if (inst.status === 'paid') return err(409, 'Esta mensalidade já foi paga.')
  if (inst.status === 'cancelled') return err(409, 'Não é possível registrar pagamento de mensalidade cancelada.')

  const { paid_at, amount_paid, notes } = body
  if (!paid_at || !amount_paid) return err(400, 'paid_at e amount_paid são obrigatórios.')

  inst.status = 'paid'
  const payment = { id: db.nextId(), installment_id: inst.id, paid_at, amount_paid, registered_by: currentAccount?.id || null, notes: notes?.trim() || null }
  db.payments.push(payment)

  const e = db.enrollments.find(en => en.id === inst.enrollment_id)
  const s = db.students.find(st => st.id === e.student_id)
  const plan = db.plans.find(p => p.id === e.plan_id)
  const t = today()

  return created({
    installment: {
      id: inst.id, competence: inst.competence, due_date: inst.due_date, amount: inst.amount, status: inst.status,
      is_overdue: false, enrollment_id: e.id, student_id: s.id, student_name: s.name,
      unit_id: plan.unit_id, unit_slug: plan.unit_slug, unit_name: plan.unit_name, plan_name: plan.name, plan_monthly_price: plan.monthly_price,
    },
    payment,
  })
})

// ── GET /payments ───────────────────────────────────────────────────────────

route('GET', '/payments', (_body, query) => {
  const { search = '', unit_id, paid_at_from, paid_at_to, page = '1', limit = '15' } = query
  const pageNum = Math.max(1, parseInt(page) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 15))

  let items = db.payments.map(p => {
    const inst = db.installments.find(i => i.id === p.installment_id)
    const e = db.enrollments.find(en => en.id === inst.enrollment_id)
    const s = db.students.find(st => st.id === e.student_id)
    const plan = db.plans.find(pl => pl.id === e.plan_id)
    return {
      id: p.id, installment_id: p.installment_id, paid_at: p.paid_at, amount_paid: p.amount_paid, notes: p.notes,
      competence: inst.competence, due_date: inst.due_date, student_name: s.name, unit_name: plan.unit_name, unit_slug: plan.unit_slug, plan_name: plan.name,
      unit_id: plan.unit_id,
    }
  })

  if (search.trim()) {
    const term = search.trim().toLowerCase()
    items = items.filter(i => i.student_name.toLowerCase().includes(term))
  }
  if (unit_id) items = items.filter(i => i.unit_id === Number(unit_id))
  if (paid_at_from) items = items.filter(i => i.paid_at >= paid_at_from)
  if (paid_at_to) items = items.filter(i => i.paid_at <= paid_at_to)

  items.sort((a, b) => b.paid_at.localeCompare(a.paid_at))
  const total = items.length
  const start = (pageNum - 1) * pageSize
  return ok({ payments: items.slice(start, start + pageSize), total, page: pageNum, totalPages: Math.ceil(total / pageSize) })
})

// ── GET /access/check ───────────────────────────────────────────────────────

route('GET', '/access/check', (_body, query) => {
  expireMaturedEnrollments()
  const { student_id, unit_slug, date, time } = query

  if (!student_id || !unit_slug) return err(400, 'student_id e unit_slug são obrigatórios.')
  if (!['power', 'evolution'].includes(unit_slug)) return err(400, 'unit_slug deve ser "power" ou "evolution".')

  const now = new Date()
  let dayOfWeek, minutes, dateISO
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  const unitNames = { power: 'Muscle Power', evolution: 'Muscle Evolution' }

  if (date && time) {
    const [y, m, d] = date.split('-').map(Number)
    const dt = new Date(y, m - 1, d)
    dayOfWeek = dt.getDay()
    const [hh, mm] = time.split(':').map(Number)
    minutes = hh * 60 + mm
    dateISO = date
  } else {
    dayOfWeek = now.getDay()
    minutes = now.getHours() * 60 + now.getMinutes()
    dateISO = now.toISOString().slice(0, 10)
  }

  const base = { unit_slug, unit_name: unitNames[unit_slug], checked_at: { date: dateISO, day: dayNames[dayOfWeek], minutes } }

  const student = db.students.find(s => s.id === Number(student_id))
  if (!student) return ok({ ...base, allowed: false, student_name: null, reason: 'Aluno não encontrado.' })

  base.student_name = student.name
  if (student.status === 'inactive') return ok({ ...base, allowed: false, reason: 'Cadastro do aluno está inativo.' })

  const enrollment = getActiveEnrollment(student.id)
  if (!enrollment) return ok({ ...base, allowed: false, reason: 'O aluno não possui matrícula ativa.' })

  const plan = db.plans.find(p => p.id === enrollment.plan_id)
  base.origin_slug = plan.unit_slug
  base.origin_name = plan.unit_name

  const overdue = countOverdue(enrollment.id)
  if (overdue > 0) return ok({ ...base, allowed: false, reason: `O aluno possui ${overdue} mensalidade${overdue > 1 ? 's' : ''} vencida${overdue > 1 ? 's' : ''} e não paga${overdue > 1 ? 's' : ''}.` })

  if (!isUnitOpen(unit_slug, dayOfWeek, minutes)) {
    const slot = SCHEDULE[unit_slug][dayOfWeek]
    const horario = slot ? formatSlot(slot) : 'Fechado'
    return ok({ ...base, allowed: false, reason: `${unitNames[unit_slug]} não está em funcionamento. ${dayNames[dayOfWeek]}: ${horario}.` })
  }

  const originSlug = plan.unit_slug
  if (originSlug === 'evolution') return ok({ ...base, allowed: true, reason: 'Acesso autorizado.' })
  if (originSlug === 'power' && unit_slug === 'power') return ok({ ...base, allowed: true, reason: 'Acesso autorizado.' })
  if (originSlug === 'power' && unit_slug === 'evolution') {
    if (dayOfWeek === 0) return ok({ ...base, allowed: true, reason: 'Acesso autorizado. Alunos Muscle Power podem utilizar a Muscle Evolution aos domingos.' })
    return ok({ ...base, allowed: false, reason: 'Alunos da Muscle Power só podem acessar a Muscle Evolution aos domingos.' })
  }

  return ok({ ...base, allowed: false, reason: 'Regra de acesso não identificada.' })
})

// ── GET /portal/home ────────────────────────────────────────────────────────

route('GET', '/portal/home', () => {
  if (!currentAccount) return err(401, 'Não autenticado.')
  expireMaturedEnrollments()

  const student = db.students.find(s => s.account_id === currentAccount.id)
  if (!student) {
    const contacts = db.units.map(u => ({ slug: u.slug, name: u.name, phone: u.phone, email: u.email }))
    return ok({ student: null, enrollment: null, finance: null, access: null, contacts })
  }

  const t = today()
  const enrollment = getActiveEnrollment(student.id)

  let enrollmentData = null
  let finance = null
  let access = null

  if (enrollment) {
    const plan = db.plans.find(p => p.id === enrollment.plan_id)
    enrollmentData = { id: enrollment.id, plan_name: plan.name, plan_duration: plan.duration_months, plan_monthly_price: plan.monthly_price, unit_slug: plan.unit_slug, unit_name: plan.unit_name, start_date: enrollment.start_date, end_date: enrollment.end_date, status: enrollment.status }

    const overdueCount = countOverdue(enrollment.id)
    const overdueAmount = sumOverdue(enrollment.id)
    const pendingFuture = db.installments.filter(i => i.enrollment_id === enrollment.id && i.status === 'pending' && i.due_date >= t).sort((a, b) => a.due_date.localeCompare(b.due_date))
    finance = { overdue_count: overdueCount, overdue_amount: overdueAmount, next_pending: pendingFuture[0] || null }

    const now = new Date()
    const dow = now.getDay()
    const mins = now.getHours() * 60 + now.getMinutes()
    const dateISO = now.toISOString().slice(0, 10)
    access = {
      power: checkAccess(student.id, 'power', dateISO, dow, mins),
      evolution: checkAccess(student.id, 'evolution', dateISO, dow, mins),
    }
  }

  let contacts
  if (enrollment) {
    const unit = db.units.find(u => u.slug === enrollmentData.unit_slug)
    contacts = unit ? [{ slug: unit.slug, name: unit.name, phone: unit.phone, email: unit.email }] : []
  } else {
    contacts = db.units.map(u => ({ slug: u.slug, name: u.name, phone: u.phone, email: u.email }))
  }

  return ok({ student: { id: student.id, name: student.name, status: student.status }, enrollment: enrollmentData, finance, access, contacts })
})

// ── GET /portal/finance ─────────────────────────────────────────────────────

route('GET', '/portal/finance', () => {
  if (!currentAccount) return err(401, 'Não autenticado.')
  expireMaturedEnrollments()

  const student = db.students.find(s => s.account_id === currentAccount.id)
  if (!student) return ok({ student: null, installments: [], payments: [] })

  const t = today()
  const studentEnrollments = db.enrollments.filter(e => e.student_id === student.id)
  const enrollmentIds = studentEnrollments.map(e => e.id)

  const instFormatted = db.installments
    .filter(i => enrollmentIds.includes(i.enrollment_id))
    .map(i => {
      const e = db.enrollments.find(en => en.id === i.enrollment_id)
      const plan = db.plans.find(p => p.id === e.plan_id)
      return { id: i.id, competence: i.competence, due_date: i.due_date, amount: i.amount, status: i.status, is_overdue: i.status === 'pending' && i.due_date < t, plan_name: plan.name, unit_name: plan.unit_name, unit_slug: plan.unit_slug }
    })
    .sort((a, b) => b.due_date.localeCompare(a.due_date))

  const studentPayments = db.payments
    .filter(p => {
      const inst = db.installments.find(i => i.id === p.installment_id)
      return inst && enrollmentIds.includes(inst.enrollment_id)
    })
    .map(p => {
      const inst = db.installments.find(i => i.id === p.installment_id)
      return { id: p.id, paid_at: p.paid_at, amount_paid: p.amount_paid, competence: inst.competence, notes: p.notes }
    })
    .sort((a, b) => b.paid_at.localeCompare(a.paid_at))

  return ok({ student: { id: student.id, name: student.name }, installments: instFormatted, payments: studentPayments })
})

// ── GET /portal/access ──────────────────────────────────────────────────────

route('GET', '/portal/access', () => {
  if (!currentAccount) return err(401, 'Não autenticado.')
  expireMaturedEnrollments()

  const student = db.students.find(s => s.account_id === currentAccount.id)
  if (!student) return ok({ student: null, enrollment: null, access: null, overdue_count: 0 })

  const now = new Date()
  const dow = now.getDay()
  const mins = now.getHours() * 60 + now.getMinutes()
  const dateISO = now.toISOString().slice(0, 10)

  const enrollment = getActiveEnrollment(student.id)

  let enrollmentData = null
  let overdueCount = 0
  let access = null

  if (enrollment) {
    const plan = db.plans.find(p => p.id === enrollment.plan_id)
    enrollmentData = { plan_name: plan.name, plan_monthly_price: plan.monthly_price, unit_slug: plan.unit_slug, unit_name: plan.unit_name }
    overdueCount = countOverdue(enrollment.id)

    access = {
      power: checkAccess(student.id, 'power', dateISO, dow, mins),
      evolution: checkAccess(student.id, 'evolution', dateISO, dow, mins),
    }
  }

  const nextPending = enrollment ? db.installments.filter(i => i.enrollment_id === enrollment.id && i.status === 'pending' && i.due_date >= dateISO).sort((a, b) => a.due_date.localeCompare(b.due_date))[0] : null

  return ok({ student: { id: student.id, name: student.name }, enrollment: enrollmentData, overdue_count: overdueCount, next_pending_due: nextPending?.due_date ?? null, access })
})

// ── Executor principal ──────────────────────────────────────────────────────

export async function demoApiFetch(path, options = {}) {
  await delay()

  const method = (options.method || 'GET').toUpperCase()
  const [pathname, queryString] = path.split('?')
  const cleanPath = pathname.replace(/^\/api/, '')

  const query = {}
  if (queryString) {
    for (const pair of queryString.split('&')) {
      const [k, v] = pair.split('=').map(decodeURIComponent)
      query[k] = v
    }
  }

  let body = {}
  if (options.body) {
    try { body = JSON.parse(options.body) } catch {}
  }

  for (const [pattern, handler] of Object.entries(routes)) {
    const [pMethod, pPath] = pattern.split(' ', 2)
    if (pMethod !== method) continue
    const regex = new RegExp('^' + pPath.replace(/:([^/]+)/g, '(?<$1>[^/]+)') + '$')
    const m = cleanPath.match(regex)
    if (m) {
      const result = handler(body, query, m.groups || {})
      if (!result.ok) {
        const error = new Error(result.data.error)
        error.status = result.status
        throw error
      }
      return result.data
    }
  }

  throw new Error(`Demo: rota não implementada ${method} ${cleanPath}`)
}

export function resetDemoData() {
  db = createDemoData()
  currentAccount = null
}
