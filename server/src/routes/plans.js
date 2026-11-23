const express = require('express')
const router  = express.Router()
const { getDatabase } = require('../database/db')

// GET /api/plans  — todos os planos com dados da unidade
router.get('/', (req, res) => {
  const db   = getDatabase()
  const rows = db.prepare(`
    SELECT p.id, p.name, p.duration_months, p.monthly_price,
           u.id AS unit_id, u.slug AS unit_slug, u.name AS unit_name
    FROM plans p
    JOIN units u ON u.id = p.unit_id
    ORDER BY u.id, p.duration_months
  `).all()
  res.json({ plans: rows })
})

module.exports = router
