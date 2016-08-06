/**
 * Created by Fredrik <fred.lind96@gmail.com> on 28.05.2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var integerValidator = require("mongoose-integer");
var TVShow = require('./tvshow');

var MediaParser = require('./parser/mediaparser');

var MovieScheema = new Schema({
	vidID: String,
	title: String,
	thumb: {
		small: String,
		large: String
	},
	type: {
		type: String,
		default: "movies",
		enum: ["movie"]
	},
	url: String,
	rating: {
		type: Number,
		min: [0, "Rating cannot be a negative value"],
		max: [10, "Rating cannot be bigger than 10"],
		required: true
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

MovieScheema.plugin(integerValidator);


MovieScheema.pre('save', function (next) {
	var mov = this; // Tydelegvis ein feil i TypeScript kompilatoren, gjorde at 'this' vart til '_this' i js
	mov.vidID = MediaParser.createVidID(mov.title);
	mov.thumb = MediaParser.parseThumbnail(mov.thumb, mov.vidID);

	mov.url = MediaParser.createVidUrl(mov.vidID,"movie");

	var conflictError = new Error("DATABASE CONFLICT ERROR: "+mov.title+", already exists!");
	conflictError.status = 400;

	// Check if media already exists
	this.constructor.find({vidID: mov.vidID}).limit(1).exec(function(err, movie){
		if(!err && movie.length > 0){
			return next(conflictError);
		}

		TVShow.find({vidID: mov.vidID}).limit(1).exec(function(err, show){
			if(!err && show.length > 0){
				return next(conflictError);
			}

			// GO FOR UPLOAD
			next()

		});

	});

});


MovieScheema.statics.createVidID = MediaParser.createVidID;
module.exports = mongoose.model('Movie', MovieScheema);
//# sourceMappingURL=movie.js.map

