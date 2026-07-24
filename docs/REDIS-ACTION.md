# Redis Integration Guide

## Overview

This project currently stores all application data in MongoDB/MySQL. While this works well, several parts of the application are read-heavy or require temporary data storage where Redis can significantly improve performance and scalability.

Redis should be used as a caching layer and temporary storage, **not as a replacement for the primary database**.

---

# Recommended Redis Use Cases

## 1. Cache Movie Listings ⭐⭐⭐⭐⭐

### Why?

Movie listings are requested frequently but change infrequently.

Instead of querying MongoDB every time:

```
Client
   ↓
Express API
   ↓
Redis Cache
   ↓ (Cache Miss)
MongoDB
```

### Suggested Endpoints

```
GET /api/v1/movie
GET /api/v1/movie?page=1&limit=10
```

### Redis Key

```
movie:list:{page}:{limit}
```

Example

```
movie:list:1:10
```

### TTL

```
30-60 seconds
```

### Cache Flow

```
Client Request
      ↓
Check Redis
      ↓
 ┌─────────────┐
 │ Cache Hit   │
 └──────┬──────┘
        ↓
 Return Cached Data

 OR

 ┌─────────────┐
 │ Cache Miss  │
 └──────┬──────┘
        ↓
   Query MongoDB
        ↓
 Store in Redis
        ↓
 Return Response
```

---

# 2. Cache Available Shows ⭐⭐⭐⭐⭐

### Suggested Endpoint

```
GET /api/v1/movie/available-shows?date=2026-08-01
```

### Redis Key

```
movie:available:{date}
```

Example

```
movie:available:2026-08-01
```

### TTL

```
15-30 seconds
```

Reason:

Available shows are requested frequently but only change after bookings or admin updates.

---

# 3. Cache Movie Show Details ⭐⭐⭐⭐☆

### Endpoint

```
GET /api/v1/movie/:movieId/show/:showId
```

### Redis Key

```
movie:{movieId}:show:{showId}
```

Example

```
movie:65fe8:show:89abc
```

### TTL

```
5-10 seconds
```

Reason:

Seat availability changes frequently.

Use a very small TTL.

---

# 4. Temporary Seat Locking ⭐⭐⭐⭐⭐

This is the **best Redis use case**.

Currently the project stores temporary seat locks inside MongoDB.

Instead, use Redis TTL.

### Redis Key

```
seat:lock:{showId}:{seatNumber}
```

Example

```
seat:lock:987654:A10
```

Value

```
{
   userId,
   lockedAt
}
```

TTL

```
300 seconds (5 minutes)
```

Flow

```
User selects seats
        ↓
Write seat lock into Redis
        ↓
TTL starts
        ↓
Payment completed?
        ↓
YES
 ↓
Remove Redis Key
 ↓
Create Booking

NO
 ↓
TTL expires
 ↓
Redis automatically deletes lock
```

Benefits

- No cleanup jobs
- Automatic expiration
- Faster seat availability checks

---

# 5. Payment Lookup Cache ⭐⭐⭐☆☆

### Endpoint

```
GET /api/v1/payment/booking/:bookingId
```

### Redis Key

```
payment:booking:{bookingId}
```

TTL

```
30-120 seconds
```

Reason

Payment information rarely changes after creation.

---

# 6. Rate Limiting ⭐⭐⭐⭐☆

If multiple API servers are deployed, Redis should store request counters.

Example

```
rate-limit:{ip}
```

Redis keeps counters synchronized across all server instances.

---

# 7. OTP Storage ⭐⭐⭐⭐⭐

If OTP authentication is added later.

Redis Key

```
otp:{email}
```

TTL

```
5 minutes
```

Redis automatically removes expired OTPs.

---

# 8. JWT Blacklist ⭐⭐⭐⭐☆

For logout support.

Redis Key

```
jwt:blacklist:{tokenId}
```

TTL

```
Remaining JWT lifetime
```

---

# Files Where Redis Can Be Added

## Config

Create

```
src/config/redis.js
```

Example

```javascript
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export default redis;
```

---

## Cache Utility

Create

```
src/utils/cache.js
```

Functions

```
getCache(key)

setCache(key, data, ttl)

deleteCache(key)

deletePattern(pattern)
```

---

## Controllers

### Movie Controller

Cache these methods

```
getAllMovies()

movieByDate()

checkMovieShows()

checkMovieShow()
```

---

### Booking Controller

Use Redis for

```
holdSeats()

releaseSeat()

confirmBooking()
```

---

### Payment Controller

Cache

```
getBookingPayment()
```

---

# Cache Invalidation Strategy

Whenever these APIs modify data, delete related cache.

## Movie Created

Delete

```
movie:list:*
movie:available:*
```

---

## Movie Updated

Delete

```
movie:list:*
movie:{movieId}:*
movie:available:*
```

---

## Movie Deleted

Delete

```
movie:list:*
movie:{movieId}:*
movie:available:*
```

---

## Booking Created

Delete

```
movie:available:*
movie:{movieId}:show:{showId}
```

---

## Booking Cancelled

Delete

```
movie:available:*
movie:{movieId}:show:{showId}
```

---

## Payment Success

Delete

```
payment:booking:{bookingId}
```

---

# Recommended Redis Key Naming

```
movie:list:{page}:{limit}

movie:available:{date}

movie:{movieId}

movie:{movieId}:show:{showId}

seat:lock:{showId}:{seat}

payment:booking:{bookingId}

otp:{email}

jwt:blacklist:{tokenId}

rate-limit:{ip}
```

---

# Suggested Folder Structure

```
src/

├── config/
│   └── redis.js

├── middleware/
│   └── cache.middleware.js

├── utils/
│   └── cache.js

├── controllers/
│   ├── movie.controller.js
│   ├── booking.controller.js
│   └── payment.controller.js
```

---

# Redis Workflow

```
                Client
                   │
                   ▼
             Express API
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
   Redis Cache           MongoDB/MySQL
        │                     │
        └──────────┬──────────┘
                   ▼
              API Response
```

---

# Expected Benefits

| Feature           | Improvement                      |
| ----------------- | -------------------------------- |
| Movie Listing     | Faster response times            |
| Show Availability | Reduced database load            |
| Seat Locking      | Automatic expiration with TTL    |
| Payment Lookup    | Lower latency                    |
| Rate Limiting     | Shared counters across instances |
| OTP Storage       | Automatic cleanup                |
| JWT Blacklist     | Secure logout support            |

---

# Conclusion

Redis should primarily be introduced as:

- A caching layer for frequently accessed movie and show data.
- A temporary storage layer for seat locks using TTL.
- A shared storage backend for rate limiting, OTPs, and JWT blacklisting.

MongoDB/MySQL should remain the source of truth for persistent application data, while Redis improves response time, reduces database load, and simplifies management of short-lived state.
