var express = require('express');
var router = express.Router();
var midAuth = require('../middleware/authentication');

var User = require('../models/user');


// GET /
router.get('/', function(req, res, next) {
  console.log(req.originalUrl);
  res.render('index',
      {
        videos: {
          url: '/videos',
          name: 'Video',
          tmb_name: 'DSC_0786.JPG'
        },
        user: req.user
      });
});

// GET /register
router.get('/register', midAuth.loggedOut, function(req, res){
  res.render('register', {});
});

// POST /register
router.post('/register', function(req, res, next){
  if( !req.body.password ||
      !req.body.confirmPassword ||
      !req.body.email ||
      !req.body.firstname ||
      !req.body.lastname){

    var registerErr = new Error("All input fields are required");
    registerErr.status = 400;
    return next(registerErr);
  }

  if(req.body.password !== req.body.confirmPassword){
    var pwdMatchErr = new Error("Password fields do not match");
    pwdMatchErr.status = 400;
    return next(pwdMatchErr);
  }

  var userData = {
    email: req.body.email,
    firstName: req.body.firstname,
    lastName: req.body.lastname,
    password: req.body.password
  };

  User.create(userData, function(registerErr, user){
    if(registerErr){
      return next(registerErr);
    }

    req.session.uid = user._id;
    return res.redirect('/videos');
  });

});

// GET /login
router.get('/login', midAuth.loggedOut, function(req, res){
  res.render('login', {user: req.user});
});

// POST /login
router.post('/login', function(req, res, next){
  if(!req.body.email || !req.body.password){
    var error = new Error("Both email and password are required fields");
    error.status = 400;
    return next(error);
  }

  // Authenticate the user
  User.authenticate(req.body.email, req.body.password, function(authErr, user){
    if(authErr || !user){
                        // Never specify which field is incorrectly typed
      var err = new Error("Wrong email or password");
      err.status = 401;
      return next(err);
    }

    // add the user id to the session
    /*
     * Ved å bere lagre BrukarID i session. sparar vi oss for å overbelaste serverens RAM.
     * Samt du slepp å tenke på å måtte konstant oppdatere informasjonen som ligg i session. Vi hentar bere dette frå databasen
     * */
    req.session.uid = user._id;
    return res.redirect('/videos');
  });

});

// GET /logout
router.get('/logout', midAuth.requiresLogin, function(req, res, next){
  if(req.session){
    req.session.destroy(function(err){
      if(err){
        return next(err);
      }
    });
  }
  res.redirect('/');
});

// GET /pint
router.get('/ping', function(req, res){
  res.status(200).send('pong!');
});




module.exports = router;
