require("dotenv").config();
const { Worker} = require("bullmq")

const { connection } = require("../queues/notificationQueue")

const worker = new Worker(
    "notifications",
    async (job) => {
        console.log("Processing job", job.data)
    },
    {
        connection
    }
)

console.log("Worker running...")