const { Router } = require("express");
const AirTable = require('airtable');

const base = new AirTable({ apiKey: process.env.AIRTABLE_API_KEY })
    .base('apptqnWFREJiuuggI');

const ImageKit = require("imagekit");

const imageClient = new ImageKit({
    publicKey: "public_qsRfGEPO2+gzfC0IxPPiglizeF0=",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: "https://ik.imagekit.io/blitz"
});


module.exports.ContentRoute = Router().use("/content", async (req, res) => {

    try {
        const records = await base("Content").select({
            maxRecords: 100,
            cellFormat: "json",
            view: "Grid view"
        }).all();

        res.status(200).json(records.map((r) => {
            return {
                id: r.id,
                ...r._rawJson.fields,
                thumbnail: `https://ik.imagekit.io/blitz/content-thumbnail/${r.id}`
            }
        }));

        const files = await imageClient.listFiles({
            path: "/content-thumbnail"
        });

        records.forEach(async (record) => {
            const imageId = record.fields.thumbnail[0].id;
            if (!files.find((file) => file.tags.includes(imageId))) {

                const imageUrl = record.fields.thumbnail[0].url;
                const imageId = record.fields.thumbnail[0].id

                const file = await imageClient.upload({
                    file: imageUrl,
                    folder: "/content-thumbnail",
                    fileName: record.id,
                    useUniqueFileName: false,
                    tags: imageId
                });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});