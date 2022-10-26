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

module.exports.HeaderRoute = Router().use("/header", async (req, res) => {

    try {
        const records = await base("Headers").select({
            maxRecords: 100,
            cellFormat: "json",
            view: "Grid view"
        }).all();

        res.status(200).json(records.map((r) => {
            let data = r._rawJson;
            data.fields.Thumbnail = `https://ik.imagekit.io/blitz/website/headers/${r.id}`;
            return data;
        }));

        const files = await imageClient.listFiles({
            path: "/website/headers"
        });

        records.forEach(async (record) => {
            const { id, fields } = record;
            if (!files.find((f) => f.name === id) && fields.Thumbnail) {
                const file = await imageClient.upload({
                    file: fields.Thumbnail,
                    folder: "/website/headers",
                    fileName: id,
                    useUniqueFileName: false
                });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});
