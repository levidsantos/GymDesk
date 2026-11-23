/**
 * seed-demo.js — Dados fictícios de demonstração do GymDesk
 *
 * Uso:
 *   node server/src/database/seed-demo.js
 *
 * O que faz:
 *   1. Remove todos os dados de alunos/matrículas/pagamentos existentes
 *   2. Preserva unidades, planos e conta admin
 *   3. Insere 6 alunos fictícios com cenários variados
 *
 * Credenciais de demonstração:
 *   Admin:   admin@email.com / (definida via .env)
 *   Alunos:  <email> / senha123
 *   Mariana Lopes (mariana@email.com) tem must_change_password=1 (primeiro acesso)
 */

const path = require('path')
const bcrypt = require('bcryptjs')

const DB_PATH = path.resolve(__dirname, '../../..', process.env.DB_PATH || 'database/gymdesk.db')
const Database = require('better-sqlite3')
const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

const PASSWORD_HASH = bcrypt.hashSync('senha123', 10)

function addMonths(startDate, offset) {
  const [yyyy, mm, dd] = startDate.split('-').map(Number)
  const rawMonth0  = (mm - 1) + offset
  const targetYear = yyyy + Math.floor(rawMonth0 / 12)
  const targetMon  = (rawMonth0 % 12)
  const lastDay  = new Date(targetYear, targetMon + 1, 0).getDate()
  const actualDay = Math.min(dd, lastDay)
  const pad = n => String(n).padStart(2, '0')
  return {
    due_date:   `${targetYear}-${pad(targetMon + 1)}-${pad(actualDay)}`,
    competence: `${targetYear}-${pad(targetMon + 1)}`,
  }
}

// Planos por slug e nome
function getPlanId(unitSlug, planName) {
  const row = db.prepare(`
    SELECT p.id FROM plans p JOIN units u ON u.id = p.unit_id
    WHERE u.slug = ? AND p.name = ?
  `).get(unitSlug, planName)
  if (!row) throw new Error(`Plano não encontrado: ${unitSlug} / ${planName}`)
  return row.id
}

function getAdminId() {
  const row = db.prepare("SELECT id FROM accounts WHERE role = 'admin' LIMIT 1").get()
  if (!row) throw new Error('Conta admin não encontrada. Execute o seed estrutural primeiro.')
  return row.id
}

function cleanDemoData() {
  db.exec(`
    DELETE FROM payments WHERE installment_id IN (
      SELECT i.id FROM installments i
      JOIN enrollments e ON e.id = i.enrollment_id
      JOIN students s ON s.id = e.student_id
      JOIN accounts a ON a.id = s.account_id
      WHERE a.role = 'student'
    );
    DELETE FROM installments WHERE enrollment_id IN (
      SELECT e.id FROM enrollments e
      JOIN students s ON s.id = e.student_id
      JOIN accounts a ON a.id = s.account_id
      WHERE a.role = 'student'
    );
    DELETE FROM enrollments WHERE student_id IN (
      SELECT s.id FROM students s
      JOIN accounts a ON a.id = s.account_id
      WHERE a.role = 'student'
    );
    DELETE FROM sessions WHERE account_id IN (
      SELECT id FROM accounts WHERE role = 'student'
    );
    DELETE FROM students WHERE account_id IN (
      SELECT id FROM accounts WHERE role = 'student'
    );
    DELETE FROM accounts WHERE role = 'student';
  `)
}

