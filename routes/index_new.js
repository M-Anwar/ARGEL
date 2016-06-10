var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var smtpTransport = require("nodemailer-smtp-transport")

var transport = nodemailer.createTransport(smtpTransport({
	    host : "smtp.gmail.com",
	    secureConnection : false,
	    port: 587,
	    auth : {
	        user : "argelmarketingsolutions@gmail.com",
	        pass : "Engscilife2016"
	    }
	}));

router.post('/contact', function(req,res){

	//Send Email to our argel gmail with the contact info passed in from the 
	//home page form.
		
	//Mail options
	var mailOpts = {
	  from: req.body.name + ' &lt;' + req.body.email + '&gt;', //grab form data from the request body object
	  to: 'argelmarketingsolutions@gmail.com',
	  subject: 'Website contact form',
	  text: req.body.name + "\n"+ req.body.mail + "\n" + req.body.message
	};
	transport.sendMail(mailOpts, function (error, response) {
	  //Email not sent
	  if (error) {
	      console.log("Error sending email: " + error);
	  }
	  //Yay!! Email sent
	  else {
	      console.log("Successfully sent");	      
	  }
	});
	res.redirect('/');

});

module.exports = router;