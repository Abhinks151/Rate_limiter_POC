# Leaky Bucket

The **Leaky Bucket** algorithm acts like a bucket with a hole at the bottom. Requests fill the bucket, and they leak out at a constant, steady rate to be processed.

---

## 💡 How It Works

1. Incoming requests enter a queue (the bucket) up to a max capacity (e.g. 5 requests).
2. Requests leave (leak out of) the bucket one by one at a fixed, constant speed (e.g. 1 request per second).
3. If new requests arrive when the bucket is already full, the extra requests overflow and are blocked (`429 Too Many Requests`).

---

## 🏃 How to Run

```bash
node leaky_bucket.js
```

---

## ⚖️ Pros & Cons

### ✅ Pros
- **Smooth Traffic**: Outputs requests at a predictable, steady speed, preventing server overloads.

### ❌ Cons
- **No Bursts Allowed**: Fast bursts of traffic get queued or dropped immediately if the bucket fills up.
