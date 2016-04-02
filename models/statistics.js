var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Statistics = new Schema({
  adId: String,
  adname: String,
  type: String, //the type will be either pageView, adPlay, etc
  sessionCookies: String,
  revenue: Number,
  fulldate: String,
  date: String,
  time: String,
  location: String
}); 

/*  OLD
var Statistics = new Schema({
  adId: String,
	uniqueViewCount: Number,
  sessionCookies: {type: Array, "default": []}, //delete?
  revenue: Number,
  adViews: {type: Array, "default": []},
	pageViews: {type: Array, "default": []} //each viewer should include sessionCookie, location, date&time
}); */

module.exports = mongoose.model('Statistics', Statistics);

/* [{
    sessionCookies:Number, 
    date:{ type: Date, default: Date.now }
  }], */