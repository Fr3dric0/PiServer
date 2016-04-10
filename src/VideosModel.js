/**
 * Created by Acer on 10.04.2016.
 */
var VideosModel = (function () {
    /**
     *  @param:     (Object || String)  postbody || vidID   Either the postbody, or the vidID.
     *                                                      The postbody is used if the object should be used
     *                                                      for data saving.
     *                                                      vidID is used for getting data out of database
     * */
    function VideosModel(postbody) {
        this.typeopt = ['tv-show', 'movie', 'image'];
        this.thumb = { small: "", large: "" };
        this.rating = 0.0;
        this.genre = [];
        this.seasons = []; // is only used IF type == 'tv-show'
        this.viewcount = 0;
        this.validVideoType = ['mp4'];
        this.saved = false;
        var parent = this;
        // Prepare to save the object
        if (typeof postbody == "object") {
            try {
                setMetadata(postbody);
            }
            catch (e) {
                console.error(e);
                return;
            }
            /**
             *  @param:     (Object)    postbody    The object provided from 'req.post'
             *  @desc:      cycles through, validates, og parses each keyvalue.
             *
             * */
            function setMetadata(postbody) {
                parent.title = postbody.title;
                if (!parent.title) {
                    throw "Title is missing";
                }
                parent.id = convertToID(parent.title);
                if (!parent.id) {
                    throw "Something went horribly wrong. Could not convert title to vidID";
                }
                parent.type = validateType(postbody['type'], parent.typeopt);
                if (!parent.type) {
                    throw "POST data MUST contain key type, with value 'tv-show', 'movie', or 'image'";
                }
                parent.thumb = JSON.parse(postbody.thumb) || {};
                parent.rating = postbody.rating;
                parent.genre = postbody.genre.trim().split(",");
                parent.details = postbody.details;
                parent.filetype = validateType(postbody.filetype, parent.validVideoType);
                if (!parent.filetype) {
                    throw "The program must know what filetype the video is";
                }
                // IF type is 'movie'
                if (parent.type == parent.typeopt[1]) {
                    parent.vidUrl = createMovieUrl(parent.id, parent.filetype);
                }
                else if (parent.type == parent.typeopt[0]) {
                    parent.seasons = setSeasons(parent.id, postbody.seasons.trim().split(","), parent.filetype);
                }
                else if (parent.type == parent.typeopt[2]) {
                }
                else {
                    throw "Could not identify which mediatype the data is";
                }
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
                function validateType(type, opt) {
                    var found = false;
                    for (var i in opt) {
                        if (type.toLowerCase() == opt[i]) {
                            found = true;
                        }
                    }
                    return found ? type : null;
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
            }
        }
        else if (typeof postbody == "string") {
            var vidID = postbody; // give it a temp name
            parent.id = vidID; // register the id;
            try {
                findVideo(parent.id);
            }
            catch (e) {
                console.error(e.message);
            }
            /**
             *  @desc:  Connects to the database and looks for the user.
             *              * THROW Exception IF program failed to find the video
             * */
            function findVideo(id) {
                saved = true;
            }
        }
    }
    VideosModel.prototype.saveToDB = function () {
    };
    VideosModel.prototype.getData = function (callback) {
        var data = {};
        if (this.saved) {
        }
        else {
            data = {
                vidID: this.id,
                title: this.title,
                type: this.type,
                thumb: this.thumb,
                rating: this.rating,
                genre: this.genre,
                details: this.details,
                viewcount: this.viewcount
            };
            if (this.type == this.typeopt[0]) {
                data.seasons = this.seasons;
            }
            else if (this.type == this.typeopt[1]) {
                data.vid_url = this.vidUrl;
            }
            callback(null, data);
        }
    };
    /**
     *  @desc:      Connects to MongoDB, and searches for the title in the specified object
     *  @return:    (String)    The title
     * */
    VideosModel.prototype.getTitle = function () {
        return "";
    };
    return VideosModel;
})();
module.exports = VideosModel;
//# sourceMappingURL=VideosModel.js.map