var express = require('express');
var router = express.Router();
var passport = require('passport');
var Session = require('../models/session');
var Account = require('../models/account');
var Ad = require('../models/ad');
var fs = require('fs');
var multer = require('multer');

var upload = multer({
    dest:'./uploads/',
    limits: { fileSize: 16* 1024 * 1024} //Max file size for upload multer is 16Mb
});

router.use(function(req,res,next){   

    //PUBLIC API must comply with cross-origin-resource-sharing to allow others to use it.
    //So apply these headers to all responses that come through our API. 
    //Yah this took me a couple of hours to figure out...so don't delete it.
    
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    console.log("API call made");
    // Pass to next layer of middleware
    next();   
   
});

//Client Authentication 
var isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated())
		return next();
	//redirecto to the following if not authenticated 
	res.json({message:"not authorized"})
}

//Client Login and Register options for API
router.post('/login', function(req,res){
    passport.authenticate('local')(req, res, function () {
        res.json({message:'success'});        
    });
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
        
        if(!req.body.password || !req.body.username){
            return res.status(400).json({message:'Sorry. Please include both a username and password. Try again.'});
        }
		
        if (req.body.password != req.body.confirmpassword) {
            return res.status(400).json({message:'Sorry. Password does not match Confirm Password. Try again.'});
        }
        
		//username should be email, as it is required  for passport
		Account.register(new Account({ username : req.body.username,  email : req.body.username,
									   displayname: req.body.username, superadmin: isSuperadmin,
									   profilepicture: "Default.jpg",
									   admin: isAdmin}), req.body.password, function(err, account) {
			if (err) {
			  return res.status(400).json({message:'Sorry. That email already exists. Try again.'});
			}			
			
			
			passport.authenticate('local')(req, res, function () {
				return res.json({message:'success'});
			});
		});
	});
});
router.get('/logout', function(req, res) {
    req.logout();
    res.json({message:'successfully logged out'});     
});



router.get('/helloArgel',function(req, res, next) {
    //console.log(req.user);
    res.json({message: 'Hello and Welcome to our API'});
});
router.get('/authenticated', isAuthenticated,function(req,res,next){
    res.json({message: 'authorized'});
});

router.get('/getsessioninfo/:id',function(req,res,next){
    Session.findOne({"_id" : req.params.id}, {"metaData": true}, function(err, session){
        if(err){res.send(err); return;}
        res.json(session);
    });
});
router.get('/getsessionimage/:id',function(req,res,next){
    Session.findOne({"_id" : req.params.id}, function(err, session){
        if (err){res.send(err); return;}
        res.contentType(session.crowdPicture.contentType);
        res.send(session.crowdPicture.data);
    });
});

router.get('/getads', function(req,res,next){
    /**Returns All the ads in the ad database **/    
    Ad.find({}, function(err,ads){
        if(err){res.status(400).json({message:err}); res.end(); return;}                
        res.json(ads);
    });
});

router.get('/getads/:sessionid', function(req,res,next){
     Session.findOne({"_id" : req.params.sessionid}, function(err, session){
        if (err){res.status(400).json({message:err}); return;}
        console.log("Session authentication: " + session.localUser.authenticated);
         
        if(session.localUser.authenticated){
            //If the session is authenticated, then fetch local ads from the authenticated
            //account. Avoid doing the localization check, and show all ads registered to the
            //account. May change this in the future to incorporate localization even on personal
            //ads (e.g multiple restaurant, store locations).
            Ad.find({userid: session.localUser.userid}, function(err, adsobjects) {
                if(err) {console.log(err); res.status(400).json({message:err}); return;}
                res.json(adsobjects);
                res.end();
            });
            return;            
        }else{
            
            //If the account is not authenticated, then just get all the ads availble in our
            //data base and send those to be recommended. Make sure the ads are localized.
            Ad.find({}, function(err,ads){
                if(err){res.status(400).json({message:err}); res.end(); return;}
                
                if(session.metaData[0]){ //If valid location data exists, fetch localized ads
                    var lat = session.metaData[0].lat;
                    var lng = session.metaData[0].lng;
                    getLocalizedAd(ads, lat, lng, function (err, localAds){
                        if(err){res.status(400).json({message:err}); res.end(); return;}
                        res.json(localAds);
                        res.end();
                    });
                    return;
                }else{ //No valid location data, return all available ads
                    res.json(ads);
                    res.end();
                    return;
                }         
                
            });
            return;
        }
        
    });
});

