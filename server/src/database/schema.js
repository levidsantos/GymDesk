const { getDatabase } = require('./db')

function createTables() {
  const db = getDatabase()

  db.exec(`
    -- Contas de acesso (administradores e alunos)
    CREATE TABLE IF NOT EXISTS accounts (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      email               TEXT    NOT NULL UNIQUE,
      password_hash       TEXT    NOT NULL,
      role                TEXT    NOT NULL CHECK (role IN ('admin', 'student')),
      must_change_password INTEGER NOT NULL DEFAULT 1,
      created_at          TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- Dados cadastrais dos alunos
    CREATE TABLE IF NOT EXISTS students (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER UNIQUE REFERENCES accounts(id) ON DELETE SET NULL,
      name       TEXT    NOT NULL,
      phone      TEXT,
      birth_date TEXT,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- Unidades da academia
    CREATE TABLE IF NOT EXISTS units (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT    NOT NULL UNIQUE,
      name TEXT    NOT NULL
    );

    -- Planos predefinidos por unidade
    CREATE TABLE IF NOT EXISTS plans (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id         INTEGER NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
      name            TEXT    NOT NULL,
      duration_months INTEGER NOT NULL,
      monthly_price   REAL    NOT NULL,
      UNIQUE (unit_id, name)
    );

    -- Matrículas dos alunos
    CREATE TABLE IF NOT EXISTS enrollments (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id     INTEGER NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
      plan_id        INTEGER NOT NULL REFERENCES plans(id)    ON DELETE RESTRICT,
      start_date     TEXT    NOT NULL,
      end_date       TEXT    NOT NULL,
      status         TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      inactivated_at TEXT,
      created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- Índice único parcial: apenas uma matrícula ativa por aluno
    CREATE UNIQUE INDEX IF NOT EXISTS uq_enrollments_active_student
      ON enrollments (student_id) WHERE status = 'active';

    -- Mensalidades geradas na criação da matrícula
    CREATE TABLE IF NOT EXISTS installments (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE RESTRICT,
      competence    TEXT    NOT NULL,
      due_date      TEXT    NOT NULL,
      amount        REAL    NOT NULL,
      status        TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
      UNIQUE (enrollment_id, competence)
    );

    -- Pagamentos registrados manualmente
    CREATE TABLE IF NOT EXISTS payments (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      installment_id  INTEGER NOT NULL UNIQUE REFERENCES installments(id) ON DELETE RESTRICT,
      paid_at         TEXT    NOT NULL,
      amount_paid     REAL    NOT NULL,
      registered_by   INTEGER NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
      notes           TEXT
    );
  `)
}

module.exports = { createTables }
