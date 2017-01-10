const mongoose = require('mongoose');
const { Schema } = mongoose;

const Episodes = new Schema({
    tvshowId: { type: Schema.Types.ObjectId, required: true },
    seasonNum: {type: Number, required: true},
    title: String,
    description: String,
    num: Number,
    url: { type: String, default: null }
});

module.exports = mongoose.model('Episodes', Episodes);