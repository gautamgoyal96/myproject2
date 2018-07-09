var mongoose = require('mongoose');
var bookingSchema = mongoose.Schema({
	_id:{ type: Number, default: 1 },
    userId: Number,
	artistId: Number,
	totalPrice: String,
	discountPrice: { type: String,default:"" },
	bookingDate:{ type: String,default:"" },
	bookingTime:{ type: String,default:"" },
	bookStatus:{ type: String,default:0 },
	location:{ type: String,default:"" },
	clientId:{type: Number,default:0},
	paymentType:{type: Number,default:1},
	transjectionId:{type: String,default:''},
	paymentStatus:{type: Number,default:0},
	reviewByUser:{ type: String,default:"" },
	reviewByArtist:{ type: String,default:"" },
	userRating:{type: Number,default: 0},
	artistRating:{type: Number,default: 0},
	reviewStatus:{type: Number,default:0},
	timeCount:{ type: Number, default: 0},
	crd: { type: Date, default: new Date() },
	upd: { type: Date, default: new Date() }

});
module.exports = mongoose.model('booking',bookingSchema);