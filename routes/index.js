var express = require('express');
var router = express.Router();

var passport = require('passport');
var User = require('../models/user');


/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("HOME PAGE");

  res.redirect("/videos");
/*
  res.render('index',
      {
        title: 'PiServer',
        pages: {
          images: {
            url: '/images',
            name: 'Bilete',
            tmb_name: 'spongebob.jpg'
          },
          videos: {
            url: '/videos',
            name: 'Video',
            tmb_name: 'DSC_0786.JPG'
          }
        },
        user: req.user
      });*/
});


router.get('/register', function(req, res){
  res.render('register', {});
});


/** REGISTER NEW USER
 *
 * */
router.post('/register', function(req, res){
  User.register( new User({username: req.body.username}), req.body.password, function(err, user){
    if(err){
      return res.render('register', {user:user});
    }

    // AUTHENTICATE AND LOGIN
    passport.authenticate('local')(req, res, function(){
      req.session.save(function(err){ // Save to session
        if(err){
          return next(err);
        }
        res.redirect('/');
      });

    });
  });
});

router.get('/login', function(req, res){
  res.render('login', {user: req.user});
});

router.post('/login', passport.authenticate('local'), function(req, res){

  req.session.save(function(err){
    if(err){
      return err;
    }

    res.redirect('/');
  });

});

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.get('/ping', function(req, res){
  res.status(200).send('pong!');
});




module.exports = router;
