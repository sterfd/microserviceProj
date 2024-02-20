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


});