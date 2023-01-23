const { api } = require("../../../config");

module.exports = {
    type: "GET",
    fn: async(req , res) => {

        const records = await api.airtable("Players").select({
            maxRecords: 100,
            cellFormat: "json",
            view: "Grid view"
        }).all();

        const config = api.cloudinary.config();
        res.send(records.map((r) => {
            return {
                ...r._rawJson,
                fields: {
                    ...r.fields,
                    avatar: `https://res.cloudinary.com/${config.cloud_name}/${config.path}/players/${r.fields?.avatar[0]?.id}`
                }
            }
        }));
    }
}