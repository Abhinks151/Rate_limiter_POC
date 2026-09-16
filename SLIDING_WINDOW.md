# Sliding Window Log

The **Sliding Window** algorithm tracks requests over a dynamic rolling time window (e.g. the last 60 seconds from *right now*), rather than fixed time blocks.

---

## 💡 How It Works

1. Every time a user makes a request, the exact time (timestamp) of the request is stored in Redis.
2. Old timestamps older than the window size (e.g. older than 60 seconds ago) are automatically removed.
3. The remaining active timestamps are counted.
4. If the count is below the limit (e.g. 10 requests), the request is allowed.
5. If the count meets or exceeds the limit, the request is blocked (`429 Too Many Requests`).

---

## 🏃 How to Run

```bash
node sliding_window.js
```

---

## ⚖️ Pros & Cons

### ✅ Pros
- **Very Accurate**: Completely solves the traffic spike issue across window boundaries.
- **Fair Enforcement**: Enforces a smooth limit over any 60-second slice of time.

### ❌ Cons
- **Higher Memory Usage**: Stores every single request timestamp in Redis instead of just a single count number.
