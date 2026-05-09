# Distributed Notification System

A production-inspired backend notification system built to understand distributed systems concepts like queues, workers, retries, background processing, and idempotent job execution.

The system accepts notification requests through an API, stores them in PostgreSQL, pushes jobs into a Redis queue, and processes them asynchronously using BullMQ workers.

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
![dotenv](https://img.shields.io/badge/dotenv-ECD53F?style=flat&logo=dotenv&logoColor=black)
# 🚀 Current Features

- REST API for notifications
- PostgreSQL + Prisma integration
- Redis-backed queue system
- BullMQ worker architecture
- Background email processing
- Retry mechanism with backoff
- Atomic lock based idempotency handling
- Notification status tracking
- Failure handling and retry-safe execution

---

# 🏗️ Current Flow

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

# 🛠️ Tech Stack

- Node.js
- Express.js
- BullMQ
- Redis (Upstash)
- Prisma ORM
- PostgreSQL (Supabase)
- Nodemailer

---

# 📂 Project Structure

```text
src/
│
├── api/routes/
├── controllers/
├── queues/
├── workers/
├── services/
└── prisma/
```

---

# ⚙️ Setup

## Install dependencies

```bash
npm install
```

---

## Configure environment variables

Create `.env`

```env
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
```

---

## Push schema & generate Prisma client

```bash
npx prisma@5 db push
npx prisma@5 generate
```

---

## Start API server

```bash
npm run dev
```

---

## Start worker

```bash
node src/workers/notificationWorker.js
```

---

# 📬 API Endpoint

## Create Notification

```http
POST /api/notifications
```

### Request Body

```json
{
  "type": "email",
  "recipient": "test@gmail.com",
  "message": "Hello from distributed notification system"
}
```

---

# 🔒 Idempotency & Retry Handling

The worker uses atomic locking to prevent duplicate processing during retries.

Features implemented:

- Retry-safe email delivery
- Processing lock mechanism
- Status-based job tracking
- Retry attempts with BullMQ
- Failure-safe worker execution

---

# 📌 Currently Working On

- Dead Letter Queue (DLQ)
- Retry analytics
- Status tracking APIs
- Multi-channel notifications
- Better observability & logging

---

# 🧠 Concepts Practiced

- Distributed systems basics
- Queue-based architectures
- Worker processes
- Async job processing
- Retry strategies
- Idempotency
- Background task execution
- Failure recovery patterns

# 🧩 Challenges & Solutions

**Duplicate email on worker crash**
When a worker crashes mid-processing, BullMQ reassigns the job to a new worker. Without protection this caused the same email to be sent twice. Fixed using Compare and Swap pattern — status only updates from "pending" to "processing" in one atomic database operation.

**Stuck jobs**
If a worker crashes permanently, the job stays stuck in "processing" forever. Fixed by running a cleanup function at the start of every job that resets notifications stuck in "processing" for more than 10 minutes back to "pending".
---

# 📄 License

MIT