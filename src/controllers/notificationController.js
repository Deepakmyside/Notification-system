const { PrismaClient} = require('../../generated/prisma')
const { notificationQueue} = require("../queues/notificationQueue")

const prisma = new PrismaClient()

const createNotificationController = async (req, res) => {
    const { type, message, recipient} = req.body;

    // Input validation 
    if(!type || !recipient || !message) {
        return res.status(400).json({message:"All fields required: type, recipient and messa"})
    }
    const notification = await prisma.notification.create({
        data: { type, recipient, message},
    });

    await notificationQueue.add("notifications",
         { notificationId: notification.id} ,
        { 
            attempts: 5,
            backoff: {
                type: "exponential",
                delay: 5000
            },

        }
    );

    res.json({
        id: notification.id,
        status: notification.status
    });
};

const getNotificationController = async (req,res) => {
    const {id} = req.params;
    const notification = await prisma.notification.findUnique({
        where : { id: parseInt(id) }
    })

    if(!notification) {
        return res.status(400).json({ error: "Notification with this id doesn't exist"})
    }
    res.json({
        id: notification.id,
        status: notification.status,
        retryCount: notification.retryCount,
        lastError: notification.lastError,
        createdAt: notification.createdAt
    })
}

module.exports = {createNotificationController, getNotificationController};