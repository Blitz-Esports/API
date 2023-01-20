const { Router } = require("express");
const { expressSharp, HttpAdapter } = require("express-sharp");

module.exports.ResizeRoute = Router().use("/resize", expressSharp({
    imageAdapter: new HttpAdapter()
}));