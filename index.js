require("dotenv").config();
const { version, cache } = require("./config");
const express = require("express");
const util = require('util');
const glob = util.promisify(require('glob'));
const cors = require("cors");
const bodyParser = require('body-parser');
const { middleware } = require("apicache");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
if (cache.enabled) app.use(middleware(cache.duration));

const run = async () => {

    app.get("/", (req, res) => {
        res.send("Hello World");
    });

    const filePaths = await glob(`routes/${version}/**/*.js`, { nodir: true });
    const routes = filePaths.map((file) => {
        return {
            path: "./" + file,
            route: file
                .replace("routes", "")
                .replace(".js", "")
        }
    });

    routes.forEach((r) => {
        const file = require(r.path);
        const defRoute = file.route ?? r.route;
        if (file.type === "GET") app.get(defRoute, (...arg) => {
            try {
                file.fn(...arg);
            } catch (e) {
                console.log(e);
                arg[1].status(500).send("An unexpected error has ocurred");
            }
        })
        if (file.type === "APP") app.use(defRoute, file.fn)
        console.log(`Loaded: ${r.route}`);
    });

    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}

run();