var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../models/account');
var Statistics = require('../models/statistics');
var Ad = require('../models/ad');
var fs = require('fs');
var util = require('util');
var multer = require('multer');
var mongoose = require('mongoose');
var gridfs = require("gridfs");
var async = require('async');
var upload = multer({
    dest:'./uploads/',
    limits: { fileSize: 400* 1024 * 1024} //Max file size for upload multer
});

// Counter for user views
function adPageViewCount(req, res) {
  req.session.count = req.session.count || 0;
  var n = req.session.count++;
  res.send('viewed ' + n + ' times\n');
}

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

    //Show the ads the USER has uploaded
	Ad.find({userid: req.user._id}, function(err, adsobjects) {
        if(err) {console.log(err); return;}
		res.render('ads',
            {adscollection : adsobjects,
            user: req.user
        });

	});
});

//fetch ad statistics for the dashboard data
router.get('/dashboarddata', isAuthenticated,function(req, res, next) {

    //Show the ads the USER has uploaded
	Statistics.find({}, function(err, statistics) {
        if(err) {console.log(err); return;}
        res.json(statistics);;

	});
});

router.get('/deleteadprofile/:ad_id', isAuthenticated, function(req, res){
	console.log(req.params.ad_id);
        
    var conn = mongoose.connection;	
	var Grid = require('gridfs-stream');
	Grid.mongo = mongoose.mongo; 
	var gfs = Grid(conn.db); 
    
    Ad.findOne({"_id" : req.params.ad_id}, function(err,deletethisad){
        //Remove the file chunks first
        gfs.findOne({filename: deletethisad.videoad.filename}, function(err,fileAd){
            gfs.db.collection('fs.chunks').remove({files_id:fileAd._id}, function(err){
                if(err) console.log("Error removing chunks");
            });
            
            //While the chunks are being removed, we can now delete the file holder
            gfs.remove({filename: deletethisad.videoad.filename}, function(err){
                if(err) console.log("Error during deletion");
                console.log("File Removed");
                
                //After the file holder is removed, remove the ad from our ad database
                deletethisad.remove(function(err,result){
                    if(err) console.log("Error");
                    res.redirect('/ads');
                });
            });
        });
       
       
    });
});

//  profile Page for current viewer  GET
router.get('/adprofile/:ad_id', isAuthenticated, function(req, res){
	console.log('req.cookies: ');
	console.log(util.inspect(req.cookies, false, null));
	console.log('req.session: ');
	console.log(util.inspect(req.session, false, null));
	console.log('req.cookies[\'connect.sid\']: '+req.cookies['connect.sid']);
  
  var datenow = new Date();
	console.log("date " + datenow);
	//update ad page view counter
	/* Statistics.findOne({adId:req.params.ad_id},{},function(err,thisStatistics){
		var found = 0;
		if(!thisStatistics){
			found = 1;
			Statistics.create({adId:req.params.ad_id, pageViews.sessionCookies: req.cookies['connect.sid'], pageView:0, adViews.sessionCookies:0, revenue:0});
		} */
    var found = 0;
  async.series([
    function(callback) {
     Statistics.findOne({adId:req.params.ad_id},{},function(err,thisStatistics){
      if(!thisStatistics){
        found = 1;
        var statistic = new Statistics();
        statistic.adId = req.params.ad_id;
        statistic.pageViewCount = 1;
        statistic.revenue = 1;
        statistic.adViews = [{
          "sessionCookies": 0,
          "date": 0}];
        statistic.pageViews = [{
          "sessionCookies": req.cookies['connect.sid'],
          "date": datenow}];
        
        //save the ad to the db
          statistic.save(function(err,a){
              if(err) throw err;                   
          });
      }
      // console.log("Date.now " + datenow);
      // console.log("thisStatistics.sessionCookies ", thisStatistics.sessionCookies[0]);
      console.log('thisStatistics: ');
      console.log(util.inspect(thisStatistics, false, null));
      
      
      for (i = 0; (found==0)&&(i < thisStatistics.pageViews.length) ; i++) {
        console.log("i= " + i);
                  	console.log('req.cookies[\'connect.sid\']: ');
            console.log(util.inspect(req.cookies['connect.sid'], false, null));
            console.log('thisStatistics.pageViews[i]: ');
            console.log(util.inspect(thisStatistics.pageViews[i], false, null));
        if(thisStatistics.pageViews[i].sessionCookies == req.cookies['connect.sid']){
          found = 1;
          console.log("found = 1");
          break;
        }
      }
      callback();
    });},
      function(callback) {
        if (found == 0){
          console.log("found=0");
          //keep only one of the following 2?? TBD
          Statistics.findOneAndUpdate({adId:req.params.ad_id},{$addToSet: {"pageViews": {"sessionCookies": req.cookies['connect.sid'],"date": datenow}}, $inc: {pageViewCount:1}},{},function(err,stat){});
          // Ad.findOneAndUpdate({_id:req.params.ad_id},{$inc: {pageView:1} },{},function(err,ad){});
          // Statistics.findOneAndUpdate({adId:req.params.ad_id},{$inc: {pageView:1} },{},function(err,stat){});
        }
        // });
        callback();
    }],
      function(err) { //This function gets called after the two tasks have called their "task callbacks"
          if (err) return next(err);
      }
    );
	
	//fetch ad
	Ad.findOne({ "_id" : req.params.ad_id }, function(err, viewthisad) {
        var mime = viewthisad.videoad.contentType          
        var video = true;        
        if(mime){
            if(mime.indexOf("jpeg")> -1 || mime.indexOf("png")>-1){
                video = false;
            }
        }
        //console.log(viewthisad.tags[1]);
        res.render('adprofile', { user: req.user , ad: viewthisad, isVideo: video}); 
	});
});

