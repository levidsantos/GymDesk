const express = require('express')
const router = express.Router()
const { getDatabase } = require('../database/db')

router.get('/', (req, res) => {
  try {
    const db = getDatabase()

    // Verifica se o banco responde corretamente
    const result = db.prepare('SELECT 1 AS ok').get()

    res.json({
      status: 'ok',
      message: 'API GymDesk funcionando corretamente.',
      database: result.ok === 1 ? 'conectado' : 'erro',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Falha na verificação de saúde da API.',
      error: error.message,
    })
  }
})

module.exports = router
