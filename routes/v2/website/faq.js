const { api } = require("../../../config");

module.exports = {
    type: "GET",
    fn: async (req, res) => {
        const records = await api.airtable("FAQs").select({
            maxRecords: 100,
            cellFormat: "json",
            view: "Grid view"
        }).all();
        res.send(records.map((r) => r._rawJson));
    }
}