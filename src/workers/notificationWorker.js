require("dotenv").config();
const { Worker} = require("bullmq")
const { connection } = require("../queues/notificationQueue")
const { sendEmail} = require("../services/emailService")
const { PrismaClient} = require('../../generated/prisma');
const { promises } = require("nodemailer/lib/xoauth2");

const prisma = new PrismaClient()


  //RESCUE Stuck jobs older than 10 minutes
  const rescueStuckJobs = async () => {
    const tenMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    const rescued = await prisma.notification.updateMany({
        where: {
            status: "processing",
            processedAt: {
                lt: tenMinutesAgo
            }
        },
        data: { status: "pending"}
    })
    if(rescued.count > 0) {
        console.log("Rescued stuck jobs:", rescued.count)
    }
  }

const worker = new Worker(
    "notifications", async (job) => {
        
          //Rescue stuck jobs
         await rescueStuckJobs()

         //log job info
        console.log("Job ID:", job.id, "Attempt:", job.attemptsMade);
        const { notificationId} = job.data
      

        // fetch notification from DB 
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId},
        });

      
        // acquire atomic lock
    const acquired = await prisma.notification.updateMany({
        where: {
            id: notificationId,
            status: "pending", 
        },
        data: { status: "processing",
            processedAt: new Date()   //This stamp the time when the processing really started so that we can have add the dead worker  logic 
        }
    })

      //Skip if already processing or sent 
    if(acquired.count === 0) {
        console.log("Already processing or sent, skipping",notificationId)
        return;
    }


    //Main logic
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