router.get('/getadsloc/:lat/:lng', function(req,res,next){    
    var err = false;
    if(!req.params.lat || isNaN(parseFloat(req.params.lat))) err = true;
    if(!req.params.lng || isNaN(parseFloat(req.params.lng))) err = true;
    if(err){
        res.status(400).json({message: "Missing or illegal arguments"});
        res.end();
        return;
    }
    var lat = parseFloat(req.params.lat);
    var lng = parseFloat(req.params.lng);
    
    Ad.find({}, function(err,ads){
        if(err){res.status(400).json({message:err}); res.end(); return;}
       
        getLocalizedAd(ads, lat, lng, function (err, ads){
            if(err){res.status(400).json({message:err}); res.end(); return;}
            res.json(ads);
            res.end();
        });
        
    });
});
function getLocalizedAd(ads,lat,lng, callback){
    var R = 6373; //Radius of the idealized spherical Earth.       
    var sendAd = [];
    for(var ad in ads){
        var marks = JSON.parse(ads[ad].tags[1]);      
        for(var mark in marks){
            var lat1 = deg2rad(marks[mark].lat);
            var lng1 = deg2rad(marks[mark].lng);
            var lat2 = deg2rad(lat);
            var lng2 = deg2rad(lng);
            var radius = parseFloat(marks[mark].radius);             
            var dlon = lng2 - lng1; 
            var dlat = lat2 - lat1;                  
            var a  = Math.pow(Math.sin(dlat/2),2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon/2),2);
            var c  = 2 * Math.atan2(Math.sqrt(a),Math.sqrt(1-a)); 
            var dist = R * c;

//                console.log("");
//                console.log("-- Distance --");
//                console.log(marks[mark].lat + "," + marks[mark].lng);
//                console.log(lat + "," +lng);              
//                console.log(dist);
//                console.log("radius: " + radius);
//                console.log(dist>radius/1000? "outside":"inside");

            if(dist<radius/1000){
                sendAd.push(ads[ad]);
                break;
            }
        }
    }        
    callback(null,sendAd);        
}
    

