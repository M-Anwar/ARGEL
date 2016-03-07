var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Statistics = new Schema({
    adId: String,
	sessionCookies: [],
	pageView: Number
});

module.exports = mongoose.model('Statistics', Statistics);

