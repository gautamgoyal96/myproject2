var User            = require('../../models/front/home.js');
var Category            = require('../../models/admin/category_model');
var subCategory            = require('../../models/admin/sub_category_model');
var artistCategory            = require('../../models/front/artistMainService');
var artistsubCategory            = require('../../models/front/artistSubService');
var artistService 					= require('../../models/front/artistService.js');
var businesshours 						= require('../../models/front/businesshours.js');
var bookingService 							= require('../../models/front/bookingService.js');
var booking 									= require('../../models/front/booking.js');
var staffService 	    							= require('../../models/front/staffService.js');
var staff	   											= require('../../models/front/staff_model.js');
var artistFavorite 											= require('../../models/front/artisteFavorite.js');
var notification 											= require('../../models/front/notification.js');
 var moment = require('moment-timezone');

var url  = require('url');
var iplocation = require('iplocation')
var NodeGeocoder = require('node-geocoder');
var Cryptr = require('cryptr'),
 cryptr = new Cryptr('1234567890');
var lodash = require('lodash');

exports.locationGet = function(req,res,next){
/*ip.address()
*/
my = req.connection.remoteAddress;
	iplocation(my, function (error, my12) {

		cityData = my12;

		next();

	});


}

exports.categoryGet = function(req,res,next){


   Category.find({status:1,deleteStatus:1}, function(err, data) {

   		categorydata = data;
   		next();	
   });


}

exports.get_sub_category = function(req, res) {

	var service = req.body.category;
	if(req.body.type=="f"){
		var service  = service.split(",");

	}
	subCategory.find({status:1,deleteStatus:1,serviceId: { $in: service}}, function(err, data) {


		res.render('front/get_sub_category.ejs', {
            error : req.flash("error"),
            success : req.flash("success"),
            session : req.session,
            categorydata : data
            
        });


   	});

	 
}

exports.search_artistdata = function(req, res, next) {

	var subservice = req.body.subservice;

	var serviceType = Number(req.body.serviceType);
	var city = req.body.city;
	var servicePrice = (req.body.servicePrice);
	var rating = req.body.rating;
	var day = req.body.day;
	var time = req.body.time;
	datae = {};
	datae['userType'] = 'artist';
	datae['isDocument'] = 3;
	datae['serviceType'] = {'$ne':serviceType};
	datae['status'] = '1';

	if(city==""){

		var city = "indore";
	}
	
	if(req.body.min && subservice){
		var price01 = req.body.min;
		var price1 = price01.length<2 ? 0+price01 : price01;
		var price2 = req.body.max;
		if(serviceType==1){



			if(price2=='100+'){

				datae['service.outCallPrice'] = {$gte: price1};

			}else{

				datae['service.outCallPrice']  = {$gte: price1,$lte: price2};
			}

		}else{


			if(price2=='100+'){

				datae['service.inCallPrice']  = {$gte: price1};

			}else{

				datae['service.inCallPrice']  = {$gte: price1,$lte: price2};
			}

			
		}
	}


	if(subservice){

		var subservice = subservice.map(function(n) {
		    return Number(n);
		});

		datae['service.subserviceId'] = { $in: subservice};

	
	}

	if(rating){

		var rating = rating.map(function(n) {
		    return n;
		});

		datae['ratingCount'] = { $in: rating};

	
	}

	if(day){

		datae['businesshours.day'] = Number(day);
	}
	if(time){

		datae['businesshours.startTime'] = {$gte:time};
		datae['businesshours.endTime'] = {$gte:time};
	}

	var options = {
			  	provider: 'google',
			  	httpAdapter: 'https',
			  	apiKey: 'AIzaSyCyie5SLruC8QRsZ4VYSaK1uwUE6g4w2IY',
			  	formatter: null		
			};
	 
			var geocoder = NodeGeocoder(options);

			geocoder.geocode(city)
			  .then(function(row) {

			  	   var latitude 	=	row[0].latitude;
	               var longitude	 =	row[0].longitude;

	               

	               User.aggregate([

	               	{
			            "$geoNear": {
			                  "near": {
			                         "type": "Point",
			                         "coordinates":[parseFloat(latitude), parseFloat(longitude)]
			                          },
			            maxDistance: 5* 1609.34,
			            "spherical": true,
			            "distanceField": "distance",
			            distanceMultiplier: 1 / 1609.344 // calculate distance in miles
			            }
			        },
				    {  
				    	$lookup:{
					            from: "artistservices", 
					            localField: "_id", 
					            foreignField: "artistId",
					            as: "service"
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
					        "userName": 1,
					        "address": 1,
					        "profileImage":1,
					        "reviewCount":1,
					        "ratingCount":1,
					        "isDocument":1,
							"serviceType":1,
					        "status":1,
					        "distance":1,
					        "userType":1,
					        "service._id":1,
					        "service.serviceId":1,
					        "service.subserviceId":1,
					        "service.title":1,
					        "service.description":1,
					        "service.inCallPrice":1,
					        "service.outCallPrice":1,
					        "businesshours._id":1,
					        "businesshours.day":1,
					        "businesshours.startTime":1,
					        "businesshours.endTime":1,

				         }
					},
					{
				     $match: datae,
				    },
				    { $sort : { distance: 1,reviewCount:-1 } },



				  ],function(err, data) {


				  	if(data){
				        for (i = 0 ; i < data.length ; i++) {

				        	data[i].distance = Number(data[i].distance).toFixed(2);
				        	data[i].review = Math.round(data[i].ratingCount);


				            if(data[i].profileImage){ 

				                data[i].profileImage = "/uploads/profile/"+data[i].profileImage;

				            }else{

					            data[i].profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

					        }
					       

				        }
				    }

				    my = data;
				    page = req.body.page;
				    serviceTypeData = serviceType;


					next();

				  });

	});

}

exports.get_sub_service = function(req, res){

	var artistId = Number(req.body.artistId);
	var serviceType = Number(req.body.serviceType);
	var url = req.body.url;

	datae = {};
	datae['service.artistId'] = artistId;
	datae['serviceType'] ={'$ne':serviceType};


    User.aggregate([

     	{  
	    	$lookup:{
		            from: "artistservices", 
		            localField: "_id", 
		            foreignField: "artistId",
		            as: "service"
		    }
	     
	    },
	   	{ 
	   		"$project": {
		        "_id": 1,
				"serviceType":1,
		        "service._id":1,
		        "service.serviceId":1,
		        "service.subserviceId":1,
		        "service.title":1,
		        "service.artistId":1,
		        "service.description":1,
		        "service.inCallPrice":1,
		        "service.outCallPrice":1,
	        }
		},
		{
	     $match: datae,
	    },
	  ],function(err, data) {

	  		res.render('front/get_sub_service.ejs', {listdata : data,serviceType:serviceType,url:url});

	  });

}

