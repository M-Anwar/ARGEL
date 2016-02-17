var express = require('express');
var router = express.Router();
var passport = require('passport');
var Session = require('../models/session');
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

router.get('/helloworld', function(req, res, next) {
    res.json({message: 'Hello World and Welcome to our API'});
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
    Ad.find({}, function(err,ads){
        if(err){console.log(err);res.send(err); return;}        
        res.json(ads);
    });
});
router.post('/postrecommendation', function(req,res,next){
    var sessionID = req.body.sessionID;
    var adID = req.body.adID;
    Session.findOne({"_id" : sessionID}, function(err, session){
        if (err){res.send(err); return;}
        session.bestAd = adID;
        session.save(function(err){
            if (err){res.send(err); return;}            
            res.json({"result": "AD recommendation added!"});
        });
       
    });
    
});
router.post('/fetchad', upload.single('crowdPic'),function(req, res, next) {       
    var dirname = require('path').dirname(__dirname);
    var filename = req.file.filename;
    var path = req.file.path;
    var type = req.file.mimetype;
    
    //Here add the file to our mongoDB database - OPTIMIZE HERE 
    //Use file-stream to load data into session instead of loading
    //into memory. OKAY FOR NOW. 
    var sess = new Session();
    sess.crowdPicture.data = fs.readFileSync(dirname + "\\" + path); //OPTIMIZE
    sess.crowdPicture.contentType = type;
    sess.save(function(err,a){
        if(err) throw err;        
        
        //After saving, spawn python process and pass the session ID to the process
        var python = require('child_process').spawn('python',["./facepp-python-sdk-master/process.py", sess.id]);
        var output = "";
        python.stdout.on('data', function(data){ output += data + "\n" });
        python.stderr.on('data', function(err){console.log("Error: " + err); output+=err})
        python.on('close', function(code){ 
//            if (code !== 0) { res.send(500, output); }
            console.log(output);
            //res.send(200, output); //Un-comment to view pythons script output            
            
            Session.findOne({"_id" : sess._id}, {"bestAd": true}).populate('bestAd')
                .exec(function(err, session){
                    if(err){res.send(err); return;}                                        
                    res.json({"bestAd": session.bestAd, 
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


module.exports = router;

