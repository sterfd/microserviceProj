const express = require('express');
const mongodb = require('mongodb');


// start microservice
async function startMicroservice(dbhost, dbname, port) {
    const client = await mongodb.MongoClient.connect(dbhost);
    const db = client.db(dbname);
    const videosCollection = db.collection("videos");

    const app = express();

    app.get("/videos", async (req, res) => {        //get list of vids from db
        const videos = await videosCollection.find().toArray();
        res.json({
            videos: videos
        });
    });

    const server = app.listen(port, () => {     //start server
        console.log("Microservice online.")
    });

    // return {        //return object representing microservice
    //     close: () => {      //function closes server, db
    //         server.close();
    //         client.close();
    //     },
    //     db: db,         //give test access to db
    // };
}

async function main() {
    const DBHOST = process.env.DBHOST;
    const DBNAME = process.env.DBNAME;
    const PORT = process.env.PORT;

    // const client = await mongodb.MongoClient.connect(DBHOST);
    // const db = client.db(DBNAME);

    await startMicroservice(DBHOST, DBNAME, PORT);
}

main()
    .catch(err => {
        console.error("Microservice failed to start.");
        console.error(err && err.stack || err);
    });
// if (require.main === module) {  //only start microservice normally if script is main
//     main()
//         .then(() => console.log("Microservice online."))
//         .catch(err => {
//             console.error("Microservice failed to start.");
//             console.error(err && err.stack || err);
//         });
// }
// else {      //otherwise its a test
//     module.exports = {
//         startMicroservice,
//     };
// }