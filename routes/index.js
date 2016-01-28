var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../models/account');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'LOL' });
});

router.get('/ads', function(req, res, next) {
  res.render('ads');
});

router.get('/users', function(req, res, next) {
  res.render('users');
});

router.get('/ads', passport.authenticate('local'),function(req, res, next) {
  res.render('ads');
});

router.get('/users', passport.authenticate('local'),function(req, res, next) {
  res.render('users');
});

router.get('/dashboard', passport.authenticate('local'),function(req, res) {
    res.render('dashboard', { user : req.user });
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
	var isSuperadmin=false;
	var isAdmin = false;
	Account.count(function (err, count) {
		console.log(count);
		if (!err && count === 0) {
			isSuperadmin=true;
			isAdmin = true;
		}
		
		//username should be email, as it is required  for passport
		Account.register(new Account({ username : req.body.username,  email : req.body.username,
									   displayname: req.body.username, superadmin: isSuperadmin,
									   profilepicture: "Default.jpg",
									   admin: isAdmin}), req.body.password, function(err, account) {
			if (err) {
			  return res.render("register", {info: "Sorry. That email already exists. Try again."});
			}
			
			if (req.body.password != req.body.confirmpassword) {
			  return res.render("register", {info: "Sorry. Password does not match Confirm Password. Try again."});
			}
			
			passport.authenticate('local')(req, res, function () {
				res.redirect('/');
			});
		});
	});
});

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/dashboard');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});


module.exports = router;
