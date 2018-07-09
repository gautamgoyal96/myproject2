var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var FeedSchema = new Schema ({
	_id:{ type: Number,default: 1 },
	userId: Number,
	feedType: { type: String,default:"" },
	feedData:{ type: Array,default:"" },
	caption: { type: String,default:"" },
	city:{ type: String,default:"" },
	country:{ type: String,default:"" },
	location:{ type: String,default:"" },
	view:{ type:Number,default:0 },
	likeCount:{type:Number,default:0 },
	sharelikeCount:{type:Number,default:0 },
	commentCount:{ type:Number,default:0},
	impressionCount:{type:Number,default:0},
	tagId:{type: Object,default:{}},
	peopleTag:{type: Object,default:{}},
	serviceTagId:{type:String,default:""},
	engagement:{type:Number,default:0},
	status:{type:Number,default:1},
	crd: { type: String, default:'' },
	upd: { type: String, default:'' }

	
});

module.exports = mongoose.model("feed",FeedSchema);