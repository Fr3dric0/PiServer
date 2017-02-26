
module.exports = {
    getQuery (req, res, next) {
        const { type } = req.query;
        const { vidId } = req.params; // Optional

        const query = {};

        if (type) {
            query.type = type;
        }

        if (vidId) {
            query.vidId = vidId;
        }

        if (!req.videos) {
            req.videos = {};
        }

        req.videos.query = query;
        next();
    },



};