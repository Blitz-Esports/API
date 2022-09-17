const { Router } = require("express");
const AirTable = require('airtable');

const base = new AirTable({ apiKey: process.env.AIRTABLE_API_KEY })
    .base('apptqnWFREJiuuggI');

module.exports.HeaderRoute = Router().use("/header", async (req, res) => {

    try {
        const records = await base("Headers").select({
            maxRecords: 100,
            cellFormat: "json",
            view: "Grid view"
        }).all();

        res.status(200).json(records.map((r) => r._rawJson));
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});