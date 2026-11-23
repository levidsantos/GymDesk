require('dotenv').config()
const express      = require('express')
const cors         = require('cors')
const cookieParser = require('cookie-parser')
const { initializeDatabase } = require('./database/db')
const { authenticate, requireAdmin, requirePasswordChanged } = require('./middleware/auth')

const healthRouter      = require('./routes/health')
const authRouter        = require('./routes/auth')
const accountsRouter    = require('./routes/accounts')
const studentsRouter    = require('./routes/students')
const plansRouter       = require('./routes/plans')
const enrollmentsRouter = require('./routes/enrollments')
const paymentsRouter    = require('./routes/payments')
const accessRouter      = require('./routes/access')
const portalRouter      = require('./routes/portal')

const app = express()
const PORT = process.env.PORT || 3001

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// Inicializa o banco de dados na inicialização
initializeDatabase()

// Rotas públicas
app.use('/api/health', healthRouter)
app.use('/api/auth',   authRouter)

// Rotas protegidas — requerem autenticação
app.use('/api/accounts',    authenticate, requireAdmin, requirePasswordChanged, accountsRouter)
app.use('/api/students',    authenticate, requireAdmin, requirePasswordChanged, studentsRouter)
app.use('/api/plans',       authenticate, requirePasswordChanged, plansRouter)
app.use('/api/enrollments', authenticate, requireAdmin, requirePasswordChanged, enrollmentsRouter)
app.use('/api/portal',      authenticate, requirePasswordChanged, portalRouter)
app.use('/api/access',      authenticate, requirePasswordChanged, accessRouter)
app.use('/api',             authenticate, requireAdmin, requirePasswordChanged, paymentsRouter)

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
