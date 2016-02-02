var express = require('express');
var router = express.Router();
var passport = require('passport');
var Session = require('../models/session');
var fs = require('fs');
var multer = require('multer');
var upload = multer({
    dest:'./uploads/',
    limits: { fileSize: 16* 1024 * 1024} //Max file size for upload multer is 16Mb
});

router.use(function(req,res,next){
    console.log("API call made");
    next();    
    
});

router.get('/helloworld', function(req, res, next) {
  res.json({message: 'Hello World and Welcome to our API'});
});

router.get('/python', function(req,res,next){    
    var python = require('child_process').spawn('python',["./Python/pythonRPC.py"]);
    var output = "";
    python.stdout.on('data', function(data){ output += data });
    python.stderr.on('data', function(err){console.log("Error: " + err); output+=err})
    python.on('close', function(code){ 
        if (code !== 0) {  return res.send(500, output); }
        return res.send(200, output)
    });  
});

router.post('/add', function(req, res, next) {    
    num1 = req.body.arg1;
    num2 = req.body.arg2;
    var python = require('child_process').spawn('python',["./Python/pythonRPC1.py", num1,num2]);
    var output = "";
    python.stdout.on('data', function(data){ output += data });
    python.stderr.on('data', function(err){console.log("Error: " + err); output+=err})
    python.on('close', function(code){ 
        if (code !== 0) {  return res.send(500, output); }
        return res.send(200, output)
    });
    
});

router.get('/database', function(req, res, next) {
    var temp = new Session({
        metaData: {
            temperature: 12,
            weather: "Sunny",
            location: "University of Toronto"
        }
    });
    temp.save(function(err, thor) {
        if (err) return console.error(err);
        console.dir(thor);
        res.send("Entry added to Database");        
        
    });
});
router.post('/fetchad', upload.single('crowdPic'),function(req, res, next) {
    console.log(req.file);
    var dirname = require('path').dirname(__dirname);
    var filename = req.file.filename;
    var path = req.file.path;
    var type = req.file.mimetype;
//  console.log(dirname + '\\' + path);
//	console.log(req.file);
//  console.log(type);        
    
    //Here add the file to our mongoDB database - OPTIMIZE HERE 
    //Use file-stream to load data into session instead of loading
    //into memory. OKAY FOR NOW. 
    var sess = new Session();
    sess.crowdPicture.data = fs.readFileSync(dirname + "\\" + path); //OPTIMIZE
    sess.crowdPicture.contentType = type;
    sess.save(function(err,a){
        if(err) throw err;        
        
        //After saving, spawn python process and pass the session ID to the process
        var python = require('child_process').spawn('python',["./Python/process.py", sess.id]);
        var output = "";
        python.stdout.on('data', function(data){ output += data });
        python.stderr.on('data', function(err){console.log("Error: " + err); output+=err})
        python.on('close', function(code){ 
            if (code !== 0) { res.send(500, output); }
            res.send(200, output);
            
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


module.exports = router;

