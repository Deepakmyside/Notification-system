require("dotenv").config();
const { Worker} = require("bullmq")
const { connection } = require("../queues/notificationQueue")
const { sendEmail} = require("../services/emailService")
const { PrismaClient} = require('../../generated/prisma')

const prisma = new PrismaClient()

const worker = new Worker(
    "notifications", async (job) => {
        const { notificationId} = job.data
      
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId},
        });

    await sendEmail({
        to: notification.recipient,
        subject: "BMW M5 Purchase Bill🚗🚗⏩💲",
        message: notification.message
    });

    console.log("Email sent:", notificationId)
    },
    { connection },

    console.log("worker runnning")
)

