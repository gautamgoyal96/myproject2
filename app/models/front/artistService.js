var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
	_id:{ type: Number, default: 1 },
	artistId: Number,
	serviceId: Number,
	subserviceId: Number,
	title:{ type: String,default:"" },
	description:{ type: String,default:"" },
	inCallPrice:{ type: String,default:0 },
	outCallPrice:{ type: String,default:0 },
	completionTime:{type:String,default:""},
	bookingCount:{type: Number,default:0},
	status:{type: Number,default:1},
	deleteStatus:{type: Number,default:1},
	crd: { type: Date, default: new Date() },
	upd: { type: Date, default: new Date() }

});
module.exports = mongoose.model('artistservices',userSchema);