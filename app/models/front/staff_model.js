var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
	_id:{ type: Number, default: 1 },
	artistId: Number,
	businessId: Number,
	job:{ type: String,default:''},
	mediaAccess:{ type: String,default:''},
	holiday:{ type: String,default:''},
	serviceType:{ type: Number,default:1},
	staffServiceId: {type: Object,default:{}},
	staffInfo:{type: Object,default:{}},
	staffHours:{type: Object,default:{}},	
	status:{type: Number,default:1},
	crd: { type: Date, default: new Date() },
	upd: { type: Date, default: new Date() }

});

module.exports = mongoose.model('staff',userSchema);