/**
 * Created by Acer on 24.03.2016.
 */
var express = require('express');
var fs = require('fs');
var router = express.Router();
var assert = require('assert');
var request = require('request');
var _uri = "http://localhost:3000";
/* GET home page. */
router.get('/', function (req, res, next) {
    var movies = [];
    var tv_show = [];
    var buffer;
    request({
        uri: _uri + '/api/v1/',
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }, function (error, response, body) {
        if (error) {
            res.send("Could not load data");
            return;
        }
        buffer = JSON.parse(body);
        for (var i in buffer) {
            if (buffer[i].type == "movie") {
                movies.push(buffer[i]);
            }
            else if (buffer[i].type == "tv-show") {
                tv_show.push(buffer[i]);
            }
        }
        res.render('videos', {
            title: "PiServer",
            movies: movies,
            tv_shows: tv_show,
            user: req.user
        });
    });
});
router.get('/:vidId', function (req, res, next) {
    var vidId = req.params.vidId;
    /** When url param (vidId) is null, no videofile has been provided.
     *  Therefore redirect the user back to the videos page.
     * */
    if (vidId == "undefined" || vidId == "null") {
        res.redirect("/videos");
    }
    // GET data
    request({
        uri: _uri + '/api/v1/' + vidId,
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    }, function (err, response, body) {
        if (err) {
            res.send(err);
            return;
        }
        var video = JSON.parse(body);
        var template;
        if (typeof video != "undefined") {
            // Decide which template to use
            switch (video.type) {
                case 'movie':
                    template = 'videoplayer';
                    incViewcount(vidId);
                    break;
                case 'tv-show':
                    template = 'details';
                    break;
            }
            res.render(template, {
                title: "PiServer",
                video: validateThumbImages(video),
                user: req.user
            });
        }
        else {
            res.send("<h1>Could not load media with id: " + vidId + "</h1>");
            return;
        }
    });
});
/**
 *
 *  @desc: Iterates over the template images in the tv-show
 * */
function validateThumbImages(vid) {
    var seasons = vid.seasons;
    if (typeof seasons != "undefined") {
        var i = 1;
        seasons.forEach(function (s) {
            if (s != null) {
                if (typeof s.thumb == "undefined") {
                    var tempUrl = "/small/" + vid.vidID + "_thumb" + i + ".jpg";
                    s.thumb = tempUrl; // @TODO:ffl validate tempurl truly is a valid filename or not
                }
                else {
                }
            }
            i++;
        });
    }
    return vid;
}
/**
 * Episode is unspecified, therefore send the user to the details-page.
 * */
router.get('/:vidID/:season', function (req, res) {
    res.redirect('/videos/' + req.params.vidID);
    return;
});
router.get('/:vidID/:season/:episode', function (req, res, next) {
    var vidID = req.params.vidID;
    var season = req.params.season;
    var episode = req.params.episode;
    request({
        uri: _uri + '/api/v1/' + vidID + "/" + season + "/" + episode,
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }, function (err, response, body) {
        if (err) {
            res.send(err);
            return;
        }
        incViewcount(vidID);
        var video = JSON.parse(body)[0]; // only take the first element.
        res.render("videoplayer", {
            title: "PiServer",
            video: video,
            conf: {
                season: season,
                episode: episode
            },
            user: req.user
        });
    });
});
function incViewcount(vidID) {
    request({ uri: "http://localhost:4567/api/v1/" + vidID + "/addview",
        method: "PUT"
    }, function (err, response, body) {
        if (err) {
            console.err(err);
            return;
        }
        //    console.log("Viewcount incremented on "+vidID);
    });
}
module.exports = router;
//# sourceMappingURL=videos.js.map