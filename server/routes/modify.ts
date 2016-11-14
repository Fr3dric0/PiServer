/**
 * Created by Acer on 19.05.2016.
 */

var express = require('express');
var fs = require('fs');
var request = require('request');
var router = express.Router();

var config = require('../bin/config/config.json');


router.get("/new", (req, res) => {

    res.render("uploadvideo", {
        title: req.config.title,
        user: req.user
    })

});

// Handles the form post request
router.post("/new", (req, res) => {
    console.log("REQUESTED BY: "+req.ip);
    request({
        uri: "http://localhost:4567/api/v1",
        method: "POST",
        body: convertToFormData( parseFormData(req.body) ),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }, (err, response, body) => {
        console.log(body);
    });

    res.send("Hello");
});




module.exports = router;


function convertToFormData(body){
    var str = "";
    var idx = 0;
    for(var key in body){

        if(body[key] == "" || body[key] == null){
            continue;
        }

        if( (idx < Object.keys(body).length-1) && str != 0 ){
            str += "&";
        }

        str += key+"="+body[key];
        idx++;
    }

    return str;
}


function parseFormData(body){
    var thumb = {};

    if(typeof body["thumbsmall"] != "undefined"){
        thumb.small = body["thumbsmall"];
        body["thumbsmall"] = null;
    }
    if(typeof body["thumblarge"] != "undefined"){
        thumb.large = body["thumblarge"];
        body["thumblarge"] = null;
    }

    body.thumb = JSON.stringify(thumb);


    return body;
}