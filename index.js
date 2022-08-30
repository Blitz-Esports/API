require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const { BlogRoute } = require("./routes/blog");
const { ResizeRoute } = require("./routes/resize");
const { FaqRoute } = require("./routes/faq");
const { GalleryRoute } = require("./routes/gallery");
const { HeaderRoute } = require("./routes/header");
const app = express();
const {middleware} = require("apicache");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(middleware("1 day"));

const run = async () => {

    app.get("/", (req, res) => {
        res.send("Ok Scientist ;)");
    });

    app.use(BlogRoute);
    app.use(ResizeRoute);
    app.use(FaqRoute);
    app.use(GalleryRoute);
    app.use(HeaderRoute);

    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}

run();
