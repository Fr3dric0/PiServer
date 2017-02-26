const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set public files
app.use(express.static(path.join(__dirname, 'client', 'dist')));
app.use('/resource', express.static(path.join(__dirname, 'resources')));

const config = require('./bin/config/_config.json');
const { database } = config;
const { username, pwd, domain, port } = database;

app.use((req, res, next) => {
   req.config = config;
   next();
});


/////////////////////////////
//      MONGOOSE SETUP     //
/////////////////////////////
mongoose.Promise = global.Promise; // Use ES5 promise, not mongoose promise
mongoose.connect(`mongodb://${username ? (username + ':' + pwd + '@') : ''}${domain}:${port}/${database.db}`);
const db = mongoose.connection;

db.on('error', (err) => {
    console.log(`
\n*******************************************
            MongoDB Connection Error         
  *******************************************
`);
    console.error(err);

    console.log(`
  -------------------------------------------`);
});


/////////////////////////////
//        API ROUTES       //
/////////////////////////////
const apiPath = './controllers';
const api = '/api';

const index = require(`${apiPath}`);
const videos = require(`${apiPath}/videos/`);
const imdb = require(`${apiPath}/imdb/`);
const users = require(`${apiPath}/users`);
const auth = require(`${apiPath}/auth`);

app.use(`${api}/videos`, videos);
app.use(`${api}/imdb`, imdb);
app.use(`${api}/users`, users);
app.use(`${api}/auth`, auth);
app.use(`${api}`, index);


////////////////////////////////////////
//           RESOURCE ROUTER          //
//                                    //
// Responsible for catching 404 err   //
// for the static resources folder.   //
// Thus preventing us from sending    //
// the index.html file every time a   //
// resource WASN'T found              //
////////////////////////////////////////
app.all('/resources/*', (req, res, next) => {
    res.status(404).send();
});


/////////////////////////////
//      CLIENT ROUTER      //
//                         //
// Responsible for serving //
// the angular site on all //
// non api route           //
/////////////////////////////
app.all('*', (req, res) => {
    res.status(200).sendFile(
        path.join('client', 'dist', 'index.html'), {root: __dirname});
});


/////////////////////////////
//      ERROR HANDLER      //
/////////////////////////////
app.use((err, req, res, next) => {
    const e = { error: err.message};
    if ((req.app.get('env') === 'development') && err.stack && err.status > 499) {
        e.stack = err.stack;
    }
    // render the error page
    res .status(err.status || 500).json(e);
});

module.exports = app;
