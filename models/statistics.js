var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Statistics = new Schema({
    adId: String,
	pageViewCount: Number,
  sessionCookies: {type: Array, "default": []}, //delete?
  revenue: Number,
  adViews: {type: Array, "default": []},
	pageViews: {type: Array, "default": []} //each viewer should include sessionCookie, location, date&time
});

module.exports = mongoose.model('Statistics', Statistics);

/* [{
    sessionCookies:Number, 
    date:{ type: Date, default: Date.now }
  }], */