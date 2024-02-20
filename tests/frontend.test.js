const { loadFixture } = require('./lib/db-fixture');
const { test, expect } = require('@playwright/test');
const { describe } = test;

describe("flixtube front end", () => {
    test("can list videos", async ({ page }) => {
        await loadFixture("metadata", "two-videos");    //load fixture "two-videos" into db metadata

        await page.goto('/');       //visit flixtube webpage

        const videos = page.locator("#video-list>div");     //retrieve elements from pages DOM
        await expect(videos).toHaveCount(2);        //check we have 2 videos

        const firstVideo = videos.nth(0).locator('a');  //look at first item in list
        await expect(firstVideo).toHaveText('SampleVideo_1280x720_1mb.mp4'); //proper filename
        await expect(firstVideo).toHaveAttribute("href", "/video?id=5ea234a1c34230004592eb32")

        const secondVideo = videos.nth(1).locator("a"); // Check the second item in the video list.
        await expect(secondVideo).toHaveText("Another video.mp4"); // Make sure file name is correct.
        await expect(secondVideo).toHaveAttribute("href", "/video?id=5ea234a5c34230004592eb33"); // Make sure link is correct.
    });
})

