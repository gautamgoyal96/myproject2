var User            = require('../../models/front/home.js');
var numeral = require('numeral');
var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');
var formidable = require('formidable');
var fs = require('fs');
var formidable = require('formidable');
var accountSid = 'ACaffcfdead968e5413e801e5e0ebee02c';
var authToken = "b6decf9d17f523d047e5b75064b788e0";
var client = require('twilio')(accountSid, authToken);
var url  = require('url');
var nodemailer = require("nodemailer");
var NodeGeocoder = require('node-geocoder');
var ejs = require("ejs");
var randomstring = require("randomstring");
var dateFormat = require('dateformat');
 var moment = require('moment-timezone');
var Cryptr = require('cryptr'),
 cryptr = new Cryptr('1234567890');
const FirebaseAuth = require('firebaseauth');
const apiKey =  "AIzaSyAEXQmhBYTNToKyyXSlpta2SXgM0EXcLSc";

exports.login = function(req, res) {


	if(req.query.id){

		data = {'artistId':req.query.id,'distance':req.query.distance};
		req.session.data = data;
	}

	if (req.session.fUser) {
		if(req.session.fUser.isDocument === 0){

	        res.redirect('/businessHours');

    	}else{
	        res.redirect('/userProfile');
	    }


	} else {

		
		res.render('front/login.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session,
			cryptr : cryptr

	
	 	});
	}
	 
}


exports.profileCheck = function(req, res, next){


	if (req.session.fUser) { // req.session.passport._id

		if(user.isDocument === 0){
	       res.redirect('/businessHours');
	       return;

    	}if(user.isDocument === 1){

	        res.redirect('/subCategoryAdd');
	        return;

    	}if(user.isDocument === 2){

	        res.redirect('/registerStep3');
	        return;

    	}	


	} 



	next();

}

exports.userLogin = function(req, res) {


	var userName = req.body.userName;
	var password = req.body.password;
	var userType = req.body.userType;

	userName = userName.trim();
	password = password.trim();

	var email = userName.toLowerCase();

    User.findOne({

    	    $or: [{
                'email': email

            }, {
                'userName': userName
            }],

            $and:[{
            	'userType' : userType
            }]
             }, function(err, user) {
        // if there are any errors, return the error before anything else
 
        if (err){

 			req.flash('error',err); // req.flash is the way to set flashdata using connect-flash
         	res.redirect('/login');

     	}else{
		        // if no user is found, return the message
		        if (!user){

		            req.flash('error', 'Please enter valid credential'); // req.flash is the way to set flashdata using connect-flash
		         	if(userType=="artist"){
				         		
				         		res.redirect('/businessLogin');

		         	}else{

		         		res.redirect('/login');
		         	}

		        }else{	

			        // if the user is found but the password is wrong
			        if (!user.validPassword(password)){

			           req.flash('error', 'Please enter valid credential'); // create the loginMessage and save it to session as flashdata
			 		  	if(userType=="artist"){
				         		
				         		res.redirect('/businessLogin');

				         	}else{

				         		res.redirect('/login');
				        }

			 		}else{   


				        if(user.status === '0'){

				         	req.flash('error', 'Your account has been inactivated by admin, please contact to activate'); // create the loginMessage and save it to session as flashdata
				         	if(userType=="artist"){
				         		
				         		res.redirect('/businessLogin');

				         	}else{

				         		res.redirect('/login');
				         	}

				    	}else if(user.userType != userType){

				         	req.flash('error', 'Invalid user type'); // create the loginMessage and save it to session as flashdata
				         	if(userType=="artist"){
				         		
				         		res.redirect('/businessLogin');

				         	}else{

				         		res.redirect('/login');
				         	}

				    	}else{

				    		var firebase = new FirebaseAuth(apiKey);

				    		var email = user.email;
							var name = user.userName;

							firebase.signInWithEmail(email, password, function(err, result){
							    if (err){
									firebase.registerWithEmail(email, password, name, function(err, result){

									    if (err){
									        console.log(err);
									    }
									    else{
									        console.log(result.user[UserProfile]);
									        console.log('result.user[UserProfile]');
									    }



									});
							    }else{
							        console.log(result.user[FirebaseUser]);
							    }
							});
							var authtoken = user.authtoken();

				            User.updateMany({'_id':user._id},{$set:{'firebaseToken':'','deviceType':'3','deviceToken':'0','authToken':authtoken}}, function(err, result){
				    		
	   							User.findOne({'_id':user._id}, function(err, user) {
	   								if(err){
	   									res.json(err);
	   									return;
	   								}
						    			req.session.fUser = user;
					    		
						         	if(userType=="artist"){
						         		
						         		res.redirect('/artistDashboard');

						         	}else{

						         		if(req.session.data){

						         			res.redirect('/booking/'+cryptr.encrypt(req.session.data.artistId)+'/'+cryptr.encrypt(req.session.data.distance));

						         		}else{

						         			res.redirect('/home');

						         		}

						         		
						         	}
					         	});
				         	
				         	});

					    }
					}
				}
    	}
    
    });
	 
}

