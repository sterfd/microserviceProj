const express = require('express');
const http = require("http");
const mongodb = require("mongodb");

if (!process.env.PORT) {
    throw new Error("Please specify the port number for the HTTP server with the env variable PORT.")
}

const PORT = process.env.PORT;
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT);
const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;

console.log("from streaming", DBHOST, DBNAME, VIDEO_STORAGE_HOST, VIDEO_STORAGE_PORT)
async function main() {
    const client = await mongodb.MongoClient.connect(DBHOST); // Connects to the database.
    const db = client.db(DBNAME);
    const videosCollection = db.collection("videos");

    const app = express();

    app.get("/video", async (req, res) => {
        const videoId = new mongodb.ObjectId(req.query.id);
        const videoRecord = await videosCollection.findOne({ _id: videoId });
        if (!videoRecord) {
            // The video was not found.
            res.sendStatus(404);
            return;
        }
        console.log(`Translated id ${videoId} to path ${videoRecord.videoPath}.`);

        const forwardRequest = http.request( // Forward the request to the video storage microservice.
            {
                host: VIDEO_STORAGE_HOST,
                port: VIDEO_STORAGE_PORT,
                path: `/video?path=${videoRecord.videoPath}`, // Video path now retrieved from the database.
                method: 'GET',
                headers: req.headers
            },
            forwardResponse => {
                res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
                forwardResponse.pipe(res);
            }
        );

        req.pipe(forwardRequest);
    });

    //
    // Starts the HTTP server.
    //
    app.listen(PORT, () => {
        console.log(`Microservice listening, please load the data file db-fixture/videos.json into your database before testing this microservice.`);
    });
}

main()
    .catch(err => {
        console.error("Microservice failed to start.");
        console.error(err && err.stack || err);
    });