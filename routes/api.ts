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
var Movie = require('../models/movie');
var TVShow = require('../models/tvshow');


var validVideoTypes = ["mp4"];
let collectionName = "videos";


/*====  GET  ====*/
router.get('/', function(req, res, next) {
    res.json({
        title:"PiServer data collection API",
        message: "specify version 'v1' and video ID 'the_martian' to get data from the server"
    });
});


router.get('/:vidID', (req, res) => {
    var vidID = req.params.vidID;
    var response = {};

    console.log("=== GETTING ELEMENT ===");

    TVShow.find({vidID: vidID}, (err, tvshow) => {
        console.log("TVSHOW");
        console.log(tvshow);

        if(tvshow.length > 0){
            response = tvshow[0];
            res.json(response);

        }else{
            Movie.find({vidID: vidID}, (err1, movie) => {
                console.log("MOVIE");
                console.log(movie);

                if(movie.length > 0){
                    response = movie[0];
                    res.json(response);

                }else{
                    return printError({
                        title: "VIDEO NOT FOUND",
                        message: "Could not find video with a vidID of "+vidID,
                        statusCode: 404
                    }, res);
                }

            });
        }
    });

});


router.get('/:vidID/:season', (req, res) => {
    var vidID = req.params.vidID;
    var season = req.params.season;

    TVShow.find({vidID: vidID}, (err, show) => {
        if(err){
            return printError({
                title: "MEDIA LOADING ERROR",
                message: "Could not get TV-show from database",
                statusCode: 500
            }, res);
        }


        createPrintableSeason(show[0], {season:season}, (err, printable) => {
            if(err){
                return printError(err, res);
            }

            res.json(printable);
            return;
        });

    });

});


router.get('/:vidID/:season/:episode', (req, res) => {
    var vidID = req.params.vidID;
    var season = req.params.season;
    var episode = req.params.episode;

    TVShow.find({vidID:vidID}, (err, show) => {
        if(err){
            return printError({
                title: "MEDIA LOADING ERROR",
                message: "Could not get tv-show from the database",
                statusCode: 500
            }, res);
        }


        createPrintableEpisode(show[0], {
            season:season,
            episode:episode
        }, (err1, printable) => {
            if(err1){
                return printError(err1, res);
            }

            res.json(printable);
            return;
        });

    });

});


router.post('/', (req, res) => {
    var vidID = req.params.vidID;
    var type = req.body.type;

    var media;

    convertToMedia(req.body, (err, data) => {
        if(err){
            return printError(err, res);
        }

        checkIfMediaAlreadyExists(data, (err, exists) => {
            if(err){
                return printError({
                    title: "DATA COLLECTION ERROR",
                    messsage: "Could not properly connect to the Database",
                    statusCode: 500
                }, res);
            }

            if(exists){

                return printError({
                    title: "MEDIA ALREADY EXISTS",
                    message: "The media already exists. Check for duplicates, or choose a different title",
                    statusCode: 400
                }, res);

            }else{
                media = data;

                if(type == "movie"){
                    var mov = Movie(media);
                    // SAVE TO DATABASE
                    mov.save( (saveErr) => {
                        if(saveErr){
                            return printError({
                                title: "DATA UPLOAD ERROR",
                                message: "Could not upload "+media.title+" to database",
                                statusCode: 500
                            }, res);
                        }

                        res.status = 200;
                        res.json(media);
                    })

                }else if(type == "tv-show"){
                    var show = TVShow(media);
                    // SAVE TO DATABASE
                    show.save( (saveErr) => {
                        if(saveErr){
                            return printError({
                                title: "DATA UPLOAD ERROR",
                                message: "Could not upload "+ media.title+" to database",
                                statusCode: 500
                            }, res);
                        }

                        res.status = 200;
                        res.json(media);
                    });
                }
            }
        });


    });

});




