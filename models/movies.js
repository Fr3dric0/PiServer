
const mongoose = require('mongoose');
const { Schema } = mongoose;

const Movies = new Schema({
    url: { type: String },
    mediaId: { type: Schema.Types.ObjectId, required: true }
});


module.exports = mongoose.model('Movies', Movies);