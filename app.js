var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// Session handlers
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
// ODM
var mongoose = require('mongoose');


// Initialize express
var app = express();

// MIDDLEWARE
var midApi = require('./middleware/api');
var midAuth = require('./middleware/authentication');
var mid = require('./middleware');

// Connect to database
mongoose.connect('mongodb://localhost:27017/PiMediaServer');
var db = mongoose.connection;
db.on('error', console.error.bind('console', 'connection error'));


// Initialize session
app.use(
    session({
      secret: 'horse board underdog_fiat klapp',
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({ // Store the session in the database
        mongooseConnection: db
      })
}));

// Make UserID available in template
app.use(function(req, res, next){
  res.locals.currentUser = req.session.uid;
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// STATIC FOLDER
app.use(express.static(path.join(__dirname, 'public')));


// Define routers
app.use(mid.placeConfigInReq);
app.use('/', require('./routes/index'));
app.use('/api/v1', midApi.sorting, midApi.filterMediatype, require('./routes/api')); // Custom authentication

// NEEDS AUTHENTICATION
app.use(midAuth.requiresLogin);
app.use('/videos', require('./routes/videos'));
app.use('/user', require('./routes/user'));
app.use('/modify', require('./routes/modify'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
/*if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}*/

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
