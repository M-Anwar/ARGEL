var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../models/account');
var Ad = require('../models/ad');

// check if the user is authenticated 
var isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated())
		return next();
	//redirecto to the following if not authenticated 
	res.redirect('/login');
}

router.get('*', function(req, res, next) {
  // just use boolean for loggedIn
    console.log("Authenticaed: "+ req.isAuthenticated());
  res.locals.loggedIn = req.isAuthenticated() ? true : false;

  next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
	if (req.isAuthenticated())
		res.redirect('/dashboard');
	else  res.render('index', { title: 'ARGEL' });
});

router.get('/ads', isAuthenticated,function(req, res, next) {
	Ad.find({}, function(err, adsobjects) {
		console.log("adsobjects:" + adsobjects);
		res.render('ads',
				{adscollection : adsobjects,
				user: req.user
			});

	});
});

router.get('/users', isAuthenticated,function(req, res, next) {
	Account.find({}, function(err, userobjects) {
		console.log("userobjects:" + userobjects);
		res.render('users',
				{usercollection : userobjects,
				user: req.user
			});

	});
});

//  profile Page for current viewer  GET
router.get('/profile', isAuthenticated, function(req, res){
	res.render('profile', { user: req.user , viewthisuser: req.user}); 
});

 // profile Page for other viewers GET
router.get('/profile/:profile_id', isAuthenticated, function(req, res){
	//find the user that is being viewed
	Account.findOne({ "_id" : req.params.profile_id }, function(err, viewthisuser) {
		res.render('profile', { user: req.user , viewthisuser: viewthisuser});
	});

});

router.get('/dashboard',isAuthenticated, function(req, res) {
  res.render('dashboard',{ user : req.user });
});

router.get('/register', function(req, res) {
    res.render('register');
});

/* FOR DEBUG PURPOSES ENABLE THESE ROUTES TO MANUALLY SEE PAGES */
//router.get('/test', function(req,res){
//    res.render('test');
//});
//router.get('/error', function(req,res){
//    res.render('error');
//});

router.post('/register', function(req, res) {
	var isSuperadmin=false;
	var isAdmin = false;
	Account.count(function (err, count) {
		console.log(count);
		if (!err && count === 0) {
			isSuperadmin=true;
			isAdmin = true;
		}
		
        if (req.body.password != req.body.confirmpassword) {
			  return res.render("register", {info: "Sorry. Password does not match Confirm Password. Try again."});
			}
        
		//username should be email, as it is required  for passport
		Account.register(new Account({ username : req.body.username,  email : req.body.username,
									   displayname: req.body.username, superadmin: isSuperadmin,
									   profilepicture: "Default.jpg",
									   admin: isAdmin}), req.body.password, function(err, account) {
			if (err) {
			  return res.render("register", {info: "Sorry. That email already exists. Try again."});
			}			
			
			
			passport.authenticate('local')(req, res, function () {
				res.redirect('/');
			});
		});
	});
});

router.get('/login', function(req, res) {    
    res.render('login', { user : req.user, info : req.flash('error') });
});

/* router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/dashboard');
});
 */
router.post('/login', 
	passport.authenticate('local', { successRedirect: '/dashboard',
                                   	 failureRedirect: '/login',
                                     failureFlash : true})
);
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});


module.exports = router;
