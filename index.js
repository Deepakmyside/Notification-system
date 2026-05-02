require('dotenv').config()
const express = require("express")
const app = express();

const notificationRoutes = require('./src/api/routes/notification'

)
app.use(express.json())

app.use("/api/notifications",notificationRoutes)
app.get("/", (req, res) => {
    res.send("Notification System Running ")
});


app.listen(3000, ()=> {
    console.log("Server is running with on port 3000");
});