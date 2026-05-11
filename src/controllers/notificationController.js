const { PrismaClient} = require('../../generated/prisma')
const { notificationQueue} = require("../queues/notificationQueue")

const prisma = new PrismaClient()

const createNotificationController = async (req, res) => {
    const { type, message, recipient} = req.body;

    // Input validation 
    if(!type || !recipient || !message) {
        return res.status(400).json({message:"All fields required: type, recipient and message"})
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

module.exports = {createNotificationController};