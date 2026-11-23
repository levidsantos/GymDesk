const express = require('express')
const bcrypt  = require('bcryptjs')
const router  = express.Router()
const { getDatabase } = require('../database/db')

// ── POST /api/accounts ──────────────────────────────────────────────────────
// Admin cria conta de aluno
router.post('/', (req, res) => {
  const db = getDatabase()
  const { student_id, password } = req.body

  if (!student_id || !password) {
    return res.status(400).json({ error: 'student_id e password são obrigatórios.' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' })
  }

  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(student_id)
  if (!student) {
    return res.status(404).json({ error: 'Aluno não encontrado.' })
  }

  if (student.account_id) {
    return res.status(409).json({ error: 'Este aluno já possui uma conta.' })
  }

  if (!student.email) {
    return res.status(400).json({ error: 'O aluno precisa ter um e-mail cadastrado para criar uma conta.' })
  }

  const existingAccount = db.prepare('SELECT 1 FROM accounts WHERE email = ?').get(student.email)
  if (existingAccount) {
    return res.status(409).json({ error: 'Já existe uma conta com este e-mail.' })
  }

  const hash = bcrypt.hashSync(password, 10)

  const run = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO accounts (email, password_hash, role, must_change_password)
      VALUES (?, ?, 'student', 1)
    `).run(student.email, hash)

    db.prepare('UPDATE students SET account_id = ? WHERE id = ?').run(result.lastInsertRowid, student.id)

    return result.lastInsertRowid
  })

  const accountId = run()
  const account = db.prepare('SELECT id, email, role, must_change_password, created_at FROM accounts WHERE id = ?').get(accountId)

  res.status(201).json({ account })
})

module.exports = router
