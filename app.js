var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');

var routes = require('./routes/index');
var api = require('./routes/api');
var routes_new = require('./routes/index_new');

var users = require('./routes/users');
var Account = require('./models/account');
// var User = require('./models/account');
var Ad = require('./models/ad');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressSession = require('express-session');
var mongoose = require('mongoose');
// Connect to DB
mongoose.connect('mongodb://localhost:27017/test');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(require('express-session')({ //Changed secret from the default value
    secret: 'argel marketting sol',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.enable('trust proxy');

app.use('/', routes_new);
app.use('/', routes);
app.use('/api', api);


passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

//passport.serializeUser(function(user, done) {
//	console.log('serializing user: ', user);
//	done(null, user);
//});
//
//passport.deserializeUser(function(id, done) {
//	Account.findById(id, function(err, user) {
//		console.log('deserializing user:',user);
//		done(err, user);
//	});
//});

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

     // res.sendfile('public/index.html', {root: __dirname })
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
