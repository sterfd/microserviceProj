// bunch of unit tests against metadata microservice

describe("metadata microservice", () => {
    // jest.fn creates mock
    const mockListenFn = jest.fn((port, callback) => callback());   // detect if ifunction called, what arguments passed
    const mockGetFn = jest.fn();

    // jest.doMock mocks the whole node.js module - replace express server
    jest.doMock("express", () => {
        return () => {
            return { //mock express app object
                listen: mockListenFn,
                get: mockGetFn,
            };
        };
    });

    const mockVideosCollection = {};

    const mockDb = {        //mock db
        collection: () => {
            return mockVideosCollection;
        }
    };

    const mockMongoClient = {       //mock mongo client object
        db: () => {
            return mockDb;
        }
    };

    jest.doMock("mongodb", () => {      //mock the mongodb module
        return {
            MongoClient: {
                connect: async () => {      //mock connect function
                    return mockMongoClient;
                }
            }
        };
    });

    const { startMicroservice } = require("./index");

    test("microservice starts web server on startup", async () => {
        await startMicroservice("dbhost", "dbname", 3000);

        expect(mockListenFn.mock.calls.length).toEqual(1);      //check 1 call to listen
        expect(mockListenFn.mock.calls[0][0]).toEqual(3000);        //check port 3000
    });

    test("/videos route is handled", async () => {
        await startMicroservice("dbhost", "dbname", 3000);

        expect(mockGetFn).toHaveBeenCalled();

        const videosRoute = mockGetFn.mock.calls[0][0];
        expect(videosRoute).toEqual("/videos");
    })

    test("videos route retreieve data via videos collection", async () => {

        await startMicroservice("dbhost", "dbname", 3000);

        const mockRequest = {};
        const mockJsonFn = jest.fn();
        const mockResponse = {
            json: mockJsonFn
        };
        const mockRecord1 = {};
        const mockRecord2 = {};

        // return some mock records with mock find
        mockVideosCollection.find = () => {
            return {
                toArray: async () => {
                    return [mockRecord1, mockRecord2];
                }
            };
        };

        const videosRouteHandler = mockGetFn.mock.calls[0][1];  //extract /videos route handler
        await videosRouteHandler(mockRequest, mockResponse);    //invoke request handler

        expect(mockJsonFn.mock.calls.length).toEqual(1);    //expect json fn called
        expect(mockJsonFn.mock.calls[0][0]).toEqual({
            videos: [mockRecord1, mockRecord2],     //expect mock records to be retrieved
        });
    });


})