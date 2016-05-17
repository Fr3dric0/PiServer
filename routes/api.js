/**
 * Created by Acer on 24.03.2016.
 */
var express = require('express');
var fs = require('fs');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectID = require("mongodb").ObjectID;
var request = require('request');
var VideosConverter = require('../src/VideosConverter');
var mongoUrl = "mongodb://localhost:27017/PiMediaServer";
var apiVersions = ["v1"];
var errorJson = {
    title: "Error",
    message: ""
};
var validVideoTypes = ["mp4"];
var collectionName = "videos";
var Videos = require('../models/video'); // Get the Videos model
/*====  GET  ====*/
router.get('/', function (req, res, next) {
    res.json({
        title: "PiServer data collection API",
        text: "specify version 'v1' and video ID 'the_martian' to get data from the server"
    });
});
/** Unspecified url, return all
 * */
router.get('/:version', validateAPIVer, function (req, res, next) {
    var mediatype = req.query.type || null;
    var queryobj = {};
    if (mediatype) {
        queryobj = { type: mediatype };
    }
    // Find the video objects
    Videos.find(queryobj, { _id: false }, function (err, media) {
        if (err) {
            return printError({
                title: "QUERY ERROR",
                message: err,
                statusCode: 400
            }, res);
        }
        res.json(media);
    });
});
// Specified vidID
router.get('/:version/:vidID', validateAPIVer, function (req, res, next) {
    var queryobject = { vidID: req.params.vidID }; // Query properties, used to specify what to get from DB
    var mediaType = req.query.type || null; // ?type=xxxxx specify which mediatype the data is
    if (mediaType != null) {
        queryobject.type = mediaType;
    }
    Videos.findOne({ vidID: req.params.vidID }, { _id: false }, function (err, vid) {
        if (err) {
            return printError({
                title: "QUERY ERROR",
                message: err,
                statusCode: 400
            }, res);
        }
        res.json(vid);
    });
});
// Requests season of a show
router.get('/:version/:vidID/:season', validateAPIVer, function (req, res, next) {
    var version = req.params.version;
    var season = req.params.season;
    var vidID = req.params.vidID;
    // ERRORHANDLING: to low season index
    if (season < 1) {
        printError({
            title: "INDEX OUT OF BOUND ERROR",
            message: "The requested season cannot be 0 or lower!",
            statusCode: 404
        }, res);
        return;
    }
    request({
        uri: 'http://localhost:3000/api/' + version + '/' + vidID,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }, function (err, response, body) {
        if (err) {
            return printError({
                title: "ERROR",
                message: err,
                statusCode: 400
            }, res);
        }
        var buffer = JSON.parse(body)[0];
        //ERRORHANDLING: season number is to high
        if (season > buffer.seasons.length) {
            return printError({
                title: "INDEX OUT OF BOUNDS ERROR",
                message: "The requested season is bigger than the season indexes available",
                statusCode: 404
            }, res);
        }
        var vid = {
            vidID: buffer.vidID,
            title: buffer.title,
            thumb: buffer.thumb,
            type: buffer.type,
            season: parseInt(season),
            episodes: buffer.seasons[season - 1],
            rating: buffer.rating,
            viewcount: buffer.viewcount,
            details: buffer.details,
            genre: buffer.genre,
            uploaded: buffer.uploaded
        };
        res.json(vid);
    });
});
/*
router.get('/api/v1/:vidID/:season/:episode', (req, res) => {
    let vidID = req.params.vidID;
    let season = parseInt(req.params.season);
    let episode = parseInt(req.params.episode);

    console.log("=== RUNNING ===");

    request({
        uri:'http://localhost:4567/api/v1/'+vidID+"/"+season+'/'+episode,
        method: 'GET',
        headers:{
            'Content-Type': 'application/json'
        }
    },
        (err, response, body) => {
            if(err){
                return printError({
                    title: "ERROR",
                    message: err,
                    statusCode: 400
                }, res);
            }

            switch(response.statusCode){
                case 200:
                    return res.json(JSON.parse(body)[0]);
                    break;
                case 201:
                    return res.json(JSON.parse(body)[0]);
                    break;
                case 400:
                    return printError({
                        title: "CLIENT ERROR",
                        message: "Could not load the data because an error on the client side",
                        statusCode: 400
                    }, res);
                    break;
                case 404:
                    return printError({
                        title: "DATA NOT FOUND",
                        message: "Could not find the data you were looking for",
                        statusCode: 404
                    }, res);
                    break;
            }
        }
    );
});
*/
/**
 *  @url-param: (string)    vidID   The identification for the video
 *              (int)       season  The selected season
 *              (int)       episode Requested episode
 *  @desc:  The user request data with specific focus on 'this' episode.
 *          Router should gather the data, remove all other episodes, except the current, previous and the next.
 *
 *          Everything will be parsed to an object-element in the 'vids'-array
 *
 *  @return: (Array) With single object with mentioned data
 *
 *  EXAMPLE:
 *      URL: /api/v1/silicon_valley/1/2
 *      RETURNS:
 *              {
 *                  vidID: 'silicon_valley',
 *                  title: 'Silicon Valley',
 *                  thumb: {
 *                      small: "/small/silicon_valley_thumb.jpg",
 *                      large: "/large/silicon_valley_thumb.jpg"
 *                  },
 *                  type: "tv-show",
 *                  season: 1
 *                  episodes: {
 *                      current: "silicon_valley_s01e02.mp4",
 *                      next: "silicon_valley_s01e03.mp4",
 *                      previous: "silicon_valley_s01e01.mp4"
 *                  },
 *                  rating: 8.5,
 *                  viewcount: 83,
 *                  details: ......................
 *              }
 *
 * */
