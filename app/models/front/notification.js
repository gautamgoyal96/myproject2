var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var notificationSchema = new Schema ({
	_id:{ type: Number,default: 1 },
	notifyId:{ type: Number,default:0 },
	senderId: { type: Number,default:"" },
	receiverId:{ type: Number,default:"" },
	notifincationType:{ type: Number,default:""},
	readStatus:{ type: Number,default:0},
	type: {type: String, default:""},
   	crd:  {type: String, default:new Date()},
	upd:  {type: String, default:new Date()}
	
});

module.exports = mongoose.model("notification",notificationSchema);