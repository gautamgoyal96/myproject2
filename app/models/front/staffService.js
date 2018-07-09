var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
	_id:{ type: Number, default: 1 },
	artistId: Number,
	serviceId: Number,
	subserviceId: Number,
	artistServiceId:Number,
	businessId:Number,
	staffId:{type: Number,default:0},
	inCallPrice:{ type: String,default:0 },
	outCallPrice:{ type: String,default:0 },
	completionTime:{type:String,default:""},
	status:{type: Number,default:1},
	deleteStatus:{type: Number,default:1},
	crd: { type: Date, default: new Date() },
	upd: { type: Date, default: new Date() }

});
module.exports = mongoose.model('staffservices',userSchema);