router.get('/aduploadpage', isAuthenticated,function(req, res, next) {
	res.render('aduploadpage', {user: req.user, info: req.flash('aderror')});
});

//Test route for uploading ads
router.post('/adtestupload',isAuthenticated,upload.single('videoAd'),function(req,res){
    console.log('File: ' + req.file.filename + " : " + req.file.path);
    console.log('Adname: ' + req.body.adname);
    console.log('Userid: ' + req.body.userid);
    console.log('Description: ' + req.body.description);
    console.log('Tags: ' + req.body.tags);
    console.log('metaData: ' + req.body.metaData);
    console.log('Locations: ' + req.body.locations);
    var tagArray = [req.body.tags, req.body.locations];
    console.log(tagArray);
    
    var ad = new Ad();
	ad.adname = req.body.adname;
	ad.userid = req.body.userid;
	ad.description = req.body.description;
	// ad.videoad._id = id;	
	ad.tags = tagArray;
    ad.metaData = req.body.metaData;
	
	//save the ad to the db
    ad.save(function(err,a){
        if(err) throw err;                   
    });
    
    
    res.json({redirect:'/ads'});
    res.end();    
});
router.post('/adupload', isAuthenticated,upload.single('videoAd'), function(req,res){
	var dirname = require('path').dirname(__dirname);
    
    //Server side error checks - ideally handle all these on client side, this is backup
    if(!req.file){
        req.flash('aderror','Please upload an advertisement');
        res.redirect('aduploadpage');
        return;
    }
    if(req.body.adname=="" || req.body.description==""){
        req.flash('aderror','Please fill in the required fields');
        res.redirect('aduploadpage');
        return;
    }
    
	var filename = req.file.filename;
	var path = req.file.path;
	var type = req.file.mimetype;

    //Uploaded video is temporarily stored in an uploads folder
	var read_stream =  fs.createReadStream(dirname + '/' + path);
    
	var conn = mongoose.connection;	
	var Grid = require('gridfs-stream');
	Grid.mongo = mongoose.mongo;
	var gfs = Grid(conn.db);

    //Read the file from the temp folder and add it to data base
	var writestream = gfs.createWriteStream({filename: filename});
	read_stream.pipe(writestream);
	read_stream.on('close', function(){
		//After file added to video data base - remove from temp folder
		fs.unlink(dirname+ '\\' + path, function(err){
			if(err){console.log("Error: " + err);}
		});
	});
    
    //Add an entry to our ad data base with all the required information inside
	var ad = new Ad();
	ad.adname = req.body.adname;
	ad.userid = req.body.userid;
	ad.description = req.body.description;	
	ad.videoad.filename = filename;
	ad.videoad.contentType = type;	
    var tagArray = [req.body.tags, req.body.locations];
    ad.tags = tagArray;
    ad.metaData = req.body.metaData;
	ad.pageView=0;
	
	//save the ad to the db
    ad.save(function(err,a){
        if(err) throw err;                   
    });

    res.json({redirect:'/ads'});
	res.redirect('/ads');
	
});

