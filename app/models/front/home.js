//app/models/user.js
//load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

//define the schema for our user model
var userSchema = mongoose.Schema({	
	_id:{ type: Number, default: 1 },
	firstName:  {type: String,default: ""},
	lastName:  {type: String,default: ""},
	userName: {type: String,default: ""},
	businessName: {type: String,default: ""},
	businesspostalCode: {type: String,default: ""},
	buildingNumber: {type: String,default: ""},
	businessType: {type: String,default: ""},
	profileImage : {type: String,default: ""},
	email:  {type: String,default: ""},
	password:  {type: String,default: ""},
	gender : {type: String,default: ""},
	dob :  {type: String,default: ""},
	address : {type: String,default: ""},
	address2 : {type: String,default: ""},
	city : {type: String,default: ""},
	state : {type: String,default: ""},
	country : {type: String,default: ""},
	countryCode : {type: String,default: ""},
	contactNo : {type: String,default: ""},
	userType :  {type: String,default: ""},
	socialId : {type: String,default: ""},
	socialType : {type: String,default: ""},
	deviceType : {type: String,default: ""},
	deviceToken : {type: String,default: ""},
	authToken : {type: String,default: ""},
	latitude : {type: String,default: 0},
	longitude : {type: String,default: 0},
	otpVerified : {type: String,default: 0},
	OTP : {type: String,default: ""},
	mailVerified : {type: String,default: 0},
	chatId : {type: String,default: 0},
	firebaseToken : {type: String,default: 0},
	followersCount : {type: String,default: 0},
	followingCount : {type: String,default: 0},
	serviceCount : {type: String,default: 0},
	certificateCount : {type: String,default: 0},
	postCount : {type: String,default: 0},
	reviewCount : {type: String,default: 0},
	ratingCount : {type: String,default: 0},
	bio : {type: String,default: ''},
	bankStatus : { type: Number, default: 0 },
	status: {type: String,default: 1},
	radius: {type: String,default: ''},
	serviceType: {type: Number,default: 0},
	inCallpreprationTime: {type: String,default: ''},
	outCallpreprationTime: {type: String,default: ''},
	isDocument: {type: Number,default: 3},
	crd: { type: Date, default: new Date() },
	upd: { type: Date, default: new Date() },
    location: {
        type: [Number],
        index: "2dsphere"
    }
});


//methods ======================
//generating a hash
userSchema.methods.generateHash = function(password) {
 return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//checking if password is valid
userSchema.methods.validPassword = function(password) {
 return bcrypt.compareSync(password, this.password);
};

userSchema.methods.authtoken = function() {
 return bcrypt.hashSync(Math.floor((Math.random() * 99999999) *54), null, null);
};

//create the model for users and expose it to our app
module.exports = mongoose.model('user', userSchema);