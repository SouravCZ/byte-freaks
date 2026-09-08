import express from 'express'
import cors from 'cors'
import apiRouter from './routes/api.js'

const app = express()

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }))
app.use(express.json())

app.use('/api', apiRouter)

// Root
app.get('/', (_req, res) => {
  res.json({ name: 'Parivekshan AI API', status: 'running' })
})

// 404 handler for unmatched API routes
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

export default app
