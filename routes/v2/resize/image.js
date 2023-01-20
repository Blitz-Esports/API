const { Router } = require("express");
const { expressSharp, HttpAdapter } = require("express-sharp");

module.exports = {
    type: "APP",
    fn: Router().use(expressSharp({
        imageAdapter: new HttpAdapter()
    }))
}