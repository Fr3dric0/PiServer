/**
 * Created by Fredrik <fred.lind96@gmail.com> on 28.05.2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var integerValidator = require("mongoose-integer");
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
    console.log("=== Running parsing and validation ===");
    next();
});
module.exports = mongoose.model('TVShow', TVShow);
//# sourceMappingURL=tvshow.js.map