# Token Bucket

The **Token Bucket** algorithm uses a bucket filled with tokens to control rate limits. It is great for allowing short bursts of traffic while keeping a steady refill speed.

---

## 💡 How It Works

1. Imagine a bucket that holds up to a maximum number of tokens (e.g. 5 tokens).
2. Tokens are added into the bucket automatically at a constant speed (e.g. 1 token every second).
3. When a request comes in:
   - If there is at least 1 token in the bucket, 1 token is removed and the request goes through.
   - If the bucket is empty (0 tokens), the request is blocked (`429 Too Many Requests`).

---

## 🏃 How to Run

```bash
node token-bucket.js
```

---

## ⚖️ Pros & Cons

### ✅ Pros
- **Handles Bursts Well**: Allows sudden short bursts of requests as long as there are tokens saved up in the bucket.
- **Low Memory**: Uses minimal memory in Redis.

### ❌ Cons
- **Refill Overhead**: Requires a timer process or calculation to constantly refill tokens into the bucket.