/* Deprecated - do not use anymore, only supports video streaming and no imges */
router.get('/viewad/:id',function(req,res){
	var pic_id = req.param('id');
	var conn = mongoose.connection;	
	var Grid = require('gridfs-stream');
	Grid.mongo = mongoose.mongo; 
	var gfs = Grid(conn.db); 
	
	var range = req.headers.range;	
    var positions = range.replace(/bytes=/, "").split("-");
    var start = parseInt(positions[0], 10);
	
	gfs.files.findOne({filename: pic_id}, function (err, files) {
		if (err) {
			res.json(err);
		}		
		var total = files.length;
		var end = positions[1] ? parseInt(positions[1], 10) : total - 1;        
		var chunksize = (end - start) + 1;        
		res.writeHead(206, {
			"Content-Range": "bytes " + start + "-" + end + "/" + total,
			"Accept-Ranges": "bytes",
			"Content-Length": chunksize,
			"Content-Type": "video/mp4"
		});

		var stream = gfs.createReadStream({filename: pic_id, range:{startPos: start, endPos:end}})
		.on("open", function() {           
            stream.pipe(res);
		}).on("error", function(err) {
            res.end(err);
		});		
			
	});
});
router.get('/view/:id',function(req,res,next){
	var pic_id = req.params.id;
	var conn = mongoose.connection;	
	var Grid = require('gridfs-stream');
	Grid.mongo = mongoose.mongo; 
	var gfs = Grid(conn.db); 
    
    
    Ad.findOne({ "_id" : req.params.id }, function(err, thisAd) {        
        try{
            var imageType = thisAd.videoad.contentType        
            if(imageType.indexOf("jpeg")> -1 || imageType.indexOf("png")>-1){
                //The content is an image
                var stream = gfs.createReadStream({filename: thisAd.videoad.filename})
                    .on("open", function() {           
                        stream.pipe(res);
                    }).on("error", function(err) {
                        res.end(err);
                    });                 
            }
            else{ //Assume it is a video and stream the content            
                var range = req.headers.range;	
                var positions = range.replace(/bytes=/, "").split("-");
                var start = parseInt(positions[0], 10);

                gfs.files.findOne({filename: thisAd.videoad.filename}, function (err, files) {
                    if (err) {
                        res.json(err);
                    }		
                    var total = files.length;
                    var end = positions[1] ? parseInt(positions[1], 10) : total - 1;        
                    var chunksize = (end - start) + 1;        
                    res.writeHead(206, {
                        "Content-Range": "bytes " + start + "-" + end + "/" + total,
                        "Accept-Ranges": "bytes",
                        "Content-Length": chunksize,
                        "Content-Type": "video/mp4"
                    });

                    var stream = gfs.createReadStream({filename: thisAd.videoad.filename, range:{startPos: start, endPos:end}})
                    .on("open", function() {           
                        stream.pipe(res);
                    }).on("error", function(err) {
                        res.end(err);
                    });	        

                });

            }
            
            //Update view statistics - Move to update statistics API
//            if(thisAd.statistics[0]==null){
//                thisAd.statistics[0] = {};                                     
//            }
//            if(thisAd.statistics[0].views==null){
//                thisAd.statistics[0].views =0;
//            }
//            thisAd.statistics[0].views ++;
//            thisAd.markModified('statistics');
//            thisAd.save();
        }catch(e){
            next(e); //Throw stack trace error on webpage
        }
        
       
			
	});
});

/** Video Streaming Tests -- Remove When Necessary **/
/*
router.get('/viewadtest/:id',function(req,res){
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
			var mime = 'video/mp4';
			res.set('Content-Type', mime);
			var read_stream = gfs.createReadStream({filename: pic_id});
			read_stream.pipe(res);
			
			
			
		} else {
			res.json('File Not Found');
		}
    });
});



router.get('/viewadstream',function(req,res){
	var dirname = require('path').dirname(__dirname);
	var file = dirname + '/uploads/reallyeasy.mp4';
    var range = req.headers.range;
	console.log('range' +range);
    var positions = range.replace(/bytes=/, "").split("-");
    var start = parseInt(positions[0], 10);

    fs.stat(file, function(err, stats) {
      var total = stats.size;
      var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
      var chunksize = (end - start) + 1;

      res.writeHead(206, {
        "Content-Range": "bytes " + start + "-" + end + "/" + total,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4"
      });

      var stream = fs.createReadStream(file, { start: start, end: end })
        .on("open", function() {
          stream.pipe(res);
        }).on("error", function(err) {
          res.end(err);
        });
    });
});
*/
//WORKGNG Video Stream
router.get('/viewadstreamtest',function(req,res){
	var dirname = require('path').dirname(__dirname);
	var file = dirname + '/uploads/TestFootage.ogv';
    var range = req.headers.range;
	console.log('range' +range);
    var positions = range.replace(/bytes=/, "").split("-");
    var start = parseInt(positions[0], 10);

    fs.stat(file, function(err, stats) {
      var total = stats.size;
      var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
      var chunksize = (end - start) + 1;

      res.writeHead(206, {
        "Content-Range": "bytes " + start + "-" + end + "/" + total,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4"
      });

      var stream = fs.createReadStream(file, { start: start, end: end })
        .on("open", function() {
          stream.pipe(res);
        }).on("error", function(err) {
          res.end(err);
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

/**
    User registration and Login Logic
**/

router.post('/register', function(req, res) {
	var isSuperadmin=false;
	var isAdmin = false;
	Account.count(function (err, count) {
		console.log(count);
		if (!err && count === 0) {
			isSuperadmin=true;
			isAdmin = true;
		}
        
        if(!req.body.password || !req.body.username){
            return res.render("register", {info: 'Sorry. Please include both a username and password. Try again.'});
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

