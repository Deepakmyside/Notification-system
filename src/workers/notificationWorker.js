require("dotenv").config();
const { Worker} = require("bullmq")
const { connection } = require("../queues/notificationQueue")
const { sendEmail} = require("../services/emailService")
const { PrismaClient} = require('../../generated/prisma')

const prisma = new PrismaClient()

const worker = new Worker(
    "notifications", async (job) => {
        console.log("Job ID:", job.id, "Attempt:", job.attemptsMade);
        const { notificationId} = job.data
      
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId},
        });

        // Idempotency check

    if (notification.status === "sent"  || notification.status === "failed") {
        console.log("Already sent, skipping", notificationId)
        return;
    }

 try {

    // success update 

    await sendEmail({
        to: notification.recipient,
        subject: "BMW M5 Purchase Bill🚗🚗⏩💲",
        message: notification.message
    });
  
    await prisma.notification.update({
        where: {id: notificationId},
        data: { status: "sent"},
    });
    console.log("Email sent:", notificationId)

}catch(err) {
    // failure update
    await prisma.notification.update({
        where: {id: notificationId},
        data: {status:"failed"},
    });

    throw err;   /*this error is what it needs for bullmq to retry the queue and job logic*/
}
    },
    {connection}  
);
console.log("Worker running....");


