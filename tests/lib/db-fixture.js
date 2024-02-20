// use from playwright test to load db fixtures

const axios = require("axios");
const dbFixturesUrl = "http://localhost:9000";

//loads named db fixture
async function loadFixture(databaseName, fixtureName) {
    unloadFixture(databaseName, fixtureName);
    const url = dbFixturesUrl + "/load-fixture?db=" + databaseName + "&fix=" + fixtureName;
    await axios.get(url);
}

//unloads named db fixture
async function unloadFixture(databaseName, fixtureName) {
    const url = dbFixturesUrl + "/unload-fixture?db=" + databaseName + "&fix=" + fixtureName;
    await axios.get(url);
}

//drops entire db
async function dropDatabase(databaseName) {
    const url = dbFixturesUrl + "/drop-database?db=" + databaseName;
    await axios.get(url);
}

//drops collection from db
async function dropCollection(databaseName, collectionName) {
    const url = dbFixturesUrl + "/drop-collection?db=" + databaseName + "&col=" + collectionName;
    await axios.get(url);
}

//gets collection of records 
async function getCollection(databaseName, collectionName) {
    const url = dbFixturesUrl + "/get-collection?db=" + databaseName + "&col=" + collectionName;
    const { data } = await axios.get(url);
    return data;
}

module.exports = {
    loadFixture, unloadFixture, dropDatabase, dropCollection, getCollection
};