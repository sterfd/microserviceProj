const express = require('express');
const fs = require('fs');

const app = express();

const port = 3000;

app.get("/video", async (req, res) => {
    const path = "../videos/rabit.mp4";
    const stats = await fs.promises.stat(path);

    res.writeHead(200, {
        "Content-Length": stats.size,
        "Content-Type": "video/mp4"
    });

    fs.createReadStream(path).pipe(res);
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})