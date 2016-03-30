var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Ad = new Schema({
	adname: String,
    userid: String,
	description: String,
	tags: {type : Array, "default" : []},
	videoad: { _id: String, filename: String, contentType: String },
  metaData: {type: Array, "default" : [] },
  statistics: {type: Array, "default": []},
  cost: Number
});

module.exports = mongoose.model('Ad', Ad);

