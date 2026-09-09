import express from 'express'
import cors from 'cors'
import apiRouter from './routes/api.js'
import mlRouter from './routes/ml.js'

const app = express()

// Comma-separated list of allowed origins (e.g. dev server + preview)
const allowedOrigins = (process.env.CLIENT_ORIGIN || '*')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)
app.use(cors({
  origin: allowedOrigins.includes('*') ? true : allowedOrigins,
}))
app.use(express.json())

app.use('/api', apiRouter)
app.use('/api/ml', mlRouter)

// Root
app.get('/', (_req, res) => {
  res.json({ name: 'Parivekshan AI API', status: 'running' })
})

// 404 handler for unmatched API routes
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

export default app
