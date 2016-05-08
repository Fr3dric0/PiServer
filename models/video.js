/**
 * Created by Acer on 24.04.2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoUrl = "mongodb://localhost:27017/PiMediaServer";
//mongoose.connect('mongodb://localhost:27017/PiMediaServer');
var Videos = new Schema({
    vidID: String,
    title: String,
    thumb: Object,
    vid_url: String,
    type: String,
    genre: Array,
    rating: Number,
    viewcount: { type: Number, default: 0 },
    details: String,
    uploaded: { type: Date, default: Date.now },
    season: Array // reserved for type 'tv-show'
});
module.exports = mongoose.model('Videos', Videos);
//# sourceMappingURL=video.js.map