var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
	username: String,
	email: String,
    password: String,
	description: String,
	displayname: String,
	admin: Boolean,
	superadmin: Boolean,
	profilepicture: String
});


Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);

