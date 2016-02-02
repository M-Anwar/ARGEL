var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Session = new Schema({
    metaData: {
        temperature: Number,
        weather: String,
        location: String
    }
});

module.exports = mongoose.model('Session', Session);

