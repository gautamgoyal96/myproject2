var User            = require('../../models/front/home.js');
var Certificate     = require('../../models/front/artistCertificate.js');
var bookingService 	= require('../../models/front/bookingService.js');
var followUnfollow 	= require('../../models/front/followersFollowing.js');
var artistFavorite 	= require('../../models/front/artisteFavorite.js');
var booking 		= require('../../models/front/booking.js');
var artistService 	= require('../../models/front/artistService.js');
var feeds = require('../../models/front/feed.js');


var numeral = require('numeral');
var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');
var formidable = require('formidable');
var fs = require('fs');
var NodeGeocoder = require('node-geocoder');
var url  = require('url');
var Cryptr = require('cryptr'),
cryptr = new Cryptr('1234567890');
var lodash = require('lodash');
 var moment = require('moment-timezone');

exports.loggedIn = function(req, res, next){

	lUser = [];
	if (req.session.fUser) { // req.session.passport._id

		User.findOne({_id:req.session.fUser._id}, function(err, userData) {

				user = userData;


				if(user.profileImage){

					var result = url.parse(userData.profileImage, true);
					if(result.slashes==true){

						user.profileImage = userData.profileImage;

					}else{

						user.profileImage = '/uploads/profile/'+userData.profileImage;
					}
					
				}else{

					user.profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

				}


				feeds.find({userId:user._id}, function (e, fdata) {

						user.postCount = 0;

						if(fdata){

							user.postCount = fdata.length;

						}
						lUser = user;				
						next();

				});


				
		});	


	} else {

		res.redirect('/');
		return;

	}

}



exports.authTokenCheck = function(req, res, next){

	if (req.session.fUser) { // req.session.passport._id

/*		console.log(req.session.fUser);
*/

		User.findOne({authToken:req.session.fUser.authToken}, function(err, userData) {


				if(userData){

					if(userData.status=='0'){

						res.json({'status':1});

					}else{

						res.json({'status':2});
					}

				}else{

					res.json({'status':0});

				}
				


		});	


	} else {

		res.json({'status':0});

	}

}

exports.loggedInuserData = function(req, res, next){

	if (req.session.fUser) { // req.session.passport._id

		User.findOne({_id:req.session.fUser._id}, function(err, userData) {

				user = userData;


				if(user.profileImage){

					var result = url.parse(userData.profileImage, true);
					if(result.slashes==true){

						user.profileImage = userData.profileImage;

					}else{

						user.profileImage = '/uploads/profile/'+userData.profileImage;
					}
					
				}else{

					user.profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

				}
				lUser = user;					
				next();

		});	


	} else {

		user = '';

		next();

	}

}

exports.getLatLong = function(req,res,next){

	var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) {

		    var options = {
		  	provider: 'google',
		  	httpAdapter: 'https',
		  	apiKey: 'AIzaSyCyie5SLruC8QRsZ4VYSaK1uwUE6g4w2IY',
		  	formatter: null		
			};
		 
				var geocoder = NodeGeocoder(options);

				geocoder.geocode(fields.address)
				  .then(function(row) {
		            red =  [{"latitude":row[0].latitude,"longitude":row[0].longitude,"city":row[0].city,"country":row[0].country,'state':row[0].administrativeLevels.level1long}] ;
		            next();
			    });
   	});     


}




function sendMail(email){


	 var template = process.cwd() + '/app/templates/resetPassword.ejs';
		     var templateData = {
		       Paaword: '@12345'
		     };	   
		   
    ejs.renderFile(template, templateData,'utf8', function(err, file) {
         if (err) {
             console.log('ERROR!');
         } else {
             var smtpTransport = nodemailer.createTransport({
                 host: 'smtp.gmail.com',
                 port: 465,
                 secure: true,
                 service: "Gmail",
                 secureConnection: true,
                 auth: {
                     user: "gautamgoyal.mindiii@gmail.com",
                     pass: "mindiii123"
                 }
             });
             var mailOptions = {
                 to: email,
                 subject: 'Mulab Email Verification',
                 text: 'hello',
                 html: file
             }
             console.log(mailOptions);
             smtpTransport.sendMail(mailOptions, function(error, response) {
                 if (error) {
                     console.log(error);
                 } else {
                     console.log("Message sent: " + response.message);
                 }
             });
         }
     });

}

exports.home = function(req, res) {

	if (req.session.fUser) {

		res.redirect('/userProfile');

	} else {

		res.render('front/home.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session,
	
	 	});
	}

	
	 
}

