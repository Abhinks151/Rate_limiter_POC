# Redis Rate Limiter Proof-of-Concept (POC)

A simple Node.js and Express project demonstrating four popular **Rate Limiting** algorithms built using **Redis**.

---

## 📌 Implemented Approaches

Each rate-limiting approach has its own dedicated documentation file:

- 📘 [Fixed Window Counter](file:///home/abhin/development/POCs/Rate_limiter/FIXED_WINDOW.md) (`fixed_window.js`)
- 📘 [Sliding Window Log](file:///home/abhin/development/POCs/Rate_limiter/SLIDING_WINDOW.md) (`sliding_window.js`)
- 📘 [Token Bucket](file:///home/abhin/development/POCs/Rate_limiter/TOKEN_BUCKET.md) (`token-bucket.js`)
- 📘 [Leaky Bucket](file:///home/abhin/development/POCs/Rate_limiter/LEAKY_BUCKET.md) (`leaky_bucket.js`)

---

## ⚡ Quick Comparison

| Approach | Description | Main Advantage | Main Disadvantage |
| :--- | :--- | :--- | :--- |
| **Fixed Window** | Counts requests in fixed time blocks (e.g. 1 min). | Easy & low memory | Spikes allowed at window boundaries |
| **Sliding Window** | Tracks exact request timestamps over a rolling window. | Super accurate | Uses more memory in Redis |
| **Token Bucket** | Consumes tokens from a refilling bucket. | Handles traffic bursts well | Needs token refill management |
| **Leaky Bucket** | Processes requests from a queue at a constant leak rate. | Smooth, steady traffic | Drops bursts when queue is full |

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18+)
- **Redis Server** running locally (`127.0.0.1:6379`)

### 2. Install Dependencies
```bash
npm install
```

### 3. Run an Algorithm Server
```bash
# Run Fixed Window
node fixed_window.js

# Run Sliding Window
node sliding_window.js

# Run Token Bucket
node token-bucket.js

# Run Leaky Bucket
node leaky_bucket.js
```

### 4. Test Endpoint
Send requests to `http://localhost:3000/user`:
```bash
for i in {1..12}; do
  curl -s http://localhost:3000/user
  echo ""
done
```

---

## 📂 Project Structure

```text
.
├── README.md           # Main project overview
├── FIXED_WINDOW.md     # Fixed Window guide
├── SLIDING_WINDOW.md   # Sliding Window guide
├── TOKEN_BUCKET.md     # Token Bucket guide
├── LEAKY_BUCKET.md     # Leaky Bucket guide
├── fixed_window.js     # Fixed Window server
├── sliding_window.js   # Sliding Window server
├── token-bucket.js     # Token Bucket server
└── leaky_bucket.js     # Leaky Bucket server
```
