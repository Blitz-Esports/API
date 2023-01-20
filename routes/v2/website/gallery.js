const { api } = require("../../../config")

module.exports = {
    type: "GET",
    fn: async (_, res) => {

        const record = await api.airtable("Gallery").select({
            maxRecords: 100,
            cellFormat: "json",
            view: "Grid view"
        }).all();

        const preImages = await api.cloudinary.api.resources({ by_folder: "c2e57322bf89697928f195129fe9c66486" });
        record.forEach(async (r) => {
            const image = r.fields.Image[0];
            const preFile = preImages.resources.find((img) => img.public_id.match(image.id));

            if (image && !preFile) {
                await api.cloudinary.uploader.upload(image.url, {
                    filename_override: image.id,
                    use_filename: true,
                    unique_filename: false,
                    folder: api.cloudinary.config().path + "/gallery",
                    overwrite: true
                });
            }
        });

        const config = api.cloudinary.config();
        res.send(record.map((r) => {
            return {
                id: r.fields.Image[0]?.id,
                name: r.fields.ID,
                url: `https://res.cloudinary.com/${config.cloud_name}/${config.path}/gallery/${r.fields.Image[0]?.id}`
            }
        }));

    }
}