exports.userProfile = function(req, res){

	User.findOne({_id:req.session.fUser._id}, function(err, userData) {

		if(userData.profileImage){


			var result = url.parse(userData.profileImage, true);
			if(result.slashes==true){

				userData.profileImage = userData.profileImage;

			}else{

				userData.profileImage = '/uploads/profile/'+userData.profileImage;
			}

		}else{

			userData.profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

		}

		res.render('front/userProfile.ejs',{
			error : req.flash("error"),
			success : req.flash("success"),
			session : req.session,
			userData : userData,
			currentUrl : req.get('host'),
			moment : moment

		});
	});
}

exports.certificateCount = function(req, res, next){


		if(req.query.id){

			var id = cryptr.decrypt(req.query.id);

			   User.aggregate([

				    {  
				    	$lookup:{
					            from: "artistcertificats", 
					            localField: "_id", 
					            foreignField: "artistId",
					            as: "artistcertificats"
					    }
				     
				    },

				    {  
				    	$lookup:{
					            from: "artistmainservices", 
					            localField: "_id", 
					            foreignField: "artistId",
					            as: "artistMainServices"
					    }
				     
				    },
				    {  
				    	$lookup:{
					            from: "busineshours", 
					            localField: "_id", 
					            foreignField: "artistId",
					            as: "businesshours"
					    }
				     
				    },
				   	{ 
				   		"$project": {
					        "_id": 1,
					        "userName": 1,
					        "firstName": 1,
					        "lastName": 1,
					        "businessName": 1,
					        "address": 1,
					        "profileImage":1,
					        "reviewCount":1,
					        "ratingCount":1,
					        "isDocument":1,
							"serviceType":1,
					        "status":1,
					        "distance":1,
					        "email":1,
					        "businessType":1,
					        "contactNo":1,
					        "latitude":1,
					        "latitude":1,
					        "followersCount":1,
					        "followingCount":1,
					        "serviceCount":1,
					        "inCallpreprationTime":1,
					        "outCallpreprationTime":1,
					        "radius":1,
					        "postCount":1,
					        "bankStatus":1,
					        "certificateCount":1,
					        "userType":1,
					        "bio":1,
					        "artistcertificats._id":1,
					        "artistcertificats.certificateImage":1,
					        "businesshours._id":1,
					        "businesshours.day":1,
					        "businesshours.startTime":1,
					        "businesshours.endTime":1,
					        "artistMainServices.serviceId":1,
					        "artistMainServices.serviceName":1,
					        "artistMainServices.status":1,
					        "artistMainServices.deleteStatus":1,

				         }
					},
					{
				     $match: {_id:Number(id)},
				    },

			 ],function(err, userData) {


					user = userData[0];


					if(user.profileImage){



						var result = url.parse(userData[0].profileImage, true);
						if(result.slashes==true){

							user.profileImage = userData[0].profileImage;

						}else{

							user.profileImage = '/uploads/profile/'+userData[0].profileImage;
						}
						
					}else{

						user.profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

					}
						feeds.find({userId:id}, function (e, fdata) {

							user.postCount = 0;

							if(fdata){

								user.postCount = fdata.length;

							}

							artistService.find({artistId:id,'status':1,'deleteStatus':1}, function (e, sdata) {


								user.serviceCount = 0;

								if(sdata){

									user.serviceCount = sdata.length;

								}

								datae = {artistId:id};
								if(req.session.fUser){

									if(req.session.fUser._id!=id){
										datae.status = 1;
									}
								}else{

									datae.status = 1;
								}	
								Certificate.find(datae, function (e, data) {

									certificateCount = 0;

									if(data){

										certificateCount = data.length;
										certificate = data;
										var picked = lodash.filter(data, { 'status': 1 } );
										isVerified = 0;
										if(picked.length>0){

											isVerified = 1;
										}

									}

									if(req.session.fUser){

											followUnfollow.findOne({userId:user._id,followerId:req.session.fUser._id}, function(err, fData) {

												follo = [];
												if(fData){
												
													follo = fData;
												
												}
												artistFavorite.findOne({artistId:user._id,userId:req.session.fUser._id}, function(err, aData) {

													fav = aData;
													where = {};
													if(req.session.fUser.userType=="artist"){

														where['artistId'] = req.session.fUser._id;

													}else{

														where['userId'] = req.session.fUser._id;

													}
													where['bookStatus'] = '3';
													booking.find(where, function(err, bdData) {

														bData = bdData.length ? bdData.length : 0;

														next();

												
													});
						
											
												});
											
											});
									}else{

										fav = [];
										bData = 0;
										next();
									}
							      
							    });
							}); 

						});   
					

			});	
		}else if(req.session!='' && req.query.id==''){

		res.redirect('/');

		}else{

			var id  = req.session.fUser._id ;

			Certificate.find({artistId:id}, function (e, data) {

				certificateCount = 0;

				if(data){

					certificateCount = data.length;
					certificate = data;
					follo = [];
					fav = [];

					var picked = lodash.filter(data, { 'status': 1 } );
					isVerified = 0;
					if(picked.length>0){

						isVerified = 1;
					}

				}
				where = {};
				if(user.userType=="artist"){

					where['artistId'] = req.session.fUser._id;

				}else{

					where['userId'] = req.session.fUser._id;

				}
				where['bookStatus'] = '3';
				booking.find(where, function(err, bdData) {

					bData = bdData.length ? bdData.length : 0;

					next();


			
				});
		      
		    });
		}




}



