/**
 * Created by Acer on 24.03.2016.
 */
let express = require('express');
let fs = require('fs');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectID = require("mongodb").ObjectID;

var mongoUrl = "mongodb://localhost:27017/PiMediaServer";

/* GET home page. */
router.get('/', function(req, res, next) {
    MongoClient.connect(mongoUrl, (err, db) =>{
        assert.equal(null, err);
        console.log("Connected correctly to server");

        let videos = db.collection('videos');
        let movies:Object;
        let tv_shows:Object;

        // Load movie
        findCollectionData(videos, {type:'movie'}, {details:false, vid_url: false}, (err, m) => {
            assert.equal(null, err);

            movies = m;

            // load TV-SHOW
            findCollectionData(videos, {type:'tv-show'}, {details:false, vid_url: false}, (err, v) => {
                assert.equal(null, err);

                tv_shows = v;

                res.render('videos', {
                    title: 'PiServer',
                    movies: movies,
                    tv_shows: tv_shows
                });

                db.close();
            });



        });



    });


});

router.get('/:vidId', (req, res, next) => {
    var vidId = req.params.vidId;

    /** When url param (vidId) is null, no videofile has been provided.
     *  Therefore redirect the user back to the videos page.
     * */
    if(vidId == "undefined" || vidId == "null"){
        res.redirect("/videos");
    }

    //Connect to DB
    MongoClient.connect(mongoUrl, (err, db) => {
        assert.equal(null, err);

        //Get video
        findCollectionData(db.collection('videos'), {vidID: vidId}, {},
            (err, video) => {
                //assert.equal(null, err);

                if(err){
                    res.send(err);
                    return;
                }

                let template:string;

                /*
                * IF video is NOT undefined:
                *   1. Identify which mediatype the video is
                *       IF movie: use template 'videoplayer'
                *           *   When a movie is provided, there is only one video file.
                *               Therefore we can go directly to the videoplayer
                *       IF tv-show: use template 'details'
                *           *   When a tv-show is provided, there are several videofiles available.
                *               The user must thereby specify which season and episode the user would like to watch.
                *                   - Specified URL => /videos/:vidID/:season/:ep
                *
                * */
                if(typeof video[0] != "undefined"){
                    console.log("NOT UNDEFINED");

                    switch (video[0].type) {
                        case 'movie':
                            template = 'videoplayer';
                            break;
                        case 'tv-show':
                            template = 'details';
                    }


                    res.render(template, {
                        title: 'PiServer',
                        video: video[0]
                    });

                    db.close();

                }else{
                    res.send("<h2>Could not find movie: "+vidId+"</h2>");
                    return;
                }

            }
        );
    });
});



var findCollectionData = (collection, filter:Object, limit:Object, callback:Function) => {
    collection.find(filter, limit).toArray( (err, res) => {
        if(err){
            callback(err, null); // Send error to user
        }else{
            callback(null, res);
        }
    });
};


var loadJson = (url:String) => {
    let jsondata = fs.readFileSync(url, 'utf-8');
    return JSON.parse(jsondata);
};


module.exports = router;