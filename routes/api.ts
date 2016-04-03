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
let apiVersions = ["v1"];
let errorJson = {
    title:"Error",
    message: ""
};

let collectionName = "videos";


/* GET home page. */
router.get('/', function(req, res, next) {

});

/** Unspecified url, return all
 * */
router.get('/:version', validateParams, (req, res, next) => {
    let ver = valApiVersion(req.params.version, apiVersions);

    if(ver == null){
        printError(
            {
                title: "ClientError",
                message: "Could not find api version number",
                statusCode: 400
            }, res);

        return;
    }

    MongoClient.connect(mongoUrl, (err, db) => {
        if(err){
            printError(
                {
                    title: "Error",
                    message: err,
                    statusCode: 400
                }, res);

            return;
        }

        db.collection(collectionName).find({}, {_id: false}).toArray( (err, media) => {
            if(err){
                printError(
                    {
                        title: "Error",
                        message: err,
                        statusCode: 400
                    }, res);
                return;
            }

            res.setHeader('content-type', 'application/json');
            res.status(200);
            res.end(JSON.stringify(media));

        });
    });
});

/** Middelfunction which handles validation of the parameters
 *
 * */
function validateParams(req, res, next){
    console.log("middelware");
    let api = valApiVersion
    next();
}



//Interface used when the user wants to print an error
interface errorOptions{
    message:string;
    title:string;
    statusCode:int;
}

function printError(options:errorOptions, res){
    let errorMsg = {
        title: (options.title == "" ? "Error" : options.title),
        message: options.message
    };
    res.setHeader('content-type', 'application/json');
    res.status(options.statusCode);
    res.end(JSON.stringify(errorMsg));
}



function valApiVersion(v:string, versions){
    let found:boolean = false;

    let _ver:string = null;

    /* TODO: implement version shortening with preservation of the numbers
    // IF version name is bigger than 2 ('v1')
    // shorten it ( preserve first and last letter)
    if(v.length > 2){
        ver = v.substring(0,1)+v.substring(v.length-1, v.length);
    }else{
        ver = v;
    }*/

    versions.forEach( (ver) => {
        if(v == ver) {
            _ver = v;
        }
    } );

    return _ver;
}

module.exports = router;