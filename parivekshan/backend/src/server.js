import 'dotenv/config'
import app from './app.js'
import { testConnection } from './db.js'

const PORT = Number(process.env.PORT) || 5000

async function start() {
  try {
    const version = await testConnection()
    console.log('✔ PostgreSQL connected:', version.split(' on ')[0])
  } catch (err) {
    console.error('✘ Could not connect to PostgreSQL:', err.message)
    console.error('  Check backend/.env and ensure the database exists.')
    process.exit(1)
  }

  app.listen(PORT, () => {
    console.log(`✔ Parivekshan AI API listening on http://localhost:${PORT}/api`)
  })
}

start()
