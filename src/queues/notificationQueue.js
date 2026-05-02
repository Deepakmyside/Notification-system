const { Queue } = require("bullmq")
const Redis =  require("ioredis").default || require("ioredis")




const connection = new Redis(process.env.REDIS_URL, {
    tls: {
        rejectUnauthorized: false
    },
    maxRetriesPerRequest: null,
    enableReadyCheck: false
})

const notificationQueue = new Queue("notifications", {
    connection,
})

module.exports = { notificationQueue, connection}