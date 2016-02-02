var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Session = new Schema({
    crowdPicture: { data: Buffer, contentType: String },
    metaData: {
        temperature: Number,
        weather: String,
        location: String
    }
});

module.exports = mongoose.model('Session', Session);

