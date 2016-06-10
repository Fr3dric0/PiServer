/**
 * Created by Fredrik <fred.lind96@gmail.com> on 28.05.2016.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var integerValidator = require("mongoose-integer");

var Movie = new Schema({
    vidID: String,
    title: String, // The vidID
    thumb: {
        small:String,
        large:String
    },
    type: {
        type: String,
        default: "movies",
        enum: ["movie"]
    },
    url:String,
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
    details: {type: String, default: ""},
    genre: [],
    released: {type: Date, default: Date.now },
    uploaded: {type: Date, default: Date.now }
});
Movie.plugin(integerValidator);

Movie.pre('save', (next) => {
    //console.log(this.title); // @TODO:ffl access the data and check if show does not already exist

    next();
});


module.exports = mongoose.model('Movie', Movie);