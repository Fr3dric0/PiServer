/**
 * Created by Acer on 24.03.2016.
 * @TODO:ffl - migrate the REST API to it's own server. I have encounted multiple problems and frustrations by keeping both
 *              the app and the api under one port.
 *                  1. When using the request method, and an error is sent from the API. The request method won't catch this error.
 *                  instead the error-handling template catches this. (causes the application to crash)
 */
var express = require('express');
var router = express.Router();
var request = require('request');
var Movie = require('../models/movie');
var TVShow = require('../models/tvshow');
var MediaParser = require('../models/parser/mediaparser');
// CONSTANTS
var SORT_ORDER = { "title": 1 };
var TYPE = { MOVIE: "movie", TVSHOW: "tv-show" };
// GET /api/v1/
router.get('/', function (req, res) {
    var sorting = req.sorting || SORT_ORDER;
    // GET MOVIES
    getDataFromScheema(Movie, { sort: sorting, skip: req.skipping.movie }, function (err, movies) {
        if (err) {
            // @TODO:ffl - replace printError() with real 'new Error()'
            return printError(err, res);
        }
        // GET TVSHOWS
        getDataFromScheema(TVShow, { sort: sorting, skip: req.skipping.tvshow }, function (err, shows) {
            if (err) {
                // @TODO:ffl - replace printError() with real 'new Error()'
                return printError(err, res);
            }
            var _r = {};
            if (!movies) {
                _r = shows;
            }
            else if (!shows) {
                _r = movies;
            }
            else {
                _r = { movies: movies, tvshows: shows };
            }
            res.status(200);
            return res.json(_r);
        });
    });
});
// GET /api/v1/:vidID
router.get('/:vidID', function (req, res, next) {
    var vidID = req.params.vidID;
    var sort = { title: -1 }; // The default sorting sequence
    // First search in Movie
    getDataFromScheema(Movie, { sort: sort, query: { vidID: vidID } }, function (err, mov) {
        if (err) {
            return printError(err, res);
        }
        if (mov.length > 0) {
            return res.json(mov[0]);
        }
        else {
            getDataFromScheema(TVShow, { sort: sort, query: { vidID: vidID } }, function (err, show) {
                if (show.length > 0) {
                    return res.json(show[0]);
                }
                else {
                    var searchErr = new Error("Could not find video " + vidID);
                    searchErr.status = 404;
                    searchErr.api = true;
                    return next(searchErr);
                }
            });
        }
    });
});
router.get('/:vidID/:season', function (req, res) {
    var vidID = req.params.vidID;
    var season = req.params.season;
    TVShow.find({ vidID: vidID }, function (err, show) {
        if (err) {
            // @TODO:ffl - replace printError() with real 'new Error()'
            return printError({
                title: "MEDIA LOADING ERROR",
                message: "Could not get TV-show from database",
                statusCode: 500
            }, res);
        }
        MediaParser.printableSeason(show[0], { season: season }, function (err, printable) {
            if (err) {
                // @TODO:ffl - replace printError() with real 'new Error()'
                return next(err);
            }
            res.json(printable);
            return;
        });
    });
});
router.get('/:vidID/:season/:episode', function (req, res, next) {
    var vidID = req.params.vidID;
    var season = req.params.season;
    var episode = req.params.episode;
    TVShow.findOne({ vidID: vidID }, function (err, show) {
        if (err) {
            return next(err);
        }
        if (!show) {
            var searchErr = new Error("Could not find tv-show: " + vidID);
            searchErr.status = 404;
            return next(searchErr);
        }
        MediaParser.printableEpisodes(show, {
            season: season,
            episode: episode
        }, function (err1, printable) {
            if (err1) {
                return next(err1);
            }
            return res.json(printable);
        });
    });
});
router.post('/', function (req, res, next) {
    var type = req.body.type;
    if (!req.body.type || !req.body.title) {
        var err = new Error("Missing fields ´title´ and ´type´ in POST-body");
        err.status = 400;
        return next(err);
    }
    if (type == TYPE.MOVIE) {
        // Convert thumb to object
        var thumb;
        try {
            thumb = JSON.parse(req.body.thumb);
        }
        catch (e) {
            thumb = {};
        }
        Movie.create({
            title: req.body.title,
            thumb: thumb,
            type: type,
            url: req.body.url,
            rating: req.body.rating,
            viewcount: req.body.viewcount || 0,
            details: req.body.details,
            genre: req.body.genre.trim().split(','),
            released: new Date(req.body.released)
        }, function (saveErr, m) {
            if (saveErr) {
                return next(saveErr);
            }
            res.status = 200;
            res.json(m);
        });
    }
    else if (type == TYPE.TVSHOW) {
        var thumb;
        try {
            thumb = JSON.parse(req.body.thumb);
        }
        catch (e) {
            thumb = {};
        }
        var seasons = setSeason(req.body, MediaParser.createVidID(req.body.title));
        if (!seasons) {
            var seasonParseError = new Error("[SEASON PARSE ERROR] One of the input fields is missing or wrongly formatted");
            seasonParseError.status = 400;
            return next(seasonParseError);
        }
        TVShow.create({
            title: req.body.title,
            thumb: thumb,
            type: type,
            seasons: seasons,
            rating: req.body.rating,
            viewcount: req.body.viewcount,
            details: req.body.details,
            genre: req.body.genre.trim().split(",") || [],
            released: new Date(req.body.released)
        }, function (saveErr, tv) {
            if (saveErr) {
                return next(saveErr);
            }
            res.status = 200;
            res.json(tv);
        });
    }
});
router.put('/:vidID/addview', function (req, res) {
    var vidID = req.params.vidID;
    findMedia(vidID, function (err, data) {
        if (err) {
            return null;
        }
        switch (data.type) {
            case TYPE.TVSHOW:
                TVShow.findOneAndUpdate({ vidID: vidID }, { viewcount: data.viewcount + 1 }, function (updateErr, media) {
                    if (updateErr) {
                        // @TODO:ffl - replace printError() with real 'new Error()'
                        return printError({
                            title: "VIEWCOUNT INCREMENTATION ERROR",
                            message: "Incrementation of tv-show " + vidID + " could not be completed",
                            statusCode: 500
                        }, res);
                    }
                    return res.json(media);
                });
                break;
            case TYPE.MOVIE:
                Movie.findOneAndUpdate({ vidID: vidID }, { viewcount: data.viewcount + 1 }, function (updateErr, media) {
                    if (updateErr) {
                        // @TODO:ffl - replace printError() with real 'new Error()'
                        return printError({
                            title: "VIEWCOUNT INCREMENTATION ERROR",
                            message: "Incrementation of movie " + vidID + "could not be completed",
                            statusCode: 500
                        }, res);
                    }
                    return res.json(media);
                });
                break;
            default:
                // @TODO:ffl - replace printError() with real 'new Error()'
                return printError({
                    title: "UNSUPPORTED MEDIATYPE",
                    message: "The mediatype: " + data.type + " in video: " + data.vidID + " is not supported",
                    statusCode: 400
                }, res);
        }
    });
});
router.put('/:vidID/change/:property/to/:value', function (req, res, next) {
    var vidID = req.params.vidID;
    var property = req.params.property;
    var value = req.params.value;
    updateMedia({ vidID: vidID, key: property, value: value }, function (err, media) {
        if (err) {
            return next(err);
        }
        return res.json(media);
    });
});
function updateMedia(options, callback) {
    if (typeof options.key == "undefined") {
        var err = new Error("The ´key´ in the object is missing");
        err.status = 400;
        return callback(err);
    }
    if (typeof options.value == "undefined") {
        var err = new Error("The ´value´ in the object is missing");
        err.status = 400;
        return callback(err);
    }
    if (typeof options.vidID == "undefined") {
        var err = new Error("The vidID value is missing");
        err.status = 400;
        return callback(err);
    }
    findMediaType(options.vidID, function (err, type) {
        if (err) {
            return callback(err, null);
        }
        var propertiesToUpdate = {};
        propertiesToUpdate[options.key] = options.value;
        /*
         * If the property is 'title', then the vidID has to be updated
         * */
        if (options.key == "title") {
            propertiesToUpdate.vidID = MediaParser.createVidID(options.value);
        }
        switch (type) {
            case TYPE.TVSHOW:
                TVShow.findOneAndUpdate({}, propertiesToUpdate, function (updateErr, media) {
                    if (updateErr) {
                        return callback(updateErr, null);
                    }
                    return callback(null, media);
                });
                break;
            case TYPE.MOVIE:
                Movie.findOneAndUpdate({}, propertiesToUpdate, function (updateErr, media) {
                    if (updateErr) {
                        return callback(updateErr, null);
                    }
                    return callback(null, media);
                });
                break;
            default:
                var err = new Error("The mediatype ´" + type + "´ is not supported in this application");
                err.status = 400;
                return callback(err);
        }
    });
}
function findMediaType(vidID, callback) {
    findMedia(vidID, function (err, media) {
        console.log("1. FINDING MEDIA");
        if (err) {
            return callback(err, null);
        }
        console.log("2. FINDING MEDIATYPE");
        if (typeof media.type == "undefined") {
            return callback({ title: "MISSING PROPERTY", message: "Missing property 'type'", statusCode: 500 }, null);
        }
        return callback(null, media.type);
    });
}
function findMedia(vidID, callback) {
    TVShow.find({ vidID: vidID }, function (err, show) {
        if (err) {
            return callback({ title: err, statusCode: 500 }, null);
        }
        if (show.length > 0 || Object.keys(show).length > 0) {
            return callback(null, show[0]);
        }
        else {
            Movie.find({ vidID: vidID }, function (err1, movie) {
                if (err1) {
                    return callback({ title: err, statusCode: 500 }, null);
                }
                if (movie.length > 0 || Object.keys(movie).length > 0) {
                    return callback(null, movie[0]);
                }
                else {
                    return callback({
                        title: "DATA COLLECTION ERROR",
                        message: "Could not find any tv-show or movie with vidID of " + vidID,
                        statusCode: 400
                    }, null);
                }
            });
        }
    });
}
function setSeason(body, vidID) {
    if (!body.seasons) {
        var seasonErr = new Error("Season field is required!");
        seasonErr.status = 400;
        return seasonErr;
    }
    var seasons = body.seasons.trim().split(",");
    var _s = [];
    seasons.forEach(function (val, key) {
        var epNum = parseInt(val);
        var buffer = {};
        buffer.thumb = MediaParser.createThumbURL(vidID, "small", ".j");
        buffer.thumb = buffer.thumb.substring(0, buffer.thumb.length - ".j".length) + (key + 1) + ".jpg";
        buffer.episodes = [];
        for (var i = 0; i < val; i++) {
            buffer.episodes.push(MediaParser.createVidUrl(vidID, TYPE.TVSHOW, { season: key + 1, episode: i + 1 }));
        }
        _s.push(buffer);
    });
    return _s;
}
/**
 *  @param: (MongoObject)   Scheema     The mongodb Scheema to collect data from
 *          (Object)        conf        Different configuration data, like sorting, etc
 *              (Boolean)       conf.skip   If the user want's to skip collection of data from the specified scheema.
 *                                          he can set skip to true
 *
 *  @desc:  Uses the provided scheema and conf data, to get data from MongoDB.
 *  @return: (Function)     Callback    Callback method with data from the scheema, and evt. errors
 * */
