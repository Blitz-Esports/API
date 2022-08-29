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
            cellFormat: "json"
        }).all();

        res.status(200).json(records.map((record) => {
            return {
                id: record.id,
                ...record._rawJson.fields,
                Thumbnail: `https://ik.imagekit.io/blitz/blog/${record.id}`
            }
        }));

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

module.exports.BlogRoute = Route;