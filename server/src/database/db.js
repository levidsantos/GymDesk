const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const DB_PATH = path.resolve(__dirname, '../../..', process.env.DB_PATH || 'database/gymdesk.db')

let db = null

function getDatabase() {
  if (!db) {
    // Garante que o diretório do banco existe
    const dbDir = path.dirname(DB_PATH)
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
  }
  return db
}

function initializeDatabase() {
  const database = getDatabase()

  // Importação tardia para evitar dependência circular
  const { createTables } = require('./schema')
  const { seedDatabase }  = require('./seed')

  createTables()
  seedDatabase()

  console.log(`Banco de dados inicializado: ${DB_PATH}`)
  return database
}

module.exports = { getDatabase, initializeDatabase }
