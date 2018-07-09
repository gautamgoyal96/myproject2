var User           		= require('../../models/front/home.js');
var bookingService 		= require('../../models/front/bookingService.js');
var businesshours 		= require('../../models/front/businesshours.js');
var artistCategory  	= require('../../models/front/artistMainService');
var artistsubCategory   = require('../../models/front/artistSubService');
var artistService 	    = require('../../models/front/artistService.js');
var staffService 	    = require('../../models/front/staffService.js');
var staff	   			= require('../../models/front/staff_model.js');
var bookingService 		= require('../../models/front/bookingService.js');

var lodash = require('lodash');
var async = require('async');
var Cryptr = require('cryptr'),
cryptr = new Cryptr('1234567890');
exports.staffManagement = function(req, res) {

	/*if(req.session.fUser.businessType!="business"){

		res.redirect('/');
		return;
	}*/

	res.render('front/staffManagement.ejs',{
		session : req.session,
		error : req.flash("error"),
        success : req.flash("success"),
        'type': req.query.type,
        cryptr : cryptr
	});
	 
}

exports.independArtistList = function(req, res, next){

		var escapere = require('escape-regexp');
		var userName = escapere(req.body.userName);
		var userId = req.session.fUser._id;
		staff.find({'businessId' : userId}, function(err, staffData) {

			User.find({

				  $or: [{
				  	'email' : { $regex : userName,'$options' : 'i' }

	            }, {
	                'userName' : { $regex : userName,'$options' : 'i' }
	            }],

	            $and:[{
	            	'userType':'artist',
	            	'businessType':'independent',
	            	'isDocument':3,
	            	'_id' : {$ne:userId}
	            }]}, function(err, data) {
					var newdata= [];
					
				  	if(data){

				  		data.forEach(function(rs) {

				  			var picked = lodash.filter(staffData, { 'artistId': rs._id } );
			        		if(picked.length==0){
					            if(rs.profileImage){ 

					                rs.profileImage = "/uploads/profile/"+rs.profileImage;

					            }else{

						           rs.profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

						        }

						        newdata.push(rs);
						    }
				  		
				  		});

				    }

					my = newdata;	
					page = req.body.page;
					next();

			});
		});		

}