exports.myProfile = function(req, res){


	res.render('front/myProfile.ejs',{
			error : req.flash("error"),
			success : req.flash("success"),
			session : req.session,
			certificateCount : certificateCount,
			id : req.query.id,
			cryptr : cryptr

	});
}

exports.artistdashboard = function(req, res) {

	res.render('front/artistdashboard.ejs',{
		session : req.session,
		cryptr : cryptr

	});
	 
}
exports.artist_my_certificate = function(req, res){

	res.render('front/artist_my_certificate.ejs',{
			error : req.flash("error"),
			success : req.flash("success"),
			session : req.session,
			certificateCount : certificateCount,
			certificate : certificate,
			cryptr : cryptr


		});
}


exports.services = function(req, res){
	res.render('front/services.ejs',{
			error : req.flash("error"),
			success : req.flash("success"),
			session : req.session,
			cryptr : cryptr


	});
}


exports.certificate_upload = function(req, res){


	   var form = new formidable.IncomingForm();
	    form.parse(req, function (err, fields, files) {
		    	
		      var oldpath = files.file.path;
		      var imageName = Date.now()+".jpg";
		      var newpath = './public/uploads/certificate/'+imageName;
		      fs.rename(oldpath, newpath, function (err) {
		        if (err) throw err;
		      });
		  	
        Certificate.findOne().sort([['_id', 'descending']]).limit(1).exec(function(err, row){

		  	var myobj = {
			title: fields.title,
			file: imageName,
			userId: req.session.fUser._id
			};


		  	if(row){
                 myobj._id = row._id + 1;
            } 

		  	Certificate(myobj).save(function (err, data) {

				req.flash("success"," Certificate added successfully");
		        res.redirect('/my_certificate');
						
			});

		});	

      	    
	        
	});


}



exports.removecertificate = function(req, res){

    var id =  req.query.id;
    Certificate.remove( { _id: id }, function(err, result) {

        req.flash('success', 'Certificate deleted successfully');
        res.json({type:"ok"});
		return;

    });
   	 

}




exports.userLogout = function(req, res){

	if(req.session.fUser){ 	

 		bookingService.deleteMany({'userId':req.session.fUser._id,'bookingStatus':0}, function(err, results){ });
 	}
	req.session.destroy();
    res.redirect('/');
}

