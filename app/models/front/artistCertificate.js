var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	_id:{ type: Number, default: 1 },
	artistId: Number,
	certificateImage:{ type: String,default:"" },
	status:{type: Number,default:0},
   	crd: { type: Date, default: new Date() },
	upd: { type: Date, default: new Date() }

});
module.exports = mongoose.model('artistCertificate',userSchema);
