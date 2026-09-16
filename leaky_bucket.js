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


const BUCKET_NAME = "leaky_bucket"
const CAPACITY = 5;
const LEAK_RATE = 1000;


app.use(express.json())

setInterval(async () => {
    const count = await redis.llen(BUCKET_NAME)
    if (count > 0) {
        await redis.rpop(BUCKET_NAME)
        console.log(`on request removed from the bucket,  new size:${count - 1}`)
    }
}, LEAK_RATE)



// GET /user route
app.get('/user', async (req, res) => {

    const count = await redis.llen(BUCKET_NAME)
    if (count < CAPACITY) {
        await redis.lpush(BUCKET_NAME, Date.now())
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