exports.userprofileUpdate = function(req,res){

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
	  		
	  		var imageName = req.session.fUser.profileImage;

	  	}


    	var options = {
		  provider: 'google',
		  httpAdapter: 'https',
		  apiKey: 'AIzaSyCyie5SLruC8QRsZ4VYSaK1uwUE6g4w2IY',
		  formatter: null
		};
 
		var geocoder = NodeGeocoder(options);

		geocoder.geocode(fields.address)
		  .then(function(row) {

			var data            = {};

			data.firstName = fields.firstName;
			data.lastName = fields.lastName;
			if(fields.businessName){
				data.businessName = fields.businessName;
			}
			if(fields.bio){
				data.bio = fields.bio;
			}
            data.dob =  GetFormattedDate(fields.dob);
            data.gender = fields.gender;	
            data.address = fields.address;
            if(fields.recImageData){
            	data.profileImage = imageName;
            }
            if(row){
            	data.city = row[0].city;
            	data.state =row[0].administrativeLevels.level1long;
            	data.country =row[0].country;
            	data.latitude = row[0].latitude;
            	data.longitude = row[0].longitude;
            	data.location =  [row[0].latitude,row[0].longitude] ;
        	}
	       	User.update({_id:req.session.fUser._id}, 
		        {$set: data},
		        function(err, docs){
		            if(err) res.json(err);
		            else    {
		                req.flash("success"," Profile updated successfully");
		                res.redirect('/userProfile');
		        };
		    });

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

exports.followrsCheckData = function(req,res, next){


	if(req.session.fUser){

		followUnfollow.aggregate([
	    	{
	    		$match: {followerId:Number(req.session.fUser._id),status:1}
	    	},

	    	{
	    		$lookup: {
	    			from: "users",
	    			localField: "userId",
	    			foreignField: "_id",
	    			as:"userInfo"
	    			}
	    	},

	        { "$unwind": "$userInfo" },

	        {   
	            $project:{
	                followerId :"$userInfo._id",
	                userName :"$userInfo.userName",
	                firstName :"$userInfo.firstName",
                	lastName :"$userInfo.lastName",
	                profileImage :"$userInfo.profileImage"
	                
	            } 

	        }],function(err,data){

        		
	        	if(data){
	        	
	        		mData = data;
	        		

	        	}
	        	next();
	     });

	}else{

		mData = [];
		next();
	}


}

exports.followersData = function(req, res, next){



    followUnfollow.aggregate([
    	{
    		$match: {userId:user._id,status:1}
    	},

    	{
    		$lookup: {
    			from: "users",
    			localField: "followerId",
    			foreignField: "_id",
    			as:"userInfo"
    			}
    	},

        { "$unwind": "$userInfo" },

        {   
            $project:{
                followerId :"$userInfo._id",
                userName :"$userInfo.userName",
                firstName :"$userInfo.firstName",
                lastName :"$userInfo.lastName",
                profileImage :"$userInfo.profileImage"
                
            } 

        }],function(err,data){
                
               if(data){ 
                    for (i = 0 ; i < data.length ; i++) {

                    	if(mData){

                 
                    		var picked = lodash.filter(mData, { 'followerId': data[i].followerId} );
			        		if(picked.length){

			        			data[i].followStatus = true;	
			        		}else{

			        			data[i].followStatus = false;
			        		}
                    	}

                        
                        if(data[i].profileImage){

							var result = url.parse(data[i].profileImage, true);
							if(result.slashes==true){

								data[i].profileImage = data[i].profileImage;

							}else{

								data[i].profileImage = '/uploads/profile/'+data[i].profileImage;
							}
							
						}else{

							data[i].profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

						}
                    }
                } 

            fData = data; 
            page = req.body.page;       

            next();                          
      
    });
 
}


exports.followingData = function(req, res, next){



    followUnfollow.aggregate([
    	{
    		$match: {followerId:Number(user._id),status:1}
    	},

    	{
    		$lookup: {
    			from: "users",
    			localField: "userId",
    			foreignField: "_id",
    			as:"userInfo"
    			}
    	},

        { "$unwind": "$userInfo" },

        {   
            $project:{
                followerId :"$userInfo._id",
                userName :"$userInfo.userName",
                firstName :"$userInfo.firstName",
                lastName :"$userInfo.lastName",
                profileImage :"$userInfo.profileImage"
                
            } 

        }],function(err,data){


                
               if(data){ 
                    for (i = 0 ; i < data.length ; i++) {

                    	if(mData){

                 
                    		var picked = lodash.filter(mData, { 'followerId': data[i].followerId} );
			        		if(picked.length){

			        			data[i].followStatus = true;	
			        		}else{

			        			data[i].followStatus = false;
			        		}
                    	}
                        
                        if(data[i].profileImage){

							var result = url.parse(data[i].profileImage, true);
							if(result.slashes==true){

								data[i].profileImage = data[i].profileImage;

							}else{

								data[i].profileImage = '/uploads/profile/'+data[i].profileImage;
							}
							
						}else{

							data[i].profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

						}
                    }
                } 

            fData = data; 
             page = req.body.page;
            next();                          
      
    });
 
}

exports.following_list = function(req, res){


	var totalStudents = 0,
    pageCount = 0,
    currentPage = 1,
    studentsList = []; 
    pageSize = 0;

	if(fData.length>0){
	  	var data = fData;
	  	pageSize = 12,
	  	olddata = data.length/pageSize;
	  	newdata =  Math.round(data.length/pageSize);
	  	if(newdata<olddata)
	  	{
	  		newdata = (newdata)+1;

	  	}
        var totalStudents = data.length,
        pageCount = newdata,
        currentPage = 1,
        students = [],
        studentsArrays = [], 
        studentsList = []; 

        //split list into groups
        while (data.length > 0) {
            studentsArrays.push(data.splice(0, pageSize));
        }

        //set current page if specifed as get variable (eg: /?page=2)
        if (typeof page !== 'undefined') {
            currentPage = +page;
        }

        //show list of students from group
        studentsList = studentsArrays[+currentPage - 1];
    }
        

	res.render('front/followingList.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session,
			staff : studentsList,
            pageSize: pageSize,
            totalStudents: totalStudents,
            pageCount: pageCount,
            currentPage: currentPage,
            cryptr : cryptr
	 	});
}



exports.following = function(req, res){


	res.render('front/following.ejs', {
		error : req.flash("error"),
		success: req.flash("success"),
		session:req.session,
        cryptr : cryptr,
 	});
}


exports.followers = function(req, res){



    res.render('front/followers.ejs', {
		error : req.flash("error"),
		success: req.flash("success"),
		session:req.session,
		cryptr : cryptr
 	});

	
}


exports.aboutUs = function(req, res){

	var days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
	res.render('front/aboutUs.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session,
			cryptr : cryptr,
			days : days
	 	});
}





