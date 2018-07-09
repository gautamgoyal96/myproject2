var mongoose = require('mongoose');
var bookServiceSchema = mongoose.Schema({
	_id:{ type: Number, default: 1 },
	userId: String,
	artistId: Number,
	staff: { type: Number, default: 0 },
	serviceType:{ type: Number},
	bookingId:{ type: Number, default: 0 },
	bookingPrice:{ type: String, default: '' },
	serviceId: Number,
	subServiceId: Number,
	artistServiceId: Number,
	startTime:{ type: String},
	endTime:{ type: String},
	bookingDate:{ type: String},
	bookingStatus:{ type: String, default: 0},
	timeCount:{ type: Number, default: 0},
	crd: { type: Date, default: new Date() },
	upd: { type: Date, default: new Date() }

});
module.exports = mongoose.model('bookingService',bookServiceSchema);