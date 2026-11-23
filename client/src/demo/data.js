// Dados fictícios de demonstração — espelha seed-demo.js

function addMonths(startDate, offset) {
  const [yyyy, mm, dd] = startDate.split('-').map(Number)
  const rawMonth0 = (mm - 1) + offset
  const targetYear = yyyy + Math.floor(rawMonth0 / 12)
  const targetMon = rawMonth0 % 12
  const lastDay = new Date(targetYear, targetMon + 1, 0).getDate()
  const actualDay = Math.min(dd, lastDay)
  const pad = n => String(n).padStart(2, '0')
  return {
    due_date: `${targetYear}-${pad(targetMon + 1)}-${pad(actualDay)}`,
    competence: `${targetYear}-${pad(targetMon + 1)}`,
  }
}

let _nextId = 1000
function nextId() { return _nextId++ }

export function createDemoData() {
  const units = [
    { id: 1, slug: 'power', name: 'Muscle Power' },
    { id: 2, slug: 'evolution', name: 'Muscle Evolution' },
  ]

  const plans = [
    { id: 1, unit_id: 1, name: 'Mensal', duration_months: 1, monthly_price: 60, unit_slug: 'power', unit_name: 'Muscle Power' },
    { id: 2, unit_id: 1, name: 'Semestral', duration_months: 6, monthly_price: 55, unit_slug: 'power', unit_name: 'Muscle Power' },
    { id: 3, unit_id: 1, name: 'Anual', duration_months: 12, monthly_price: 50, unit_slug: 'power', unit_name: 'Muscle Power' },
    { id: 4, unit_id: 2, name: 'Mensal', duration_months: 1, monthly_price: 100, unit_slug: 'evolution', unit_name: 'Muscle Evolution' },
    { id: 5, unit_id: 2, name: 'Trimestral', duration_months: 3, monthly_price: 95, unit_slug: 'evolution', unit_name: 'Muscle Evolution' },
    { id: 6, unit_id: 2, name: 'Semestral', duration_months: 6, monthly_price: 90, unit_slug: 'evolution', unit_name: 'Muscle Evolution' },
    { id: 7, unit_id: 2, name: 'Anual', duration_months: 12, monthly_price: 85, unit_slug: 'evolution', unit_name: 'Muscle Evolution' },
  ]

  const accounts = []
  const students = []
  const enrollments = []
  const installments = []
  const payments = []

  const adminAccount = { id: nextId(), email: 'admin@email.com', password: 'admin123', role: 'admin', must_change_password: false }
  accounts.push(adminAccount)

  function createStudent({ name, email, phone, birthDate, status = 'active', mustChangePassword = false }) {
    const acc = { id: nextId(), email, password: 'senha123', role: 'student', must_change_password: mustChangePassword }
    accounts.push(acc)
    const stu = { id: nextId(), account_id: acc.id, name, email, phone, birth_date: birthDate, status, created_at: '2026-11-23 10:00:00' }
    students.push(stu)
    return { accountId: acc.id, studentId: stu.id }
  }

  function createEnrollment({ studentId, planId, startDate, endDate, status = 'active', inactivatedAt = null }) {
    const e = { id: nextId(), student_id: studentId, plan_id: planId, start_date: startDate, end_date: endDate, status, inactivated_at: inactivatedAt, created_at: '2026-11-23 10:00:00' }
    enrollments.push(e)
    return e.id
  }

  function createInstallments({ enrollmentId, startDate, durationMonths, monthlyPrice }) {
    const ids = []
    for (let i = 0; i < durationMonths; i++) {
      const { due_date, competence } = addMonths(startDate, i)
      const inst = { id: nextId(), enrollment_id: enrollmentId, competence, due_date, amount: monthlyPrice, status: 'pending' }
      installments.push(inst)
      ids.push(inst.id)
    }
    return ids
  }

  function payInstallment(installmentId, paidAt, amount) {
    const inst = installments.find(i => i.id === installmentId)
    if (inst) inst.status = 'paid'
    payments.push({ id: nextId(), installment_id: installmentId, paid_at: paidAt, amount_paid: amount, registered_by: adminAccount.id, notes: null })
  }

  function cancelInstallment(installmentId) {
    const inst = installments.find(i => i.id === installmentId)
    if (inst) inst.status = 'cancelled'
  }

  // 1. Lucas Ferreira — Power Semestral, ativo, em dia
  const lucas = createStudent({ name: 'Lucas Ferreira', email: 'lucas.ferreira@email.com', phone: '11987654321', birthDate: '1998-03-12' })
  const lucasEnrollId = createEnrollment({ studentId: lucas.studentId, planId: 2, startDate: '2026-07-10', endDate: '2026-12-10' })
  const lucasInst = createInstallments({ enrollmentId: lucasEnrollId, startDate: '2026-07-10', durationMonths: 6, monthlyPrice: 55 })
  payInstallment(lucasInst[0], '2026-07-10', 55)
  payInstallment(lucasInst[1], '2026-08-11', 55)
  payInstallment(lucasInst[2], '2026-09-10', 55)
  payInstallment(lucasInst[3], '2026-10-10', 55)
  payInstallment(lucasInst[4], '2026-11-10', 55)

  // 2. Beatriz Oliveira — Evolution Anual, ativa, em dia
  const beatriz = createStudent({ name: 'Beatriz Oliveira', email: 'beatriz.oliveira@email.com', phone: '21976543210', birthDate: '2001-08-25' })
  const beatrizEnrollId = createEnrollment({ studentId: beatriz.studentId, planId: 7, startDate: '2026-05-01', endDate: '2027-04-01' })
  const beatrizInst = createInstallments({ enrollmentId: beatrizEnrollId, startDate: '2026-05-01', durationMonths: 12, monthlyPrice: 85 })
  for (let i = 0; i < 7; i++) {
    const month = String(5 + i).padStart(2, '0')
    payInstallment(beatrizInst[i], `2026-${month}-01`, 85)
  }

  // 3. Rafael Mendes — Power Mensal, ativo, 1 mensalidade vencida
  const rafael = createStudent({ name: 'Rafael Mendes', email: 'rafael.mendes@email.com', phone: '11965432109', birthDate: '1995-11-30' })
  const rafaelEnroll1 = createEnrollment({ studentId: rafael.studentId, planId: 1, startDate: '2026-09-15', endDate: '2026-09-15', status: 'inactive', inactivatedAt: '2026-10-16 00:00:00' })
  const rafaelInst1 = createInstallments({ enrollmentId: rafaelEnroll1, startDate: '2026-09-15', durationMonths: 1, monthlyPrice: 60 })
  payInstallment(rafaelInst1[0], '2026-09-15', 60)
  const rafaelEnroll2 = createEnrollment({ studentId: rafael.studentId, planId: 1, startDate: '2026-12-01', endDate: '2026-12-01' })
  createInstallments({ enrollmentId: rafaelEnroll2, startDate: '2026-12-01', durationMonths: 1, monthlyPrice: 60 })

  // 4. Juliana Costa — Evolution Trimestral, ativa, em dia
  const juliana = createStudent({ name: 'Juliana Costa', email: 'juliana.costa@email.com', phone: '31998765432', birthDate: '2000-02-14' })
  const julianaEnrollId = createEnrollment({ studentId: juliana.studentId, planId: 5, startDate: '2026-10-01', endDate: '2026-12-01' })
  const julianaInst = createInstallments({ enrollmentId: julianaEnrollId, startDate: '2026-10-01', durationMonths: 3, monthlyPrice: 95 })
  payInstallment(julianaInst[0], '2026-10-01', 95)
  payInstallment(julianaInst[1], '2026-11-01', 95)

  // 5. Thiago Almeida — Power Anual, inativo, histórico preservado
  const thiago = createStudent({ name: 'Thiago Almeida', email: 'thiago.almeida@email.com', phone: '11954321098', birthDate: '1992-06-08', status: 'inactive' })
  const thiagoEnrollId = createEnrollment({ studentId: thiago.studentId, planId: 3, startDate: '2025-08-01', endDate: '2026-07-01', status: 'inactive', inactivatedAt: '2026-07-02 00:00:00' })
  const thiagoInst = createInstallments({ enrollmentId: thiagoEnrollId, startDate: '2025-08-01', durationMonths: 12, monthlyPrice: 50 })
  for (let i = 0; i < 10; i++) {
    const d = addMonths('2025-08-01', i)
    payInstallment(thiagoInst[i], d.due_date, 50)
  }
  cancelInstallment(thiagoInst[10])
  cancelInstallment(thiagoInst[11])

  // 6. Mariana Lopes — sem matrícula, primeiro acesso
  createStudent({ name: 'Mariana Lopes', email: 'mariana.lopes@email.com', phone: '21987651234', birthDate: '2003-12-01', mustChangePassword: true })

  return { units, plans, accounts, students, enrollments, installments, payments, addMonths, nextId }
}
