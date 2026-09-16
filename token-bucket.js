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


const BUCKET_NAME = "token_bucket"
const CAPACITY = 5;
const REFILL_RATE = 1000;


app.use(express.json())

setInterval(async () => {
    let tokens = await redis.get(BUCKET_NAME)
    tokens = Math.min(parseInt(tokens || "0") + 1, CAPACITY)

    await redis.set(BUCKET_NAME, tokens)
    console.log(`Token added to the bucket,  new size:${tokens}`)
}, REFILL_RATE)



// GET /user route
app.get('/user', async (req, res) => {

    const tokens = await redis.get(BUCKET_NAME)
    if (parseInt(tokens || "0") > 0) {
        await redis.set(BUCKET_NAME, parseInt(tokens) - 1)
        
        return res.json({
        message: 'GET /user route is working!',
        user: {
            id: 1,
            name: 'Abhin',
            email: 'abhin@example.com',
        },
    })
    }

    return res.status(429).send("Too many requests")

   
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})
