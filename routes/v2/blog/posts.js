const { api } = require("../../../config");

module.exports = {
    type: "GET",
    fn: async (req, res) => {

        const apiRes = await api.ghost.posts.browse();
        res.send(apiRes);
    }
}