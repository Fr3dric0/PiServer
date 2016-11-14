/**
 * Created by Fredrik <fred.lind96@gmail.com> on 28.05.2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var integerValidator = require("mongoose-integer");
var Movie = require('./movie');

var MediaParser = require('./parser/mediaparser');

var TVShow = new Schema({
	vidID: String,
	title: String,
	thumb: {
		small: String,
		large: String
	},
	type: {
		type: String,
		default: "tv-show",
		enum: ["tv-show"]
	},
	seasons: [
		{
			thumb: String,
			episodes: []
		}
	],
	rating: {
		type: Number,
		min: [0, "Rating cannot be a negative value"],
		max: [10, "Rating cannot be bigger than 10"]
	},
	viewcount: {
		type: Number,
		integer: true,
		default: 0
	},
	details: { type: String, default: "" },
	genre: [],
	released: { type: Date, default: Date.now },
	uploaded: { type: Date, default: Date.now }
});
TVShow.plugin(integerValidator);

TVShow.pre("save", function (next, done) {
	var show = this;

	show.vidID = MediaParser.createVidID(show.title);
	show.thumb = MediaParser.parseThumbnail(show.thumb, show.vidID);

	var conflictError = new Error("DATABASE CONFLICT ERROR: "+show.title+", already exists!");
	conflictError.status = 400;

	// Check if media already| exists
	this.constructor.find({vidID: show.vidID}).limit(1).exec(function(err, tv){
		if(!err && tv.length > 0){
			return next(conflictError);
		}

		return next();

/*
		// @TODO:ffl - Find out what the fuck is wrong with this model!!!
		Movie.find({vidID: show.vidID}).limit(1).exec(function(err, mov){
			if(!err && mov.length > 0){
				return next(conflictError);
			}

			// GO FOR UPLOAD
			next()
		});*/
	});

});

module.exports = mongoose.model('TVShow', TVShow);