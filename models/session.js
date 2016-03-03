var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Session = new Schema({
    crowdPicture: { data: Buffer, contentType: String },
    metaData:{type : Array, "default" : []},
    bestAd: { type: Schema.Types.ObjectId, ref: 'Ad' },
    localUser: {
        authenticated: Boolean,
        userid: String
    }
});

module.exports = mongoose.model('Session', Session);

