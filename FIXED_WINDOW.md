# Fixed Window Counter

The **Fixed Window** algorithm divides time into fixed blocks (for example, 60-second windows). Each user gets a simple counter for the current window.

---

## 💡 How It Works

1. Time is split into fixed intervals (e.g. 1 minute).
2. When a user makes a request, their counter in Redis increases by 1.
3. If the counter is within the limit (e.g. 10 requests), the request is allowed.
4. If the counter exceeds the limit, the request is blocked (`429 Too Many Requests`).
5. When the time window expires, the counter resets back to 0.

---

## 🏃 How to Run

```bash
node fixed_window.js
```

---

## ⚖️ Pros & Cons

### ✅ Pros
- **Super Simple**: Easy to understand and code.
- **Low Memory**: Stores only a single number in Redis per user.

### ❌ Cons
- **Traffic Spike at Window Borders**: A user could send 10 requests at the end of window 1, and 10 requests at the start of window 2, allowing 20 requests in just a few seconds.
