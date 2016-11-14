var User = require('../../models/user');

/**
 * 	@desc:	Authorization middleware for controlling if the user is logged inn or not.
 *			Used to protect pages which requires user login
 * */
function requiresLogin(req, res, next){
	if(!req.session || !req.session.uid){
		var err = new Error("You are not authorized to view this page!");
		err.status = 403;
		return next(err);
	}

	/*
	* 	Track when the user was last active
	* */
	User.setLastActive(req.session.uid, function(err, doc){
		if(err){
			console.error(err.message);
		}

		return next();
	});
}


/**
 *	@desc: Authorization middleware for controlling that no user is logged in
 * */
function loggedOut(req, res, next){
	if(req.session && req.session.uid){
		return res.redirect('/videos');
	}
	return next();
}

module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;