var TVShow = require('../tvshow');
var Movie = require('../movie');

var WHITE_SPACE_REPLACER = "_";

function parseThumb(thumbObj, vidID){
	var _r = {};

	if(thumbObj.small){
		_r.small = createThumbURL(vidID, "small", ".jpg");
	}

	if(thumbObj.large){
		_r.large = createThumbURL(vidID, "large", ".jpg");
	}

	return _r;
}
function createThumbURL(vidID, size, type){
	var thumbURL = "/"+size+"/";
	if(type.substring(0,1) != "."){
		type = "."+type;
	}
	thumbURL += vidID+"_thumb"+type;
	return thumbURL;
}

/**
 * 	@param:		[String]	title	The title to create the vidID from
 *	@desc:		Lowercases all the chars, and replaces whitespace with '_'
 *	@return:	[String]	vidID String
 * */
function createVidID(title){
	var vidID = "";

	for(var i = 0; i < title.length; i++){
		var str = title.substring(i, i+1);

		if(str == " "){
			vidID += WHITE_SPACE_REPLACER;
		}else{
			vidID += str.toLowerCase();
		}
	}

	return vidID;
}

function createVidUrl(vidID, type, options){
	var url = "/res/videos/"+type+"/";

	url += vidID + "/";

	// If the options exists. Then we assume this is an url
	if(options && Object.keys(options).length > 0 ){
		if(!options.season){
			throw JSON.stringify({title: "MISSING PROPERTY", message: "Property 'season' is missing in options.", statusCode: 400});
		}
		if(!options.episode){
			throw JSON.stringify({title: "MISSING PROPERTY", message:"Property 'episode' is missing in options", statusCode: 400})
		}

		url += "season_"+options.season;
		url += "/"+vidID;

		url += "_s"+makePrintableNumber(options.season);
		url += "e"+ makePrintableNumber(options.episode);
		url += ".mp4";

	}else{
		url += vidID + ".mp4";
	}




	return url;
}
/**
 *  @desc:  A number should always print out double digits (03 or 24) or more, even though the number is less than 10.
 *          This function creates this printable version of the number.
 * */
function makePrintableNumber(num){
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

function createPrintableEpisode(media, conf, callback){
	var epSize;

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
		thumb: thisSeason.thumb,
		season: conf.season
	};

	// Try to get the previous episode
	if(conf.episode > 1){
		_r.episodes.prev = {
			episode: parseInt(conf.episode)-1,
			url: thisSeason.episodes[conf.episode-2],
			thumb: thisSeason.thumb,
			season: conf.season
		};
	}

	// Try to get the next episode
	if(conf.episode < epSize){
		_r.episodes.next = {
			episode: parseInt(conf.episode)+1,
			url: thisSeason.episodes[conf.episode],
			thumb: thisSeason.thumb,
			season: conf.season
		}
	}

	return callback(null, _r);
}
function validateEpisodeNumber(media, conf){
	var epSize = 0;
	var seasonSize = 0;

	if(conf.season == "undefined"){
		throw JSON.stringify({title:"MISSING SEASON NUMBER", message: "Missing the value conf.season", statusCode: 400});
	}
	if(conf.episode == "undefined"){
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


function videoExists(vidID, callback){
	Movie
		.find({vidID: vidID})
		.limit(1)
		.find(function(err, movie){
			console.log("Find tvshow");
			if(!err && (movie.length > 0)){
				return callback(null, true);
			}

			TVShow
				.find({vidID: vidID})
				.limit(1)
				.find(function(err, tv){
					console.log("Find movie");
					if(!err && (tv.length > 0)){
						return callback(null, true);
						// If we couldn't find the data in any of them. Then return false
					}else{
						return callback(null, false);
					}
				});
		}
	);
}


module.exports.createVidID = createVidID;
module.exports.parseThumbnail = parseThumb;
module.exports.createThumbURL = createThumbURL;
module.exports.createVidUrl = createVidUrl;
module.exports.printableEpisodes = createPrintableEpisode;
module.exports.printableSeason = createPrintableSeason;
module.exports.videoExists = videoExists;