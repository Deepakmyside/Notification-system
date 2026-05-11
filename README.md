# Distributed Notification System

🚀 **Live API:** https://notification-system-xd0h.onrender.com 

A backend system that accepts notification requests via API, queues them in Redis, and processes them asynchronously through BullMQ workers — built to handle failures gracefully with retries, atomic locking, and stuck job recovery.
 
---

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![BullMQ](https://img.shields.io/badge/BullMQ-FF6B6B?style=flat&logo=redis&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Upstash](https://img.shields.io/badge/Upstash-00E9A3?style=flat&logo=upstash&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-0F9DCE?style=flat&logo=gmail&logoColor=white)

---

# 🏗️ System Flow

```text
Client Request
      ↓
Express API
      ↓
Save Notification in PostgreSQL
      ↓
Push Job to Redis Queue
      ↓
BullMQ Worker Picks Job
      ↓
Atomic Lock Check
      ↓
Send Email
      ↓
Update Notification Status
```

---

# 🚀 Features

- REST API for creating and tracking notifications
- PostgreSQL + Prisma for persistent storage
- Redis backed queue with BullMQ
- Async background worker processing
- Atomic lock to prevent duplicate processing
- Stuck job rescue — resets jobs stuck in processing for 10+ minutes
- Retry mechanism with exponential backoff (5 attempts)
- Retry tracking — stores retryCount and lastError in DB
- Status API to track notification lifecycle in real time
- Input validation on all endpoints
- Failure safe worker execution

---

# 📬 API Endpoints

## Create Notification
```http
POST /api/notifications
```
```json
{
  "type": "email",
  "recipient": "test@gmail.com",
  "message": "Hello from distributed notification system"
}
```

## Get Notification Status
```http
GET /api/notifications/:id
```
```json
{
  "id": 5,
  "status": "sent",
  "retryCount": 0,
  "lastError": null,
  "createdAt": "2024-01-01T10:00:00Z"
}
```
## Testing APIs
Import `postman_collection.json` into Postman to test all endpoints instantly.

**Status values:** `pending` → `processing` → `sent` / `failed`

---

# 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| BullMQ | Job queue management |
| Redis (Upstash) | Queue storage |
| Prisma ORM | Database client |
| PostgreSQL (Supabase) | Persistent storage |
| Nodemailer | Email delivery |

---

# 📂 Project Structure

```text
src/
├── api/routes/        → route definitions
├── controllers/       → request handling logic
├── queues/            → BullMQ queue setup
├── workers/           → background job processor
└── services/          → email service
```

---

# ⚙️ Setup

## Install dependencies
```bash
npm install
```

## Configure environment variables
```env
DATABASE_URL=your_supabase_url
REDIS_URL=your_upstash_redis_url
EMAIL_USER=your_gmail
EMAIL_PASS=your_gmail_app_password
```

## Push schema and generate Prisma client
```bash
npx prisma@5 db push
npx prisma@5 generate
```

## Start API server
```bash
node index.js
```

## Start worker (separate terminal)
```bash
node src/workers/notificationWorker.js
```

---

# 🧩 Challenges & Solutions

**Duplicate email on worker crash**
When a worker crashes mid-processing, BullMQ reassigns the job to a new worker. Without protection this caused the same email to be sent twice. Fixed using Compare and Swap pattern — status only updates from `pending` to `processing` in one atomic database operation. If the update affects 0 rows, another worker already grabbed it and the job is skipped.

**Stuck jobs**
If a worker crashes permanently, the job stays stuck in `processing` forever. Fixed by running a cleanup function at the start of every job that resets notifications stuck in `processing` for more than 10 minutes back to `pending` so they get picked up again.

---

# 🧠 Concepts Practiced

- Queue based architecture
- Worker processes and background job execution
- Idempotency and atomic locking
- Retry strategies with exponential backoff
- Failure recovery patterns
- Distributed systems observability

---

# 📄 License
MIT