function createStudent({ name, email, phone, birthDate, status = 'active', mustChangePassword = 0 }) {
  const accResult = db.prepare(`
    INSERT INTO accounts (email, password_hash, role, must_change_password)
    VALUES (?, ?, 'student', ?)
  `).run(email, PASSWORD_HASH, mustChangePassword)

  const stuResult = db.prepare(`
    INSERT INTO students (account_id, name, email, phone, birth_date, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(accResult.lastInsertRowid, name, email, phone, birthDate, status)

  return { accountId: accResult.lastInsertRowid, studentId: stuResult.lastInsertRowid }
}

function createEnrollment({ studentId, planId, startDate, endDate, status = 'active', inactivatedAt = null }) {
  const result = db.prepare(`
    INSERT INTO enrollments (student_id, plan_id, start_date, end_date, status, inactivated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(studentId, planId, startDate, endDate, status, inactivatedAt)
  return result.lastInsertRowid
}

function createInstallments({ enrollmentId, startDate, durationMonths, monthlyPrice }) {
  const insert = db.prepare(`
    INSERT INTO installments (enrollment_id, competence, due_date, amount, status)
    VALUES (?, ?, ?, ?, ?)
  `)
  const ids = []
  for (let i = 0; i < durationMonths; i++) {
    const { due_date, competence } = addMonths(startDate, i)
    const result = insert.run(enrollmentId, competence, due_date, monthlyPrice, 'pending')
    ids.push(result.lastInsertRowid)
  }
  return ids
}

function payInstallment(installmentId, paidAt, amount, adminId) {
  db.prepare("UPDATE installments SET status = 'paid' WHERE id = ?").run(installmentId)
  db.prepare(`
    INSERT INTO payments (installment_id, paid_at, amount_paid, registered_by)
    VALUES (?, ?, ?, ?)
  `).run(installmentId, paidAt, amount, adminId)
}

function cancelInstallment(installmentId) {
  db.prepare("UPDATE installments SET status = 'cancelled' WHERE id = ?").run(installmentId)
}

// ── Dados de demonstração ────────────────────────────────────────────────────

function seedDemo() {
  const adminId = getAdminId()
  const today = new Date().toISOString().slice(0, 10) // 2026-11-23

  cleanDemoData()

  // ── 1. Lucas Ferreira — Power Semestral, ativo, em dia ───────────────────
  const lucas = createStudent({
    name: 'Lucas Ferreira',
    email: 'lucas.ferreira@email.com',
    phone: '11987654321',
    birthDate: '1998-03-12',
  })
  const lucasPlan = getPlanId('power', 'Semestral') // 6 meses, R$55
  const lucasEnrollId = createEnrollment({
    studentId: lucas.studentId,
    planId: lucasPlan,
    startDate: '2026-07-10',
    endDate: '2026-12-10',
  })
  const lucasInst = createInstallments({
    enrollmentId: lucasEnrollId,
    startDate: '2026-07-10',
    durationMonths: 6,
    monthlyPrice: 55,
  })
  // Pagas: jul–nov (5 de 6), dez ainda pendente (vence 10/12)
  payInstallment(lucasInst[0], '2026-07-10', 55, adminId)
  payInstallment(lucasInst[1], '2026-08-11', 55, adminId)
  payInstallment(lucasInst[2], '2026-09-10', 55, adminId)
  payInstallment(lucasInst[3], '2026-10-10', 55, adminId)
  payInstallment(lucasInst[4], '2026-11-10', 55, adminId)
  // lucasInst[5] = dez, pendente (vence 2026-12-10, ainda no prazo)

  // ── 2. Beatriz Oliveira — Evolution Anual, ativa, em dia ─────────────────
  const beatriz = createStudent({
    name: 'Beatriz Oliveira',
    email: 'beatriz.oliveira@email.com',
    phone: '21976543210',
    birthDate: '2001-08-25',
  })
  const beatrizPlan = getPlanId('evolution', 'Anual') // 12 meses, R$85
  const beatrizEnrollId = createEnrollment({
    studentId: beatriz.studentId,
    planId: beatrizPlan,
    startDate: '2026-05-01',
    endDate: '2027-04-01',
  })
  const beatrizInst = createInstallments({
    enrollmentId: beatrizEnrollId,
    startDate: '2026-05-01',
    durationMonths: 12,
    monthlyPrice: 85,
  })
  // Pagas: mai–nov (7 de 12)
  for (let i = 0; i < 7; i++) {
    const month = String(5 + i).padStart(2, '0')
    payInstallment(beatrizInst[i], `2026-${month}-01`, 85, adminId)
  }
  // dez–abr pendentes (ainda no prazo)

  // ── 3. Rafael Mendes — Power Mensal, ativo, 1 mensalidade vencida ────────
  const rafael = createStudent({
    name: 'Rafael Mendes',
    email: 'rafael.mendes@email.com',
    phone: '11965432109',
    birthDate: '1995-11-30',
  })
  const rafaelPlan = getPlanId('power', 'Mensal') // 1 mês, R$60
  // Matrícula antiga encerrada (set)
  const rafaelEnroll1 = createEnrollment({
    studentId: rafael.studentId,
    planId: rafaelPlan,
    startDate: '2026-09-15',
    endDate: '2026-09-15',
    status: 'inactive',
    inactivatedAt: '2026-10-16 00:00:00',
  })
  const rafaelInst1 = createInstallments({
    enrollmentId: rafaelEnroll1,
    startDate: '2026-09-15',
    durationMonths: 1,
    monthlyPrice: 60,
  })
  payInstallment(rafaelInst1[0], '2026-09-15', 60, adminId)

  // Matrícula atual (nov) — mensalidade vencida e não paga
  const rafaelEnroll2 = createEnrollment({
    studentId: rafael.studentId,
    planId: rafaelPlan,
    startDate: '2026-11-05',
    endDate: '2026-11-05',
  })
  createInstallments({
    enrollmentId: rafaelEnroll2,
    startDate: '2026-11-05',
    durationMonths: 1,
    monthlyPrice: 60,
  })
  // Mensalidade de nov pendente (venceu 05/11 — em atraso)

  // ── 4. Juliana Costa — Evolution Trimestral, ativa, em dia ───────────────
  const juliana = createStudent({
    name: 'Juliana Costa',
    email: 'juliana.costa@email.com',
    phone: '31998765432',
    birthDate: '2000-02-14',
  })
  const julianaPlan = getPlanId('evolution', 'Trimestral') // 3 meses, R$95
  const julianaEnrollId = createEnrollment({
    studentId: juliana.studentId,
    planId: julianaPlan,
    startDate: '2026-10-01',
    endDate: '2026-12-01',
  })
  const julianaInst = createInstallments({
    enrollmentId: julianaEnrollId,
    startDate: '2026-10-01',
    durationMonths: 3,
    monthlyPrice: 95,
  })
  payInstallment(julianaInst[0], '2026-10-01', 95, adminId)
  payInstallment(julianaInst[1], '2026-11-01', 95, adminId)
  // julianaInst[2] = dez, pendente (ainda no prazo)

  // ── 5. Thiago Almeida — Power Anual, inativo, histórico preservado ───────
  const thiago = createStudent({
    name: 'Thiago Almeida',
    email: 'thiago.almeida@email.com',
    phone: '11954321098',
    birthDate: '1992-06-08',
    status: 'inactive',
  })
  const thiagoPlan = getPlanId('power', 'Anual') // 12 meses, R$50
  const thiagoEnrollId = createEnrollment({
    studentId: thiago.studentId,
    planId: thiagoPlan,
    startDate: '2025-08-01',
    endDate: '2026-07-01',
    status: 'inactive',
    inactivatedAt: '2026-07-02 00:00:00',
  })
  const thiagoInst = createInstallments({
    enrollmentId: thiagoEnrollId,
    startDate: '2025-08-01',
    durationMonths: 12,
    monthlyPrice: 50,
  })
  // Pagou 10 de 12, últimas 2 canceladas na inativação
  for (let i = 0; i < 10; i++) {
    const d = addMonths('2025-08-01', i)
    payInstallment(thiagoInst[i], d.due_date, 50, adminId)
  }
  cancelInstallment(thiagoInst[10])
  cancelInstallment(thiagoInst[11])

  // ── 6. Mariana Lopes — sem matrícula, primeiro acesso ────────────────────
  createStudent({
    name: 'Mariana Lopes',
    email: 'mariana.lopes@email.com',
    phone: '21987651234',
    birthDate: '2003-12-01',
    mustChangePassword: 1,
  })

  console.log('Dados de demonstração inseridos com sucesso.')
  console.log('')
  console.log('Credenciais dos alunos (senha: senha123):')
  console.log('  lucas.ferreira@email.com    — Power Semestral, ativo, em dia')
  console.log('  beatriz.oliveira@email.com  — Evolution Anual, ativa, em dia')
  console.log('  rafael.mendes@email.com     — Power Mensal, ativo, 1 em atraso')
  console.log('  juliana.costa@email.com     — Evolution Trimestral, ativa, em dia')
  console.log('  thiago.almeida@email.com    — Power Anual, inativo')
  console.log('  mariana.lopes@email.com     — Sem matrícula (primeiro acesso)')
}

const run = db.transaction(seedDemo)
run()
db.close()
