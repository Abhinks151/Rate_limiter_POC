# Redis Rate Limiter (Fixed Window Counter Algorithm)

A Node.js and Express rate limiter proof-of-concept (POC) using Redis and Lua scripting to implement the **Fixed Window Counter** rate-limiting algorithm.

---

## Features

- **Fixed Window Rate Limiting**: Limits requests per client IP within a configurable time window (e.g., 10 requests per 60 seconds).
- **Atomic Operations with Redis Lua Scripting**: Executes `INCR` and `EXPIRE` atomically inside Redis to prevent race conditions.
- **Configurable Environment Variables**: Easily tune window duration and request limits via `.env`.
- **IP-Based Client Tracking**: Tracks request limits per client IP (`user:<ip_address>`).
- **Express Middleware**: Seamlessly integrates as Express middleware returning HTTP status `429 Too Many Requests` when limits are exceeded.

---

## 🛠️ Prerequisites

Before running this project, ensure you have the following installed:

- **[Node.js](https://nodejs.org/)** (v18 or higher recommended)
- **[pnpm](https://pnpm.io/)** (or `npm` / `yarn`)
- **[Redis Server](https://redis.io/)** running locally (or remote Redis URI)

---

## Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd /home/abhin/development/POCs/Rate_limiter
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   # or
   npm install
   ```

---

## ⚙️ Configuration

Create or update the `.env` file in the root directory:

```env
PORT=3000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
RATE_LIMIT_WINDOW_SIZE=60    # Window size in seconds
RATE_LIMIT_REQUEST_COUNT=10  # Maximum allowed requests per window
```

---

## ▶Running the Application

1. **Start your local Redis server** (if not already running):
   ```bash
   redis-server
   ```

2. **Start the Express server**:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

You should see:
```text
Connected to Redis
Server running at http://localhost:3000
```

---

## Testing the API

### API Endpoint

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET`  | `/user`  | Returns user details (rate limited) |

---

### 1. Browser Testing

Open your web browser and navigate to:
```
http://localhost:3000/user
```

**Success Response (`200 OK`)**:
```json
{
  "message": "GET /user route is working!",
  "user": {
    "id": 1,
    "name": "Abhin",
    "email": "abhin@example.com"
  }
}
```

Refresh the page more than `RATE_LIMIT_REQUEST_COUNT` (10 times) within 60 seconds to trigger the limit.

**Rate Limit Exceeded Response (`429 Too Many Requests`)**:
```json
{
  "status": 429,
  "message": "Too many requests"
}
```

---

### 2. Testing with cURL / Bash Loop

Run a quick bash loop in your terminal to fire 12 requests automatically:

```bash
for i in {1..12}; do
  echo -n "Request $i: "
  curl -s http://localhost:3000/user
  echo ""
done
```

- Requests 1 to 10 will return the user JSON data (`200 OK`).
- Requests 11 and 12 will return `{ "status": 429, "message": "Too many requests" }`.

---

### 3. Testing with Postman

1. **Create a Request**:
   - Method: `GET`
   - URL: `http://localhost:3000/user`
2. **Send Requests**:
   - Click **Send** repeatedly.
   - For the first 10 requests, you will receive `200 OK`.
   - On the 11th request onwards, you will receive `429 Too Many Requests`.
3. **Automated Testing via Postman Collection Runner**:
   - Save the request to a Collection.
   - Open **Collection Runner**.
   - Set **Iterations** to `15` and **Delay** to `0ms`.
   - Click **Run Collection**. You will observe HTTP status 200 for the first 10 runs and 429 for the remaining 5.

---

## 📂 Project Structure

```text
├── fixed_window.js                 # Main application entry point & rate limiter middleware
├── scripts/
│   └── fixed_window_rate_limiter.lua# Redis Lua script for atomic INCR + EXPIRE
├── .env                            # Environment variables configuration
├── package.json                    # Dependencies and scripts
└── README.md                       # Project documentation
```
