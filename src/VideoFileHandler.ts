/**
 * Created by Acer on 17.05.2016.
 */

var request = require("request");
var fs = require('fs');
var rimraf = require('rimraf');

var api_url = "http://localhost:4567/api/v1";
var path_to_res = "../public/res";
var path_to_thumb = path_to_res+"/thumb";
var path_to_videos = path_to_res+"/videos";

function deleteVideo(vidID:string, callback){


    findVideoByID(vidID, (err, vid) =>  {
        if(err){

        }

        if(vid == null || vid == {}){
            return callback(new Error("The requested video does not exist"), null);
        }

        var vidPath = getPathToVidFolder(vidID, vid);

        if(vidPath != path_to_videos || vidPath != path_to_videos+"/") {

            deleteFolderRecursive(vidPath); //TODO:ffl Make this work

        }
    });

    callback(null, "true");
}




function getPathToVidFolder(vidID, video):string{
    var path = "";
    var type = "";

    switch(video.type){
        case "tv-show":
            type = "tv-shows";
            break;
        case "movie":
            type = "movies";
            break;
        default:
            console.log("The videotype is not valid!");
    }

    path += path_to_videos + "/" + type+ "/"+vidID;

    return path;
}

function findVideoByID(vidID:string, callback){
    request({
        uri: api_url+"/"+vidID,
        method: "GET",
        headers: {
            "Content-Type": "application/json"
    }
        },
        (err, res, body) => {
            if(err){

            }

            var video = JSON.parse(body);
            return callback(null, video);
        }
    );

}


function deleteFolderRecursive(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            console.log(curPath);
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }else{
        console.log("file does not exist");
    }
};

module.exports = {deleteVideo: deleteVideo};
