const express  = require('express')
const bcrypt   = require('bcryptjs')
const crypto   = require('crypto')
const router   = express.Router()
const { getDatabase } = require('../database/db')
const { authenticate } = require('../middleware/auth')

const SESSION_DAYS = 7
const COOKIE_NAME  = 'session_token'

function cookieOpts(maxAgeMs) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeMs,
  }
}

function createSession(db, accountId) {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString()
  db.prepare('INSERT INTO sessions (account_id, token, expires_at) VALUES (?, ?, ?)').run(accountId, token, expires)
  return { token, maxAge: SESSION_DAYS * 86400000 }
}

// ── POST /api/auth/login ────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const db = getDatabase()
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' })
  }

  const account = db.prepare('SELECT * FROM accounts WHERE email = ?').get(email.trim().toLowerCase())
  if (!account || !bcrypt.compareSync(password, account.password_hash)) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' })
  }

  const { token, maxAge } = createSession(db, account.id)
  res.cookie(COOKIE_NAME, token, cookieOpts(maxAge))

  const responseData = {
    id:    account.id,
    email: account.email,
    role:  account.role,
    must_change_password: !!account.must_change_password,
  }

  if (account.role === 'student') {
    const student = db.prepare('SELECT id, name FROM students WHERE account_id = ?').get(account.id)
    if (student) {
      responseData.student_id   = student.id
      responseData.student_name = student.name
      const enrollment = db.prepare(`
        SELECT u.slug AS unit_slug FROM enrollments e
        JOIN plans p ON p.id = e.plan_id
        JOIN units u ON u.id = p.unit_id
        WHERE e.student_id = ? AND e.status = 'active'
      `).get(student.id)
      responseData.unit_slug = enrollment?.unit_slug ?? null
    }
  }

  res.json({ account: responseData })
})

// ── POST /api/auth/logout ───────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  const token = req.cookies?.[COOKIE_NAME]
  if (token) {
    const db = getDatabase()
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
  }
  res.clearCookie(COOKIE_NAME, cookieOpts(0))
  res.json({ ok: true })
})

// ── GET /api/auth/me ────────────────────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
  const db = getDatabase()
  const account = db.prepare('SELECT id, email, role, must_change_password FROM accounts WHERE id = ?').get(req.accountId)
  if (!account) {
    return res.status(401).json({ error: 'Conta não encontrada.' })
  }

  const responseData = {
    id:    account.id,
    email: account.email,
    role:  account.role,
    must_change_password: !!account.must_change_password,
  }

  if (account.role === 'student') {
    const student = db.prepare('SELECT id, name FROM students WHERE account_id = ?').get(account.id)
    if (student) {
      responseData.student_id   = student.id
      responseData.student_name = student.name
      const enrollment = db.prepare(`
        SELECT u.slug AS unit_slug FROM enrollments e
        JOIN plans p ON p.id = e.plan_id
        JOIN units u ON u.id = p.unit_id
        WHERE e.student_id = ? AND e.status = 'active'
      `).get(student.id)
      responseData.unit_slug = enrollment?.unit_slug ?? null
    }
  }

  res.json({ account: responseData })
})

// ── POST /api/auth/change-password ──────────────────────────────────────────
router.post('/change-password', authenticate, (req, res) => {
  const db = getDatabase()
  const { current_password, new_password } = req.body

  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' })
  }

  const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(req.accountId)

  if (!account.must_change_password) {
    if (!current_password) {
      return res.status(400).json({ error: 'A senha atual é obrigatória.' })
    }
    if (!bcrypt.compareSync(current_password, account.password_hash)) {
      return res.status(401).json({ error: 'Senha atual incorreta.' })
    }
  }

  const hash = bcrypt.hashSync(new_password, 10)
  db.prepare('UPDATE accounts SET password_hash = ?, must_change_password = 0 WHERE id = ?').run(hash, account.id)

  res.json({ ok: true })
})

module.exports = router
