var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Ad = new Schema({
	adname: String,
    userid: String,
	description: String,
	tags: String,
	videoad: { filename: String, contentType: String },
    metaData: {
        temperature: Number,
        weather: String,
        location: String
    }
});

module.exports = mongoose.model('Ad', Ad);

