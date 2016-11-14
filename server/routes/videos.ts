/**
 * Created by Acer on 24.03.2016.
 */
let express = require('express');
var fs = require('fs');
var router = express.Router();
var assert = require('assert');
var request = require('request');

var VideoFileHandler = require("../src/VideoFileHandler");

var mongoose = require("mongoose");
var TVShow = require("../models/tvshow");

//var _uri = "http://localhost:3000";
var _api_uri = "http://localhost:3000/api/v1";

/* home page. */
router.get('/', function(req, res, next) {
    let buffer;
    var sort = req.query.sort || null;
    var order = req.query.order || null;

    var restURI = req.config.rest.url;

    if(sort){
        restURI += "?sort="+sort;

        // Order should only be used, if sort exists
        if(order){
            restURI += "&order="+order;
        }else{
            restURI += "&order=asc";
        }
    }


    // Get data from API
    request({
        uri: restURI,
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }, (error, response, body) => {
        if(error){
            res.send("Could not connect to REST-API");
            return;
        }

        // The body could send out html data.
        // Use a try-block, to catch this
        try {
            buffer = JSON.parse(body); // @TODO:ffl fixes error
        }catch(e){
            res.status(400);
            return res.send(body);
        }

        res.render('videos', {
            title: req.config.title,
            movies: buffer.movies,
            tv_shows: buffer.tvshows,
            user: req.user,
            error : (() => { // Check if error messages exists
                if(req.session.error != null || req.session.error != undefined){
                    if(Object.keys(req.session.error).length > 0) {
                       let err = req.session.error;

                       req.session.error = {};

                       console.log(error);

                       return err;
                   }
                }else{
                    return null;
                }
            })()
        });

        req.session.error = {};
    });

    /**
     *  @param: (Object)    videos  The video json object
     *  @desc:  Iterates over the 'videos' param, and by using the type argument
     *          map by 'movie', 'tv-show' and 'other' (the undefined ones)
     *
     *  @return:    (Object) the mapped values, with keys: "movies", "tv-show" and "other"
     * */
    function mapvideos(videos){
        var movies = [];
        var tv_show = [];
        var other = [];

        for(var i in videos){
            if(videos[i].type == "movie"){
                movies.push(videos[i]);
            }else if(videos[i].type == "tv-show"){
                tv_show.push(videos[i]);
            }else{
                other.push(videos[i]);
            }
        }

        return {"movies": movies, "tv-show": tv_show, "other": other};
    }

});

router.get('/:vidId', (req, res, next) => {
    var vidId = req.params.vidId;

    /** When url param (vidId) is null, no videofile has been provided.
     *  Therefore redirect the user back to the videos page.
     * */
    if(vidId == "undefined" || vidId == "null"){
        res.redirect("/videos");
    }

    // GET data
    request({
        uri:req.config.rest.url+"/"+vidId,
        method: 'GET',
        headers:{
            "Content-Type": "application/json"
        }
    }, (err, response, body) => {
        if(err){
            return next(err);
        }

        if(!body){
            var bodyErr = new Error("Could not get videodata");
            bodyErr.status = 400;
            return next(bodyErr);
        }

        try {
            var video = JSON.parse(body);
        }catch(e){
            return res.send(body);
        }

        let template:string;

        if(video){

            /*
            * Decide the template to use
            *   - 'movie' if the mediatype is a movie, then proceed straight to the videoplayer
            *   - 'tvshow' if mediatype is a tvshow, then by this route we don't know which season or episode
            *     the user wants to watch. Proceed therefore to the details paige, where the user can specify.
            * */
            switch(video.type){
                case 'movie':
                    template = 'mediaplayer';
                    incViewcount(vidId, req);
                    break;
                case 'tv-show':
                    template = 'details';
                    break;
                default:
                    template = 'mediaplayer';
                    break;
            }

            res.render(template, {
                title: req.config.title,
                video: video,
                user: req.user
            })
        }else{
            var renderErr = new Error("Could not render media: "+vidId);
            renderErr.status = 400;
            return next(renderErr);
        }
    });

});


/**
 * Episode is unspecified, therefore reroute the user to the details-page.
 * */
router.get('/:vidID/:season', (req, res, next) => {
    return res.redirect('/videos/'+req.params.vidID);
});

router.get('/:vidID/:season/:episode', (req, res, next) => {
    let vidID = req.params.vidID;
    let season = req.params.season;
    let episode = req.params.episode;

    if(season == "undefined" || season < 1){
        req.session.error = {
            title: "INVALID SEASON NUMBER",
            message: "Sesongnummeret for programmet: "+vidID+" er ikkje gyldig"
        }
        res.redirect("/videos");
    }

    if(episode == "undefined" || episode < 1){
        req.session.error = {
            title: "INVALID EPISODE NUMBER",
            message: "Episodenummeret for programmet: "+vidID+" er ikkje gyldig"
        }
        res.redirect("/videos")
    }



    request({
        uri: req.config.rest.url +"/"+ vidID + "/" + season + "/" + episode,
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }, (err, response, body) => {
        if(err){
            return next(err);
        }


        try {
            var video = JSON.parse(body); // only take the first element.

        // If the parsing failes, then the body is probably a html template
        }catch(e){
            return res.send(body);
        }
        res.render("mediaplayer",{
            title: req.config.title,
            video: video,
            conf: {
                season: season,
                episode: episode
            },
            user: req.user
        });

        incViewcount(vidID, req);

    });
});

router.delete('/:vidID', (req, res) => {
    var vidID = req.params.vidID;

    VideoFileHandler.deleteVideo(vidID, (err, response) => {
        if(err){
            res.status(400);
            return res.send("Could not remove "+vidID);
        }

        res.status = 200;
        res.send(vidID+ " DELETED");
        return "Success";
    });

});

/**
 *  @param: (String)    vidID   The identifier used for each movie or show
 *          (Object)    req     Uses the request object to access config data, such as the REST-API URL
 *  @desc:  Increments the viewcount for the specified video.
 *          Sends a PUT request to the REST-API which handles communication to the database
 * */
function incViewcount(vidID, req){
    request({
        uri:req.config.rest.url+"/"+vidID+"/addview",
        method: "PUT"
    }, (err, response, body) => {
        if(err){
            console.log(err);
            return;
        }

    });
}


module.exports = router;


/* FUNGERANDE SYSTEM FOR Å HENTE KOMMENTARAR
 var mysql = require('mysql');
 var connection = mysql.createConnection({
 host: 'localhost',
 user: 'root',
 password: '',
 database: 'PiServer'
 });

 connection.connect();

 connection.query('SELECT * FROM test.comment', (err, rows, fields) => {
 if(err){
 return console.log(err);
 }

 res.send(rows);

 }); */