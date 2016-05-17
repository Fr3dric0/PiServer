/**
 * Created by Acer on 24.03.2016.
 */
var express = require('express');
var fs = require('fs');
var router = express.Router();
var assert = require('assert');
var request = require('request');
//var _uri = "http://localhost:3000";
var _api_uri = "http://localhost:4567/api/v1";
/* GET home page. */
router.get('/', function (req, res, next) {
    var movies = [];
    var tv_show = [];
    var buffer;
    request({
        uri: _api_uri,
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
        var mappedVideos = mapvideos(buffer);
        res.render('videos', {
            title: "PiServer",
            movies: mappedVideos["movies"],
            tv_shows: mappedVideos["tv-show"],
            user: req.user
        });
    });
    /**
     *  @param: (Object)    videos  The video json object
     *  @desc:  Iterates over the 'videos' param, and by using the type argument
     *          map by 'movie', 'tv-show' and 'other' (the undefined ones)
     *
     *  @return:    (Object) the mapped values, with keys: "movies", "tv-show" and "other"
     * */
    function mapvideos(videos) {
        var movies = [];
        var tv_show = [];
        var other = [];
        for (var i in videos) {
            if (videos[i].type == "movie") {
                movies.push(videos[i]);
            }
            else if (videos[i].type == "tv-show") {
                tv_show.push(videos[i]);
            }
            else {
                other.push(videos[i]);
            }
        }
        return { "movies": movies, "tv-show": tv_show, "other": other };
    }
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
        uri: _api_uri + "/" + vidId,
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
 * Episode is unspecified, therefore reroute the user to the details-page.
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
        uri: _api_uri + "/" + vidID + "/" + season + "/" + episode,
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
        var video = JSON.parse(body); // only take the first element.
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
router.delete('/:vidID', function (req, res) {
    var vidID = req.params.vidID;
    console.log("deleting");
    res.status(200);
    res.send(vidID + " DELETED");
});
/**
 *  @desc:  Increments the viewcount for the video which calls it
 * */
function incViewcount(vidID) {
    request({ uri: "http://localhost:4567/api/v1/" + vidID + "/addview",
        method: "PUT"
    }, function (err, response, body) {
        if (err) {
            console.err(err);
            return;
        }
    });
}
module.exports = router;
//# sourceMappingURL=videos.js.map