const request = require("supertest");
const { app } = require("../index");

describe("video streaming microservice", () => {

    test("microservice can handle requests", async () => {

        const response = await request(app).get("/live"); //make request to app/live
        expect(response.status).toBe(200);      //make sure we get 200 response we expect
    });
});