const Media = require('../../models/media');
const Shows = require('../../models/tvshows');
const Movies = require('../../models/movies');

const { getQuery } = require('./query');

const findOne = [
    getQuery,
    getMedia,
    getType,
    getMediaDetails,
    concatMedia,
    returnVideos
];

function getMedia (req, res, next) {
    Media.find(req.videos.query)
        .then((videos) => {
            req.videos.videos = videos;
            next();
        })
        .catch(err => next(err));
}

function getType (req, res, next) {
    const { videos } = req.videos;

    if (videos.length < 1) {
        return res.status(204).json({});
    }

    const [video] = videos;
    const { type } = video;

    if (['movie', 'tv-show'].indexOf(type) == -1) {
        const err = new Error(`Illegal mediatype in media: ${video.title}`);
        err.status = 500;
        return next(err);
    }

    req.videos.type = type;
    req.videos.video = video; // Use only the single version
    delete req.videos.videos; // And remove the array
    next();
}

function getMediaDetails (req, res, next) {
    const { type, video } = req.videos;

    // Define which model to search in
    let Model = type == 'tv-show' ? Shows : Movies;
    // The key which the media-details  are placed in
    let typeKey = type == 'tv-show' ? 'show' : 'movie';

    Model.findOne({ mediaId: video._id })
        .then((data) => {
            req.videos[typeKey] = data;
            next();
        })
        .catch(err => next(err));
}

function concatMedia (req, res, next) {
    const { video, show, movie } = req.videos;

    req.videos.media = _destructureMedia(video, show || movie);
    next();
}

function returnVideos (req, res, next) {
    const { media } = req.videos;

    res.status(200).json(media);
}


/**
 *
 * Tedious function used, to concat
 *
 * */
function _destructureMedia (media, data) {
    let title, vidId, rating, genre, released, description, type, thumb, uploaded, uploader;
    if (media) {
        ({ title, vidId, rating, genre, description, type, released, thumb, uploaded, uploader } = media);
    }

    let m = { title, vidId, rating, genre, released, description, type, thumb, uploaded, uploader };

    // If data has seasons, it's a tv-show
    if (data.seasons) {
        m.seasons = data.seasons;
    } else if (data.url) {
        m.url = data.url;
    }


    // if (m.thumb) {
    //     m.thumb.small = setThumbUrl(req, m.thumb.small);
    //     m.thumb.large = setThumbUrl(req, m.thumb.large);
    // }

    return m;
}

module.exports = { findOne };