exports.search_artist = function(req, res) {

		var totalStudents = 0,
        pageCount = 0,
        currentPage = 1,
        studentsList = []; 
        pageSize = 0;
        if(my){

			if(my.length>0){
			  	var data = my;
			  	pageSize = 5,
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

    	}

		res.render('front/search_artist.ejs', {
            error : req.flash("error"),
            success : req.flash("success"),
            session : req.session,
            listdata : studentsList,
            pageSize: pageSize,
            totalStudents: totalStudents,
            pageCount: pageCount,
            currentPage: currentPage,
            serviceType:serviceTypeData,
            cryptr : cryptr
            
        });
	 
}


exports.searchResult = function(req, res) {

		city = "indore";
		if(req.query.city){

			var city = req.query.city;

		}else if(cityData.city){

			var city =  cityData.city;
		}


		res.render('front/searchResult.ejs', {
            error : req.flash("error"),
            success : req.flash("success"),
            session : req.session,
            categorydata : categorydata,
            city:city,
            services:req.query.services,
            date:req.query.date,
            time:req.query.time
            
        });
	 
}



exports.searchbooking = function(req, res) {

	
 var moment = require('moment-timezone');
    var a = moment().format();



	if (req.session.fUser) {

		if(req.session.fUser.userType=="artist"){

    		 res.redirect('/artistDashboard');


    	}	


	} 


		city = "indore";	
		if(cityData.city){

			var city =  cityData.city;
		}


        res.render('front/searchbooking.ejs', {
            error : req.flash("error"),
            success : req.flash("success"),
            bsuccess : req.flash("bsuccess"),
            session : req.session,
            categorydata : categorydata,
            listdata : my,
            city : city,
            
        });
	 
}


exports.home_search_artist = function(req, res, next) {

	
	var category = req.body.category;
	var city = req.body.city;
	var day = req.body.day;
	var time = req.body.time;
	datae = {};
	datae['userType'] = 'artist';
	datae['isDocument'] = 3;
	datae['serviceType'] = {'$ne':2};
	datae['status'] = '1';
	if(city==""){

		var city = "indore";
	}
	if(category){

		var category = category.map(function(n) {
	    return Number(n);
		});
		datae['service.serviceId'] = { $in: category};

	}
	if(day){

		datae['businesshours.day'] = Number(day);
	}
	if(time){

		datae['businesshours.startTime'] = {$gte:time};
		datae['businesshours.endTime'] = {$gte:time};
	}

	  /*'businesshours.startTime': {$gte:'03:31 AM'},
		       'businesshours.endTime': {$lt:'3:31 AM'},*/

	var options = {
			  	provider: 'google',
			  	httpAdapter: 'https',
			  	apiKey: 'AIzaSyCyie5SLruC8QRsZ4VYSaK1uwUE6g4w2IY',
			  	formatter: null		
			};
	 
			var geocoder = NodeGeocoder(options);

			geocoder.geocode(city)
			  .then(function(row) {

			  	   var latitude 	=	row[0].latitude;
	               var longitude	 =	row[0].longitude;

	               

	               User.aggregate([

	               	{
			            "$geoNear": {
			                  "near": {
			                         "type": "Point",
			                         "coordinates":[parseFloat(latitude), parseFloat(longitude)]
			                          },
			            maxDistance: 5* 1609.34,
			            "spherical": true,
			            "distanceField": "distance",
			            distanceMultiplier: 1 / 1609.344 // calculate distance in miles
			            }
			        },
				    {  
				    	$lookup:{
					            from: "artistservices", 
					            localField: "_id", 
					            foreignField: "artistId",
					            as: "service"
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
					        "userName": 1,
					        "lastName": 1,
					        "address": 1,
					        "profileImage":1,
					        "reviewCount":1,
					        "ratingCount":1,
					        "isDocument":1,
							"serviceType":1,
					        "status":1,
					        "distance":1,
					        "userType":1,
					        "service._id":1,
					        "service.serviceId":1,
					        "service.subserviceId":1,
					        "service.title":1,
					        "service.description":1,
					        "service.inCallPrice":1,
					        "service.outCallPrice":1,
					        "businesshours._id":1,
					        "businesshours.day":1,
					        "businesshours.startTime":1,
					        "businesshours.endTime":1,

				         }
					},
					{
				     $match: datae,
				    },
				    { $sort : { distance: 1,reviewCount:-1 } },



				  ],function(err, data) {

/*				  	console.log(err);
*/
				  	if(data){
				        for (i = 0 ; i < data.length ; i++) {

				        	data[i].distance = Number(data[i].distance).toFixed(2);
				        	data[i].review = Math.round(data[i].ratingCount);


				            if(data[i].profileImage){ 

				                data[i].profileImage = "/uploads/profile/"+data[i].profileImage;

				            }else{

					            data[i].profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

					        }
					       

				        }
				    }

				    my = data;
				    page = req.body.page


					next();

				  });




	});

}

exports.home_search_artist_result = function(req, res) {

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
        
		res.render('front/home_search_artist.ejs', {
            error : req.flash("error"),
            success : req.flash("success"),
            session : req.session,
            listdata : studentsList,
            pageSize: pageSize,
            totalStudents: totalStudents,
            pageCount: pageCount,
            currentPage: currentPage,
            cryptr : cryptr

            
        });
	 
}



exports.pendingBooking = function(req, res, next) {


    var cdate=new Date();

    var m = (cdate.getMonth()+1);

    var s = m<10 ? '0'+m : m;


    var e = cdate.getDate();

    var d = e<10 ?'0'+e: e;

    var val = cdate.getFullYear()+"-"+s+"-"+d;

	var userId = req.session.fUser._id;
	var bookingdate = req.body.date;
	var staffId = req.body.staffId;
	var ct = parseTime(timeConvert(req.body.currentTime));
	var datae = {};
	var datae12 = {};

	datae['bookingDate'] = {$gte:val};

	if(req.session.fUser.businessType=="business"){
		datae['artistId'] = userId;	
		datae['bookStatus'] = '0';		
		if(staffId){

			if(staffId=="myBooking"){

				datae['bookingData.staff'] = Number(0);


			}else{

				datae['bookingData.staff'] = Number(staffId);

			}
		}
	}else{

		if(staffId){

			if(staffId=="all"){

				/*myCom.push(req.session.fUser._id);
				datae['artistId'] = { $in: myCom};*/
				datae12 = { $or: [ { 'bookingData.artistId': req.session.fUser._id }, { 'bookingData.staff': req.session.fUser._id } ] };


			}else{

				datae['bookingData.artistId'] = Number(staffId);
				datae['bookingData.staff'] = userId;
				datae['bookStatus'] = '5';		


			}

		//	datae['bookingData.staff'] = { $in: userId};	

		}else{

			datae['artistId'] = userId;	
			datae['bookStatus'] = '0';		
		}


	}
	var query = booking.aggregate([

			 			{
			                "$lookup": {
			                    "from": "bookingservices",
			                    "localField": "_id",
			                    "foreignField": "bookingId",
			                    "as": "bookingData"
			                }
			            },
			            {
			                "$lookup": {
			                    "from": "users",
			                    "localField": "userId",
			                    "foreignField": "_id",
			                    "as": "userDetail"
			                }
			            },

			            {
			                $match: datae
			            },
			            {
			                $match: datae12
			            },
			          
			            { $sort : { 'bookingDate':1,'timeCount':1 } }
			            

			        ]);

			query.exec(function(err, data) {

	
			  	if(data){
			        for (i = 0 ; i < data.length ; i++) {






			            if(data[i].userDetail[0].profileImage){ 

			                data[i].userDetail[0].profileImage = "/uploads/profile/"+data[i].userDetail[0].profileImage;

			            }else{

				            data[i].userDetail[0].profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

				        }

				        if(data[i].bookingDate==val && parseTime(timeConvert(data[i].bookingTime))<ct){

				        	booking.deleteMany({'_id':data[i]._id,'bookStatus':0}, function(err, results){ });
				        	notification.deleteMany({'notifyId':data[i]._id,'type':'booking'}, function(err, results){ });
 							bookingService.deleteMany({'bookingId':Number(data[i]._id)}, function(err, results){ });
			        		delete(data[i]);


			        	}
				       

			        }


			    }

			    pending = data;



			    next();
    });

}
exports.artistservicesList = function(req, res, next){


	if(req.body.staffId){
		
		userId = (req.session.fUser.businessType!="business") ? req.body.staffId : req.session.fUser._id ; 
	
	}else{

		userId = req.session.fUser ? req.session.fUser._id : '';
	}
	datae = {};
	datae['artistId'] = userId;


	artistService.find().exec(function(err, data) {
    if (err) throw err;
    
    	artistServicesData = data;

    	next();
  });
}


exports.completeBooking = function(req, res, next) {



	var userId = req.session.fUser._id;
	var bookingdate = req.body.date;
	var staffId = req.body.staffId;
	var datae = {};
	var datae12 = {};
	var datae13 = {};
	datae['bookingDate'] = bookingdate;
	if(req.session.fUser.businessType=="business"){
		datae['artistId'] = userId;	
		datae['bookStatus'] = {$ne:'0'};

		if(staffId=="myBooking"){

			datae['bookingData.staff'] = Number(0);


		}else if(staffId){

			datae['bookingData.staff'] = Number(staffId);

		}
	}else{

		if(staffId){

			datae13 = { 'bookStatus' :  {$ne:'0'},'bookStatus' :  {$ne:'2'}};

			if(staffId=="all"){

				/*myCom.push(req.session.fUser._id);
				datae['artistId'] = { $in: myCom};*/
				datae12 = { $or: [ { 'bookingData.artistId': req.session.fUser._id }, { 'bookingData.staff': req.session.fUser._id } ] };


			}else{

				datae['bookingData.artistId'] = Number(staffId);
				datae['bookingData.staff'] = userId;

			}
	
			//datae['bookingData.staff'] = { $in: userId};	

		}else{

			datae['artistId'] = userId;	
			datae['bookStatus'] = {$ne:'0'};
		
		}


	}

	var query = booking.aggregate([

			 			{
			                "$lookup": {
			                    "from": "users",
			                    "localField": "userId",
			                    "foreignField": "_id",
			                    "as": "userDetail"
			                }
			            },
			            {
			                "$lookup": {
			                    "from": "bookingservices",
			                    "localField": "_id",
			                    "foreignField": "bookingId",
			                    "as": "bookingData"
			                }
			            },
			            {
			                $match: datae
			            },
			            {
			                $match: datae12
			            },
			            {
			                $match: datae13
			            },
		            	{ $sort : { 'timeCount':1} }

			        ]);

			query.exec(function(err, data) {



			  	if(data){
			        for (i = 0 ; i < data.length ; i++) {



			            if(data[i].userDetail[0].profileImage){ 

			                data[i].userDetail[0].profileImage = "/uploads/profile/"+data[i].userDetail[0].profileImage;

			            }else{

				            data[i].userDetail[0].profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

				        }
				       

			        }


			    }

			    complete = data;


			    next();

	});

}
exports.bookinghistory = function(req, res) {




	if(req.session.fUser.userType=="user"){

		res.render('front/Userbookinghistory.ejs',{
			session : req.session,
			error : req.flash("error"),
            success : req.flash("success"),
            cryptr : cryptr
		});

	}else{	



			res.render('front/bookinghistory.ejs',{
						session : req.session,
						error : req.flash("error"),
			            success : req.flash("success"),
			            user : user,
			            stafData : (req.session.fUser.businessType=="business") ? my : myCp,
			            cryptr : cryptr
					});



	}
	 
}

exports.artistFreeSlot = function(req, res){

	if(req.session.fUser){
		

		datae = {};
		datae['artistId'] = req.session.fUser._id;
		datae['day'] = req.query.day;
		var day = req.query.day;
		newDate = req.query.date;
		staffId = req.query.staff;
		var rew = newDate.split("/");
	    var date1 = rew[2]+'-'+rew[1]+'-'+rew[0];
		curentTime = parseTime(timeConvert(req.query.curentTime));
		var  interval = 10;
		businesshours.find(datae).exec(function(err, data) {

	
	    	if(data){

	    		var start_time =  Array();
	    		var end_time =  Array();
	    		var bussy_slot = Array();

	    		data.forEach(function(rs) {



	    			start_time.push(parseTime(timeConvert(rs.startTime)));
					end_time.push(parseTime(timeConvert(rs.endTime)));


	    		});


    			var staffSTime = Array();
				var staffETime = Array();
				var where = {};

				if(req.session.fUser.businessType=="business"){
	
					if(staffId){
										
						where.artistId = Number(staffId);
						where.businessId = Number(datae.artistId);

					}else{

						where.artistId = Number(datae.artistId);
					}
				}else{

					where.artistId = Number(datae.artistId);

					if(staffId){

						where.businessId = Number(staffId);

					}

				}	

		    	staff.find(where).sort([['_id', 'ascending']]).exec(function(err, DSdata) {

		    		if(DSdata){

		    			DSdata.forEach(function(sdata) {

		    				if(sdata.staffHours){

			    				sdata.staffHours.forEach(function(rs) {

			    					if(day==rs.day){

						    			staffSTime.push(parseTime(timeConvert(rs.startTime)));
										staffETime.push(parseTime(timeConvert(rs.endTime)));
									
									}


			    				});
		    				}

	    				});

	    			}

		    		var bookData = {};
					bookData['bookingDate'] = date1;
					bookData['bookingStatus'] = {$ne : 2};
					if(req.session.fUser.businessType=="business"){

						bookData['artistId'] = datae.artistId;
						if(staffId){
											
							bookData['staff'] = Number(staffId);
						}

					}else{

						if(staffId){
						
							bookData['staff'] = datae.artistId;											
							bookData['artistId'] = Number(staffId);
						
						}else{

							bookData['artistId'] = datae.artistId;

						}


					}	

			    	bookingService.find(bookData).exec(function(err, bdata) {

			    		var bookingSTime = Array();
						var bookingETime = Array();

			    		
			
			    		if(bdata){

			    			bdata.forEach(function(rs) {

			    			bookingSTime.push(parseTime(timeConvert(rs.startTime)));
							bookingETime.push(parseTime(timeConvert(rs.endTime)));


		    			});


			    		}

			    		var artistType = req.session.fUser.businessType;
			    		var bussy_slot = bookingTime(bookingSTime, bookingETime, interval);
						if(artistType=='independent' && staffId==''){

								var bussya_slot = bookingTime(staffSTime, staffETime, interval);
								var bussy_slot = bussy_slot.concat(bussya_slot); 
						}


						if(staffId){

							start_time = staffSTime;
							end_time  = staffETime;
						}

						var times_ara = calculate_time_slot_artist( start_time, end_time, interval,bussy_slot,curentTime,newDate);
						res.render('front/artist_time_slot.ejs',{slot:times_ara});

					
					});

			    });

		    }

		    	

	  	});

	}else{

		res.json({'status':'fail','message':'Session expire'});
		return;
	}




}


exports.artistbookingHistory = function(req, res) {

	 var moment = require('moment-timezone');
	res.render('front/artistbookingHistory.ejs',{
		session : req.session,
		clistdata : complete,
		plistdata : pending,
		error : req.flash("error"),
        success : req.flash("success"),
        user : user,
        stafData : (req.session.fUser.businessType=="business") ? my : myCp,
        userData : userData,
        artistServicesData:artistServicesData,
        staffId : req.body.staffId,
        moment : moment,
        businessType : req.session.fUser.businessType,
        cryptr : cryptr,
        lodash : lodash

	});
	 
}


exports.bookingInfoData = function(req, res, next) {



	var id = req.params.id ? cryptr.decrypt(req.params.id) : req.query.id ? cryptr.decrypt(req.query.id) : req.body.BookingId;


	var query = booking.aggregate([

			 			{
			                $match: {
			                    '_id': Number(id),
			                }
			            },
			          
			            {
			                "$lookup": {
			                    "from": "bookingservices",
			                    "localField": "_id",
			                    "foreignField": "bookingId",
			                    "as": "bookingData"
			                }
			            },
			            {
			                "$lookup": {
			                    "from": "users",
			                    "localField": "userId",
			                    "foreignField": "_id",
			                    "as": "userDetail"
			                }
			            },
			            {
			                "$lookup": {
			                    "from": "users",
			                    "localField": "artistId",
			                    "foreignField": "_id",
			                    "as": "artistDetail"
			                }
			            },

			            

			        ]);

			query.exec(function(err, data) {



			  	if(data){
			        for (i = 0 ; i < data.length ; i++) {



			            if(data[i].userDetail[0].profileImage){ 

			                data[i].userDetail[0].profileImage = "/uploads/profile/"+data[i].userDetail[0].profileImage;

			            }else{

				            data[i].userDetail[0].profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

				        }

				        if(data[i].artistDetail[0].profileImage){ 

			                data[i].artistDetail[0].profileImage = "/uploads/profile/"+data[i].artistDetail[0].profileImage;

			            }else{

				            data[i].artistDetail[0].profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

				        }
				       

			        }


				    bookingData = data;
				    next();

			    }else{
			    	
			    	redirect('/');

			    }
    });

}

exports.bookingInfo = function(req, res) {

	var d = new Date();
 	var month = d.getMonth()+1;
    var day = d.getDate();
    var currentDate = d.getFullYear()+ '-'+(month<10 ? '0' : '') + month+ '-' +(day<10 ? '0' : '') + day;

	artistService.find({artistId:bookingData[0].artistId}).exec(function(err, data) {

		res.render('front/bookingInfo.ejs',{
			session : req.session,
			rs : bookingData,
			error : req.flash("error"),
	        success : req.flash("success"),
	        user : user,
	        userData : userData,
	        artistServicesData:(user.businessType=="business") ? artistServicesData : data,
	        stafData : (req.session.fUser.businessType=="business") ? my : myCp,
	        cryptr : cryptr,
	        currentTime : parseTime(timeConvert(currentTime1())),
	        bookingTimeE : parseTime(timeConvert(bookingData[0].bookingTime)),
	        currentDate : currentDate,
	        moment : moment

		});

	});
	 
}

function currentTime1() {

      var date    = new Date();
      var hours   = date.getHours();
      var minutes = date.getMinutes();
      var ampm    = hours >= 12 ? 'PM' : 'AM';
      hours       = hours % 12;
      hours       = hours ? hours : 12; // the hour '0' should be '12'
      hours       = hours< 10 ? '0'+hours : hours; // the hour '0' should be '12'
      minutes     = minutes < 10 ? '0'+minutes : minutes;
      var strTime = hours + ':' + minutes + ' ' + ampm;
      return strTime;
   
}


function calculate_time_slot_artist(start_time, end_time, interval = "60", bussy_slot,curentTime,day){

 var i, formatted_time;
 var a=0;
 var time_slots = new Array();
	start_time.forEach(function(rs) {

		for(var i=rs; i<=end_time[a]; i = i+interval){

			formatted_time = convertHours(i);

			if(currentDay()== day){

				if(curentTime<i){

					time_slots.push(formatAMPM(formatted_time));

				}


			}else{

				time_slots.push(formatAMPM(formatted_time));
			}
		}

	a++;});




	time_slots = time_slots.filter(function(val) {
	  return bussy_slot.indexOf(val) == -1;
	});


 return time_slots;
 }


exports.bookingUpdate = function(req, res,next){

		var bookStatus = req.body.bookStatus;
		var b = bookStatus;
		var be = bookStatus;
		if(bookStatus==3){

			b = 2;
			be = 2;
		}
		paymentStatus = 0;
        transjectionId = '';

		if(bookStatus==4){
			var pType = req.body.pType;
			if(pType=='3'){

				paymentStatus = 1;
				var trsNo = Math.floor((Math.random() * 999999) + 1);
                transjectionId = 'txn_'+trsNo;
			}

			b = 3;
			be = 1;
		}
		var BookingId = req.body.BookingId;
		booking.updateMany({'_id':BookingId},{$set: {bookStatus:b,paymentStatus:paymentStatus,transjectionId:transjectionId}}, function(err, docs){  });
		bookingService.updateMany({'bookingId':BookingId},{$set: {bookingStatus:be}}, function(err, docs){  });

		data = bookingData[0];
		if(bookStatus==1){
	
			notify.notificationUser(data['artistId'],data['userId'],'2',BookingId,'booking'); 

			req.flash('success', 'Booking has been accepted');
			res.json({'status':'updated','message':'Booking has been accepted'});
			return;

		}else if(bookStatus==3){

			(req.session.fUser.userType=="artist") ? notify.notificationUser(data['artistId'],data['userId'],'4',BookingId,'booking') : notify.notificationUser(data['userId'],data['artistId'],'4',BookingId,'booking'); 

			req.flash('success', 'Booking has been cancelled');
			res.json({'status':'updated','message':'Booking has been cancelled'});
			return;

		}else if(bookStatus==4){

			notify.notificationUser(data['artistId'],data['userId'],'5',BookingId,'booking'); 

			req.flash('success', 'Booking has been completed');
			res.json({'status':'updated','message':'Booking has been completed'});
			return;

		}else{

			notify.notificationUser(data['artistId'],data['userId'],'3',BookingId,'booking'); 
			req.flash('success', 'Booking  has been rejected');
			res.json({'status':'updated','message':'Booking  has been rejected'});
			return;

		}



}





exports.userDetail = function(req, res,next){


	if(req.params.id){

		User.findOne({_id:cryptr.decrypt(req.params.id)}, function(err, userData) {

				artist = userData;
				if(req.params.distance){
				
					artist.distance = cryptr.decrypt(req.params.distance);
				
				}

				if(artist.profileImage){

					var result = url.parse(userData.profileImage, true);
					if(result.slashes==true){

						artist.profileImage = userData.profileImage;

					}else{

						artist.profileImage = '/uploads/profile/'+userData.profileImage;
					}
					
				}else{

					artist.profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

				}
				
				next();

		});	
	
	}else{

		res.redirect('/');


	}

}

exports.Artistcategorydata = function(req, res, next){

	 var query = artistCategory.aggregate([

	 			
	            {
	                $match: {
	                    'artistId': Number(artist._id),
	                    'status': 1,
	                    'deleteStatus': 1	,
	                    'artistServices.outCallPrice':{'$ne':''}
	                }
	            },
	            {
	                "$lookup": {
	                    "from": "artistsubsrervices",
	                    "localField": "serviceId",
	                    "foreignField": "serviceId",
	                    "as": "subService"
	                }
	            },
	            {  
			    	"$lookup":{
				            "from": "artistservices", 
				            "localField": "serviceId", 
				            "foreignField": "serviceId",
				            "as": "artistServices"
				    }
				     
				},

	            {
	                "$project": {
	                    "serviceId": 1,
	                    "serviceName": 1,
	                    "subcategory": "$subService",
	                    "artistServices": "$artistServices",
	                }
	            }

	            

	        ]);
        query.exec(function(err, data) {

            categorydata = data;
/*            console.log(data);
*/
    		next();

        });

}


exports.artistmainsubservices = function(req, res) {


	res.render('front/mainServiceGet.ejs',{
			session : req.session,
			artist : artist,
			categorydata : categorydata,
			checkServiceType : req.query.checkServiceType,
			category : req.query.category,
			subcategory : req.query.subcategory

		});
	 
}

exports.artistsubservicesList = function(req, res, next){

	var c = req.query.call;
	datae = {};
	datae['subserviceId'] = req.query.id;
	datae['artistId'] = artist._id;
	datae['status'] = 1;
	datae['deleteStatus'] = 1;
	datae[c] = {'$ne':''};
	artistService.find(datae).exec(function(err, data) {
    if (err) throw err;
	
    	subservicesdata = data;
    	next();
  });
}

exports.ArtistServiceDetail = function(req, res){

	datae = {};
	datae['_id'] = req.query.id;
	artistService.findOne(datae).exec(function(err, data) {
    if (err) throw err;
	
    	res.json({data});
  });
}


exports.artistsubservices = function(req, res){


	res.render('front/artistsubservices.ejs', { subservicesdata:subservicesdata,call:req.query.call,artistServiceId:req.query.artistServiceId});
}

exports.artistData = function(req, res,next){

		artistData = [];

		User.findOne({_id:Number(req.query.artistId)}, function(err, userData) {

			if(userData){

				artistData = userData;
				next();

			}


		});	

};


exports.artistStaff = function(req, res){

	var call = req.query.call;
	var artistServiceId = Number(req.query.artistServiceId);

	var where = {};
	where['businessId'] = Number(req.query.artistId);
	where['staffServiceId'] = {$in:[req.query.artistServiceId]};
	where['staffService.artistServiceId'] = Number(req.query.artistServiceId);
	

	staff.aggregate([

					{  
				    	$lookup:{
					            from: "staffservices", 
					            localField: "_id", 
					            foreignField: "staffId",
					            as: "staffService"
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
					        "staffService.staffId":1,
					        "staffService.artistServiceId":1,
					        "staffService.outCallPrice":1,
					        "staffService.inCallPrice":1,

				         }
					},
					{
				     $match: where,
				    },
				  ]).exec(function(err, data) {



				  	 	if(data){
			        for (i = 0 ; i < data.length ; i++) {



				  		var picked = lodash.filter(data[i].staffService, { 'artistServiceId': artistServiceId } );

				  		if(call=='inCallPrice'){

				  			if(picked[0].inCallPrice=='' || picked[0].inCallPrice==0 || picked[0].inCallPrice=='0'){

				  				delete data[i];

				  			}

				  		}else{

				  			if(picked[0].outCallPrice=='' || picked[0].outCallPrice==0 || picked[0].outCallPrice=='0'){

				  				delete data[i];

				  			}



				  		}
				       

			        }


			    }

		res.render('front/artistStaff.ejs', { staffData:data,staff:req.query.staff,type:req.query.type,businessType:req.query.businessType});

		
	});	

}


exports.staffdetail = function(req, res){

	var where = {};
	where.businessId = req.query.artistId;
	where.artistServiceId =req.query.artistServiceId;
	where.artistId =req.query.staff;

	staffService.findOne(where).sort([['_id', 'ascending']]).exec(function(err, staffData) {

			res.json({'data':staffData});	
	});
}



exports.booking_detial = function(req, res) {


	var latitude = '22.7196';
	var longitude = '75.8577';
	if(cityData.latitude &  cityData.longitude){

		var latitude = cityData.latitude;
		var longitude = cityData.longitude;
	}
		
		var request = require('request');
		var loc = latitude+","+longitude // Tokyo expressed as lat,lng tuple
		var targetDate = new Date() // Current date/time of user computer

		var timestamp = targetDate.getTime()/1000 + targetDate.getTimezoneOffset() * 60 // Current UTC date/time expressed as seconds since midnight, January 1, 1970 UTC
		var apikey = 'AIzaSyAs3DGwYwltPsb8AdR48IX21rq5JHEimZs'
		var apicall = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + loc + '&timestamp=' + timestamp + '&key=' + apikey

			request(apicall, function (error, response, body) {
			if (!error && response.statusCode == 200) {


				        var output = JSON.parse(body) // convert returned JSON string to JSON object
				        var offsets = output.dstOffset * 1000 + output.rawOffset * 1000 // get DST and time zone offsets in milliseconds
		   				var localdate = new Date(timestamp * 1000 + offsets) // Date object containing current time of Tokyo (timestamp + dstOffset + rawOffset)
				if(req.session.fUser){

					var userId  = req.session.fUser._id;

				}else{

					var userId = req.connection.remoteAddress;

				}

				bookingService.findOne({'userId':userId,'artistId':artist._id,'bookingStatus':0}).exec(function(err,data) { 

					var isBooking = 0;
					var serviceType = 0;

					if(data){

						isBooking = 1;
						serviceType = data.serviceType;
					
					}

					res.render('front/booking_detial.ejs',{
						session : req.session,
						artist : artist,
						categorydata : categorydata,
						currentDate : new Date(),
						isBooking : isBooking,
						serviceType : serviceType,
						error : req.flash("error"),
            			success : req.flash("success"),
            			category : req.query.categor ? cryptr.decrypt(req.query.category) : '',
            			subcategory : req.query.subcategory ? cryptr.decrypt(req.query.subcategory) : '',
            			artistServiceId : req.query.artistServiceId ? cryptr.decrypt(req.query.artistServiceId) : '',
            			staff : req.query.staff ? cryptr.decrypt(req.query.staff) : '',
            			bookingDate : req.query.bookingDate ? cryptr.decrypt(req.query.bookingDate) : '',
            			BookingTime : req.query.BookingTime ? cryptr.decrypt(req.query.BookingTime) : '',
            			BookingId : req.query.BookingId ? cryptr.decrypt(req.query.BookingId) : '',
            			completionTime : req.query.completionTime ? cryptr.decrypt(req.query.completionTime) : '',
            			bookingCount : req.query.bookingCount ? cryptr.decrypt(req.query.bookingCount) : '',
            			checkServiceType : (req.query.checkServiceType) ? cryptr.decrypt(req.query.checkServiceType) : serviceType,
            			cryptr : cryptr,
            			moment : moment


					});
				});	


			}
	});
	 
}

exports.loginBookingUpdate = function(req, res, next){

	if(req.session.fUser){

		var userId  = String(req.session.fUser._id);

	}else{

		var userId = req.connection.remoteAddress;

	}

		if(req.session.data){

		var oldUserId = req.connection.remoteAddress;

		bookingService.updateMany({'userId':oldUserId,'bookingStatus':0},{$set: {'userId':userId}}, function(err, docs){  });


	}

	next();
}

exports.bookingRemove = function(req, res){

	if(req.session.fUser){

		var userId = req.connection.remoteAddress;
		var msg = 'fail';
		if(req.session.fUser.userType!='artist'){
			var userId  = String(req.session.fUser._id);
			var msg = 'Your booking session has been expired';
			req.flash('success', msg); 


		}


	}else{

		var userId = req.connection.remoteAddress;
		var msg = 'Your booking session has been expired';
		req.flash('success', msg); 



	}

 	bookingService.deleteMany({'userId':userId,'bookingStatus':0}, function(err, results){ });

	res.json({'status':'success','message':msg});
	return;

}

exports.booking = function(req, res) {

	if(req.session.fUser){

		var userId  = String(req.session.fUser._id);

	}else{

		var userId = req.connection.remoteAddress;

	}


	 var query = bookingService.aggregate([

	 			{
	                $match: {
	                    'userId': userId,
	                    'artistId': artist._id,
	                    'bookingStatus': '0'
	                }
	            },
	            {
	                "$lookup": {
	                    "from": "artistservices",
	                    "localField": "artistServiceId",
	                    "foreignField": "_id",
	                    "as": "subService"
	                }
	            },
	            { $sort : { '_id': 1 ,'bookingDate':1} }

	        ]);

	query.exec(function(err, data) {

		if(data){

			var today = new Date(data[0].bookingDate);
	var dd = today.getDate();
	var mm = today.getMonth(); //January is 0!
	var yy = today.getFullYear();

			 var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
           var m = monthNames[mm];
			res.render('front/booking.ejs',{
				session : req.session,
				artist : artist,
				bookingData:data,
				bookingDate : moment(data[0].bookingDate).format('DD/MM/YYYY')+", "+data[0].startTime,
				error : req.flash("error"),
            	success : req.flash("success"),
            	user : user,
            	cryptr : cryptr,
            	moment : moment
			});


		}else{

			req.flash('error', 'Please select service'); 
			var bookingPage = '/booking_detial/'+cryptr.encrypt(artist._id)+'/'+cryptr.encrypt(artist.distance);
			res.redirect(bookingPage);

		}


	});
	 
}

exports.serviceBookingAdd = function(req, res){

	data = {};
	var staff = req.body.staff;
	if(req.session.fUser){

		var userId  = req.session.fUser._id;

	}else{

		var userId = req.connection.remoteAddress;

	}

	staff1 = staff ? staff : 0;
	data['artistId'] = req.body.artistId;

	if(staff){
		data['staff'] = staff;
	}
	data['serviceId'] = req.body.category;
	data['subServiceId'] = req.body.subcategory;
	data['artistServiceId'] = req.body.artistServices;
	data['bookingDate'] = req.body.bookingDate;
	data['startTime'] = req.body.timeSlot;
	data['endTime'] = req.body.endSlot;
	data['userId'] = userId;
	data['serviceType'] = req.body.outcall;
	data['bookingPrice'] = req.body.bookingPrice;
	data['timeCount'] = 	parseTime(timeConvert(req.body.timeSlot));
	BookingId = req.body.BookingId;

	if(BookingId){

		bookingService.find({'artistId':data.artistId,'userId':userId,'bookingStatus':0}).sort([['_id', 'descending']]).exec(function(err,brd) { 

				bookingService.findOne({'_id':BookingId}).sort([['_id', 'descending']]).exec(function(err,rd) { 

				if(rd){

					if(rd.bookingDate==data.bookingDate && rd.startTime==data.startTime && data.endTime==rd.endTime && data.staff==rd.staff && data.artistId==rd.artistId){
									
						res.json({'status':'updated','message':'Service update successfully'});
						return;

					}else{

						if(rd.bookingDate>data.bookingDate || (brd[0].bookingDate>data.bookingDate)){

							bookingService.updateMany({'_id':BookingId},{$set: data}, function(err, docs){  });
							res.json({'status':'updated','message':'Service update successfully'});
							return;


						}else if(brd[0].bookingDate==data.bookingDate && parseTime(timeConvert(data.startTime))<=parseTime(timeConvert(brd[0].startTime))){

							bookingService.updateMany({'_id':BookingId},{$set: data}, function(err, docs){  });
							res.json({'status':'updated','message':'Service update successfully'});
							return;


						}else{

							/*	console.log(parseTime(timeConvert(brd[0].startTime)));
								console.log(parseTime(timeConvert(data.startTime)));*/
								bookingService.remove( {'_id':BookingId}, function(err, result) { });
								bookingService.findOne().sort([['_id', 'descending']]).limit(1).exec(function(err,userdata) { 
										
									var b = 1;
									if(userdata){

										b = userdata._id+1;
									}
									data['_id'] = b;


									bookingService.insertMany(data,function(err,my) {
											                    
									});	

									res.json({'status':'updated','message':'Service update successfully'});
									return;
								});
						}


					}
				}
				

			});

	});

	}else{


		bookingService.findOne({'userId':userId,'artistServiceId':data.artistServiceId,'bookingStatus':0}).sort([['_id', 'descending']]).exec(function(err,red) { 

			if(red){

				res.json({'status':'fail','message':'Service already added'});
				return;


			}else{


				bookingService.findOne({'bookingDate':data.bookingDate,'artistId':data.artistId,'startTime':data.startTime,'endTime':data.endTime,'staff':staff1,'bookingStatus':{$ne:2}}).sort([['_id', 'descending']]).exec(function(err,rd) { 
					if(rd){
						
						res.json({'status':'fail','message':'Time Slot not available'});
						return;

					}else{

						bookingService.findOne().sort([['_id', 'descending']]).limit(1).exec(function(err,userdata) { 
					
						var b = 1;
						if(userdata){

							b = userdata._id+1;
						}
						data['_id'] = b;


						bookingService.insertMany(data,function(err,my) {
								                    
						});	

						artistCategory.findOne({'serviceId':data.serviceId,'artistId':data.artistId}).exec(function(err,sdata) {

							var bookingCount = 1;

							if(data){

								bookingCount = Number(sdata.bookingCount)+1;
							}

							artistCategory.updateMany({'serviceId':data.serviceId,'artistId':data.artistId},{$set: {bookingCount:bookingCount}}, function(err, docs){  });
					    
					    });

						artistService.findOne({'_id':data.artistServiceId}).exec(function(err,adata) {

							var bookingCount = 1;

							if(data){

								bookingCount = Number(adata.bookingCount)+1;
							}

							artistService.updateMany({'_id':data.artistServiceId},{$set: {bookingCount:bookingCount}}, function(err, docs){  });
					    
					    });

						res.json({'status':'success','message':'Service added successfully'});
						return;

				   });


					}

				});
			}

		});

	}

		

}




exports.finalBooking = function(req, res){

	data = {};
	var userId  = req.session.fUser._id;

	data['artistId'] = req.body.artistId;
	data['bookingDate'] = req.body.bookingDate;
	data['bookingTime'] = req.body.bookingTime;
	data['location'] = req.body.location;
	data['totalPrice'] = req.body.totalAmount;
	data['paymentType'] = req.body.paymentType;
	data['userId'] = userId;
	data['timeCount'] = 	parseTime(timeConvert(req.body.bookingTime));

	bookingService.remove( {'userId':userId,'artistId':{'$ne':data.artistId},'bookingStatus':0}, function(err, result) { });


	booking.findOne().sort([['_id', 'descending']]).limit(1).exec(function(err,userdata) { 

		var b = 1;
		if(userdata){

			b = userdata._id+1;
		}
		data['_id'] = b;

		bookingService.updateMany({'userId':userId,'artistId':Number(data.artistId),'bookingStatus':0},{$set: {'bookingStatus':1,'bookingId':b}}, function(err, docs){  });

		booking.insertMany(data,function(err,my) {
				                    
		});	


            notify.notificationUser(data['userId'],data['artistId'],'1',b,'booking'); 
            
            /*end notification code*/
		req.flash('bsuccess', 'Your booking request has been successfully sent to artist');
		res.json({'status':'success','message':'Your booking request has been successfully sent to artist'});
		return;

	});		

}

exports.bookingServiceDetail = function(req, res, next){

	var datae = {};
	if(req.session.fUser){

		var userId  = req.session.fUser._id;

	}else{

		var userId = req.connection.remoteAddress;

	}
	var artistId  = req.query.artistId;
	datae['artistServiceId'] = req.query.id;
	datae['userId'] = userId;
	datae['bookingStatus'] = 0;
	bookingService.findOne(datae).exec(function(err, data) {

		bookingService.find({userId:userId,bookingStatus:0,artistId:artistId}).exec(function(err, bdata) {

		
				    if (err) throw err;
					
				    	res.json({'data':data,count:bdata.length});

    	});
  });
}




exports.artistslot = function(req, res) {

	if(req.session.fUser){

		var userId  = req.session.fUser._id;

	}else{

		var userId = req.connection.remoteAddress;

	}



		datae = {};
		var artistType = req.query.artistType;
		var staffId = req.query.staffId;
		datae['artistId'] = req.query.artistId;
		datae['day'] = req.query.day;
		date = req.query.date;
		var rew = date.split("/");
	    var newDate = rew[2]+'-'+rew[1]+'-'+rew[0];
		curentTime = 	parseTime(timeConvert(req.query.curentTime));
		serviceTime = 	req.query.serviceTime;
		type = 	req.query.type;
		BookingTime  = 	req.query.BookingTime;
		bookingDate  = 	req.query.bookingDate;
		BookingId  = 	req.query.BookingId;
		bookingCount  = 	req.query.bookingCount;
		bookingstaff  = 	req.query.BookingStaff;
		//curentTime = currentTime(req.connection.remoteAddress);

		businesshours.find(datae).sort([['_id', 'ascending']]).exec(function(err, data) {

		
	    	if(data){

		    		var start_time =  Array();
		    		var end_time =  Array();
		    		var bussy_slot = Array();

		    		data.forEach(function(rs) {



		    			start_time.push(parseTime(timeConvert(rs.startTime)));
						end_time.push(parseTime(timeConvert(rs.endTime)));


		    		});
		    		var staffSTime = Array();
					var staffETime = Array();


					var where = {};
					if(staffId=='' || staffId==0 || staffId=='0'){
										
							where.artistId = datae.artistId;
					}else{

						where.artistId = staffId;
						where.businessId = datae.artistId;
					}
		    		staff.find(where).sort([['_id', 'ascending']]).exec(function(err, ddata) {

			    			if(ddata){

			    				ddata.forEach(function(sdata) {	

				    				if(sdata.staffHours){

					    				sdata.staffHours.forEach(function(rs) {

					    					if(datae.day==rs.day){

								    			staffSTime.push(parseTime(timeConvert(rs.startTime)));
												staffETime.push(parseTime(timeConvert(rs.endTime)));
											
											}


					    				});
				    				}
			    				});

			    			}



			    	


		    			var bookData = {};
		    			bookData['artistId'] = datae.artistId;
						bookData['bookingDate'] = newDate;
						bookData['bookingStatus'] = {$ne : 2};
						
						if(type=="edit"){

							bookData['_id'] = {'$ne':BookingId};
							
						}else{

							if(staffId){
										
								bookData['staff'] = staffId;
							}
						}
				    	bookingService.find(bookData).sort([['_id', 'ascending']]).exec(function(err, bdata) {


				    		var bookingSTime = Array();
							var bookingETime = Array();
							var t = 0;
							if(type=="edit"){

							 var t = 10;
							}

				    		if(bdata){

				    			bdata.forEach(function(rs) {

				    			bookingSTime.push(parseTime(timeConvert(rs.startTime))+t);
								bookingETime.push(parseTime(timeConvert(rs.endTime)));


			    			});


				    		}
				    		var d = 'descending';
				    		if(type=="edit"){

				    			var d = 'ascending';

				    		}

				    		bookingService.find({'userId':userId,'artistId':datae.artistId,'bookingStatus':0}).sort([['_id',d]]).limit(1).exec(function(err,adata) { 


								var  interval = 10;
								var AbookingTime = '';
								var AbookingDate = '';

								if(adata.length>0){

								/*	console.log('a');
									console.log(adata);*/


									var AbookingTime = parseTime(timeConvert(adata[0].endTime));
									var AbookingDate = adata[0].bookingDate;
								}

								if(type=="edit"){

									var AbookingTime = '';
									var AbookingDate = '';

									if(bookingCount!=1){

										if(BookingId!=adata[0]._id){

											if(adata.length>0){


												var AbookingTime = parseTime(timeConvert(adata[0].endTime));
												var AbookingDate = adata[0].bookingDate;
											}



										}


									}

								}


								var Ntime_slots = Array();
							
								if(AbookingDate<=newDate){

									var bussy_slot = bookingTime(bookingSTime, bookingETime, interval);

									if(staffId=='' || staffId==0 || staffId=='0'){

											var bussya_slot = bookingTime(staffSTime, staffETime, interval);
											var bussy_slot = bussy_slot.concat(bussya_slot); 
									}else{


										start_time = staffSTime;
										end_time  = staffETime;

									}


									var times_ara = calculate_time_slot( start_time, end_time, interval,date,bussy_slot,AbookingTime,curentTime,AbookingDate,newDate);
									var Ntime_slots = final_time_slot(times_ara, serviceTime);

								}

								var selectData = Array();

								


								if(type=="edit"){

									staffId = staffId ? staffId : 0;

									Ntime_slots.forEach(function(data) {

										if(data==BookingTime && newDate==bookingDate && bookingstaff==staffId){

											selectData.push(1);

										}else{

											selectData.push(0);
										}

									});
								}

								res.render('front/time_slot.ejs',{slot:Ntime_slots,selectData:selectData});

							});
						});

			    });


		    }

		    	

	  	});

	 
}


exports.artistslot12 = function(req, res) {

	if(req.session.fUser){

		var userId  = req.session.fUser._id;

	}else{

		var userId = req.connection.remoteAddress;

	}



		datae = {};
		datae['artistId'] = req.query.artistId;
		datae['day'] = req.query.day;
		date = req.query.date;
		var rew = date.split("/");
	    var newDate = rew[2]+'-'+rew[1]+'-'+rew[0];
		curentTime = 	parseTime(timeConvert(req.query.curentTime));
		serviceTime = 	req.query.serviceTime;
		type = 	req.query.type;
		BookingTime  = 	req.query.BookingTime;
		bookingDate  = 	req.query.bookingDate;
		BookingId  = 	req.query.BookingId;
		bookingCount  = 	req.query.bookingCount;
		//curentTime = currentTime(req.connection.remoteAddress);

		businesshours.find(datae).sort([['_id', 'ascending']]).exec(function(err, data) {

		
	    	if(data){

	    		var start_time =  Array();
	    		var end_time =  Array();
	    		var bussy_slot = Array();

	    		data.forEach(function(rs) {



	    			start_time.push(parseTime(timeConvert(rs.startTime)));
					end_time.push(parseTime(timeConvert(rs.endTime)));


	    		});


    			var bookData = {};
    			bookData['artistId'] = datae.artistId;
				bookData['bookingDate'] = newDate;
				bookData['bookingStatus'] = {$ne : 2};
				if(type=="edit"){

					bookData['_id'] = {'$ne':BookingId};
				}

		    	bookingService.find(bookData).sort([['_id', 'ascending']]).exec(function(err, bdata) {

		    		var bookingSTime = Array();
					var bookingETime = Array();
					var t = 0;
					if(type=="edit"){

					 var t = 10;
					}

		    		if(bdata){

		    			bdata.forEach(function(rs) {

		    			bookingSTime.push(parseTime(timeConvert(rs.startTime))+t);
						bookingETime.push(parseTime(timeConvert(rs.endTime)));


	    			});


		    		}

				

					bookingService.find({'userId':userId,'artistId':datae.artistId,'bookingStatus':0}).sort([['_id', 'ascending']]).limit(1).exec(function(err,adata) { 

						var  interval = 10;
						var AbookingTime = '';
						var AbookingDate = '';

						if(adata.length>0){

							/*console.log('a');
							console.log(adata);*/


							var AbookingTime = parseTime(timeConvert(adata[0].endTime));
							var AbookingDate = adata[0].bookingDate;
						}

						if(type=="edit"){

							var AbookingTime = '';
							var AbookingDate = '';

							if(bookingCount!=1){

								if(BookingId!=adata[0]._id){

									if(adata.length>0){


										var AbookingTime = parseTime(timeConvert(adata[0].endTime));
										var AbookingDate = adata[0].bookingDate;
									}



								}


							}

						}


			
						var Ntime_slots = Array();
					
						if(AbookingDate<=newDate){

							var bussy_slot = bookingTime(bookingSTime, bookingETime, interval);
							var times_ara = calculate_time_slot( start_time, end_time, interval,date,bussy_slot,AbookingTime,curentTime,AbookingDate,newDate);
							var Ntime_slots = final_time_slot(times_ara, serviceTime);

						}

						var selectData = Array();

						if(type=="edit"){

							Ntime_slots.forEach(function(data) {

								if(data==BookingTime && newDate==bookingDate){

									selectData.push(1);

								}else{

									selectData.push(0);
								}

							});
						}

						res.render('front/time_slot.ejs',{slot:Ntime_slots,selectData:selectData});

					});
				});

		    }

		    	

	  	});




	 
}

function final_time_slot(times_ara, serviceTime){


	i=0;
	var s = serviceTime*10;

	Ntime_slots = Array();
	times_ara.forEach(function(rs) {

		var end = Number(i)+Number(serviceTime);
		var end_time = times_ara[end];

		var currentSlot = rs;
		var end = timeDiffrence(currentSlot,end_time); 

		if(s==end){
			Ntime_slots.push(rs);
		}

	i++;	
	});

	return Ntime_slots;

}

function timeDiffrence(start,end){

    var day = '1 1 1970 '
    diff_in_min = ( Date.parse(day + end) - Date.parse(day + start) )/ 1000 / 60;
    return diff_in_min;


}

function bookingTime(start_time,end_time,interval){

	var i, formatted_time;
	var a=0;
	var time_slots = new Array();
	start_time.forEach(function(rs) {


		for(var i=rs; i<end_time[a]; i = i+interval){

			formatted_time = convertHours(i);

			time_slots.push(formatAMPM(formatted_time));


		}

	a++;});
	return time_slots;


}


function currentTime(my) {

	iplocation(my, function (error, my12) {

			cityData = my12;
			var latitude = '22.7196';
			var longitude = '75.8577';
			if(cityData.latitude &  cityData.longitude){

				var latitude = cityData.latitude;
				var longitude = cityData.longitude;
			}
			
			var request = require('request');
			var loc = latitude+","+longitude // Tokyo expressed as lat,lng tuple
			var targetDate = new Date() // Current date/time of user computer

			var timestamp = targetDate.getTime()/1000 + targetDate.getTimezoneOffset() * 60 // Current UTC date/time expressed as seconds since midnight, January 1, 1970 UTC
			var apikey = 'AIzaSyAs3DGwYwltPsb8AdR48IX21rq5JHEimZs'
			var apicall = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + loc + '&timestamp=' + timestamp + '&key=' + apikey

				request(apicall, function (error, response, body) {
				if (!error && response.statusCode == 200) {


					        var output = JSON.parse(body) // convert returned JSON string to JSON object
					        var offsets = output.dstOffset * 1000 + output.rawOffset * 1000 // get DST and time zone offsets in milliseconds
			   				var localdate = new Date(timestamp * 1000 + offsets) // Date object containing current time of Tokyo (timestamp + dstOffset + rawOffset)
			   				var hours   = localdate.getHours();
						    var minutes = localdate.getMinutes();
						    var ampm    = hours >= 12 ? 'PM' : 'AM';
						    hours       = hours % 12;
						    hours       = hours ? hours : 12; // the hour '0' should be '12'
						    minutes     = minutes < 10 ? '0'+minutes : minutes;
						    var strTime = hours + ':' + minutes + ' ' + ampm;
						   return parseTime(timeConvert(strTime));
					
				}
		});

	});   
}

function currentDay() {

	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
	    dd = '0'+dd
	} 

	if(mm<10) {
	    mm = '0'+mm
	} 

	return today = dd + '/' + mm + '/' + yyyy;

   
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

function formatAMPM(otime) {

	var ohours = Number(otime.match(/^(\d+)/)[1]);
    var ominutes = Number(otime.match(/:(\d+)/)[1])
	var hours   = ohours;
	var minutes = ominutes;
	var ampm    = hours >= 12 ? 'PM' : 'AM';
	hours       = hours % 12;
	hours       = hours ? hours : 12; // the hour '0' should be '12'
	minutes     = minutes < 10 ? '0'+minutes : minutes;
	hours 		= hours<10 ? "0"+hours : hours;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return strTime;

}

function parseTime(s) {

 var c = s.split(':');
 return parseInt(c[0]) * 60 + parseInt(c[1]);

 }

function pad (str, max) {

	  str = str.toString();
	  return str.length < max ? pad("0" + str, max) : str;

}

function convertHours(mins){

	 var hour = Math.floor(mins/60);
	 var mins = mins%60;
 	 var converted = pad(hour, 2)+':'+pad(mins, 2);
 	 return converted;
}


function calculate_time_slot(start_time, end_time, interval = "60", day, bussy_slot, AbookingTime,curentTime,AbookingDate,newDate){


 var i, formatted_time;
 var a=0;
 var time_slots = new Array();
	start_time.forEach(function(rs) {

		for(var i=rs; i<=end_time[a]; i = i+interval){

			formatted_time = convertHours(i);

			if(currentDay()==day){

			

				if(curentTime<i){


					if(AbookingTime){


						if(AbookingTime<=i){

							time_slots.push(formatAMPM(formatted_time));
						}
	
					}else{
									


						time_slots.push(formatAMPM(formatted_time));
					}



				}


			}else if(AbookingDate==newDate){

				if(AbookingTime<=i){

					time_slots.push(formatAMPM(formatted_time));
				}


			}else{

			 	time_slots.push(formatAMPM(formatted_time));

			}

		}

	a++;});




	time_slots = time_slots.filter(function(val) {
	  return bussy_slot.indexOf(val) == -1;
	});


 return time_slots;
 }


 function timeDiffrence(start,end){

    var day = '1 1 1970 '
    diff_in_min = ( Date.parse(day + end) - Date.parse(day + start) )/ 1000 / 60;
    return diff_in_min;


}

exports.staffUpdate = function(req, res,next){

		var staff = req.body.staff;
		var BookingId = req.body.BookingId;
		bookingService.updateMany({'_id':BookingId},{$set: {staff:staff}}, function(err, docs){  });
		req.flash('success', 'Staff has been changed successfully');
		res.json({'status':'updated','message':'Staff has been changed successfully'});



}


exports.changeartistFreeSlot = function(req, res, callback){

		
		datae = {};
		datae['artistId'] = req.session.fUser._id;
		datae['day'] = req.body.day;
		var day = req.body.day;
		newDate = req.body.bookingDate;
		bookingSTime = req.body.bookingSTime;
		bookingETime = req.body.bookingETime;
		start_time = req.body.staffSTime;
		end_time = req.body.staffETime;
		staffId = req.body.staff;
		serviceTime = req.body.serviceTime;
		var rew = newDate.split("/");
	    var date1 = rew[2]+'-'+rew[1]+'-'+rew[0];

		//curentTime = parseTime(timeConvert(req.query.curentTime));
		var  interval = 10;

    		var artistType = req.session.fUser.businessType;
    		var bussy_slot = bookingTime(bookingSTime, bookingETime, interval);
			var times_ara = calculate_time_slot_artist( start_time, end_time, interval,bussy_slot,curentTime,newDate);
			var Ntime_slots = final_time_slot123(times_ara, serviceTime);
			return Ntime_slots;

					
			
}

function final_time_slot123(times_ara, serviceTime){


	d=0;
	var s = serviceTime*10;

	Ntime_slots = Array();
	times_ara.forEach(function(srs) {

		var end = Number(d)+Number(serviceTime);
		var end_time = times_ara[end];
		if (typeof end_time != 'undefined'){
			var currentSlot = srs;
			var end = timeDiffrence(currentSlot,end_time); 

			if(s==end){
				Ntime_slots.push(srs);
			}
		}

	d++;	
	});


	return Ntime_slots;

}


exports.faveroite_list = function(req, res, next) {

	var userId = Number(req.session.fUser._id);
	var ds = art = [];
	artistFavorite.find({userId:userId}, function(err, data) {


	  	if(data){
	        for (i = 0 ; i < data.length ; i++) {

		        ds.push(data[i].artistId);
		    }
		    req.body.art = ds;	
		}
		next();
   });
	

}



exports.faveroite_list_artist = function(req, res, next) {

	var art = req.body.art;
	var category = req.body.category;
	var city = req.body.city;
	var day = req.body.day;
	var time = req.body.time;
	datae = {};
	datae['userType'] = 'artist';
	datae['isDocument'] = 3;
	datae['serviceType'] = {'$ne':2};
	datae['status'] = '1';
	if(city==""){

		var city = "indore";
	}

	if(art){

		var art = art.map(function(n) {
	    return Number(n);
		});
		datae['_id'] = { $in: art};

	}
	if(category){

		var category = category.map(function(n) {
	    return Number(n);
		});
		datae['service.serviceId'] = { $in: category};

	}
	if(day){

		datae['businesshours.day'] = Number(day);
	}
	if(time){

		datae['businesshours.startTime'] = {$gte:time};
		datae['businesshours.endTime'] = {$gte:time};
	}

	  /*'businesshours.startTime': {$gte:'03:31 AM'},
		       'businesshours.endTime': {$lt:'3:31 AM'},*/

	var options = {
			  	provider: 'google',
			  	httpAdapter: 'https',
			  	apiKey: 'AIzaSyCyie5SLruC8QRsZ4VYSaK1uwUE6g4w2IY',
			  	formatter: null		
			};
	 
			var geocoder = NodeGeocoder(options);

			geocoder.geocode(city)
			  .then(function(row) {

			  	   var latitude 	=	row[0].latitude;
	               var longitude	 =	row[0].longitude;

	               

	               User.aggregate([

	               	{
			            "$geoNear": {
			                  "near": {
			                         "type": "Point",
			                         "coordinates":[parseFloat(latitude), parseFloat(longitude)]
			                          },
			            maxDistance: 5* 1609.34,
			            "spherical": true,
			            "distanceField": "distance",
			            distanceMultiplier: 1 / 1609.344 // calculate distance in miles
			            }
			        },
				    {  
				    	$lookup:{
					            from: "artistservices", 
					            localField: "_id", 
					            foreignField: "artistId",
					            as: "service"
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
					        "userName": 1,
					        "lastName": 1,
					        "address": 1,
					        "profileImage":1,
					        "reviewCount":1,
					        "ratingCount":1,
					        "isDocument":1,
							"serviceType":1,
					        "status":1,
					        "distance":1,
					        "userType":1,
					        "service._id":1,
					        "service.serviceId":1,
					        "service.subserviceId":1,
					        "service.title":1,
					        "service.description":1,
					        "service.inCallPrice":1,
					        "service.outCallPrice":1,
					        "businesshours._id":1,
					        "businesshours.day":1,
					        "businesshours.startTime":1,
					        "businesshours.endTime":1,

				         }
					},
					{
				     $match: datae,
				    },
				    { $sort : { distance: 1,reviewCount:-1 } },



				  ],function(err, data) {

/*				  	console.log(err);
*/
				  	if(data){
				        for (i = 0 ; i < data.length ; i++) {

				        	data[i].distance = Number(data[i].distance).toFixed(2);
				        	data[i].review = Math.round(data[i].ratingCount);


				            if(data[i].profileImage){ 

				                data[i].profileImage = "/uploads/profile/"+data[i].profileImage;

				            }else{

					            data[i].profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

					        }
					       

				        }
				    }

				    my = data;
				    page = req.body.page


					next();

				  });




	});

}

exports.faveroite_list_result = function(req, res) {


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
        res.render('front/home_search_artist.ejs', {
            error : req.flash("error"),
            success : req.flash("success"),
            session : req.session,
            listdata : studentsList,
            pageSize: pageSize,
            totalStudents: totalStudents,
            pageCount: pageCount,
            currentPage: currentPage,
            cryptr : cryptr

            
        });
	 
}
