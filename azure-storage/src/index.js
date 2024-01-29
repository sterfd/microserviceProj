const express = require("express");
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

const app = express();

const PORT = process.env.PORT;
const STORAGE_ACCOUNT_NAME = process.env.STORAGE_ACCOUNT_NAME;
const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY;

function createBlobService() {
    const sharedKeyCredential = new StorageSharedKeyCredential(STORAGE_ACCOUNT_NAME, STORAGE_ACCESS_KEY);
    const blobService = new BlobServiceClient(
        `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
        sharedKeyCredential
    );
    return blobService;
}

app.get("/video", async (req, res) => {
    const videoPath = req.query.path;

    const containerName = "videos";
    const blobService = createBlobService();
    const containerClient = blobService.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(videoPath);

    const properties = await blobClient.getProperties();

    res.writeHead(200, {
        "Content-Length": properties.contentLength,
        "Content-Type": "video/mp4",
    });
    const response = await blobClient.download();
    response.readableStreamBody.pipe(res);
});

app.listen(PORT, () => {
    console.log('Microservice online');
});

// Besides, we haven’t learned anything about Kubernetes yet, so we definitely couldn’t have used Kubernetes volumes at this point in the book. 
// However, there’s another important reason why I generally choose to use cloud storage over cluster storage.
// We could store the files and data for our application in the Kubernetes cluster, but I prefer my production cluster to be stateless. 
// That means I can destroy and rebuild the cluster at will without risk of losing the data. Later, this enables us to use blue-green deployment for our production rollouts, which we’ll talk about in chapter 12. 
// This makes it easy to build a new and updated instance of our application that runs in parallel with the previous version.
