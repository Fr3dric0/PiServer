/**
 * Created by Acer on 14.04.2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Bcrypt = require('bcryptjs');
var HASH_ROUNDS = 10;

var UserScheema = new Schema({
	email: { type: String, required: true, unique: true }, // Instead of username, we use email
	password: { type: String, required: true, trim: true }, // Password is stored HASHED
	firstName: { type: String, required: true }, // Ensures we know who the person is
	lastName: { type: String, required: true },	// Ensures we know who the person is
	accessRights: {type:String, default:"user", enum: ["user", "admin"]}, // A user can have two access rights
	starredVideos: { type: Array },	// A user has an option of star videos
	registered: {type: Date, default: Date.now()},	// Track when the user registered
	lastActive: {type: Date, default: Date.now()} // Used to track when the user was last active
});

/**
 *	@param:		[String]	uid			The userID, also known as ObjectID in MongoDB
 *				[Function]	callback	Callback function
 *	@desc:		Method responsible for updating the last-active property in the user model.
 *	@return:	[Function]	Callback function
 * */
UserScheema.statics.setLastActive = function(uid, callback){
	this.findOneAndUpdate({_id: uid}, {lastActive: new Date()}, {new: true}, function(err, doc){
		if(err){
			return callback(err);
		}

		return callback(null, doc);
	});
};

/**
 * 	@param:		[String]	email		Users email
 * 				[String]	pwd			Users password, UN-HASHED
 * 				[Function]	callback	Callback function
 * 	@desc:		Handles user authentication. We first try to find the user, based on it's email.
 *				Thereafter, we compare the Hashed version of 'pwd' with the stored password.
 *					If an error is returned, or 'result' is empty we send an error to the caller. Letting him
 *					know, the User was not authenticated.
 *					If the user was authenticated, return the callback with the user credidentials
 *	@return:	[Function]	Callback function, with or without errors
 * */
UserScheema.statics.authenticate = function(email, pwd, callback){
	this.findOne({email: email}).exec(function(err, user){
		if(err){
			return callback(err);
		}else if(!user){
			var noUserErr = new Error("Could not find user in DB");
			noUserErr.status = 401;
			return callback(noUserErr);
		}

		Bcrypt.compare(pwd, user.password, function(comprErr, result){
			if(comprErr) return callback(comprErr);

			if(result){
				user.password = "";
				return callback(null, user);
			}else{
				var err = new Error("User is not authenticated");
				err.status = 403;
				callback(err);
			}
		});
	});
};


// Value validation, and hashing of password
UserScheema.pre('save', function (next) {
	var user = this;

	Bcrypt.hash(user.password, HASH_ROUNDS, function(hashErr, hash){
		if(hashErr){
			return next(hashErr);
		}

		user.password = hash;
		return next();
	});

});

module.exports = mongoose.model('User', UserScheema);
//# sourceMappingURL=user.js.map