router.get('/:version/:vidID/:season/:episode', validateAPIVer, function (req, res, next) {
    var version = req.params.version;
    var vidID = req.params.vidID;
    var season = parseInt(req.params.season);
    var episode = parseInt(req.params.episode);
    var vids = [];
    if (episode < 1) {
        printError({
            title: "INDEX OUT OF BOUNDS ERROR",
            message: "The episode number cannot be 0 or lower!",
            statusCode: 404
        }, res);
        return;
    }
    // GET DATA
    request({
        uri: 'http://localhost:3000/api/' + version + '/' + vidID + "?type=tv-show",
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }, function (err, response, body) {
        if (err) {
            printError({
                title: "ERROR",
                message: err,
                statusCode: 400
            }, response);
            return;
        }
        var buffer = JSON.parse(body);
        //TODO:ffl Create middleware validationhandling for season and episodes
        // Check if SEASON is larger than the seasons available
        if (season > buffer.seasons.length) {
            printError({
                title: "INDEX OUT OF BOUNDS ERROR",
                message: "The requested season is bigger than the seasons available",
                statusCode: 400
            }, res);
            return;
        }
        else if (season < 1) {
            printError({
                title: "INDEX OUT OF BOUNDS ERROR",
                message: "The requested season cannot be lower than 0",
                statusCode: 400
            }, res);
            return;
        }
        // Check if REQUESTED episode is bigger than available episodes
        if (episode > buffer.seasons[season - 1].episodes.length) {
            printError({
                title: "INDEX OUT OF BOUNDS ERROR",
                message: "The requested episode number is bigger than the episodes available!",
                statusCode: 400
            }, res);
            return;
        }
        //                      Get first element from buffer
        vids.push(transformVideoJson(buffer, { season: season, episode: episode }));
        // Check if the video is empty
        if (vids[0] == null) {
            return;
        }
        res.json(vids[0]);
    });
});
/**
 *  @param: (Object)    data    The data recieved from the request
 *          (Object)    conf    Includes config data, like requested:
 *                                  - episode
 *                                  - season
 *  @desc:
 *      1. Checks if data includes 'vidID', this is an obligatory datastring.
 *      2. GET and CHECK if current season exists.
 *      3. Start to set data which don't need extra modification and parsing.
 *      4. Checks if the next and previous episodes is in the scope of the shows season and episodes.
 *      5. Put all data inside local variable 'd'
 *
 *  @return (Object) d
 * */