function createPrintableEpisode(media, conf, callback){
    let epSize = 0;

    try{
        validateEpisodeNumber(media, conf);
    }catch(e){
        return callback(JSON.parse(e), null);
    }

    epSize = media.seasons[conf.season-1].episodes.length;

    var _r = {
        vidID : media.vidID,
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

    var thisSeason = media.seasons[conf.season-1];

    _r.episodes.current = {
        episode: parseInt(conf.episode),
        url: thisSeason.episodes[conf.episode-1],
        thumb: thisSeason.thumb
    };

    // Try to get the previous episode
    if(conf.episode > 1){
        _r.episodes.prev = {
            episode: parseInt(conf.episode)-1,
            url: thisSeason.episodes[conf.episode-2],
            thumb: thisSeason.thumb
        };
    }

    // Try to get the next episode
    if(conf.episode < epSize){
        _r.episodes.next = {
            episode: parseInt(conf.episode)+1,
            url: thisSeason.episodes[conf.episode],
            thumb: thisSeason.thumb
        }
    }

    return callback(null, _r);
}
function validateEpisodeNumber(media, conf){
    let epSize = 0;
    let seasonSize = 0;

    if(typeof conf.season == "undefined"){
        throw JSON.stringify({title:"MISSING SEASON NUMBER", message: "Missing the value conf.season", statusCode: 400});
    }
    if(typeof conf.episode == "undefined"){
        throw JSON.stringify({title: "MISSING EPISODE NUMBER", message: "Missing the value conf.episode", statusCode: 400});
    }

    // CHECK SEASON NUMBERS
    seasonSize = media.seasons.length;
    if(conf.season < 1){
        throw JSON.stringify({title: "INVALID SEASON NUMBER", message: "The season number cannot be less than 1!", statusCode: 400});
    }
    if(conf.season > seasonSize){
        throw JSON.stringify({title: "INVALID SEASON NUMBER", message: "The season number cannot bigger than the seasons available!", statusCode: 400});
    }

    // CHECK EPISODE NUMBERS
    epSize = media.seasons[conf.season-1].episodes.length;
    if(conf.episode < 1){
        throw JSON.stringify({title: "INVALID EPISODE NUMBER", message: "The episode number cannot be less than 1!", statusCode: 400});
    }
    if(conf.episode > epSize){
        throw JSON.stringify({title: "INVALID EPISODE NUMBER",
            message: "The episode number is bigger than the number of episodes avilable in this season", statusCode: 400});
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
function createPrintableSeason(media, conf, callback){
    var errorMsg = {title: "MEDIA PARSING ERROR", message:"", statusCode: 500};

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

    if(typeof conf.season == "undefined"){
        errorMsg.message = "conf.season is missing!";
        return callback(errorMsg, null);
    }
    if(conf.season < 1){
        return callback({title:"INVALID SEASON NUMBER", message: "The season number cannot be less than 1!", statusCode: 400}, null);
    }

    _r.season  = conf.season;

    _r.episodes = media.seasons[conf.season-1];

    return callback(null, _r);

}
/**
 *  @desc:  Checks the collections 'movie' and 'tvshow' for an identical video
 * */
function checkIfMediaAlreadyExists(media, callback){
    TVShow.find({vidID: media.vidID}, (err, data) => {
        if(err){
            return callback(err, null);
        }
        if(data.length > 0 || Object.keys(data).length > 0){
            return callback(null, true);
        }else{

            Movie.find({vidID: media.vidID}, (err1, data1) => {
                if(err1){
                    return callback(err1, null);
                }

                if(data1.length > 0 || Object.keys(data).length > 0){
                    return callback(null, true);

                }else{ // Confirmed, The media does not exist
                    return callback(null, false);
                }
            });
        }


    });
}
function convertToMedia(body, callback){
    var media = {};

    // The title must be included
    if(!body.title){
        return callback({
            title: "MISSING PROPERTY ERROR",
            message: "Missing title in the POST arguments",
            statusCode: 400
        }, null);
    }
    media.vidID = createVidID(body.title);

    if(!body.type){
        return callback({
            title: "MISSING PROPERTY ERROR",
            message:"Missing property 'type' in POST argument",
            statusCode:400},
        null);
    }

    media.type = body.type;
    media.thumb = createThumbObj(body, media.vidID);
    media.genre = body.genre.trim().split(",");
    media.details = body.details;

    if(body.rating > 10){
        media.rating = 10;
    }else if(body.rating < 0){
        media.rating = 0;
    }

    // Get the "type-exclusive" values
    if(media.type == "tv-show"){
        media.seasons = setSeason(body, media.vidID);
    }else if(media.type == "movie"){
        media.url = createVidUrl(media.vidID, media.type, {});
    }


    return callback(null, media);
}
function setSeason(body, vidID){
    var seasons = body.seasons.trim().split(",");
    var _s = [];

    seasons.forEach((val, key) => {
        var epNum = parseInt(val);
        var buffer = {};

        buffer.thumb = createThumbURL(vidID, "small", ".j");
        buffer.thumb = buffer.thumb.substring(0, buffer.thumb.length - ".j".length) + (key+1)+ ".jpg";

        buffer.episodes = [];
        for(var i = 0; i < val; i++){
            buffer.episodes.push(createVidUrl(vidID, "tv-show", {season: key+1, episode: i+1}));
        }

        _s.push(buffer);
    });

    return _s;
}
function createVidUrl(vidID, type, options){
    var url = "/res/videos/"+type+"/";

    url += vidID + "/";

    if(options && Object.keys(options).length > 0 ){
        if(!options.season){
            throw JSON.stringify({title: "MISSING PROPERTY", message: "Property 'season' is missing in options.", statusCode: 400});
        }
        if(!options.episode){
            throw JSON.stringify({title: "MISSING PROPERTY", message:"Property 'episode' is missing in options", statusCode: 400})
        }

        url += "season_"+options.season;
        url += "/"+vidID;

        url += "_s"+getPrintableNumber(options.season);
        url += "e"+ getPrintableNumber(options.episode);
        url += ".mp4";

    }else{
        url += vidID + ".mp4";
    }


    /**
     *  @desc:  A number should always print out double digits (03 or 24) or more, even though the number is less than 10.
     *          This function creates this printable version of the number.
     * */
    function getPrintableNumber(num){
        var printNum = "";

        if(num < 10){
            printNum += "0";
        }

        if(num < 0){
            num = 0; // @TODO:ffl Make negative numbers valid
        }

        printNum += num;

        return printNum;
    }

    return url;
}
function createThumbObj(body, vidID){
    var thumb = {};
    var buffer = JSON.parse(body.thumb);

    if(buffer.small){
        thumb.small = createThumbURL(vidID, "small", ".jpg");
    }
    if(buffer.large){
        thumb.large = createThumbURL(vidID, "large", ".jpg");
    }

    return thumb;
}
function createThumbURL(vidID, size, type){
    var thumbURL = "/"+size+"/";

    if(type.substring(0,1) != "."){
        type = "."+type;
    }

    thumbURL += vidID+"_thumb"+type;

    return thumbURL;
}
function createVidID(title){
    var vidID = "";
    var whiteSpaceChar = "_";

    for(var i = 0; i < title.length; i++){
        var str = title.substring(i, i+1);

        if(str == " "){
            vidID += whiteSpaceChar;
        }else{
            vidID += str.toLowerCase();
        }
    }

    return vidID;
}


function parseSeason(data, season){

}




/**
 *
 * */
function printError(options, res){
    let errorMsg = {
        title: (options.title == "" ? "Error" : options.title),
        message: (options.message || "Error in server"),
        statusCode: (options.statusCode || 400)
    };

    res.setHeader('content-type', 'application/json');
    res.status(options.statusCode);
    res.end(JSON.stringify(errorMsg));
}


module.exports = router;