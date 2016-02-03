var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../models/account');
var Ad = require('../models/ad');
var fs = require('fs');
var multer = require('multer');
var mongoose = require('mongoose');
var upload = multer({
    dest:'./uploads/',
    limits: { fileSize: 100* 1024 * 1024} //Max file size for upload multer
});

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
//  profile Page for current viewer  GET
router.get('/adprofile/:ad_id', isAuthenticated, function(req, res){
	Ad.findOne({ "_id" : req.params.ad_id }, function(err, viewthisad) {
        res.render('adprofile', { user: req.user , ad: viewthisad}); 
	});

});

router.get('/aduploadpage', isAuthenticated,function(req, res, next) {
	res.render('aduploadpage');
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



router.post('/adupload', upload.single('videoAd'), function(req,res){
	var dirname = require('path').dirname(__dirname);
	var filename = req.file.filename;
	var path = req.file.path;
	var type = req.file.mimetype;

	var read_stream =  fs.createReadStream(dirname + '/' + path);

	var conn = mongoose.connection;
	console.log("req.conn:" + req.conn);
	var Grid = require('gridfs-stream');
	Grid.mongo = mongoose.mongo;

	var gfs = Grid(conn.db);

	var writestream = gfs.createWriteStream({
	filename: filename
	});
	read_stream.pipe(writestream);
	read_stream.on('close', function(){
		//After file added to session data base - remove from temp folder
		fs.unlink(dirname+ '\\' + path, function(err){
			if(err){console.log("Error: " + err);}
		});
	});

	var ad = new Ad();
    ad.videoad.contentType = type;
	ad.videoad.filename = filename;
	ad.adname = req.body.adname;
	ad.userid = req.body.userid;
	ad.description = req.body.description;
	ad.tags = req.body.tags;
    ad.save(function(err,a){
        if(err) throw err;        
                 
    });


	res.redirect('/ads');
	// res.send(200,filename);
});

router.get('/viewad/:id',function(req,res){
		var pic_id = req.param('id');
		var conn = mongoose.connection;
		console.log("req.conn:" + req.conn);
		var Grid = require('gridfs-stream');
		Grid.mongo = mongoose.mongo;
 
		var gfs = Grid(conn.db);
 
		gfs.files.find({filename: pic_id}).toArray(function (err, files) {

		if (err) {
			res.json(err);
		}
		if (files.length > 0) {
			// var mime = 'image/jpeg';
			var mime = 'binary/octet-stream';
			res.set('Content-Type', mime);
			var read_stream = gfs.createReadStream({filename: pic_id});
			read_stream.pipe(res);
		} else {
			res.json('File Not Found');
		}
    });
});


module.exports = router;
