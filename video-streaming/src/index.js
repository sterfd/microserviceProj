const express = require('express');
// const http = require("http");
// const mongodb = require("mongodb");
const fs = require("fs");
const http = require("http");
const amqp = require('amqplib');

if (!process.env.PORT) {
    throw new Error("Please specify the port number for the HTTP server with the env variable PORT.")
}

const PORT = process.env.PORT;
// const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
// const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT);
// const DBHOST = process.env.DBHOST;
// const DBNAME = process.env.DBNAME;
const RABBIT = process.env.RABBIT;

// console.log("from streaming", DBHOST, DBNAME, VIDEO_STORAGE_HOST, VIDEO_STORAGE_PORT)

// function sendViewedMessage(videoPath) {
//     const postOptions = {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//     };

//     const requestBody = {
//         videoPath: videoPath
//     };

//     const req = http.request("http://history/viewed",
//         postOptions
//     );

//     req.on("close", () => {
//         console.log("Sent 'viewed' message to history microservice.");
//     })

//     req.on("error", (err) => {
//         console.error("Failed to send and view message");
//         console.error(err && err.stack || err);
//     });

//     req.write(JSON.stringify(requestBody));
//     req.end();
// }


async function main() {
    // const client = await mongodb.MongoClient.connect(DBHOST); // Connects to the database.
    // const db = client.db(DBNAME);
    // const videosCollection = db.collection("videos");

    console.log(`Connecting to RabbitMQ server at ${RABBIT}.`);
    const messagingConnection = await amqp.connect(RABBIT);
    console.log("Connected to RabbitMQ");
    const messageChannel = await messagingConnection.createChannel();

    function sendViewedMessage(messageChannel, videoPath) {
        console.log('Publishing message on "viewed" queue.');
        const msg = { videoPath: videoPath };
        const jsonMsg = JSON.stringify(msg);
        messageChannel.publish("", "viewed", Buffer.from(jsonMsg));
    }

    const app = express();

    app.get("/video", async (req, res) => {
        // const videoId = new mongodb.ObjectId(req.query.id);
        // const videoRecord = await videosCollection.findOne({ _id: videoId });
        // if (!videoRecord) {
        //     // The video was not found.
        //     res.sendStatus(404);
        //     return;
        // }
        // console.log(`Translated id ${videoId} to path ${videoRecord.videoPath}.`);

        // const forwardRequest = http.request( // Forward the request to the video storage microservice.
        //     {
        //         host: VIDEO_STORAGE_HOST,
        //         port: VIDEO_STORAGE_PORT,
        //         path: `/video?path=${videoRecord.videoPath}`, // Video path now retrieved from the database.
        //         method: 'GET',
        //         headers: req.headers
        //     },
        //     forwardResponse => {
        //         res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
        //         forwardResponse.pipe(res);
        //     }
        // );

        // req.pipe(forwardRequest);    
        const videoPath = "./videos/rabit.mp4";
        const stats = await fs.promises.stat(videoPath);

        res.writeHead(200, {
            "Content-Length": stats.size,
            "Content-Type": "video/mp4",
        });

        fs.createReadStream(videoPath).pipe(res);

        // sendViewedMessage(videoPath);            #HTTP post
        sendViewedMessage(messageChannel, videoPath);
    });

    //
    // Starts the HTTP server.
    //
    app.listen(PORT, () => {
        // console.log(`Microservice listening, please load the data file db-fixture/videos.json into your database before testing this microservice.`);
        console.log("Microservice online.");
    });
}

main()
    .catch(err => {
        console.error("Microservice failed to start.");
        console.error(err && err.stack || err);
    });