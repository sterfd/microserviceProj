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
    const recoCollection = db.collection("recos");

    const messagingConnection = await amqp.connect(RABBIT);
    const messageChannel = await messagingConnection.createChannel();

    async function consumeViewedMessage(msg) {
        const parsedMsg = JSON.parse(msg.content.toString());
        console.log("Received a 'viewed' message: ");
        console.log(JSON.stringify(parsedMsg, null, 4));
        await recoCollection.insertOne({ videoPath: parsedMsg.videoPath });   //record the view in db

        console.log("Acknowledging message was handled.");
        messageChannel.ack(msg);
    };

    await messageChannel.assertExchange("viewed", "fanout");
    const { queue } = await messageChannel.assertQueue("", { exclusive: true });
    console.log(`Created queue ${queue} binding it to viewed exchange`);
    await messageChannel.bindQueue(queue, "viewed", "");
    await messageChannel.consume(queue, consumeViewedMessage); //start receiving messages from queue

    app.listen(PORT, () => {
        console.log("MS online.");
    });
}

main()
    .catch(err => {
        console.error("MS failed to start.");
        console.error(err && err.stack || err);
    });