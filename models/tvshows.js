const mongoose = require('mongoose');
const { Schema } = mongoose;

const Episodes = require('./episodes');
const Media = require('./media');

const TvShows = new Schema({
    mediaId: { type: Schema.Types.ObjectId, required: true },
    seasons: [{
        num: Number,
        thumb: { small: String, large: String },
        description: String,
        released: Date,
        uploaded: { type: Date, default: Date.now() },
        episodes: [] // Array of episodeIds
    }]
});

/**
 * @param   {Object}    query   The data we need to find where to inser the episode
 * @param   {Object}    episode The data to insert
 *
 *
 * */
TvShows.statics.uploadEpisode = function({mediaId, seasons}, episode) {

};

function buildEpisodeName(showTitle, seasons, episode) {

}


module.exports = mongoose.model('TvShows', TvShows);