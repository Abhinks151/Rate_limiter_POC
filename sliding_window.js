import express from 'express'
import Redis from 'ioredis'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
})

redis.on('connect', () => console.log('Connected to Redis'))
redis.on('error', (err) => console.error('Redis error:', err.message))

const app = express()
const PORT = process.env.PORT || 3000
const RATE_LIMIT_WINDOW_SIZE = Number(process.env.RATE_LIMIT_WINDOW_SIZE) || 60;
const RATE_LIMIT_REQUEST_COUNT = Number(process.env.RATE_LIMIT_REQUEST_COUNT) || 10;

const fixedWindowScript = fs.readFileSync(
  './scripts/fixed_window_rate_limiter.lua',
  'utf8'
)

app.use(express.json())

async function sliding_window_rate_limit_middleware(req, res, next) {
  try {
    const key = "user:" + req.ip
    const requestCount = await redis.eval(
      fixedWindowScript,
      1,
      key,
      RATE_LIMIT_WINDOW_SIZE
    )

    if (requestCount > RATE_LIMIT_REQUEST_COUNT) {
      return res.status(429).send({
        status: 429,
        message: "Too many requests"
      })
    }

    next()
  } catch (error) {
    console.log(error);
    next()
  }
}

app.use(sliding_window_rate_limit_middleware)

// GET /user route
app.get('/user', async (req, res) => {
  res.json({
    message: 'GET /user route is working!',
    user: {
      id: 1,
      name: 'Abhin',
      email: 'abhin@example.com',
    },
  })
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
