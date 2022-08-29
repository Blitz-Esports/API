const { Router } = require("express");
const AirTable = require('airtable');

const base = new AirTable({ apiKey: process.env.AIRTABLE_API_KEY })
    .base('apptqnWFREJiuuggI');

module.exports.FaqRoute = Router().use("/faq", async (req, res) => {

    try {
        const records = await base("FAQs").select({
            maxRecords: 100,
            cellFormat: "json"
        }).all();

        res.status(200).json(records.map((r) => r._rawJson));
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});