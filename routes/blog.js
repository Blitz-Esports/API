const { Router } = require("express");

const Route = Router();
const AirTable = require('airtable');

const base = new AirTable({ apiKey: process.env.AIRTABLE_API_KEY })
    .base('apptqnWFREJiuuggI');

const ImageKit = require("imagekit");

const imageClient = new ImageKit({
    publicKey: "public_qsRfGEPO2+gzfC0IxPPiglizeF0=",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: "https://ik.imagekit.io/blitz"
});

Route.get("/blog", async (req, res) => {
    try {

        const records = await base("Blogs").select({
            maxRecords: 100,
            cellFormat: "json",
            view: "Grid view"
        }).all();

        res.status(200).json(records.map((record) => {
            return {
                id: record.id,
                ...record._rawJson.fields,
                Thumbnail: `https://ik.imagekit.io/blitz/blog/${record.id}`
            }
        }).sort((a, b) => b["Created At"] - a["Created At"]));

        records.forEach((record) => {
            if (record._rawJson.fields.Thumbnail && record._rawJson.fields.Thumbnail[0]) {
                imageClient.upload({
                    file: record._rawJson.fields.Thumbnail[0].url,
                    folder: "/blog",
                    fileName: record.id,
                    useUniqueFileName: false,
                    tags: record.id
                }).catch()
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

Route.get("/blog/:id", async (req, res) => {

    try {

        const record = await base("Blogs").find(req.params.id).catch(() => null);

        if (record) res.status(200).json({
            id: record.id,
            ...record._rawJson.fields,
            Thumbnail: `https://ik.imagekit.io/blitz/blog/${record.id}`
        });
        else res.status(404).send("Record not found");

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }

});

Route.get("/blog/:id/share", async (req, res) => {

    if (!req.query.social) return res.status(404).send("Invalid Social Id");
    try {

        const record = await base("Blogs").find(req.params.id).catch(() => null);

        const shareLink = (social) => {
            const encodedDescription = encodeURI(`Check out: ${record.fields.Title}\nhttps://blitzesports.org/blog?id=${record.id}`);
            const encodedUrl = encodeURI(`https://blitzesports.org/blog?id=${record.id}`);

            const socialsData = {
                twitter: `https://twitter.com/intent/tweet?text=${encodedDescription}`,
                facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&t=${encodedDescription}`,
                pinterest: `http://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedDescription}`,
                telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedDescription}`
            }
            return socialsData[social] ?? null;
        };

        if (shareLink(req.query.social)) return res.redirect(shareLink(req.query.social));
        else res.status(404).send("Invalid Social Id");

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }

});

module.exports.BlogRoute = Route;
