var mongoose = require('mongoose');
var userSchema = mongoose.Schema({	
	_id:{ type: Number, default: 1 },
	artistId: Number,
	serviceId: Number,
	subServiceId: Number,
	subServiceName: String,
	status:{type: Number,default:1},
	deleteStatus:{type: Number,default:1},
    crd: Date,
	upd: Date
	
});

module.exports = mongoose.model('artistSubSrervice', userSchema);