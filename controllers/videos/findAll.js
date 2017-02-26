const Media = require('../../models/media');

const { getQuery } = require('./query');


const findAll = [
    getQuery,
    getMedia,
    returnData
];

function getMedia (req, res, next) {
    Media.find(req.videos.query)
        .then((videos) => {
            req.videos.videos = videos;
            next();
        })
        .catch(err => next(err));
}

function returnData (req, res, next) {
    const { videos } = req.videos;

    res.status(200).json(videos);
}


module.exports = { findAll };