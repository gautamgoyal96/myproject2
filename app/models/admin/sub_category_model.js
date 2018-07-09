
//app/models/user.js
//load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

//define the schema for our user model
var userSchema = mongoose.Schema({	
	_id:{ type: Number, default: 1 },
	serviceId: Number,
	title: String,
	image: String,
	description: String,
	status: String,
	created_date: Date,
	updated_date: Date,
	active_hash: String,
	deleteStatus:{type: Number,default:1},
	role_id: { type: Number, default: 2 }
});


//methods ======================


//create the model for users and expose it to our app
module.exports = mongoose.model('subService', userSchema);