exports.followUnfollow = function(req,res){

	var status = req.body.status;
	var id = req.body.id;
	var rId = req.body.rId;
	var userId = req.session.fUser._id;
	foData = {};
	foData['userId'] = id;
	foData['followerId'] = userId;
	foData['status'] = 1;


	User.findOne({'_id':id},{'followingCount':1,'followersCount':1}, function(err, data) {

		if(status==0){

			 	followingCount = Number(user.followingCount)-1;
			 	followingCount = followingCount<=0 ? 0 : followingCount;
				User.update({ _id:userId },{ $set:{ followingCount: followingCount } },function(err, result) { });

				followersCount = Number(data.followersCount)-1;
			 	followersCount = followersCount<=0 ? 0 : followersCount;
				User.update({ _id:id },{ $set:{ followersCount: followersCount } },function(err, result) { });


				followUnfollow.update({userId:id,followerId:userId}, {$set:{status:0} },function(err, docs) {	});

		}else{

				followingCount = Number(user.followingCount)+1;
			 	followingCount = followingCount<=0 ? 0 : followingCount;
				User.update({ _id:userId },{ $set:{ followingCount: followingCount } },function(err, result) { });

				followersCount = Number(data.followersCount)+1;
			 	followersCount = followersCount<=0 ? 0 : followersCount;
				User.update({ _id:id },{ $set:{ followersCount: followersCount } },function(err, result) { });

				followUnfollow.findOne({userId:id,followerId:userId,status:0}, function(err, fdata) {


					if(fdata){
						
						followUnfollow.update({userId:id,followerId:userId}, {$set:{status:1} },function(err, docs) {	});
					
					}else{

						autoId = 1;
		 				followUnfollow.findOne().sort([['_id', 'descending'] ]).limit(1).exec(function(err, result) {
							if (result) {
							 	foData._id = result._id + 1;
							 
							 }else{
							 
							 	foData._id = autoId;
							 
							 }

							followUnfollow.insertMany(foData,function(err,my) {});	
		 				});
					}
					
				 });

		}

	});

	res.render('front/followunFollow.ejs',{status,status,id:id,rId:rId});
		 
}
    



exports.artistFavorite = function(req,res){

	var status = req.body.status;
	var id = req.body.id;
	var rId = req.body.rId;
	var userId = req.session.fUser._id;
	foData = {};
	foData['userId'] = userId;
	foData['artistId'] = id;

	User.findOne({'_id':id},{'followingCount':1,'followersCount':1}, function(err, data) {

		if(status==0){

			artistFavorite.deleteMany({'userId':userId,'artistId':id}, function(err, results){ });


		}else{

			autoId = 1;
			artistFavorite.findOne().sort([['_id', 'descending'] ]).limit(1).exec(function(err, result) {

				if (result) {
				 	foData._id = result._id + 1;
				 
				 }else{
				 
				 	foData._id = autoId;
				 
				 }

				artistFavorite.insertMany(foData,function(err,my) {});	
			});

		}

	});

	res.render('front/artistFavorite.ejs',{status,status,id:id,rId:rId});
		 
}
    
