const { api } = require("../../../config")

module.exports = {
    type: "GET",
    fn: async (req, res) => {

        const records = await api.airtable("Content").select({
            maxRecords: 100,
            cellFormat: "json",
            view: "Grid view"
        }).all();

        const preImages = await api.cloudinary.api.resources({ by_folder: "c2e6a1067e8952d4263af9fc18d3644038" });
        records.forEach(async (r) => {
            const image = r.fields.thumbnail[0];
            const preFile = preImages.resources.find((img) => img.public_id.match(image?.id));

            if (image && !preFile) {
                await api.cloudinary.uploader.upload(image.url, {
                    filename_override: image.id,
                    use_filename: true,
                    unique_filename: false,
                    folder: api.cloudinary.config().path + "/content",
                    overwrite: true
                });
            }
        });

        const config = api.cloudinary.config();
        res.send(records.map((r) => {
            return {
                id: r.id,
                fields: {
                    ...r.fields,
                    thumbnail: `https://res.cloudinary.com/${config.cloud_name}/${config.path}/content/${r.fields.thumbnail[0]?.id}`
                }
            }
        }));

    }
}