var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var commentSchema = new Schema ({
	_id:{ type: Number, default: 1 },
    feedId:  {type: Number},
    postUserId:  {type: Number,default:0},
	commentById:{type: Number},
	comment:  {type:String,default:''},
	gender:  {type: String,default:''},
	age:     {type: Number,default:''},
	city:    {type: String,default:''},
	state:   {type: String,default:''},
	country: {type: String,default:''},
	commentLikeCount:{type:Number,default:0},
	type:{type:String,default:'text'},
	crd:     { type: String, default:'' },
    upd:     { type: String, default:'' }
});

module.exports = mongoose.model("comment", commentSchema);