function deg2rad(deg) {
    rad = deg * Math.PI/180; // radians = degrees * pi/180
    return rad;
}
router.post('/postrecommendation', function(req,res,next){
    var sessionID = req.body.sessionID;
    var adID = req.body.adID;
    Session.findOne({"_id" : sessionID}, function(err, session){
        if (err){res.send(err); return;}        
        session.bestAd = adID;
        session.save(function(err){
            if (err){res.send(err); return;}            
            res.json({"message": "AD recommendation added!"});
        });
       
    });
    
});
router.post('/fetchad', upload.single('crowdPic'),function(req, res, next) {       
    var dirname = require('path').dirname(__dirname);
    if(!req.file){
        res.status(400).json({message:"No crowd picture sent"});
        res.end(); 
        return;
    }
    var filename = req.file.filename;
    var path = req.file.path;
    var type = req.file.mimetype;
    
    //Here add the file to our mongoDB database - OPTIMIZE HERE 
    //Use file-stream to load data into session instead of loading
    //into memory. OKAY FOR NOW. 
    var sess = new Session();
    sess.crowdPicture.data = fs.readFileSync(dirname + "\\" + path); //OPTIMIZE
    sess.crowdPicture.contentType = type;
    
    //Populate any metadata sent in through the request.
    
    //See the the fetchAd request is authenticated, if so we are in LOCAL mode.
    if(req.isAuthenticated()){        
        sess.localUser.authenticated = req.isAuthenticated();
        sess.localUser.userid = req.user._id;
    }else{
        sess.localUser.authenticated = false;
        sess.localUser.userid = null;
    }
    
    //Parse the geolocation information if any are present
    var err = false;
    if(!req.body.lat || isNaN(parseFloat(req.body.lat))) err = true;
    if(!req.body.lng || isNaN(parseFloat(req.body.lng))) err = true;
    if(err){
        console.log("WARNING: incorrect format of geolocation");        
    }
    else{
        sess.metaData[0] = {lat: parseFloat(req.body.lat), lng: parseFloat(req.body.lng)};
    }
    
    sess.save(function(err,a){
        if(err) throw err;        
        
        //After saving, spawn python process and pass the session ID to the process
        var python = require('child_process').spawn('python',["./facepp-python-sdk-master/process.py", sess.id]);
        var output = "";
        python.stdout.on('data', function(data){ output += data + "\n" });
        python.stderr.on('data', function(err){console.log("Error: " + err); output+=err})
        python.on('close', function(code){ 
            console.log(output); //Log python output to the console, on program close.                     
            
            Session.findOne({"_id" : sess._id}, {"bestAd": true}).populate('bestAd')
                .exec(function(err, session){
                    if(err){res.send(err); return;}                                        
                    res.json({"bestAd": session.bestAd[0], //Send one back for now, until front end catches up , 
                              "pythonDebug":output
                             }); //Send back the best ad file name
                
                     //After the python program has closed - remove the session from data base;
                    sess.remove(function (err, result){
                        if(err) throw err;
                        console.log("Session Removed!");
                    }) 
                });           
                           
        });   
        
        //After file added to session data base - remove from temp folder
        fs.unlink(dirname+ '\\' + path, function(err){
            if(err){console.log("Error: " + err);}
        });
        
    });
    
    
});


/**
    Custom fetchAd test, no picture upload required, and calls into Python/test.py to run
    a few custom tests.
**/
router.post('/fetchadtest', function(req, res, next) {       
    var dirname = require('path').dirname(__dirname);  
    
    //Generate and populate session data
    var sess = new Session();   
    if(req.isAuthenticated()){        
        sess.localUser.authenticated = req.isAuthenticated();
        sess.localUser.userid = req.user._id;
    }else{
        sess.localUser.authenticated = false;
        sess.localUser.userid = null;
    }
    var err = false;
    if(!req.body.lat || isNaN(parseFloat(req.body.lat))) err = true;
    if(!req.body.lng || isNaN(parseFloat(req.body.lng))) err = true;
    if(err){
        console.log("WARNING: incorrect format of geolocation");        
    }
    else{
        sess.metaData[0] = {lat: parseFloat(req.body.lat), lng: parseFloat(req.body.lng)};
    }
    
    sess.save(function(err,a){
        if(err) throw err;        
        
        //After saving, spawn python process and pass the session ID to the process
        var python = require('child_process').spawn('python',["./Python/test.py", sess.id]);
        var output = "";
        python.stdout.on('data', function(data){ output += data + "\n" });
        python.stderr.on('data', function(err){console.log("Error: " + err); output+=err})
        python.on('close', function(code){ 
            console.log(output);
                        
            Session.findOne({"_id" : sess._id}, {"bestAd": true}).populate('bestAd')
                .exec(function(err, session){
                    if(err){res.send(err); return;}                                        
                    res.json({"bestAd": session.bestAd[0], //Send one back for now, until front end catches up 
                              "pythonDebug":output
                             }); //Send back the best ad file name
                
                     //After the python program has closed - remove the session from data base;
                    sess.remove(function (err, result){
                        if(err) throw err;
                        console.log("Session Removed!");
                    }) 
                });                         
        });                
    });
    
    
});



module.exports = router;

