var mongoose = require('mongoose');
var userSchema = mongoose.Schema({	
	_id:{ type: Number, default: 1 },
	artistId: Number,
	serviceId: Number,
	serviceName: String,
	bookingCount:{type: String,default:'0'},
	status:{type: Number,default:1},
	deleteStatus:{type: Number,default:1},
    crd: Date,
	upd: Date
	
});
module.exports = mongoose.model('artistMainService', userSchema);