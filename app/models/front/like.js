var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

var likeSchema = new Schema ({
	_id:{ type: Number, default: 1 },
    feedId:  {type: Number,required: true,},
    userId:  {type: Number,required: true,},
	likeById:{type: Number,required: true,},
	gender:  {type: String,required: true,},
	age:     {type: Number,required: true,},
	city:    {type: String,required: true,},
	state:   {type: String,required: true,},
	country: {type: String,required: true,},
	type:    {type: String,required: true,},
	status:  {type:Number,default:1},
	crd:     { type: Date, default: new Date() },
    upd:     { type: Date, default: new Date() }
});

module.exports = mongoose.model("like", likeSchema);