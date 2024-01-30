const express = require("express");
const mongodb = require("mongodb");
const amqp = require("amqplib");

const PORT = process.env.PORT;
const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;
const RABBIT = process.env.RABBIT;

async function main() {
    const app = express();
    app.use(express.json());        // enable JSON body parsing for HTTP requests

    const client = await mongodb.MongoClient.connect(DBHOST);
    const db = client.db(DBNAME);
    const videosCollection = db.collection("videos");

    const messagingConnection = await amqp.connect(RABBIT);     // connect to rabbitMQ server
    console.log("Connect to RabbitMQ");
    const messageChannel = await messagingConnection.createChannel();   // create messaging channel
    // await messageChannel.assertQueue("viewed", {});
    // console.log('Created "viewed" queue.');
    await messageChannel.assertExchange("viewed", "fanout");        // asserts viewed exchange (create or ensure there is one)
    const { queue } = await messageChannel.assertQueue("", { exclusive: true });    //create anonymous queue
    console.log(`Created queue ${queue}, binding it to the "viewed" exchange. `);
    await messageChannel.bindQueue(queue, "viewed", "");            //bind queue to exchange

    await messageChannel.consume(queue, async (msg) => {
        console.log('Received a "viewed" message');
        const parsedMsg = JSON.parse(msg.content.toString());

        await videosCollection.insertOne({ videoPath: parsedMsg.videoPath });   //record the view in db
        console.log("Acknowledging message was handled.");
        messageChannel.ack(msg);        //if no error, acknowledge
    })

    // async function consumeViewedMessage(msg) {
    //     const parsedMsg = JSON.parse(msg.content.toString());
    //     await videosCollection.insertOne({ videoPath: parsedMsg.videoPath });
    //     console.log("Acknowledging message was handled.")
    //     messageChannel.ack(msg);
    // }

    // await messageChannel.consume("viewed", consumeViewedMessage);

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