exports.register = function(req, res) {


	console.log(req.session);
	if (req.session.fUser) {

		res.redirect('/userProfile');

	} else {

		var con = [{"name":"Israel","dial_code":"+972","code":"IL"},{"name":"Afghanistan","dial_code":"+93","code":"AF"},{"name":"Albania","dial_code":"+355","code":"AL"},{"name":"Algeria","dial_code":"+213","code":"DZ"},{"name":"AmericanSamoa","dial_code":"+1 684","code":"AS"},{"name":"Andorra","dial_code":"+376","code":"AD"},{"name":"Angola","dial_code":"+244","code":"AO"},{"name":"Anguilla","dial_code":"+1 264","code":"AI"},{"name":"Antigua and Barbuda","dial_code":"+1268","code":"AG"},{"name":"Argentina","dial_code":"+54","code":"AR"},{"name":"Armenia","dial_code":"+374","code":"AM"},{"name":"Aruba","dial_code":"+297","code":"AW"},{"name":"Australia","dial_code":"+61","code":"AU"},{"name":"Austria","dial_code":"+43","code":"AT"},{"name":"Azerbaijan","dial_code":"+994","code":"AZ"},{"name":"Bahamas","dial_code":"+1 242","code":"BS"},{"name":"Bahrain","dial_code":"+973","code":"BH"},{"name":"Bangladesh","dial_code":"+880","code":"BD"},{"name":"Barbados","dial_code":"+1 246","code":"BB"},{"name":"Belarus","dial_code":"+375","code":"BY"},{"name":"Belgium","dial_code":"+32","code":"BE"},{"name":"Belize","dial_code":"+501","code":"BZ"},{"name":"Benin","dial_code":"+229","code":"BJ"},{"name":"Bermuda","dial_code":"+1 441","code":"BM"},{"name":"Bhutan","dial_code":"+975","code":"BT"},{"name":"Bosnia and Herzegovina","dial_code":"+387","code":"BA"},{"name":"Botswana","dial_code":"+267","code":"BW"},{"name":"Brazil","dial_code":"+55","code":"BR"},{"name":"British Indian Ocean Territory","dial_code":"+246","code":"IO"},{"name":"Bulgaria","dial_code":"+359","code":"BG"},{"name":"Burkina Faso","dial_code":"+226","code":"BF"},{"name":"Burundi","dial_code":"+257","code":"BI"},{"name":"Cambodia","dial_code":"+855","code":"KH"},{"name":"Cameroon","dial_code":"+237","code":"CM"},{"name":"Canada","dial_code":"+1","code":"CA"},{"name":"Cape Verde","dial_code":"+238","code":"CV"},{"name":"Cayman Islands","dial_code":"+ 345","code":"KY"},{"name":"Central African Republic","dial_code":"+236","code":"CF"},{"name":"Chad","dial_code":"+235","code":"TD"},{"name":"Chile","dial_code":"+56","code":"CL"},{"name":"China","dial_code":"+86","code":"CN"},{"name":"Christmas Island","dial_code":"+61","code":"CX"},{"name":"Colombia","dial_code":"+57","code":"CO"},{"name":"Comoros","dial_code":"+269","code":"KM"},{"name":"Congo","dial_code":"+242","code":"CG"},{"name":"Cook Islands","dial_code":"+682","code":"CK"},{"name":"Costa Rica","dial_code":"+506","code":"CR"},{"name":"Croatia","dial_code":"+385","code":"HR"},{"name":"Cuba","dial_code":"+53","code":"CU"},{"name":"Cyprus","dial_code":"+537","code":"CY"},{"name":"Czech Republic","dial_code":"+420","code":"CZ"},{"name":"Denmark","dial_code":"+45","code":"DK"},{"name":"Djibouti","dial_code":"+253","code":"DJ"},{"name":"Dominica","dial_code":"+1 767","code":"DM"},{"name":"Dominican Republic","dial_code":"+1 849","code":"DO"},{"name":"Ecuador","dial_code":"+593","code":"EC"},{"name":"Egypt","dial_code":"+20","code":"EG"},{"name":"El Salvador","dial_code":"+503","code":"SV"},{"name":"Equatorial Guinea","dial_code":"+240","code":"GQ"},{"name":"Eritrea","dial_code":"+291","code":"ER"},{"name":"Estonia","dial_code":"+372","code":"EE"},{"name":"Ethiopia","dial_code":"+251","code":"ET"},{"name":"Faroe Islands","dial_code":"+298","code":"FO"},{"name":"Fiji","dial_code":"+679","code":"FJ"},{"name":"Finland","dial_code":"+358","code":"FI"},{"name":"France","dial_code":"+33","code":"FR"},{"name":"French Guiana","dial_code":"+594","code":"GF"},{"name":"French Polynesia","dial_code":"+689","code":"PF"},{"name":"Gabon","dial_code":"+241","code":"GA"},{"name":"Gambia","dial_code":"+220","code":"GM"},{"name":"Georgia","dial_code":"+995","code":"GE"},{"name":"Germany","dial_code":"+49","code":"DE"},{"name":"Ghana","dial_code":"+233","code":"GH"},{"name":"Gibraltar","dial_code":"+350","code":"GI"},{"name":"Greece","dial_code":"+30","code":"GR"},{"name":"Greenland","dial_code":"+299","code":"GL"},{"name":"Grenada","dial_code":"+1 473","code":"GD"},{"name":"Guadeloupe","dial_code":"+590","code":"GP"},{"name":"Guam","dial_code":"+1 671","code":"GU"},{"name":"Guatemala","dial_code":"+502","code":"GT"},{"name":"Guinea","dial_code":"+224","code":"GN"},{"name":"Guinea-Bissau","dial_code":"+245","code":"GW"},{"name":"Guyana","dial_code":"+595","code":"GY"},{"name":"Haiti","dial_code":"+509","code":"HT"},{"name":"Honduras","dial_code":"+504","code":"HN"},{"name":"Hungary","dial_code":"+36","code":"HU"},{"name":"Iceland","dial_code":"+354","code":"IS"},{"name":"India","dial_code":"+91","code":"IN"},{"name":"Indonesia","dial_code":"+62","code":"ID"},{"name":"Iraq","dial_code":"+964","code":"IQ"},{"name":"Ireland","dial_code":"+353","code":"IE"},{"name":"Israel","dial_code":"+972","code":"IL"},{"name":"Italy","dial_code":"+39","code":"IT"},{"name":"Jamaica","dial_code":"+1 876","code":"JM"},{"name":"Japan","dial_code":"+81","code":"JP"},{"name":"Jordan","dial_code":"+962","code":"JO"},{"name":"Kazakhstan","dial_code":"+7 7","code":"KZ"},{"name":"Kenya","dial_code":"+254","code":"KE"},{"name":"Kiribati","dial_code":"+686","code":"KI"},{"name":"Kuwait","dial_code":"+965","code":"KW"},{"name":"Kyrgyzstan","dial_code":"+996","code":"KG"},{"name":"Latvia","dial_code":"+371","code":"LV"},{"name":"Lebanon","dial_code":"+961","code":"LB"},{"name":"Lesotho","dial_code":"+266","code":"LS"},{"name":"Liberia","dial_code":"+231","code":"LR"},{"name":"Liechtenstein","dial_code":"+423","code":"LI"},{"name":"Lithuania","dial_code":"+370","code":"LT"},{"name":"Luxembourg","dial_code":"+352","code":"LU"},{"name":"Madagascar","dial_code":"+261","code":"MG"},{"name":"Malawi","dial_code":"+265","code":"MW"},{"name":"Malaysia","dial_code":"+60","code":"MY"},{"name":"Maldives","dial_code":"+960","code":"MV"},{"name":"Mali","dial_code":"+223","code":"ML"},{"name":"Malta","dial_code":"+356","code":"MT"},{"name":"Marshall Islands","dial_code":"+692","code":"MH"},{"name":"Martinique","dial_code":"+596","code":"MQ"},{"name":"Mauritania","dial_code":"+222","code":"MR"},{"name":"Mauritius","dial_code":"+230","code":"MU"},{"name":"Mayotte","dial_code":"+262","code":"YT"},{"name":"Mexico","dial_code":"+52","code":"MX"},{"name":"Monaco","dial_code":"+377","code":"MC"},{"name":"Mongolia","dial_code":"+976","code":"MN"},{"name":"Montenegro","dial_code":"+382","code":"ME"},{"name":"Montserrat","dial_code":"+1664","code":"MS"},{"name":"Morocco","dial_code":"+212","code":"MA"},{"name":"Myanmar","dial_code":"+95","code":"MM"},{"name":"Namibia","dial_code":"+264","code":"NA"},{"name":"Nauru","dial_code":"+674","code":"NR"},{"name":"Nepal","dial_code":"+977","code":"NP"},{"name":"Netherlands","dial_code":"+31","code":"NL"},{"name":"Netherlands Antilles","dial_code":"+599","code":"AN"},{"name":"New Caledonia","dial_code":"+687","code":"NC"},{"name":"New Zealand","dial_code":"+64","code":"NZ"},{"name":"Nicaragua","dial_code":"+505","code":"NI"},{"name":"Niger","dial_code":"+227","code":"NE"},{"name":"Nigeria","dial_code":"+234","code":"NG"},{"name":"Niue","dial_code":"+683","code":"NU"},{"name":"Norfolk Island","dial_code":"+672","code":"NF"},{"name":"Northern Mariana Islands","dial_code":"+1 670","code":"MP"},{"name":"Norway","dial_code":"+47","code":"NO"},{"name":"Oman","dial_code":"+968","code":"OM"},{"name":"Pakistan","dial_code":"+92","code":"PK"},{"name":"Palau","dial_code":"+680","code":"PW"},{"name":"Panama","dial_code":"+507","code":"PA"},{"name":"Papua New Guinea","dial_code":"+675","code":"PG"},{"name":"Paraguay","dial_code":"+595","code":"PY"},{"name":"Peru","dial_code":"+51","code":"PE"},{"name":"Philippines","dial_code":"+63","code":"PH"},{"name":"Poland","dial_code":"+48","code":"PL"},{"name":"Portugal","dial_code":"+351","code":"PT"},{"name":"Puerto Rico","dial_code":"+1 939","code":"PR"},{"name":"Qatar","dial_code":"+974","code":"QA"},{"name":"Romania","dial_code":"+40","code":"RO"},{"name":"Rwanda","dial_code":"+250","code":"RW"},{"name":"Samoa","dial_code":"+685","code":"WS"},{"name":"San Marino","dial_code":"+378","code":"SM"},{"name":"Saudi Arabia","dial_code":"+966","code":"SA"},{"name":"Senegal","dial_code":"+221","code":"SN"},{"name":"Serbia","dial_code":"+381","code":"RS"},{"name":"Seychelles","dial_code":"+248","code":"SC"},{"name":"Sierra Leone","dial_code":"+232","code":"SL"},{"name":"Singapore","dial_code":"+65","code":"SG"},{"name":"Slovakia","dial_code":"+421","code":"SK"},{"name":"Slovenia","dial_code":"+386","code":"SI"},{"name":"Solomon Islands","dial_code":"+677","code":"SB"},{"name":"South Africa","dial_code":"+27","code":"ZA"},{"name":"South Georgia and the South Sandwich Islands","dial_code":"+500","code":"GS"},{"name":"Spain","dial_code":"+34","code":"ES"},{"name":"Sri Lanka","dial_code":"+94","code":"LK"},{"name":"Sudan","dial_code":"+249","code":"SD"},{"name":"Suriname","dial_code":"+597","code":"SR"},{"name":"Swaziland","dial_code":"+268","code":"SZ"},{"name":"Sweden","dial_code":"+46","code":"SE"},{"name":"Switzerland","dial_code":"+41","code":"CH"},{"name":"Tajikistan","dial_code":"+992","code":"TJ"},{"name":"Thailand","dial_code":"+66","code":"TH"},{"name":"Togo","dial_code":"+228","code":"TG"},{"name":"Tokelau","dial_code":"+690","code":"TK"},{"name":"Tonga","dial_code":"+676","code":"TO"},{"name":"Trinidad and Tobago","dial_code":"+1 868","code":"TT"},{"name":"Tunisia","dial_code":"+216","code":"TN"},{"name":"Turkey","dial_code":"+90","code":"TR"},{"name":"Turkmenistan","dial_code":"+993","code":"TM"},{"name":"Turks and Caicos Islands","dial_code":"+1 649","code":"TC"},{"name":"Tuvalu","dial_code":"+688","code":"TV"},{"name":"Uganda","dial_code":"+256","code":"UG"},{"name":"Ukraine","dial_code":"+380","code":"UA"},{"name":"United Arab Emirates","dial_code":"+971","code":"AE"},{"name":"United Kingdom","dial_code":"+44","code":"GB"},{"name":"United States","dial_code":"+1","code":"US"},{"name":"Uruguay","dial_code":"+598","code":"UY"},{"name":"Uzbekistan","dial_code":"+998","code":"UZ"},{"name":"Vanuatu","dial_code":"+678","code":"VU"},{"name":"Wallis and Futuna","dial_code":"+681","code":"WF"},{"name":"Yemen","dial_code":"+967","code":"YE"},{"name":"Zambia","dial_code":"+260","code":"ZM"},{"name":"Zimbabwe","dial_code":"+263","code":"ZW"},{"name":"land Islands","dial_code":"","code":"AX"},{"name":"Antarctica","dial_code":null,"code":"AQ"},{"name":"Bolivia, Plurinational State of","dial_code":"+591","code":"BO"},{"name":"Brunei Darussalam","dial_code":"+673","code":"BN"},{"name":"Cocos (Keeling) Islands","dial_code":"+61","code":"CC"},{"name":"Congo, The Democratic Republic of the","dial_code":"+243","code":"CD"},{"name":"Cote d'Ivoire","dial_code":"+225","code":"CI"},{"name":"Falkland Islands (Malvinas)","dial_code":"+500","code":"FK"},{"name":"Guernsey","dial_code":"+44","code":"GG"},{"name":"Holy See (Vatican City State)","dial_code":"+379","code":"VA"},{"name":"Hong Kong","dial_code":"+852","code":"HK"},{"name":"Iran, Islamic Republic of","dial_code":"+98","code":"IR"},{"name":"Isle of Man","dial_code":"+44","code":"IM"},{"name":"Jersey","dial_code":"+44","code":"JE"},{"name":"Korea, Democratic People's Republic of","dial_code":"+850","code":"KP"},{"name":"Korea, Republic of","dial_code":"+82","code":"KR"},{"name":"Lao People's Democratic Republic","dial_code":"+856","code":"LA"},{"name":"Libyan Arab Jamahiriya","dial_code":"+218","code":"LY"},{"name":"Macao","dial_code":"+853","code":"MO"},{"name":"Macedonia, The Former Yugoslav Republic of","dial_code":"+389","code":"MK"},{"name":"Micronesia, Federated States of","dial_code":"+691","code":"FM"},{"name":"Moldova, Republic of","dial_code":"+373","code":"MD"},{"name":"Mozambique","dial_code":"+258","code":"MZ"},{"name":"Palestinian Territory, Occupied","dial_code":"+970","code":"PS"},{"name":"Pitcairn","dial_code":"+872","code":"PN"},{"name":"Réunion","dial_code":"+262","code":"RE"},{"name":"Russia","dial_code":"+7","code":"RU"},{"name":"Saint Barthélemy","dial_code":"+590","code":"BL"},{"name":"Saint Helena, Ascension and Tristan Da Cunha","dial_code":"+290","code":"SH"},{"name":"Saint Kitts and Nevis","dial_code":"+1 869","code":"KN"},{"name":"Saint Lucia","dial_code":"+1 758","code":"LC"},{"name":"Saint Martin","dial_code":"+590","code":"MF"},{"name":"Saint Pierre and Miquelon","dial_code":"+508","code":"PM"},{"name":"Saint Vincent and the Grenadines","dial_code":"+1 784","code":"VC"},{"name":"Sao Tome and Principe","dial_code":"+239","code":"ST"},{"name":"Somalia","dial_code":"+252","code":"SO"},{"name":"Svalbard and Jan Mayen","dial_code":"+47","code":"SJ"},{"name":"Syrian Arab Republic","dial_code":"+963","code":"SY"},{"name":"Taiwan, Province of China","dial_code":"+886","code":"TW"},{"name":"Tanzania, United Republic of","dial_code":"+255","code":"TZ"},{"name":"Timor-Leste","dial_code":"+670","code":"TL"},{"name":"Venezuela, Bolivarian Republic of","dial_code":"+58","code":"VE"},{"name":"Viet Nam","dial_code":"+84","code":"VN"},{"name":"Virgin Islands, British","dial_code":"+1 284","code":"VG"},{"name":"Virgin Islands, U.S.","dial_code":"+1 340","code":"VI"}];

			res.render('front/register.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session,
			con:con,
			cryptr : cryptr
		
		 	});
	}	
	 
}


