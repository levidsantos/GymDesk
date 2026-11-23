const { getDatabase } = require('../database/db')

function getSession(token) {
  if (!token) return null
  const db = getDatabase()
  const row = db.prepare(`
    SELECT s.*, a.email, a.role, a.must_change_password
    FROM sessions s
    JOIN accounts a ON a.id = s.account_id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `).get(token)
  return row || null
}

function authenticate(req, res, next) {
  const token = req.cookies?.session_token
  const session = getSession(token)
  if (!session) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' })
  }
  req.session = session
  req.accountId = session.account_id
  req.role = session.role
  next()
}

function requireAdmin(req, res, next) {
  if (req.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores.' })
  }
  next()
}

function requirePasswordChanged(req, res, next) {
  if (req.session.must_change_password) {
    return res.status(403).json({ error: 'É necessário alterar a senha antes de continuar.', code: 'MUST_CHANGE_PASSWORD' })
  }
  next()
}

module.exports = { authenticate, requireAdmin, requirePasswordChanged, getSession }
