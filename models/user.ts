/**
 * Created by Acer on 14.04.2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');


/**
 *  @desc: Declare the 'User' Schema
 *
 * */
var User = new Schema({
    username: String,
    password: String,
    favVid: Array,
    first_name: String,
    last_name: String,
    email: String
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);