exports.phoneVerification = function(req, res,next){


   var contactNo = req.body.phone; 
   var cod = req.body.countryCode;
   var countryCode = cod
   var OTP = req.body.otp;
   data = req.body; 
   data.OTP = OTP;


            User.findOne({'contactNo' : contactNo}, function(err, user) {

               if(user){  


	               	if(user.otpVerified==1 && user.firstName){

	               		return res.json({status:2,message:'Phone number already exist'});


	               	}else if((user.otpVerified==1 && user.firstName=='') || (user.otpVerified==0 && user.firstName=='')){


	               		  	User.update({contactNo:contactNo}, 
					        {$set: {OTP:OTP,contactNo:contactNo,otpVerified:0,countryCode:countryCode,deviceType:'3'}},
					        function(err, docs){
					            if(err) res.json(err);
					            else    {

					            	data._id = user._id;
					            next();

					        };
					    });
	               		
	               	}else{

	                  res.json({status:'0',message:"Somting going wrong"});
	                  return;
	                }  

               }else{


           		   User.find().sort([['_id', 'descending']]).limit(1).exec(function(err, userdata) {  

			                 
			                  var newUser    = new User({OTP:OTP,contactNo:contactNo,otpVerified:0,countryCode:countryCode,deviceType:'3'});

			                        if(userdata.length > 0){
			                            newUser._id = userdata[0]._id+1;
			                        }
			                        		
			                    newUser.save(function(err) {
			                    	data._id = newUser._id;
			                       next();

			                    
			                    });
			                    
			            });
               }

            });    
}