function transformVideoJson(data, conf) {
    if (!data.vidID) {
        console.log("INVALID DATA ERROR");
        console.log("\tCould not find vidID in program, every show MUST have a vidID for identification!");
        return null;
    }
    // Store the current season
    var currSeason = data.seasons[conf.season - 1];
    // CHECK if current season exists
    if (!currSeason) {
        return null;
    }
    // Check if current episode is bigger or smaller than the episodes available
    if ((conf.episode - 1 > currSeason.episodes.length) || (conf.episode - 1 < 0)) {
        return null;
    }
    // Start to collect data, which don't need parsing and modification
    var d = {
        vidID: data.vidID,
        title: data.title,
        thumb: data.thumb,
        type: data.type,
        season: parseInt(conf.season),
        episodes: {
            current: {
                thumb: currSeason.thumb,
                url: currSeason.episodes[conf.episode - 1]
            }
        },
        rating: data.rating,
        viewcount: data.viewcount,
        details: data.details,
        genre: data.genre
    };
    // CHECKS if the episode was the last in the season
    if (conf.episode > currSeason.episodes.length - 1) {
        // CHECKS if there is another season
        if (data.seasons.length - 1 > conf.season) {
            d.episodes.next = {
                thumb: data.seasons[conf.season].thumb,
                url: data.seasons[conf.season].episodes[0],
                season: conf.season + 1,
                episode: 1 // First episode
            };
        }
        // CHECKS if current episode was the first episode in the season
        if (conf.episode < 1) {
            // CHECKS if current season wasn't the first season
            if (conf.season > 1) {
                var prevSeason = data.seasons[conf.season - 2];
                d.episodes.prev = {
                    thumb: prevSeason.thumb,
                    url: prevSeason.episodes[prevSeason.episodes.length - 1],
                    season: conf.season - 1,
                    episode: prevSeason.episodes.length - 1
                };
            }
        }
    }
    // CHECKS if current episode is not the first
    if (conf.episode > 1) {
        d.episodes.prev = {
            thumb: currSeason.thumb,
            url: currSeason.episodes[conf.episode - 2],
            season: conf.season,
            episode: conf.episode - 1
        };
    }
    // Combined checks if episode isn't the last episode of the season
    if (conf.episode < currSeason.episodes.length) {
        d.episodes.next = {
            thumb: currSeason.thumb,
            url: currSeason.episodes[conf.episode],
            season: conf.season,
            episode: conf.episode + 1
        };
    }
    else {
        // Checks if there are more seasons available
        if (conf.season < data.seasons.length - 1) {
            d.episodes.next = {
                thumb: data.seasons[conf.season].thumb,
                url: data.seasons[conf.season].episodes[0],
                season: conf.season - 1,
                episode: 1 // First episode
            };
        }
    }
    return d;
}
/*====  POST  ====*/
router.post('/:version', validateAPIVer, function (req, res, next) {
    var title = req.body.title || null;
    var mediatype = req.body.type;
    // Check if title exists
    if (!title) {
        printError({
            title: "POST ERROR",
            message: "Missing title!",
            statusCode: 400
        }, res);
        return;
    }
    // Check if mediatype exists
    // Uses mediatype to identify if the data is for a movie or tv-show
    if (!mediatype) {
        printError({
            title: "POST ERROR",
            message: "Missing key 'type'!",
            statusCode: 400
        }, res);
        return;
    }
    var videosConverter = new VideosConverter(req.body);
    videosConverter.getData(function (err, data) {
        res.json(data);
    });
});
/**
 *  @params:    (string)    id          Videoid
 *              (array)     seasons     Array where each elementvalue is the episode numbers,
 *                                      and indexnumber+1 is the seasons
 *              (string)    filetype    The filetype for the files
 *
 *  @desc:      Iterates over each season.
 *                  1.  Sets the thumbimg value
 *                  2.  Iterates over each episode in each season and sets the filename
 *
 *  @return:    (array)     List with each season, and the episodes and thumbimg to follow
 * */
function setSeasons(id, seasons, filetype) {
    var _r = [];
    seasons.forEach(function (epCount, idx) {
        var season = idx + 1;
        var _thumb = "/small/" + id + "_thumb" + season + ".jpg";
        var episodes = [];
        var title = "";
        epCount = parseInt(epCount);
        for (var i = 1; i <= epCount; i++) {
            title = id + "_s";
            if (season < 10) {
                title += "0" + season;
            }
            else {
                title += season;
            }
            title += "e";
            if (i < 10) {
                title += "0" + i;
            }
            else {
                title += i;
            }
            title += "." + filetype;
            episodes.push("/tv-shows/" + id + "/season_" + season + "/" + title);
        }
        _r.push({
            thumb: _thumb,
            episodes: episodes
        });
    });
    return _r;
}
/**
 *  @param: (string)    id
 *          (string)    filetype    The filetype to the video
 *
 * */
function createMovieUrl(id, filetype) {
    var url = "/movies/" + id + "/" + id + "." + filetype;
    return url;
}
function convertToID(title) {
    var r = "";
    title = title.toLowerCase();
    for (var i = 0; i <= title.length; i++) {
        if (title.substring(i - 1, i) == " ") {
            r += "_";
        }
        else {
            r += title.substring(i - 1, i);
        }
    }
    return r;
}
/**
 * @desc: Connects to the database
 * */
function mongoConnect(url, res, callback) {
    MongoClient.connect(url, function (err, db) {
        if (err) {
            printError({
                title: "Connection ERROR",
                message: err,
                statusCode: 400
            }, res);
            return;
        }
        callback(err, db);
    });
}
/** Middlefunction which handles validation of the parameters
 *
 * */
function validateAPIVer(req, res, next) {
    var api = req.params.version;
    var errorMsg = {
        title: "API-version ERROR",
        message: "Something was wrong with the API-version",
        statusCode: 400
    };
    if (typeof api != "undefined") {
        // Validate API-version
        api = findAPIVersion(api, apiVersions);
        if (api == null) {
            errorMsg.message = "The API-version provided in the URL, is not valid!";
            printError(errorMsg, res);
            return;
        }
    }
    else {
        errorMsg.message = "Missing API_version!";
        printError(errorMsg, res);
        return;
    }
    next();
}
/**
 *  @param: (string)    v           The provided API version
 *          (array)     versions    List of the valid API
 *  @desc: Iterates over the existing API versions, and compares it with the provided API version
 *  @return: (string) API version IF found, null if not
 * */
function findAPIVersion(v, versions) {
    var _ver = null;
    // TODO: implement version shortening with preservation of the numbers
    // Iterate over API-versions
    versions.forEach(function (ver) {
        if (v == ver) {
            _ver = v;
        }
    });
    return _ver;
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