function getDataFromScheema(Scheema, conf, callback) {
    // Check if user wants to skip query
    if (!conf.skip) {
        // Get data from MongoDB
        Scheema.find(conf.query || {}, // QUERY
        { _id: false, __v: false } // FILTER OUT FIELDS
        ).sort(conf.sort || {}) // SORTING
            .exec(function (err, data) {
            if (err) {
                // @TODO:ffl - replace printError() with real 'new Error()'
                return callback({ title: "DATA COLLECTION ERROR", message: err, statusCode: 500 });
            }
            return callback(null, data);
        });
    }
    else {
        return callback(null, null);
    }
}
/**
 *  @param:     [Object]    options     Includes the elements of the error message
 *                                          * title: The title of the error
 *                                          * message: The error message
 *                                          * statusCode: the http statusCode
 *              [Object]       res      The response object
 *  @desc:      Is responsible for handling and print out the error message
 *  @return:    void
 * */
function printError(options, res) {
    var errorMsg = {
        title: (options.title == "" ? "Error" : options.title),
        message: (options.message || "Error in server"),
        statusCode: (options.statusCode || 500)
    };
    res.setHeader('content-type', 'application/json');
    res.status(options.statusCode);
    res.end(JSON.stringify(errorMsg));
}
module.exports = router;
//# sourceMappingURL=api.js.map