exports.sendSmsdata = function(req, res){
console.log(data);
	OTP = data.OTP;
	var contactNo = data.countryCode+data.phone;

    client.messages.create({
        to: contactNo,
        from: "+14159972821",
        body: "Welcome to Mualab, your phone number verification code is: "+OTP, 
        }, function(err, call) {

        if(err){

          	User.remove( { _id:data._id }, function(err, result) {
	        if (err) throw err;
	        
	    	});

            res.json({status:'0',message:err.message});
            return;

          }else{

            res.json({status:'1',message:'Verification code has been sent successfully',otp:cryptr.encrypt(OTP),'id':data._id});
            return;
          }

    });

}



exports.emailCheck = function(req, res){


	var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var email = req.query.email; 
    var userType = req.query.userType ? req.query.userType  : 'user'; 
    var type = req.query.type; 
    if(type==1){

	    User.findOne({email:email,userType:userType}, function(err, userData) {


	    	if(userData){
	    		res.json({type:false});
	    	}else{

	    		res.json({type: true});
	    	}

	    });

	}else{

		if (req.session.fUser) {

			userId = req.session.fUser._id;

		    User.findOne({userName:email ,_id: {'$ne':userId}}, function(err, userData) {


		    	if(userData){
		    		res.json({type:false});
		    	}else{

		    		res.json({type: true});
		    	}

	    	});

		} else {

			User.findOne({userName:email}, function(err, userData) {


		    	if(userData){
		    		res.json({type:false});
		    	}else{

		    		res.json({type: true});
		    	}

	    	});
		}	


	}    

}



exports.fileUpload = function(req, res){

	   var form = new formidable.IncomingForm();
	    form.parse(req, function (err, fields, files) {
		    if(files.profileImage.name){

		    	var oldpath = files.profileImage;
		        var imageName = Date.now()+".jpg";

		    	var test = Jimp.read(oldpath, function (err, lenna) {
				    if (err) throw err;
				    lenna.resize(256, 256)            // resize 
				         .quality(60)                 // set JPEG quality 
				         .greyscale()                 // set greyscale 
				         .write(imageName); // save 
				});
		    	
		      var newpath = './public/uploads/profile/'+imageName;
		     console.log(test);
		      fs.rename(test, newpath, function (err) {
		        if (err) throw err;
		      //  res.end();
		      });
		  	}else{
		  		
		  		var imageName = fields.image;
		  	}
		 });
}



