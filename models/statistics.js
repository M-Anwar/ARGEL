var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Statistics = new Schema({
    adId: String,
	pageView: Number,
	viewers: [] //each viewer should include sessionCookie, location, date&time
});

module.exports = mongoose.model('Statistics', Statistics);

