var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

var followerSchema = new Schema ({
	_id:{ type: Number, default: 1 },
    followerId:  {type: Number,default:0},
    userId:  {type: Number,default:0},
	status:  {type: Number,default:1},
    crd: { type: Date, default: new Date() },
    upd: { type: Date, default: new Date() }
});

module.exports = mongoose.model("followerFollowing", followerSchema);