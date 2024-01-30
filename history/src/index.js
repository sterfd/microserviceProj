const express = require("express");
const mongodb = require("mongodb");
const amqp = require("amqplib");

const PORT = process.env.PORT;
const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;
const RABBIT = process.env.RABBIT;

async function main() {
    const app = express();
    app.use(express.json());

    const client = await mongodb.MongoClient.connect(DBHOST);
    const db = client.db(DBNAME);
    const videosCollection = db.collection("videos");

    const messagingConnection = await amqp.connect(RABBIT);
    console.log("Connect to RabbitMQ");
    const messageChannel = await messagingConnection.createChannel();
    await messageChannel.assertQueue("viewed", {});
    console.log('Created "viewed" queue.');

    async function consumeViewedMessage(msg) {
        const parsedMsg = JSON.parse(msg.content.toString());
        await videosCollection.insertOne({ videoPath: parsedMsg.videoPath });
        console.log("Acknowledging message was handled.")
        messageChannel.ack(msg);
    }

    await messageChannel.consume("viewed", consumeViewedMessage);

    // app.post("/viewed", async (req, res) => {
    //     const videoPath = req.body.videoPath;
    //     await videosCollection.insertOne({ videoPath: videoPath });

    //     console.log(`Added video ${videoPath} to history.`)
    //     res.sendStatus(200);
    // })

    app.get("/", async (req, res) => {
        console.log("Hello wolrd!");
        res.send("helloooo");
    })

    app.listen(PORT, () => {
        console.log("Microservice online.")
    });
}


main()
    .catch(err => {
        console.error("Microservice failed to start.");
        console.error(err && err.stack || err);
    });