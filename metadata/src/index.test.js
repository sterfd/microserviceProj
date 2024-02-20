// integration tests against metadata microservice
const axios = require('axios');
const mongodb = require('mongodb');

describe("metadata microservice", () => {
    const PORT = 3000;
    const BASE_URL = `http://localhost:${PORT}`;
    const DBHOST = "mongodb://localhost:27017";
    const DBNAME = "testdb";

    const { startMicroservice } = require("./index");

    let microservice;   //reference to microservice object

    beforeAll(async () => {
        microservice = await startMicroservice(DBHOST, DBNAME, PORT); // Start server before all tests.
    });

    afterAll(async () => {
        await microservice.close();  // Close server after all tests.
    });

    //wrapper for HTTP GET so url not repeated
    function httpGet(route) {
        const url = `${BASE_URL}${route}`
        return axios.get(url);
    }

    //helper to load db fixture into db ###DO NOT RUN THIS ON REAL DATABASE IT GETS RESET
    async function loadDatabaseFixture(collectionName, records) {
        await microservice.db.dropDatabase();   //reset test database

        const collection = microservice.db.collection(collectionName);
        await collection.insertMany(records);   //insert db ficxture
    }

    //tests
    test("/videos route retrieves data via videos collection", async () => {
        const id1 = new mongodb.ObjectId();
        const id2 = new mongodb.ObjectId();
        const videoPath1 = 'my-video-1.mp4'
        const videoPath2 = 'my-video-2.mp4'

        const testVideos = [
            {
                _id: id1,
                videoPath: videoPath1
            },
            {
                _id: id2,
                videoPath: videoPath2
            },
        ];

        //load db fixture into db
        await loadDatabaseFixture("videos", testVideos);

        const response = await httpGet("/videos");
        expect(response.status).toEqual(200);

        const videos = response.data.videos;
        expect(videos.length).toEqual(2);
        expect(videos[0]._id).toEqual(id1.toString());
        expect(videos[0].videoPath).toEqual(videoPath1);
        expect(videos[1]._id).toEqual(id2.toString());
        expect(videos[1].videoPath).toEqual(videoPath2);
    })

});