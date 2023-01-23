const { api } = require("../../../config");

module.exports = {
    type: "GET",
    fn: async (req, res) => {

        const teams = await api.airtable("Teams").select({
            maxRecords: 100,
            cellFormat: "json",
            view: "Grid view"
        }).all();

        const players = await api.airtable("Players").select({
            maxRecords: 100,
            cellFormat: "json",
            view: "Grid view"
        }).all();

        const preImages = await api.cloudinary.api.resources({ by_folder: "c2ea9a51570969a4ac60be0421208d5e10" });
        players.forEach(async (r) => {
            const image = r.fields.avatar[0];
            const preFile = preImages.resources.find((img) => img.public_id.match(image?.id));

            if (image && !preFile) {
                await api.cloudinary.uploader.upload(image.url, {
                    filename_override: image?.id,
                    use_filename: true,
                    unique_filename: false,
                    folder: api.cloudinary.config().path + "/players",
                    overwrite: true
                });
            }
        });

        const config = api.cloudinary.config();
        const playersData = players.map((p) => {
            return {
                id: p.id,
                ...p.fields,
                avatar: `https://res.cloudinary.com/${config.cloud_name}/${config.path}/players/${p.fields?.avatar[0]?.id}`
            }
        });

        res.send(teams.map((team) => {
            let data = team._rawJson;
            data.fields.players = data.fields.players.map((pId) => {
                return playersData.find((p) => p.id === pId);
            })
            return {
                ...data
            }
        }));
    }
}