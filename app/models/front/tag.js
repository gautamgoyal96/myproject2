var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tagSchema = new Schema ({
	_id:{ type: Number,default: 1 },
	userId: { type: Number,default:"" },
	tag:{ type: String,default:"" },
	type: { type: String,default:"" },
	tagCount:{ type: Number,default:0 },
	crd: { type: String, default: "" },
	upd: { type: String, default:"" }
	
});

module.exports = mongoose.model("tag",tagSchema);