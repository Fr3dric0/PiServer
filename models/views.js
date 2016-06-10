/**
 * Created by Acer on 22.05.2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Views = new Schema({
    user: String,
    video: String,
    viewed: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Views', Views);
//# sourceMappingURL=views.js.map