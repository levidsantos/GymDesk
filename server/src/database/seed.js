const { getDatabase } = require('./db')

const UNITS = [
  { slug: 'power',     name: 'Muscle Power'     },
  { slug: 'evolution', name: 'Muscle Evolution'  },
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
    INSERT OR IGNORE INTO units (slug, name) VALUES (?, ?)
  `)

  const insertPlan = db.prepare(`
    INSERT OR IGNORE INTO plans (unit_id, name, duration_months, monthly_price)
    SELECT u.id, ?, ?, ?
    FROM units u WHERE u.slug = ?
  `)

  const runSeed = db.transaction(() => {
    for (const unit of UNITS) {
      insertUnit.run(unit.slug, unit.name)
    }
    for (const plan of PLANS) {
      insertPlan.run(plan.name, plan.duration_months, plan.monthly_price, plan.unit_slug)
    }
  })

  runSeed()
}

module.exports = { seedDatabase }
