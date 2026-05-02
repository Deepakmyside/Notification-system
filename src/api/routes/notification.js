const express = require('express')
const { PrismaClient} = require('../../../generated/prisma')
const { notificationQueue} = require("../../queues/notificationQueue")

const router = express.Router()
const prisma = new PrismaClient()


router.post("/", async (req, res) => {
    const { type, recipient, message } = req.body;

    const notification = await prisma.notification.create({
        data: {
            type,
            recipient,
            message,
        },
    });
     await notificationQueue.add("Send-notification", {
        notificationId: notification.id,
     })
     
    res.json({
        id: notification.id,
        status: notification.status,
    });
});

module.exports = router;