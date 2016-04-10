/**
 * Created by Acer on 24.03.2016.
 */
let express = require('express');
let fs = require('fs');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectID = require("mongodb").ObjectID;
var request = require('request');

var mongoUrl = "mongodb://localhost:27017/PiMediaServer";

/* GET home page. */
router.get('/', function(req, res, next) {
    let movies = [];
    let tv_show = [];
    let buffer;

    request({
        uri: 'http://localhost:3000/api/v1/',
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }, (error, response, body) => {
        if(error){
            res.send("Could not load data");
            return;
        }

        buffer = JSON.parse(body);
        for(var i in buffer){
            if(buffer[i].type == "movie"){
                movies.push(buffer[i]);
            }else if(buffer[i].type == "tv-show"){
                tv_show.push(buffer[i]);
            }
        }


        res.render('videos', {
            title: "PiServer",
            movies: movies,
            tv_shows: tv_show
        });

    });
    /*
     res.render('videos', {
     title: 'PiServer',
     movies: movies,
     tv_shows: tv_shows
     });*/



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
        uri:'http://localhost:3000/api/v1/'+vidId,
        method: 'GET',
        headers:{
            "Content-Type": "application/json"
        }
    }, (err, response, body) => {
        if(err){
            res.send(err);
            return;
        }

        let video = JSON.parse(body)[0];

        let template:string;

        if(typeof video != "undefined"){

            switch(video.type){
                case 'movie':
                    template = 'videoplayer';
                    break;
                case 'tv-show':
                    template = 'details';
                    break;
            }

            res.render(template, {
                title: "PiServer",
                video: video
            })
        }else{
            res.send("<h1>Could not load media with id: "+vidId+"</h1>");
            return;
        }
    });

});


/**
 * Episode is unspecified, therefore send the user to the details-page.
 * */
router.get('/:vidID/:season', (req, res) => {
    res.redirect('/videos/'+req.params.vidID);
    return;
});


router.get('/:vidID/:season/:episode', (req, res, next) => {
    let vidID = req.params.vidID;
    let season = req.params.season;
    let episode = req.params.episode;

    let _uri = 'http://localhost:3000';

    request({
        uri:_uri+'/api/v1/'+vidID+"/"+season+"/"+episode,
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }, (err, response, body) => {
        if(err){
            res.send(err);
            return;
        }

        let video = JSON.parse(body)[0]; // only take the first element.

        res.render("videoplayer",{
            title: "PiServer",
            video: video,
            conf: {
                season: season,
                episode: episode
            }
        });



    });
});



module.exports = router;