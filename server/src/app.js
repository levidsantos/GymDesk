require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { initializeDatabase } = require('./database/db')

const healthRouter = require('./routes/health')

const app = express()
const PORT = process.env.PORT || 3001

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// Inicializa o banco de dados na inicialização
initializeDatabase()

// Rotas
app.use('/api/health', healthRouter)

// Tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' })
})

// Tratamento global de erros
app.use((err, req, res, next) => {
  console.error('[Erro]', err.message)
  res.status(500).json({ error: 'Erro interno do servidor.' })
})

app.listen(PORT, () => {
  console.log(`Servidor GymDesk rodando em http://localhost:${PORT}`)
})
