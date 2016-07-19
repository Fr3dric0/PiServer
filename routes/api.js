/**
 * Created by Acer on 24.03.2016.
 */
var express = require('express');
var fs = require('fs');
var router = express.Router();
var request = require('request');
var Movie = require('../models/movie');
var TVShow = require('../models/tvshow');
var sort_order = { "title": 1 };
/*====  GET  ====*/
router.get('/', function (req, res) {
    var sorting = req.sorting || sort_order;
    // GET MOVIES
    getDataFromScheema(Movie, { sort: sorting, skip: req.skipping.movie }, function (err, movies) {
        if (err) {
            return printError(err, res);
        }
        // GET TVSHOWS
        getDataFromScheema(TVShow, { sort: sorting, skip: req.skipping.tvshow }, function (err, shows) {
            if (err) {
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
                return callback({ title: "DATA COLLECTION ERROR", message: err, statusCode: 500 });
            }
            return callback(null, data);
        });
    }
    else {
        return callback(null, null);
    }
}
router.get('/:vidID', function (req, res) {
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
                    return printError({
                        title: "VIDEO NOT FOUND",
                        message: "Could not find video with a vidID of " + vidID,
                        statusCode: 404
                    }, res);
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
            return printError({
                title: "MEDIA LOADING ERROR",
                message: "Could not get TV-show from database",
                statusCode: 500
            }, res);
        }
        createPrintableSeason(show[0], { season: season }, function (err, printable) {
            if (err) {
                return printError(err, res);
            }
            res.json(printable);
            return;
        });
    });
});
router.get('/:vidID/:season/:episode', function (req, res) {
    var vidID = req.params.vidID;
    var season = req.params.season;
    var episode = req.params.episode;
    TVShow.find({ vidID: vidID }, function (err, show) {
        if (err) {
            return printError({
                title: "MEDIA LOADING ERROR",
                message: "Could not get tv-show from the database",
                statusCode: 500
            }, res);
        }
        createPrintableEpisode(show[0], {
            season: season,
            episode: episode
        }, function (err1, printable) {
            if (err1) {
                return printError(err1, res);
            }
            res.json(printable);
            return;
        });
    });
});
router.post('/', function (req, res) {
    var vidID = req.params.vidID;
    var type = req.body.type;
    var media;
    convertToMedia(req.body, function (err, data) {
        if (err) {
            return printError(err, res);
        }
        // Check for duplicates
        checkIfMediaAlreadyExists(data, function (err, exists) {
            if (err) {
                return printError({
                    title: "DATA COLLECTION ERROR",
                    messsage: "Could not properly connect to the Database",
                    statusCode: 500
                }, res);
            }
            // Confirm if duplicate
            if (exists) {
                return printError({
                    title: "MEDIA ALREADY EXISTS",
                    message: "The media already exists. Check for duplicates, or choose a different title",
                    statusCode: 400
                }, res);
            }
            media = data;
            if (type == "movie") {
                var mov = Movie(media);
                // SAVE TO DATABASE
                mov.save(function (saveErr) {
                    if (saveErr) {
                        return printError({
                            title: "DATA UPLOAD ERROR",
                            message: "Could not upload " + media.title + " to database",
                            statusCode: 500
                        }, res);
                    }
                    res.status = 200;
                    res.json(media);
                });
            }
            else if (type == "tv-show") {
                var show = TVShow(media);
                // SAVE TO DATABASE
                show.save(function (saveErr) {
                    if (saveErr) {
                        return printError({
                            title: "DATA UPLOAD ERROR",
                            message: "Could not upload " + media.title + " to database",
                            statusCode: 500
                        }, res);
                    }
                    res.status = 200;
                    res.json(media);
                });
            }
        });
    });
});
router.put('/:vidID/addview', function (req, res) {
    var vidID = req.params.vidID;
    findMedia(vidID, function (err, data) {
        if (err) {
            return printError(err, res);
        }
        switch (data.type) {
            case "tv-show":
                TVShow.findOneAndUpdate({ vidID: vidID }, { viewcount: data.viewcount + 1 }, function (updateErr, media) {
                    if (updateErr) {
                        return printError({
                            title: "VIEWCOUNT INCREMENTATION ERROR",
                            message: "Incrementation of tv-show " + vidID + " could not be completed",
                            statusCode: 500
                        }, res);
                    }
                    return res.json(media);
                });
                break;
            case "movie":
                Movie.findOneAndUpdate({ vidID: vidID }, { viewcount: data.viewcount + 1 }, function (updateErr, media) {
                    if (updateErr) {
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
                return printError({
                    title: "UNSUPPORTED MEDIATYPE",
                    message: "The mediatype: " + data.type + " in video: " + data.vidID + " is not supported",
                    statusCode: 400
                }, res);
        }
    });
});
router.put('/:vidID/change/:property/to/:value', function (req, res) {
    var vidID = req.params.vidID;
    var property = req.params.property;
    var value = req.params.value;
    updateMedia({ vidID: vidID, key: property, value: value }, function (err, media) {
        if (err) {
            return printError(err, res);
        }
        return res.json(media);
    });
});
function updateMedia(options, callback) {
    if (typeof options.key == "undefined") {
        return callback({ title: "MISSING PROPERTY", message: "The key property is missing", statusCode: 400 }, null);
    }
    if (typeof options.value == "undefined") {
        return callback({ title: "MISSING PROPERTY", message: "The value property is missing", statusCode: 400 }, null);
    }
    if (typeof options.vidID == "undefined") {
        return callback({ title: "MISSING PROPERTY", message: "The vidID property is missing", statusCode: 400 }, null);
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
            propertiesToUpdate.vidID = createVidID(options.value);
        }
        switch (type) {
            case 'tv-show':
                TVShow.findOneAndUpdate({}, propertiesToUpdate, function (updateErr, media) {
                    if (updateErr) {
                        return callback({ title: updateErr }, null);
                    }
                    return callback(null, media);
                });
                break;
            case 'movie':
                Movie.findOneAndUpdate({}, propertiesToUpdate, function (updateErr, media) {
                    if (updateErr) {
                        return callback({ title: updateErr }, null);
                    }
                    return callback(null, media);
                });
                break;
            default:
                return callback({ title: "UNSUPPORTED MEDIATYPE", message: "The mediatype '" + type + "', in '" + options.vidID + "' is not supported" }, null);
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
function createPrintableEpisode(media, conf, callback) {
    var epSize = 0;
    try {
        validateEpisodeNumber(media, conf);
    }
    catch (e) {
        return callback(JSON.parse(e), null);
    }
    epSize = media.seasons[conf.season - 1].episodes.length;
    var _r = {
        vidID: media.vidID,
        title: media.title,
        thumb: media.thumb,
        type: typeof media.type != "undefined" ? media.type : "tv-show",
        rating: media.rating,
        details: media.details,
        genre: media.genre,
        viewcount: media.viewcount,
        uploaded: typeof media.uploaded != "undefined" ? media.uploaded : new Date(),
        season: parseInt(conf.season),
        episodes: {}
    };
    var thisSeason = media.seasons[conf.season - 1];
    _r.episodes.current = {
        episode: parseInt(conf.episode),
        url: thisSeason.episodes[conf.episode - 1],
        thumb: thisSeason.thumb,
        season: conf.season
    };
    // Try to get the previous episode
    if (conf.episode > 1) {
        _r.episodes.prev = {
            episode: parseInt(conf.episode) - 1,
            url: thisSeason.episodes[conf.episode - 2],
            thumb: thisSeason.thumb,
            season: conf.season
        };
    }
    // Try to get the next episode
    if (conf.episode < epSize) {
        _r.episodes.next = {
            episode: parseInt(conf.episode) + 1,
            url: thisSeason.episodes[conf.episode],
            thumb: thisSeason.thumb,
            season: conf.season
        };
    }
    return callback(null, _r);
}
function validateEpisodeNumber(media, conf) {
    var epSize = 0;
    var seasonSize = 0;
    if (conf.season == "undefined") {
        throw JSON.stringify({ title: "MISSING SEASON NUMBER", message: "Missing the value conf.season", statusCode: 400 });
    }
    if (conf.episode == "undefined") {
        throw JSON.stringify({ title: "MISSING EPISODE NUMBER", message: "Missing the value conf.episode", statusCode: 400 });
    }
    // CHECK SEASON NUMBERS
    seasonSize = media.seasons.length;
    if (conf.season < 1) {
        throw JSON.stringify({ title: "INVALID SEASON NUMBER", message: "The season number cannot be less than 1!", statusCode: 400 });
    }
    if (conf.season > seasonSize) {
        throw JSON.stringify({ title: "INVALID SEASON NUMBER", message: "The season number cannot bigger than the seasons available!", statusCode: 400 });
    }
    // CHECK EPISODE NUMBERS
    epSize = media.seasons[conf.season - 1].episodes.length;
    if (conf.episode < 1) {
        throw JSON.stringify({ title: "INVALID EPISODE NUMBER", message: "The episode number cannot be less than 1!", statusCode: 400 });
    }
    if (conf.episode > epSize) {
        throw JSON.stringify({ title: "INVALID EPISODE NUMBER",
            message: "The episode number is bigger than the number of episodes avilable in this season", statusCode: 400 });
    }
}
/**
 *  @param: (Object)    Media   The specific show collected from the Database
 *          (Object)    conf    Configuration values. Obligated value: 'season'
 *          (Function)  callback    The callback function
 *  @desc:  Puts the data we are interested in, into the _r variable.
 *          Then checks if conf.season exists and is a valid number.
 *          Last, add the values season and episodes
 *
 *  @return (Object) The whole season in print-friendly format
 * */
function createPrintableSeason(media, conf, callback) {
    var errorMsg = { title: "MEDIA PARSING ERROR", message: "", statusCode: 500 };
    var _r = {
        vidID: media.vidID,
        title: media.title,
        thumb: media.thumb,
        type: media.type,
        rating: media.rating,
        details: media.details,
        genre: media.genre,
        viewcount: media.viewcount,
        uploaded: typeof media.uploaded != "undefined" ? media.uploaded : new Date()
    };
    if (typeof conf.season == "undefined") {
        errorMsg.message = "conf.season is missing!";
        return callback(errorMsg, null);
    }
    if (conf.season < 1) {
        return callback({ title: "INVALID SEASON NUMBER", message: "The season number cannot be less than 1!", statusCode: 400 }, null);
    }
    _r.season = conf.season;
    _r.episodes = media.seasons[conf.season - 1];
    return callback(null, _r);
}
/**
 *  @desc:  Checks the collections 'movie' and 'tvshow' for an identical video
 * */
function checkIfMediaAlreadyExists(media, callback) {
    TVShow.find({ vidID: media.vidID }, function (err, data) {
        if (err) {
            return callback(err, null);
        }
        if (data.length > 0 || Object.keys(data).length > 0) {
            return callback(null, true);
        }
        else {
            Movie.find({ vidID: media.vidID }, function (err1, data1) {
                if (err1) {
                    return callback(err1, null);
                }
                if (data1.length > 0 || Object.keys(data).length > 0) {
                    return callback(null, true);
                }
                else {
                    return callback(null, false);
                }
            });
        }
    });
}
/**
 *  @param: (Object)    body    Is the request body, provided in a POST request
 *          (Function)  callback    The callback function
 *
 *  @desc:  Takes the provided values in the req.body, and converts it into valid values
 *          for the database.
 *
 *          NOTICE: The method parses som values, based on the specified 'mediatype'.
 *                  Currently only two mediatypes is accepted: movie and tv-show
 *
 * */
function convertToMedia(body, callback) {
    var media = {};
    // The title must be included
    if (!body.title) {
        return callback({
            title: "MISSING PROPERTY ERROR",
            message: "Missing title in the POST arguments",
            statusCode: 400
        }, null);
    }
    media.title = body.title;
    media.vidID = createVidID(body.title);
    if (!body.type) {
        return callback({
            title: "MISSING PROPERTY ERROR",
            message: "Missing property 'type' in POST argument",
            statusCode: 400 }, null);
    }
    media.type = body.type;
    media.thumb = createThumbObj(body, media.vidID);
    media.genre = body.genre.trim().split(",");
    media.details = body.details;
    if (body.rating > 10) {
        media.rating = 10;
    }
    else if (body.rating < 0) {
        media.rating = 0;
    }
    else {
        media.rating = body.rating;
    }
    // Get the "type-exclusive" values
    if (media.type == "tv-show") {
        media.seasons = setSeason(body, media.vidID);
    }
    else if (media.type == "movie") {
        media.url = createVidUrl(media.vidID, media.type, {});
    }
    var released;
    try {
        released = new Date(body.released);
    }
    catch (e) {
        released = new Date();
    }
    media.uploaded = new Date();
    return callback(null, media);
}
function setSeason(body, vidID) {
    var seasons = body.seasons.trim().split(",");
    var _s = [];
    seasons.forEach(function (val, key) {
        var epNum = parseInt(val);
        var buffer = {};
        buffer.thumb = createThumbURL(vidID, "small", ".j");
        buffer.thumb = buffer.thumb.substring(0, buffer.thumb.length - ".j".length) + (key + 1) + ".jpg";
        buffer.episodes = [];
        for (var i = 0; i < val; i++) {
            buffer.episodes.push(createVidUrl(vidID, "tv-show", { season: key + 1, episode: i + 1 }));
        }
        _s.push(buffer);
    });
    return _s;
}
function createVidUrl(vidID, type, options) {
    var url = "/res/videos/" + type + "/";
    url += vidID + "/";
    if (options && Object.keys(options).length > 0) {
        if (!options.season) {
            throw JSON.stringify({ title: "MISSING PROPERTY", message: "Property 'season' is missing in options.", statusCode: 400 });
        }
        if (!options.episode) {
            throw JSON.stringify({ title: "MISSING PROPERTY", message: "Property 'episode' is missing in options", statusCode: 400 });
        }
        url += "season_" + options.season;
        url += "/" + vidID;
        url += "_s" + getPrintableNumber(options.season);
        url += "e" + getPrintableNumber(options.episode);
        url += ".mp4";
    }
    else {
        url += vidID + ".mp4";
    }
    /**
     *  @desc:  A number should always print out double digits (03 or 24) or more, even though the number is less than 10.
     *          This function creates this printable version of the number.
     * */
    function getPrintableNumber(num) {
        var printNum = "";
        if (num < 10) {
            printNum += "0";
        }
        if (num < 0) {
            num = 0; // @TODO:ffl Make negative numbers valid
        }
        printNum += num;
        return printNum;
    }
    return url;
}
function createThumbObj(body, vidID) {
    var thumb = {};
    var buffer = JSON.parse(body.thumb);
    if (buffer.small) {
        thumb.small = createThumbURL(vidID, "small", ".jpg");
    }
    if (buffer.large) {
        thumb.large = createThumbURL(vidID, "large", ".jpg");
    }
    return thumb;
}
function createThumbURL(vidID, size, type) {
    var thumbURL = "/" + size + "/";
    if (type.substring(0, 1) != ".") {
        type = "." + type;
    }
    thumbURL += vidID + "_thumb" + type;
    return thumbURL;
}
function createVidID(title) {
    var vidID = "";
    var whiteSpaceChar = "_";
    for (var i = 0; i < title.length; i++) {
        var str = title.substring(i, i + 1);
        if (str == " ") {
            vidID += whiteSpaceChar;
        }
        else {
            vidID += str.toLowerCase();
        }
    }
    return vidID;
}
/**
 *
 * */
function printError(options, res) {
    var errorMsg = {
        title: (options.title == "" ? "Error" : options.title),
        message: (options.message || "Error in server"),
        statusCode: (options.statusCode || 400)
    };
    res.setHeader('content-type', 'application/json');
    res.status(options.statusCode);
    res.end(JSON.stringify(errorMsg));
}
module.exports = router;
//# sourceMappingURL=api.js.map