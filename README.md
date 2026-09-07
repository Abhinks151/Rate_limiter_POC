# Redis Rate Limiter Proof-of-Concept (POC)

A Node.js and Express rate-limiting implementation built using **Redis** and **Lua scripting**. This repository demonstrates two popular rate-limiting algorithms: **Fixed Window Counter** and **Sliding Window Log**.

> **Reference**: The algorithmic concepts and system design patterns in this project are based on the [GeeksforGeeks Rate Limiting Algorithms System Design](https://www.geeksforgeeks.org/system-design/rate-limiting-algorithms-system-design/) guide.

---

## What is Rate Limiting and What Problem Does It Solve?

**Rate Limiting** is a strategy used in system design to control the amount of incoming traffic sent or received by a network interface or API service. It bounds the number of requests a client can make within a specified time frame.

### Key Problems Solved by Rate Limiting:
- **Preventing Denial of Service (DoS / DDoS) Attacks**: Protects servers from being overwhelmed by deliberate malicious floods of requests.
- **Preventing Resource Exhaustion**: Prevents individual clients or bots from monopolizing backend CPU, memory, database connections, or bandwidth.
- **Cost Management**: Controls operational costs when integrating third-party APIs or serverless infrastructure billed per request.
- **Ensuring Fair Usage (Quality of Service)**: Guarantees consistent availability and performance across all users by preventing noisy-neighbor issues.
- **Cascading Failure Prevention**: Helps maintain system stability during unexpected traffic surges.

---

## Implemented Rate Limiting Approaches

This POC provides implementations for two rate-limiting algorithms:

### 1. Fixed Window Counter Algorithm (`fixed_window.js`)

#### How It Works:
- The timeline is divided into fixed, non-overlapping time windows (e.g., 60-second intervals).
- Each request within the current window increments a counter (`INCR`) assigned to the client IP (`user:<ip>`).
- If the counter exceeds the allowed threshold (e.g., 10 requests), subsequent requests within that window are blocked with HTTP `429 Too Many Requests`.
- Once the window expires, the counter resets.

#### Redis & Lua Implementation:
- Located in `scripts/fixed_window_rate_limiter.lua`.
- Uses an atomic Redis Lua script executing `INCR` and setting `EXPIRE` on the first request of each window to eliminate race conditions.

#### Pros & Cons:
- **Pros**: Extremely memory-efficient and easy to implement.
- **Cons**: Boundary spikes — a client could send max requests at the end of window $N$ and max requests at the start of window $N+1$, briefly doubling the allowed rate across the boundary.

---

### 2. Sliding Window Log Algorithm (`sliding_window.js`)

#### How It Works:
- Instead of static intervals, the sliding window tracks request timestamps continuously over a moving time frame (e.g., the last 60 seconds relative to the current request timestamp `now`).
- Old timestamps outside the current window (`now - window`) are automatically purged before counting active requests.
- If the active request count is below the limit, the current request timestamp is added to the log, and access is allowed. Otherwise, it is rejected.

#### Redis & Lua Implementation:
- Located in `scripts/sliding_window_rate_limiter.lua`.
- Uses a Redis **Sorted Set (`ZSET`)** (`user:<ip>`) with request timestamps as scores and members.
- Executed atomically via Lua script:
  1. `ZREMRANGEBYSCORE` to remove logs older than `now - window`.
  2. `ZCOUNT` to count remaining requests in the window.
  3. Rejects if count $\ge$ limit.
  4. `ZADD` to record the current timestamp and `EXPIRE` to maintain key TTL.

#### Pros & Cons:
- **Pros**: Highly accurate; completely prevents boundary spikes and traffic bursts across fixed window borders.
- **Cons**: Slightly higher Redis memory footprint due to storing timestamps in sorted sets.

---

## 🛠️ Prerequisites

Ensure you have the following installed on your machine:
- **[Node.js](https://nodejs.org/)** (v18 or higher recommended)
- **[Redis Server](https://redis.io/)** running locally (default: `127.0.0.1:6379`)
- **npm** or **pnpm** package manager

---

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Abhinks151/Rate_limiter_POC.git
   cd Rate_limiter_POC
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure environment variables**:
   Create or verify your `.env` file in the root directory:
   ```env
   PORT=3000
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379

   RATE_LIMIT_WINDOW_SIZE=60
   RATE_LIMIT_SLIDING_WINDOW_SIZE=60
   RATE_LIMIT_REQUEST_COUNT=10
   ```

---

## ▶Running the Server

Make sure your Redis server is running (`redis-server`), then run either script directly using Node:

### Run Fixed Window Rate Limiter:
```bash
node fixed_window.js
```

### Run Sliding Window Rate Limiter:
```bash
node sliding_window.js
```

Upon starting, you should see console logs indicating successful Redis connection and server startup:
```text
Connected to Redis
Server running at http://localhost:3000
```

---

## Testing the Rate Limiter

Both servers expose a sample endpoint: `GET /user`

### 1. cURL / Bash Loop (Automated Testing)
Run this bash loop in your terminal to execute 12 rapid requests:

```bash
for i in {1..12}; do
  echo -n "Request $i: "
  curl -s http://localhost:3000/user
  echo ""
done
```

**Expected Result**:
- **Requests 1–10**: HTTP `200 OK` returning user JSON payload.
  ```json
  {"message":"GET /user route is working!","user":{"id":1,"name":"Abhin","email":"abhin@example.com"}}
  ```
- **Requests 11–12**: HTTP `429 Too Many Requests`
  ```json
  {"status":429,"message":"Too many requests"}
  ```

### 2. Browser Testing
Navigate to:
```
http://localhost:3000/user
```
Refresh the page more than 10 times within 60 seconds to see the rate limit response.

---

## Project Structure

```text
.
├── fixed_window.js                  # Fixed Window Express application & middleware
├── sliding_window.js                # Sliding Window Express application & middleware
├── scripts/
│   ├── fixed_window_rate_limiter.lua# Atomic Lua script for Fixed Window counter
│   └── sliding_window_rate_limiter.lua# Atomic Lua script for Sliding Window sorted set
├── .env                             # Environment configuration
├── package.json                     # Dependencies
└── README.md                        # Documentation
```
