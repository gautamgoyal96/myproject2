var mongoose = require('mongoose');
var paymentDetailSchema = mongoose.Schema({	
	
	_id: { type: Number, default: 0 },	
	bookingId: { type: Number, default: 0 },	
	firstAdminPay: { type: Object, default: '' },
	firstUserPay: { type: Object, default: '' },
	dateTime: { type: Date, default: new Date() },	
	status: { type: Number, default: 1 },
	crd: { type: Date, default: new Date() },
	upd: { type: Date, default: new Date() }
});
module.exports = mongoose.model('paymentDetail', paymentDetailSchema);


