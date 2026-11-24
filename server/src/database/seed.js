const { getDatabase } = require('./db')
const bcrypt = require('bcryptjs')

const UNITS = [
  { slug: 'power',     name: 'Muscle Power',     phone: '5511900001111', email: 'contato@musclepower.com.br'     },
  { slug: 'evolution', name: 'Muscle Evolution',  phone: '5511900002222', email: 'contato@muscleevolution.com.br' },
]

const PLANS = [
  // Muscle Power (slug: power)
  { unit_slug: 'power',     name: 'Mensal',    duration_months: 1,  monthly_price: 60.00 },
  { unit_slug: 'power',     name: 'Semestral', duration_months: 6,  monthly_price: 55.00 },
  { unit_slug: 'power',     name: 'Anual',     duration_months: 12, monthly_price: 50.00 },
  // Muscle Evolution (slug: evolution)
  { unit_slug: 'evolution', name: 'Mensal',     duration_months: 1,  monthly_price: 100.00 },
  { unit_slug: 'evolution', name: 'Trimestral', duration_months: 3,  monthly_price:  95.00 },
  { unit_slug: 'evolution', name: 'Semestral',  duration_months: 6,  monthly_price:  90.00 },
  { unit_slug: 'evolution', name: 'Anual',      duration_months: 12, monthly_price:  85.00 },
]

function seedDatabase() {
  const db = getDatabase()

  const insertUnit = db.prepare(`
    INSERT OR IGNORE INTO units (slug, name, phone, email) VALUES (?, ?, ?, ?)
  `)

  const updateUnitContact = db.prepare(`
    UPDATE units SET phone = ?, email = ? WHERE slug = ? AND (phone IS NULL OR email IS NULL)
  `)

  const insertPlan = db.prepare(`
    INSERT OR IGNORE INTO plans (unit_id, name, duration_months, monthly_price)
    SELECT u.id, ?, ?, ?
    FROM units u WHERE u.slug = ?
  `)

  const runSeed = db.transaction(() => {
    for (const unit of UNITS) {
      insertUnit.run(unit.slug, unit.name, unit.phone, unit.email)
      updateUnitContact.run(unit.phone, unit.email, unit.slug)
    }
    for (const plan of PLANS) {
      insertPlan.run(plan.name, plan.duration_months, plan.monthly_price, plan.unit_slug)
    }
  })

  runSeed()

  seedAdminAccount(db)
}

function seedAdminAccount(db) {
  const email    = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) return

  const existing = db.prepare('SELECT 1 FROM accounts WHERE email = ?').get(email.toLowerCase())
  if (existing) return

  const hash = bcrypt.hashSync(password, 10)
  db.prepare(`
    INSERT INTO accounts (email, password_hash, role, must_change_password)
    VALUES (?, ?, 'admin', 0)
  `).run(email.toLowerCase(), hash)

  console.log(`Conta administrativa criada: ${email}`)
}

module.exports = { seedDatabase }
