import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

export const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || 'parivekshan',
  user: process.env.PGUSER || 'parivekshan',
  password: process.env.PGPASSWORD || 'parivekshan',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

export async function query(text, params) {
  const result = await pool.query(text, params)
  return result
}

export async function testConnection() {
  const { rows } = await pool.query('SELECT version()')
  return rows[0].version
}
