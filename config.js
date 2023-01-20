const GhostContentAPI = require("@tryghost/content-api");
const Airtable = require("airtable");
let Cloudinary = require("cloudinary").v2;

Cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

Cloudinary.config().path = "api-assets";

module.exports = {
    version: "v2",
    cache: {
        duration: "5 minutes",
        enabled: false
    },
    api: {
        airtable: new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('apptqnWFREJiuuggI'),
        cloudinary: Cloudinary,
        ghost: new GhostContentAPI({url: "https://blog.blitzesports.org" , key: process.env.GHOST_API_KEY , version: "v5.0"})
    }
}