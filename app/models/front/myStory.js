var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var myStorySchema = new Schema ({
	_id:    { type: Number, default: 1 },
    userId: {type: Number},
	myStory:{type:String,default:''},
	videoThumb:{type:String,default:''},
	type:   {type: String,default:''},
	status: {type: Number,default:1},
	crd: { type: String, default:'' },
	upd: { type: String, default:'' }
});
module.exports = mongoose.model("myStory", myStorySchema);