exports.UserSignup = function(req, res){

	   var form = new formidable.IncomingForm();
	    form.parse(req, function (err, fields, files) {

	    	
		    if(fields.recImageData){


		    	var oldpath = fields.recImageData;
		    	var imageName = Date.now()+".jpg";
		    	var newpath = './public/uploads/profile/'+imageName;
		    	var data = oldpath.replace(/^data:image\/\w+;base64,/, "");
				var buf = new Buffer(data, 'base64');
				fs.writeFile(newpath, buf);

		  	}else{
		  		
		  		var imageName = fields.image;
		  	}

		  	email = fields.email;


		  	   User.findOne({ 'email' :  email,'userType':'user' }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {

            	req.flash('error', 'Email is already register.');
                 res.redirect('/register');

            } else {

            	var options = {
				  	provider: 'google',
				  	httpAdapter: 'https',
				  	apiKey: 'AIzaSyCyie5SLruC8QRsZ4VYSaK1uwUE6g4w2IY',
				  	formatter: null		
				};
		 
				var geocoder = NodeGeocoder(options);

				geocoder.geocode(fields.address)
				  .then(function(row) {

                        var my = new User();
                        var data            = {};
                        var active_code=bcrypt.hashSync(Math.floor((Math.random() * 99999999) *54), null, null);
                        data.email    = email;
                        data.password = my.generateHash(fields.cpassword);
                        data.firstName = fields.firstName;
                        data.lastName = fields.lastName;
                        data.userName = fields.userName;
                        data.contactNo = fields.contactNo;
                        data.socialId = fields.socialId;
                        data.socialType =fields.socialType;
                        data.address =	fields.address;
                        data.dob = GetFormattedDate(fields.dob);
                        data.city =row[0].city;
                        data.state =row[0].administrativeLevels.level1long;
                        data.country =row[0].country;
                        data.latitude =row[0].latitude;
                        data.longitude =row[0].longitude;
                        data.location =	[row[0].latitude,row[0].longitude];
                        data.otpVerified = "1";
                        data.OTP = "checked";
                        data.status = '1'; //inactive for email actiavators
                        data.authToken = active_code;
                        data.deviceType ="3";
                        data.gender  = "";
                        data.userType = "user";
                        data.profileImage = imageName;
                        console.log(data);
                        User.update({_id:fields.userId}, 
                        {$set: data},
                        function(err, docs){


                            data._id = fields.userId;
                            req.session.fUser = data;
                            req.flash('success', 'Account Created Successfully');
                            if(req.session.data){

			         			res.redirect('/booking?id='+req.session.data.artistId+'&distance='+req.session.data.distance);

			         		}else{

			         			res.redirect('/home');

			         		}

                    });

                });
           
                
            }

        });  	    
	        
	});


}


function GetFormattedDate(date) {

	if(date){
  		s = date.split('/');
		return s[2] + '-' + s[1] + '-' + s[0];
	}
	return false;
}


exports.socialRegister = function(req, res){

	var email = req.body.email;
	var socialId = req.body.socialId;
	var socialType = req.body.socialType;
	console.log(email);
	console.log(socialId);
	console.log(socialType);

	User.findOne({'email' : email}, function(err, user) {

	     if(user){


	     	User.findOne({'socialId' : socialId,'socialType':socialType}, function(err, data) {


			     if(data){

			     	if(data.OTP = "checked"){

				     	req.session.fUser = data;
				        res.json({'return':'false',type:"SL"});
				        return;

				    }else{

				    	res.json({type:"SR",userData:data._id});
				        return;

				    }    

			    }else{

			    	res.json({type:'AE',message:"Email already exist"});
	        		return;

			    }


		    });



	    }else{


	    	User.findOne({'socialId' : socialId,'socialType':socialType}, function(err, data) {

            
			     if(data){

			     	if(data.OTP = "checked"){

				     	req.session.fUser = data;
				        res.json({'return':'false',type:"SL"});
				        return;

				    }else{

				    	res.json({type:"SR",userData:data._id});
				        return;

				    }    

			    }else{

			    	res.json({type:"SR"});
				    return;

			    }


		    });


	    }


    });
}

exports.forgotPassword = function(req, res,next) {

   var email = req.body.email;
   var type = req.body.type;
     User.findOne({'email': email,socialId:'',userType:type}, function(err, user) {
        // if there are any errors, return the error before anything else

        if(user){

        	    var messagePass =	randomstring.generate({ length: 5,charset: 'alphanumeric'})+"@";
                var newUser = new User({});
                newPass = newUser.generateHash(messagePass);
                User.update({'_id': user._id}, { $set: {password: newPass } }, function(err, docs) {});
                data = {'email':email,'password':messagePass};
                next();


        }else{

        	res.json({status:'0',message:'Invalid email id'});
        }
 
    });


}


exports.sendMail = function(req, res) {


		var template = process.cwd() + '/app/templates/resetPassword.ejs';
                var templateData = {
                    Paaword: data.password
                };
                console.log(data);
                ejs.renderFile(template, templateData, 'utf8', function(err, file) {
                    if (err) {
                        res.json({'status': "0",message: err});
                    } else {

                        var smtpTransport = nodemailer.createTransport({
                            host: 'smtp.gmail.com',
                            port: 465,
                            secure: true,
                            service: "Gmail",
                            secureConnection: true,
                            auth: {
                                user: "sunil.mindiii@gmail.com",
                                pass: "sunil123456"
                            }
                        });
                        var mailOptions = {
                            to: req.body.email,
                            subject: 'Forgot password',
                            html: file
                        }

                        smtpTransport.sendMail(mailOptions, function(error, response) {
                            if (error) {

                                res.json({'status': "0",message: error});

                            } else {
                               
                            	res.json({ 'status': "1",message: 'Password has been send successfully'});
                            }
                        });
                    }
                });

         
}
   
       /*  artist login */

exports.businesslogin = function(req, res) {

	if (req.session.fUser) {

		res.redirect('/userProfile');

	} else {
		
		res.render('front/businesslogin.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session,
			cryptr : cryptr
	
	 	});
	}
	 
}


