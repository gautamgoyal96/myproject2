var mongoose = require('mongoose');
var Schema = mongoose.Schema({	
	_id:{ type: Number, default: 1 },
	artistId: Number,
	day: Number,
	startTime: String,
	endTime: String,
	status: { type: Number, default: 0 },
	crd: { type: Date, default: new Date() },
	upd: { type: Date, default: new Date() }
});
module.exports = mongoose.model('busineshours', Schema);


