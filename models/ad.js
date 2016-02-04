var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Ad = new Schema({
	adname: String,
    userid: String,
	description: String,
	tags: {type : Array, "default" : []},
	videoad: { filename: String, contentType: String },
    metaData: {type: Array, "default" : [] },
    statistics: {type: Array, "default": []}
});

module.exports = mongoose.model('Ad', Ad);