exports.businessRegister = function(req, res) {

	if (req.session.fUser) {

		res.redirect('/userProfile');

	} else {

		var con = [{"name":"Israel","dial_code":"+972","code":"IL"},{"name":"Afghanistan","dial_code":"+93","code":"AF"},{"name":"Albania","dial_code":"+355","code":"AL"},{"name":"Algeria","dial_code":"+213","code":"DZ"},{"name":"AmericanSamoa","dial_code":"+1 684","code":"AS"},{"name":"Andorra","dial_code":"+376","code":"AD"},{"name":"Angola","dial_code":"+244","code":"AO"},{"name":"Anguilla","dial_code":"+1 264","code":"AI"},{"name":"Antigua and Barbuda","dial_code":"+1268","code":"AG"},{"name":"Argentina","dial_code":"+54","code":"AR"},{"name":"Armenia","dial_code":"+374","code":"AM"},{"name":"Aruba","dial_code":"+297","code":"AW"},{"name":"Australia","dial_code":"+61","code":"AU"},{"name":"Austria","dial_code":"+43","code":"AT"},{"name":"Azerbaijan","dial_code":"+994","code":"AZ"},{"name":"Bahamas","dial_code":"+1 242","code":"BS"},{"name":"Bahrain","dial_code":"+973","code":"BH"},{"name":"Bangladesh","dial_code":"+880","code":"BD"},{"name":"Barbados","dial_code":"+1 246","code":"BB"},{"name":"Belarus","dial_code":"+375","code":"BY"},{"name":"Belgium","dial_code":"+32","code":"BE"},{"name":"Belize","dial_code":"+501","code":"BZ"},{"name":"Benin","dial_code":"+229","code":"BJ"},{"name":"Bermuda","dial_code":"+1 441","code":"BM"},{"name":"Bhutan","dial_code":"+975","code":"BT"},{"name":"Bosnia and Herzegovina","dial_code":"+387","code":"BA"},{"name":"Botswana","dial_code":"+267","code":"BW"},{"name":"Brazil","dial_code":"+55","code":"BR"},{"name":"British Indian Ocean Territory","dial_code":"+246","code":"IO"},{"name":"Bulgaria","dial_code":"+359","code":"BG"},{"name":"Burkina Faso","dial_code":"+226","code":"BF"},{"name":"Burundi","dial_code":"+257","code":"BI"},{"name":"Cambodia","dial_code":"+855","code":"KH"},{"name":"Cameroon","dial_code":"+237","code":"CM"},{"name":"Canada","dial_code":"+1","code":"CA"},{"name":"Cape Verde","dial_code":"+238","code":"CV"},{"name":"Cayman Islands","dial_code":"+ 345","code":"KY"},{"name":"Central African Republic","dial_code":"+236","code":"CF"},{"name":"Chad","dial_code":"+235","code":"TD"},{"name":"Chile","dial_code":"+56","code":"CL"},{"name":"China","dial_code":"+86","code":"CN"},{"name":"Christmas Island","dial_code":"+61","code":"CX"},{"name":"Colombia","dial_code":"+57","code":"CO"},{"name":"Comoros","dial_code":"+269","code":"KM"},{"name":"Congo","dial_code":"+242","code":"CG"},{"name":"Cook Islands","dial_code":"+682","code":"CK"},{"name":"Costa Rica","dial_code":"+506","code":"CR"},{"name":"Croatia","dial_code":"+385","code":"HR"},{"name":"Cuba","dial_code":"+53","code":"CU"},{"name":"Cyprus","dial_code":"+537","code":"CY"},{"name":"Czech Republic","dial_code":"+420","code":"CZ"},{"name":"Denmark","dial_code":"+45","code":"DK"},{"name":"Djibouti","dial_code":"+253","code":"DJ"},{"name":"Dominica","dial_code":"+1 767","code":"DM"},{"name":"Dominican Republic","dial_code":"+1 849","code":"DO"},{"name":"Ecuador","dial_code":"+593","code":"EC"},{"name":"Egypt","dial_code":"+20","code":"EG"},{"name":"El Salvador","dial_code":"+503","code":"SV"},{"name":"Equatorial Guinea","dial_code":"+240","code":"GQ"},{"name":"Eritrea","dial_code":"+291","code":"ER"},{"name":"Estonia","dial_code":"+372","code":"EE"},{"name":"Ethiopia","dial_code":"+251","code":"ET"},{"name":"Faroe Islands","dial_code":"+298","code":"FO"},{"name":"Fiji","dial_code":"+679","code":"FJ"},{"name":"Finland","dial_code":"+358","code":"FI"},{"name":"France","dial_code":"+33","code":"FR"},{"name":"French Guiana","dial_code":"+594","code":"GF"},{"name":"French Polynesia","dial_code":"+689","code":"PF"},{"name":"Gabon","dial_code":"+241","code":"GA"},{"name":"Gambia","dial_code":"+220","code":"GM"},{"name":"Georgia","dial_code":"+995","code":"GE"},{"name":"Germany","dial_code":"+49","code":"DE"},{"name":"Ghana","dial_code":"+233","code":"GH"},{"name":"Gibraltar","dial_code":"+350","code":"GI"},{"name":"Greece","dial_code":"+30","code":"GR"},{"name":"Greenland","dial_code":"+299","code":"GL"},{"name":"Grenada","dial_code":"+1 473","code":"GD"},{"name":"Guadeloupe","dial_code":"+590","code":"GP"},{"name":"Guam","dial_code":"+1 671","code":"GU"},{"name":"Guatemala","dial_code":"+502","code":"GT"},{"name":"Guinea","dial_code":"+224","code":"GN"},{"name":"Guinea-Bissau","dial_code":"+245","code":"GW"},{"name":"Guyana","dial_code":"+595","code":"GY"},{"name":"Haiti","dial_code":"+509","code":"HT"},{"name":"Honduras","dial_code":"+504","code":"HN"},{"name":"Hungary","dial_code":"+36","code":"HU"},{"name":"Iceland","dial_code":"+354","code":"IS"},{"name":"India","dial_code":"+91","code":"IN"},{"name":"Indonesia","dial_code":"+62","code":"ID"},{"name":"Iraq","dial_code":"+964","code":"IQ"},{"name":"Ireland","dial_code":"+353","code":"IE"},{"name":"Israel","dial_code":"+972","code":"IL"},{"name":"Italy","dial_code":"+39","code":"IT"},{"name":"Jamaica","dial_code":"+1 876","code":"JM"},{"name":"Japan","dial_code":"+81","code":"JP"},{"name":"Jordan","dial_code":"+962","code":"JO"},{"name":"Kazakhstan","dial_code":"+7 7","code":"KZ"},{"name":"Kenya","dial_code":"+254","code":"KE"},{"name":"Kiribati","dial_code":"+686","code":"KI"},{"name":"Kuwait","dial_code":"+965","code":"KW"},{"name":"Kyrgyzstan","dial_code":"+996","code":"KG"},{"name":"Latvia","dial_code":"+371","code":"LV"},{"name":"Lebanon","dial_code":"+961","code":"LB"},{"name":"Lesotho","dial_code":"+266","code":"LS"},{"name":"Liberia","dial_code":"+231","code":"LR"},{"name":"Liechtenstein","dial_code":"+423","code":"LI"},{"name":"Lithuania","dial_code":"+370","code":"LT"},{"name":"Luxembourg","dial_code":"+352","code":"LU"},{"name":"Madagascar","dial_code":"+261","code":"MG"},{"name":"Malawi","dial_code":"+265","code":"MW"},{"name":"Malaysia","dial_code":"+60","code":"MY"},{"name":"Maldives","dial_code":"+960","code":"MV"},{"name":"Mali","dial_code":"+223","code":"ML"},{"name":"Malta","dial_code":"+356","code":"MT"},{"name":"Marshall Islands","dial_code":"+692","code":"MH"},{"name":"Martinique","dial_code":"+596","code":"MQ"},{"name":"Mauritania","dial_code":"+222","code":"MR"},{"name":"Mauritius","dial_code":"+230","code":"MU"},{"name":"Mayotte","dial_code":"+262","code":"YT"},{"name":"Mexico","dial_code":"+52","code":"MX"},{"name":"Monaco","dial_code":"+377","code":"MC"},{"name":"Mongolia","dial_code":"+976","code":"MN"},{"name":"Montenegro","dial_code":"+382","code":"ME"},{"name":"Montserrat","dial_code":"+1664","code":"MS"},{"name":"Morocco","dial_code":"+212","code":"MA"},{"name":"Myanmar","dial_code":"+95","code":"MM"},{"name":"Namibia","dial_code":"+264","code":"NA"},{"name":"Nauru","dial_code":"+674","code":"NR"},{"name":"Nepal","dial_code":"+977","code":"NP"},{"name":"Netherlands","dial_code":"+31","code":"NL"},{"name":"Netherlands Antilles","dial_code":"+599","code":"AN"},{"name":"New Caledonia","dial_code":"+687","code":"NC"},{"name":"New Zealand","dial_code":"+64","code":"NZ"},{"name":"Nicaragua","dial_code":"+505","code":"NI"},{"name":"Niger","dial_code":"+227","code":"NE"},{"name":"Nigeria","dial_code":"+234","code":"NG"},{"name":"Niue","dial_code":"+683","code":"NU"},{"name":"Norfolk Island","dial_code":"+672","code":"NF"},{"name":"Northern Mariana Islands","dial_code":"+1 670","code":"MP"},{"name":"Norway","dial_code":"+47","code":"NO"},{"name":"Oman","dial_code":"+968","code":"OM"},{"name":"Pakistan","dial_code":"+92","code":"PK"},{"name":"Palau","dial_code":"+680","code":"PW"},{"name":"Panama","dial_code":"+507","code":"PA"},{"name":"Papua New Guinea","dial_code":"+675","code":"PG"},{"name":"Paraguay","dial_code":"+595","code":"PY"},{"name":"Peru","dial_code":"+51","code":"PE"},{"name":"Philippines","dial_code":"+63","code":"PH"},{"name":"Poland","dial_code":"+48","code":"PL"},{"name":"Portugal","dial_code":"+351","code":"PT"},{"name":"Puerto Rico","dial_code":"+1 939","code":"PR"},{"name":"Qatar","dial_code":"+974","code":"QA"},{"name":"Romania","dial_code":"+40","code":"RO"},{"name":"Rwanda","dial_code":"+250","code":"RW"},{"name":"Samoa","dial_code":"+685","code":"WS"},{"name":"San Marino","dial_code":"+378","code":"SM"},{"name":"Saudi Arabia","dial_code":"+966","code":"SA"},{"name":"Senegal","dial_code":"+221","code":"SN"},{"name":"Serbia","dial_code":"+381","code":"RS"},{"name":"Seychelles","dial_code":"+248","code":"SC"},{"name":"Sierra Leone","dial_code":"+232","code":"SL"},{"name":"Singapore","dial_code":"+65","code":"SG"},{"name":"Slovakia","dial_code":"+421","code":"SK"},{"name":"Slovenia","dial_code":"+386","code":"SI"},{"name":"Solomon Islands","dial_code":"+677","code":"SB"},{"name":"South Africa","dial_code":"+27","code":"ZA"},{"name":"South Georgia and the South Sandwich Islands","dial_code":"+500","code":"GS"},{"name":"Spain","dial_code":"+34","code":"ES"},{"name":"Sri Lanka","dial_code":"+94","code":"LK"},{"name":"Sudan","dial_code":"+249","code":"SD"},{"name":"Suriname","dial_code":"+597","code":"SR"},{"name":"Swaziland","dial_code":"+268","code":"SZ"},{"name":"Sweden","dial_code":"+46","code":"SE"},{"name":"Switzerland","dial_code":"+41","code":"CH"},{"name":"Tajikistan","dial_code":"+992","code":"TJ"},{"name":"Thailand","dial_code":"+66","code":"TH"},{"name":"Togo","dial_code":"+228","code":"TG"},{"name":"Tokelau","dial_code":"+690","code":"TK"},{"name":"Tonga","dial_code":"+676","code":"TO"},{"name":"Trinidad and Tobago","dial_code":"+1 868","code":"TT"},{"name":"Tunisia","dial_code":"+216","code":"TN"},{"name":"Turkey","dial_code":"+90","code":"TR"},{"name":"Turkmenistan","dial_code":"+993","code":"TM"},{"name":"Turks and Caicos Islands","dial_code":"+1 649","code":"TC"},{"name":"Tuvalu","dial_code":"+688","code":"TV"},{"name":"Uganda","dial_code":"+256","code":"UG"},{"name":"Ukraine","dial_code":"+380","code":"UA"},{"name":"United Arab Emirates","dial_code":"+971","code":"AE"},{"name":"United Kingdom","dial_code":"+44","code":"GB"},{"name":"United States","dial_code":"+1","code":"US"},{"name":"Uruguay","dial_code":"+598","code":"UY"},{"name":"Uzbekistan","dial_code":"+998","code":"UZ"},{"name":"Vanuatu","dial_code":"+678","code":"VU"},{"name":"Wallis and Futuna","dial_code":"+681","code":"WF"},{"name":"Yemen","dial_code":"+967","code":"YE"},{"name":"Zambia","dial_code":"+260","code":"ZM"},{"name":"Zimbabwe","dial_code":"+263","code":"ZW"},{"name":"land Islands","dial_code":"","code":"AX"},{"name":"Antarctica","dial_code":null,"code":"AQ"},{"name":"Bolivia, Plurinational State of","dial_code":"+591","code":"BO"},{"name":"Brunei Darussalam","dial_code":"+673","code":"BN"},{"name":"Cocos (Keeling) Islands","dial_code":"+61","code":"CC"},{"name":"Congo, The Democratic Republic of the","dial_code":"+243","code":"CD"},{"name":"Cote d'Ivoire","dial_code":"+225","code":"CI"},{"name":"Falkland Islands (Malvinas)","dial_code":"+500","code":"FK"},{"name":"Guernsey","dial_code":"+44","code":"GG"},{"name":"Holy See (Vatican City State)","dial_code":"+379","code":"VA"},{"name":"Hong Kong","dial_code":"+852","code":"HK"},{"name":"Iran, Islamic Republic of","dial_code":"+98","code":"IR"},{"name":"Isle of Man","dial_code":"+44","code":"IM"},{"name":"Jersey","dial_code":"+44","code":"JE"},{"name":"Korea, Democratic People's Republic of","dial_code":"+850","code":"KP"},{"name":"Korea, Republic of","dial_code":"+82","code":"KR"},{"name":"Lao People's Democratic Republic","dial_code":"+856","code":"LA"},{"name":"Libyan Arab Jamahiriya","dial_code":"+218","code":"LY"},{"name":"Macao","dial_code":"+853","code":"MO"},{"name":"Macedonia, The Former Yugoslav Republic of","dial_code":"+389","code":"MK"},{"name":"Micronesia, Federated States of","dial_code":"+691","code":"FM"},{"name":"Moldova, Republic of","dial_code":"+373","code":"MD"},{"name":"Mozambique","dial_code":"+258","code":"MZ"},{"name":"Palestinian Territory, Occupied","dial_code":"+970","code":"PS"},{"name":"Pitcairn","dial_code":"+872","code":"PN"},{"name":"Réunion","dial_code":"+262","code":"RE"},{"name":"Russia","dial_code":"+7","code":"RU"},{"name":"Saint Barthélemy","dial_code":"+590","code":"BL"},{"name":"Saint Helena, Ascension and Tristan Da Cunha","dial_code":"+290","code":"SH"},{"name":"Saint Kitts and Nevis","dial_code":"+1 869","code":"KN"},{"name":"Saint Lucia","dial_code":"+1 758","code":"LC"},{"name":"Saint Martin","dial_code":"+590","code":"MF"},{"name":"Saint Pierre and Miquelon","dial_code":"+508","code":"PM"},{"name":"Saint Vincent and the Grenadines","dial_code":"+1 784","code":"VC"},{"name":"Sao Tome and Principe","dial_code":"+239","code":"ST"},{"name":"Somalia","dial_code":"+252","code":"SO"},{"name":"Svalbard and Jan Mayen","dial_code":"+47","code":"SJ"},{"name":"Syrian Arab Republic","dial_code":"+963","code":"SY"},{"name":"Taiwan, Province of China","dial_code":"+886","code":"TW"},{"name":"Tanzania, United Republic of","dial_code":"+255","code":"TZ"},{"name":"Timor-Leste","dial_code":"+670","code":"TL"},{"name":"Venezuela, Bolivarian Republic of","dial_code":"+58","code":"VE"},{"name":"Viet Nam","dial_code":"+84","code":"VN"},{"name":"Virgin Islands, British","dial_code":"+1 284","code":"VG"},{"name":"Virgin Islands, U.S.","dial_code":"+1 340","code":"VI"}];


			res.render('front/businessRegister.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session,
			con:con,
			cryptr : cryptr
		
		 	});
	}	
	 
}

