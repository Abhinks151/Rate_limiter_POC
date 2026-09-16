# Redis Rate Limiter Proof-of-Concept (POC)

A Node.js and Express rate-limiting implementation built using **Redis** and **Lua scripting**. This repository demonstrates four popular rate-limiting algorithms: **Fixed Window Counter**, **Sliding Window Log**, **Token Bucket**, and **Leaky Bucket**.

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

This POC provides implementations for four rate-limiting algorithms. Click on any algorithm to read its dedicated, lightweight documentation:

### 1. [Fixed Window Counter Algorithm](file:///home/abhin/development/POCs/Rate_limiter/FIXED_WINDOW.md) (`fixed_window.js`)
- Divides time into fixed, non-overlapping intervals (e.g., 60-second windows).
- Uses an atomic Redis Lua script (`scripts/fixed_window_rate_limiter.lua`) with `INCR` and `EXPIRE`.
- Extremely memory-efficient, but subject to boundary traffic spikes.
- 📖 **Detailed Guide**: [FIXED_WINDOW.md](file:///home/abhin/development/POCs/Rate_limiter/FIXED_WINDOW.md)

### 2. [Sliding Window Log Algorithm](file:///home/abhin/development/POCs/Rate_limiter/SLIDING_WINDOW.md) (`sliding_window.js`)
- Tracks request timestamps continuously over a rolling window.
- Uses a Redis **Sorted Set (`ZSET`)** and atomic Lua script (`scripts/sliding_window_rate_limiter.lua`).
- Completely prevents boundary spikes, but has slightly higher memory usage.
- 📖 **Detailed Guide**: [SLIDING_WINDOW.md](file:///home/abhin/development/POCs/Rate_limiter/SLIDING_WINDOW.md)

### 3. [Token Bucket Algorithm](file:///home/abhin/development/POCs/Rate_limiter/TOKEN_BUCKET.md) (`token-bucket.js`)
- Consumes tokens from a bucket refilled periodically at a fixed rate.
- Allows short bursts of requests up to bucket capacity ($C = 5$).
- 📖 **Detailed Guide**: [TOKEN_BUCKET.md](file:///home/abhin/development/POCs/Rate_limiter/TOKEN_BUCKET.md)

### 4. [Leaky Bucket Algorithm](file:///home/abhin/development/POCs/Rate_limiter/LEAKY_BUCKET.md) (`leaky_bucket.js`)
- Queues incoming requests in a Redis List and leaks (processes) them at a constant rate.
- Guarantees a smooth output traffic flow to protect downstream services.
- 📖 **Detailed Guide**: [LEAKY_BUCKET.md](file:///home/abhin/development/POCs/Rate_limiter/LEAKY_BUCKET.md)

---

## Prerequisites

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

## Running the Server

Make sure your Redis server is running (`redis-server`), then run any script directly using Node:

### Run Fixed Window Rate Limiter:
```bash
node fixed_window.js
```

### Run Sliding Window Rate Limiter:
```bash
node sliding_window.js
```

### Run Token Bucket Rate Limiter:
```bash
node token-bucket.js
```

### Run Leaky Bucket Rate Limiter:
```bash
node leaky_bucket.js
```

Upon starting, you should see console logs indicating successful Redis connection and server startup:
```text
Connected to Redis
Server running at http://localhost:3000
```

---

## Testing the Rate Limiter

All servers expose a sample endpoint: `GET /user`

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
- **Allowed Requests**: HTTP `200 OK` returning user JSON payload:
  ```json
  {"message":"GET /user route is working!","user":{"id":1,"name":"Abhin","email":"abhin@example.com"}}
  ```
- **Exceeded Requests**: HTTP `429 Too Many Requests`:
  ```json
  {"status":429,"message":"Too many requests"}
  ```

### 2. Browser Testing
Navigate to:
```
http://localhost:3000/user
```
Refresh the page multiple times within the time window to observe the rate limit response.

---

## Project Structure

```text
.
├── README.md                            # Main project documentation
├── FIXED_WINDOW.md                      # Fixed Window guide
├── SLIDING_WINDOW.md                    # Sliding Window guide
├── TOKEN_BUCKET.md                      # Token Bucket guide
├── LEAKY_BUCKET.md                      # Leaky Bucket guide
├── fixed_window.js                      # Fixed Window Express application & middleware
├── sliding_window.js                    # Sliding Window Express application & middleware
├── token-bucket.js                      # Token Bucket Express application
├── leaky_bucket.js                      # Leaky Bucket Express application
├── scripts/
│   ├── fixed_window_rate_limiter.lua    # Atomic Lua script for Fixed Window counter
│   └── sliding_window_rate_limiter.lua  # Atomic Lua script for Sliding Window sorted set
├── .env                                 # Environment configuration
└── package.json                         # Dependencies
```