exports.staffArtistList = function(req, res) {

		var totalStudents = 0,
        pageCount = 0,
        currentPage = 1,
        studentsList = []; 
        pageSize = 0;

		if(my.length>0){
		  	var data = my;
		  	pageSize = 7,
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


        
		res.render('front/staffArtistList.ejs', {
            error : req.flash("error"),
            success : req.flash("success"),
            session : req.session,
            staff : studentsList,
            pageSize: pageSize,
            totalStudents: totalStudents,
            pageCount: pageCount,
            currentPage: currentPage,
            cryptr : cryptr
            
        });
	 
}

exports.bussinessHoursGet = function(req, res, next){

	userId = (req.session.fUser.businessType=="business") ? req.session.fUser._id : cryptr.decrypt(req.params.id) ; 

	businesshours.find({artistId:userId}).sort([['_id', 'ascending']]).exec(function(err, data) {

		businesshoursdata = data;
		next();

	});	

}

exports.artistCategoryData = function(req, res, next){

		artistId = (req.session.fUser.businessType!="business") ? req.query.staffId : req.session.fUser._id ; 

		artistCategory.aggregate([
			{
		        $match: {
		            'status': 1,
		            'deleteStatus': 1,
		            'artistId': Number(artistId)
		        }
		    },	
		    { $lookup:
		      {
		        from: 'artistsubsrervices',
		        localField: 'serviceId',
		        foreignField: 'serviceId',
		        as: 'subcategory'
		      }
		    }
		  ], function(err, data) {
		    	categorydata = data;
		    	next();
		  });


}




exports.get_artistsubservices = function(req, res){

	artistsubCategory.find({artistId:req.session.fUser._id,status:1,deleteStatus:1,serviceId:req.query.id}).sort([['_id', 'ascending']]).exec(function(err, data) {

		res.render('front/get_artistsubservices.ejs',{data : data});

	});	

}

exports.get_artistservices = function(req, res){
	
	var userId = req.session.fUser._id;
	var subserviceId = req.query.id;
	datae = {};
	datae['artistId'] = userId;
	datae['status'] = 1;
	datae['deleteStatus'] = 1;
	datae['subserviceId'] = subserviceId;

	artistService.find(datae).exec(function(err, data) {
    	if (err) throw err;
	
    		res.render('front/get_artistservices.ejs',{data : data});
    });
}

exports.add_staff = function(req, res) {
	

	var days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
	res.render('front/add_staff.ejs',{
		error : req.flash("error"),
        success : req.flash("success"),
		session : req.session,
		staff : artist,
		user : user,
		businesshours : businesshoursdata,
		days : days,
		categorydata : categorydata,
		staffInfo : (staffInfo!=null) ? staffInfo : [],
		lodash : lodash,
		read : (req.session.fUser.businessType!="business") ? 'readonly' : '',
		disa : (req.session.fUser.businessType!="business") ? 'disabled' : '',
		cryptr : cryptr
	});
	 
}  

exports.ArtistServiceDetail = function(req, res){

	datae = {};
	datae['_id'] = req.query.id;
	artistService.findOne(datae).exec(function(err, data) {
    if (err) throw err;
	
    	res.json({'data':data,'stafserviceData':stafserviceData});
  });
}

exports.staffServiceDetail  = function(req, res, next){

	var businessId =req.session.fUser._id;

	staffService.findOne({'artistId':req.query.staffId,'artistServiceId':req.query.id,'businessId':businessId}).exec(function(err,data) {
		stafserviceData = data;
		next();

	});
}

exports.staffServiceList  = function(req, res){

	artistId = (req.session.fUser.businessType=="business") ? req.query.staffId : req.session.fUser._id ; 
	businessId = (req.session.fUser.businessType=="business") ? req.session.fUser._id : req.query.staffId ;

	console.log(categorydata) ;

	staffService.find({'artistId':artistId,'businessId':businessId}).exec(function(err,data) {
		res.render('front/staffServiceList.ejs',{
			data : data,
			categorydata : categorydata,
			artistServiceList :artistServicesData,
			seession : req.session
		});


	});
}

exports.removestaffservice = function(req, res){

	staffService.deleteMany({'_id':req.query.id}, function(err, results){ });

	res.json({'status':'success','message':'Service remove successfully'});
	return;

}


exports.staffServiceAdd  = function(req, res){

	var newId = 1;
	var businessId =req.session.fUser._id;
	var hours = req.body.hours;
	if(hours.length<2){

		var hours = 0+req.body.hours;
	}

	var minute = req.body.minute;
	if(minute.length<2){

		var minute = 0+req.body.minute;
	}

		var completionTime = hours+":"+minute;

	var myobj = {
				artistId : req.body.artistId,
				serviceId : req.body.serviceId,
				subserviceId : req.body.subserviceId,
				artistServiceId : req.body.artistServiceId,
				inCallPrice:  req.body.incallPrice,
				outCallPrice:  req.body.outCallPrice,
				businessId:  businessId,
				completionTime:  completionTime

			};

	if(req.body.type=="insert"){
	
		staffService.find({}).sort({_id:-1}).limit(1).exec(function(err,data) {
			if(err){ var newId = 1; }
			if(0 < data.length) { var newId = data[0]._id + 1; }else{ var newId = 1; }

					myobj._id = newId;

						staffService.findOne({'artistId':myobj.artistId,'artistServiceId':myobj.artistServiceId,'businessId':myobj.businessId}).exec(function(err,data) {

							if(data){

								res.json({status:'0',error:"The service already exist"});

							}else{



								staffService(myobj).save(function (err, data) {
									if (err) throw err;

									res.json({status:'1',message:"Service added successfully"});
									
								});
							}

						});

						
	
			
		});

	}else{

		staffService.update({_id:req.body.type}, 
            {$set: myobj},
            function(err, docs){
            res.json({status:'1',message:"Service updated successfully"});

        });


	}


}  



exports.staff_add = function(req, res){


	var businessId = req.session.fUser._id;
	var artistId = req.body.artistId;
	var day = req.body.day;
		

	var time = req.body.openTime;
	var close = req.body.close;

	   jsArr = []
			    y = 0;
			for (var i = 0; i < time.length; i++) {



				if(time){


				data = time[i];
				day1 = day[i];

					for (var a = 0; a < data.length; a++) {

						if (typeof data[a] !== "undefined") {

							if(data[a][0]){

								var d = data[a][0];
								st = d.split(":");
								oh = st[0];
								if(st[0].length<2){

									var oh = 0+st[0];
								}

								var openTime = oh+":"+st[1];

								var c = data[a][1];
								ct = c.split(":");
								ch = ct[0];
								if(ct[0].length<2){

									var ch = 0+ct[0];
								}

								var closeTime = ch+":"+ct[1];
									
								  jsArr.push({
						                day: Number(day1[a][0]),
						                startTime: openTime,
						                endTime: closeTime,
						            });
							  y++;

							}
					    
					    }
					};
				}	


					
			};

	var datae = {};
	staffInfo = {};
	User.findOne({'_id':artistId}).exec(function(err,data) {

						


			if(data){

					staffInfo.userName = data.userName;		
					staffInfo.profileImage = data.profileImage;


					datae.staffHours = jsArr;		
					datae.artistId = artistId;		
					datae.staffServiceId = req.body.staffServiceId;		
					datae.staffInfo = staffInfo;		
					datae.businessId = businessId;		
					datae.job = req.body.job;	
					datae.mediaAccess = req.body.mediaAccess;	
					datae.holiday = req.body.holiday;	
					datae.crd = new Date();	
					staffId = req.body.staffId;		

					
					if(staffId){

						staffService.updateMany({businessId:businessId,artistId:artistId}, 
				            {$set: {'staffId':staffId}},
				            function(err, docs){

				        });	
				        staff.updateMany({_id:staffId}, 
				            {$set: datae},
				            function(err, docs){
				            	req.flash('success', 'Staff updated successfully');
								res.redirect('/staffManagement');
				        });	
						

					}else{

						staff.findOne({}).sort({_id:'descending'}).limit(1).exec(function(err,data) {
						if(err){ var newId = 1; }
						if(data) { var newId = data._id + 1; }else{ var newId = 1; }

								datae._id = newId;
								staffService.updateMany({businessId:businessId,artistId:artistId}, 
						            {$set: {'staffId':newId}},
						            function(err, docs){

						        });	
								staff(datae).save(function (err, data) {
										if (err) throw err;
										req.flash('success', 'Staff added successfully');
										res.redirect('/staffManagement');
										
									});
						});

					}
			}
			
	});


}


exports.staff_Info = function(req, res, next){


		var staffId =  req.query.staffId ? cryptr.decrypt(req.query.staffId) : '';
		var staffData = [];

		staff.findOne({'_id' : staffId}, function(err, staffData) {

					var newdata= [];
					
				  	if(staffData){


				  			userData = staffData.staffInfo;

				            if(userData.profileImage){ 

				                staffData.staffInfo.profileImage = "/uploads/profile/"+userData.profileImage;

				            }else{

					          staffData.staffInfo.profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

					        }
				  		

				    }

					staffInfo = staffData;	
					next();

		});		

}

exports.company_List_data = function(req, res, next){


		var userId = req.session.fUser._id;

			myComa = [];

	               staff.aggregate([

				    {  
				    	$lookup:{
					            from: "users", 
					            localField: "businessId", 
					            foreignField: "_id",
					            as: "staffInfo"
					    }
				     
				    },
				   	{ 
				   		"$project": {
					        "_id": 1,
					        "artistId": 1,
					        "businessId": 1,
					        "artistId": 1,
					        "staffServiceId": 1,
					        "job": 1,
					        "status": 1,
					        "staffInfo": { "$arrayElemAt": [ "$staffInfo",0] },


				         }
					},
					{
				     $match: {'artistId' : Number(userId)},
				    },
				   { $sort : { crd:-1 } }

			 ]).exec(function(err, staffData) {

					var newdata= [];
					
				  	if(staffData){

				  		staffData.forEach(function(rs) {

				  			myComa.push(rs.businessId);


				  			userData = rs.staffInfo;

				            if(userData.profileImage){ 

				                rs.staffInfo.profileImage = "/uploads/profile/"+userData.profileImage;

				            }else{

					          rs.staffInfo.profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

					        }
				  		
				  		});

				    }


					myCp = staffData;	
					myCom = myComa;	
					page = req.body.page;
					next();

		});		

}



exports.staff_List_data = function(req, res, next){


		var userId = req.session.fUser._id;

		staff.find({'businessId' : userId}).sort({crd:'descending'}).exec(function(err, staffData) {

					var newdata= [];
					
				  	if(staffData){

				  		staffData.forEach(function(rs) {

				  			userData = rs.staffInfo;

				            if(userData.profileImage){ 

				                rs.staffInfo.profileImage = "/uploads/profile/"+userData.profileImage;

				            }else{

					          rs.staffInfo.profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

					        }
				  		
				  		});

				    }

					my = staffData;	
					page = req.body.page;

					next();

		});		

}



exports.staff_List = function(req, res) {

	var userId = req.session.fUser._id;

	staff.find({'businessId' : userId}).sort({crd:'descending'}).exec(function(err, staffData) {

			var newdata= [];
			
		  	if(staffData){

		  		staffData.forEach(function(rs) {

		  			userData = rs.staffInfo;

		            if(userData.profileImage){ 

		                rs.staffInfo.profileImage = "/uploads/profile/"+userData.profileImage;

		            }else{

			          rs.staffInfo.profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

			        }
		  		
		  		});

		    }

			my = staffData;	
			page = req.body.page;


			my12 = (req.session.fUser.businessType=="business") ? my : myCp ; 
			var totalStudents = 0,
	        pageCount = 0,
	        currentPage = 1,
	        studentsList = []; 
	        pageSize = 0;

			if(my12.length>0){
			  	var data = my12;
			  	pageSize = 7,
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
	        
			res.render('front/staffList.ejs', {
	            error : req.flash("error"),
	            success : req.flash("success"),
	            session : req.session,
	            staff : studentsList,
	            pageSize: pageSize,
	            totalStudents: totalStudents,
	            pageCount: pageCount,
	            currentPage: currentPage,
	            cryptr : cryptr,
	            
	        });
	});	
	 
}



exports.staff_List_data_service = function(req, res, next){

var booking = require("./booking");


		var userId = req.session.fUser._id;
		var artistServiceId = [req.body.artistServiceId];
		var bookingDate = req.body.bookingDate;
		var bookingTime = req.body.bookingTime;
		var serviceTime = req.body.serviceTime;
		var bookstaff = req.body.staff;
		var day = req.body.day;


	               staff.aggregate([

				    {  
				    	$lookup:{
					            from: "bookingservices", 
					            localField: "artistId", 
					            foreignField: "staff",
					            as: "bookingService"
					    }
				     
				    },
				   	{ 
				   		"$project": {
					        "_id": 1,
					        "artistId": 1,
					        "businessId": 1,
					        "staffServiceId": 1,
					        "job": 1,
					        "status": 1,
					        "staffHours": 1,
					        "staffInfo": 1,
					        "mediaAccess":1,
					        "bookingService.bookingDate":1,
					        "bookingService.startTime":1,
					        "bookingService.endTime":1,
					        "bookingService.staff":1,
					        "bookingService.bookingStatus":1,

				         }
					},
					{
				     $match: {'businessId' : userId,'staffServiceId':{$in:artistServiceId},'staffHours.day':Number(day)},
				    },



				  ],function(err, staffData) {



					var newdata= [];
					
				  	if(staffData){

				  		i=0;

				  		 async.each(staffData, function(element, callback){

				  		 	rs = staffData[i];

			  				hours = rs.staffHours;
			  				var staffSTime = Array();
							var staffETime = Array();
				  		 	rs.staffHours.forEach(function(drs) {

			    					if(day==drs.day){



						    			staffSTime.push(parseTime(timeConvert(drs.startTime)));
										staffETime.push(parseTime(timeConvert(drs.endTime)));
									
									}


			    			});


				  		var bookingSTime = Array();
						var bookingETime = Array();	

						bdata = rs.bookingService;	    		
			
			    		if(bdata){

			    			bdata.forEach(function(brs) {

		    					if(brs.bookingStatus!='2'){
			    				
			    					bookingSTime.push(parseTime(timeConvert(brs.startTime)));
									bookingETime.push(parseTime(timeConvert(brs.endTime)));
								
								}

		    				});
			    	 	}	

				  			userData = rs.staffInfo;

				            if(userData.profileImage){ 

				                rs.staffInfo.profileImage = "/uploads/profile/"+userData.profileImage;

				            }else{

					          rs.staffInfo.profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

					        }

					        req.body.staffId = rs.artistId;
					        req.body.bookingSTime = bookingSTime;
					        req.body.bookingETime = bookingETime;
					        req.body.staffSTime = staffSTime;
					        req.body.staffETime = staffETime;
					        req.body.serviceTime = serviceTime;
					        Ntime_slots = booking.changeartistFreeSlot(req, res,callback);
					        if(Ntime_slots.length==0){

					        	delete staffData[i];

					        }else if(Ntime_slots.includes(bookingTime)==false && bookstaff!=rs.artistId){
					        	delete staffData[i];
					        }
						     
				  			callback();

				  		i++;},function(){

							my = staffData;	

							next();


				  		});

				    }

				   



		});		

}

function timeConvert(otime){
  
      var ohours = Number(otime.match(/^(\d+)/)[1]);
      var ominutes = Number(otime.match(/:(\d+)/)[1]);
      var AMPM = otime.match(/\s(.*)$/)[1];
      if(AMPM == "PM" && ohours<12) ohours = ohours+12;
      if(AMPM == "AM" && ohours==12) ohours = ohours-12;
      var osHours = ohours.toString();
      var osMinutes = ominutes.toString();
      if(ohours<10) osHours = "0" + osHours;
      if(ominutes<10) osMinutes = "0" + osMinutes;
     return osHours + ":" + osMinutes;
}

function parseTime(s) {

 var c = s.split(':');
 return parseInt(c[0]) * 60 + parseInt(c[1]);

 }

exports.changstaff = function(req,res){

	res.render('front/changstaff.ejs', {
        error : req.flash("error"),
        success : req.flash("success"),
        session : req.session,
        stafData : my
        
    });
	 



}


exports.independArtistListData = function(req, res, next){

			User.find({
	            	'userType':'artist',
	            	'businessType':'independent',
	            	'isDocument':3
	            }, function(err, data) {
					var newdata= [];
					
				  	if(data){

				  		data.forEach(function(rs) {

				  			if(rs.profileImage){ 

				                rs.profileImage = "/uploads/profile/"+rs.profileImage;

				            }else{

					           rs.profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

					        }

					        newdata.push(rs);
				  		
				  		});

				    }

					userData = newdata;	
					iData = newdata;	
					next();

			});

}



exports.delete_staff = function(req, res, next){

		var userId = req.session.fUser._id;
		var artistId = req.query.id;
		var staffId = req.query.staffId;

		userId1 = (req.session.fUser.businessType=="business") ? userId : artistId ; 
		artistId1 = (req.session.fUser.businessType=="business") ? artistId : userId ; 
		msg = (req.session.fUser.businessType=="business") ? 'Staff remove successfully' : 'Company remove successfully' ; 
		msg1 = (req.session.fUser.businessType=="business") ? "This staff's service is already booked , you can't remove the staff" : "This company service is already booked , you can't remove the company"; 

		bookingService.find({
        	'artistId':userId1,
        	'staff':artistId1,
        	'bookingStatus': {$ne:2}
        }, function(err, data) {

        	if(data.length==0){

    				staff.deleteMany({'_id':req.query.staffId}, function(err, results){ });
    				staffService.deleteMany({'staffId':req.query.staffId}, function(err, results){ });

					req.flash('success', msg);
					res.redirect('/staffManagement');


        	}else{

				req.flash('success',msg1);
				res.redirect('/staffManagement');


        	}


		});		

}