var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var routes = require('./routes/index');
var config = require('./bin/config/config.json');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));


var User = require('./models/user.js'); // Get the User model
passport.use(new LocalStrategy(User.authenticate()) );
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect('mongodb://localhost:27017/PiMediaServer');

var api_middleware = require('./src/middleware/api_middleware');

// Define routers
app.use(addConfigToSession);
app.use('/', routes); // No need to be authenticated
app.use('/api/v1', api_middleware.sorting, api_middleware.filterMediatype, require('./routes/api')); // Custom authentication

app.use(userValidation); // ↓ Needs authentication
app.use('/videos', require('./routes/videos'));
app.use('/user', require('./routes/user'));
app.use('/modify', require('./routes/modify'));


function addConfigToSession(req, res, next){
  req.config = config;
  next();
}


/**
 * @desc: Handles user validation. on every before request
 * */
function userValidation(req, res, next){
  if(req.user){
    return next();
  }

  return next();
  //return res.redirect("/");
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
