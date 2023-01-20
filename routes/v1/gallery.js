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

module.exports.GalleryRoute = Router().use("/gallery", async (req, res) => {

    try {
        const records = await base("Gallery").select({
            maxRecords: 100,
            cellFormat: "json",
            view: "Grid view"
        }).all();

        const files = await imageClient.listFiles({
            path: "/gallery"
        });

        const filteredFiles = records.map((r) => {
            const imageId = r.fields.Image ? r.fields.Image[0].id : null;
            if(imageId) return files.find((f) => f.tags.includes(imageId));
            else return null;
        }).filter((v) => v != null);

        res.status(200).json(filteredFiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

        records.forEach(async (record) => {
            const imageId = record.fields.Image ? record.fields.Image[0].id : null;
            if (imageId && !files.find((file) => file.tags.includes(imageId))) {

                const imageUrl = record.fields.Image[0].url;
                const imageTitle = record.fields.ID;
                const imageId = record.fields.Image[0].id

                const file = await imageClient.upload({
                    file: imageUrl,
                    folder: "/gallery",
                    fileName: imageTitle,
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