exports.businessSignup = function(req, res){


	   var form = new formidable.IncomingForm();
	    form.parse(req, function (err, fields, files) {

		   if(fields.recImageData){


		    	var oldpath = fields.recImageData;
		    	var imageName = Date.now()+".jpg";
		    	var newpath = './public/uploads/profile/'+imageName;
		    	var data = oldpath.replace(/^data:image\/\w+;base64,/, "");
				var buf = new Buffer(data, 'base64');
				fs.writeFile(newpath, buf);
				
		  	}else{
		  		
		  		var imageName = fields.image;
		  	}

		  	email = fields.email;


		  	   User.findOne({ 'email' :  email,'userType':'artist' }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {

            	req.flash('error', 'Email is already register.');
                 res.redirect('/register');

            } else {

            	var options = {
				  	provider: 'google',
				  	httpAdapter: 'https',
				  	apiKey: 'AIzaSyCyie5SLruC8QRsZ4VYSaK1uwUE6g4w2IY',
				  	formatter: null		
				};
		 
				var geocoder = NodeGeocoder(options);

				geocoder.geocode(fields.address)
				  .then(function(row) {

	                        var my = new User();
	                        var data            = {};
	                        var active_code=bcrypt.hashSync(Math.floor((Math.random() * 99999999) *54), null, null);
	                        data.email    = email;
	                        data.password = my.generateHash(fields.cpassword);
	                        data.firstName = fields.firstName;
	                        data.lastName = fields.lastName;       
	                        data.userName = fields.userName;
	                        data.contactNo = fields.contactNo;
	                        data.businessName = fields.businessName;
	                        data.businesspostalCode = fields.businesspostalCode;
	                        data.buildingNumber = fields.buildingNumber;
	                        data.businessType = fields.businessType;
	                        data.socialId = fields.socialId;
	                        data.socialType =fields.socialType;
                        	data.dob = GetFormattedDate(fields.dob);
	                        data.address =fields.address;
	                        data.city =row[0].city;
	                        data.state =row[0].administrativeLevels.level1long;
	                        data.country =row[0].country;
	                        data.latitude =row[0].latitude;
	                        data.longitude =row[0].longitude;
	                        data.location =	[row[0].latitude,row[0].longitude];
	                        data.otpVerified = "1";
	                        data.OTP = "checked";
	                        data.status = '1'; //inactive for email actiavators
	                        data.authToken = active_code;
	                        data.deviceType ="3";
	                        data.gender  = "male";
	                        data.userType = "artist";
	                        data.isDocument = 0;
	                        data.profileImage = imageName;
	                        console.log(data);
	                         console.log(fields.userId);
	                        User.update({_id:fields.userId}, 
	                        {$set: data},
	                        function(err, docs){


	                            data._id = fields.userId;
	                            req.session.fUser = data;
	                            req.flash('success', 'Account Created Successfully')
	                            res.redirect('/userProfile');

	                    });

           		});
                
            }

        });  	    
	        
	});


}
