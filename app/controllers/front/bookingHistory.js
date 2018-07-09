var bookingService 							= require('../../models/front/bookingService.js');
var booking 								= require('../../models/front/booking.js');
var User            						= require('../../models/front/home.js');
var notification 						    = require('../../models/front/notification.js');

var Cryptr = require('cryptr'),
cryptr = new Cryptr('1234567890');
var lodash = require('lodash');
var moment = require('moment-timezone');

exports.allBookinghistory = function(req, res) {

	res.render('front/Userbookinghistory.ejs',{
		session : req.session,
		error : req.flash("error"),
        success : req.flash("success"),
        cryptr : cryptr
	});
	 
}

exports.futureBooking = function(req, res, next) {




    var cdate=new Date();

    var m = (cdate.getMonth()+1);

    var s = m<10 ? '0'+m : m;


    var e = cdate.getDate();

    var d = e<10 ?'0'+e: e;

    var val = cdate.getFullYear()+"-"+s+"-"+d;

   	var ct = parseTime(timeConvert(req.body.currentTime));

	var userId = req.session.fUser._id;
	var datae = {};
	if(user.userType=="artist"){
		datae['artistId'] = userId;	
		datae['bookStatus'] = '3';	
		datae['bookStatus'] = {$ne : '0'};		
		datae['paymentStatus'] = {$ne : 1};							
	
	}else{

		datae['userId'] = userId;
		datae['paymentStatus'] = {$ne : 1};		
	}

	page = req.body.page;
	limit = 10;
	page = page*limit;

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
			                "$lookup": {
			                    "from": "users",
			                    "localField": "artistId",
			                    "foreignField": "_id",
			                    "as": "artistDetail"
			                }
			            },

			            {
			                $match: datae
			            },

			            {
			                $match: {bookStatus:{$ne : '2'}}
			            },
			            { $skip:page },
		 				{ $limit:limit },				           
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

				        if(data[i].artistDetail[0].profileImage){ 

			                data[i].artistDetail[0].profileImage = "/uploads/profile/"+data[i].artistDetail[0].profileImage;

			            }else{

				            data[i].artistDetail[0].profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

				        }


				        if(data[i].bookingDate==val && parseTime(timeConvert(data[i].bookingTime))<ct && data[i].bookStatus==0){

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

exports.pastBooking = function(req, res, next) {

	var cdate=new Date();

    var m = (cdate.getMonth()+1);

    var s = m<10 ? '0'+m : m;


    var e = cdate.getDate();

    var d = e<10 ?'0'+e: e;

    var val = cdate.getFullYear()+"-"+s+"-"+d;

	var userId = req.session.fUser._id;
	var datae = {};

	datae['bookStatus'] = '3';		

	if(user.userType=="artist"){

		datae['artistId'] = userId;	
		datae['paymentStatus'] = 1;		
	
	}else{

		datae['userId'] = userId;
		datae['paymentStatus'] = 1;			
	}

	page = req.body.page;
	limit = 10;
	page = page*limit;


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
			                "$lookup": {
			                    "from": "users",
			                    "localField": "artistId",
			                    "foreignField": "_id",
			                    "as": "artistDetail"
			                }
			            },

			            {
			                $match: datae
			            },
			            { $skip:page },
		 				{ $limit:limit },
			           
			            { $sort : { 'bookingDate':-1,'timeCount':-1 } }
			            

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


			    }

			    complete = data;



			    next();
    });

}

exports.artistAllBookingHistory = function(req, res) {


	res.render('front/artistAllBookingHistory.ejs',{
		session : req.session,
		error : req.flash("error"),
        success : req.flash("success"),
        cryptr : cryptr,
        moment : moment,
        page : req.body.page,
        type : req.body.type

	});
	 
}

exports.postRatingReview = function(req, res){

	if(req.session.fUser.userType=='artist'){

		data = {
			"artistRating": req.query.stars,
	        "reviewByArtist": req.query.comment,
			};

		rs = {'userId' : bookingData[0].userId,'artistRating':{$ne:0}};	
		where = {'_id':bookingData[0].userId};
		senderId =  bookingData[0].artistId;
		reciverId =  bookingData[0].userId;
		if(bookingData[0].userRating!=''){

			data.reviewStatus = 1;
		}

	}else{

		data = {
			"userRating": req.query.stars,
	        "reviewByUser": req.query.comment,
			};
		rs = {'artistId' : bookingData[0].artistId,'userRating':{$ne:0}};
		where = {'_id':bookingData[0].artistId};
		senderId =  bookingData[0].userId;
		reciverId =  bookingData[0].artistId;
		if(bookingData[0].artistRating!=''){

			data.reviewStatus = 1;
		}	

	}
	
	
	booking.updateMany({'_id':bookingData[0]._id},{$set:data}, function(err, docs){  

		booking.find(rs, function(err, userData) {

			if(userData){
				count = userData.length;
				total = 0;
				userData.forEach(function(rd) {
					
					if(req.session.fUser.userType=='artist'){

						total = rd.artistRating+total;

					}else{

					   total = rd.userRating+total;

					}

		    	});


		    	r = total/count;
		    	rating = Number(r).toFixed(0);
		    	console.log(count);
		    	User.updateMany(where,{$set:{ratingCount:rating,reviewCount:count}}, function(err, docs){  });
			}

		});
		
	});

	notify.notificationUser(senderId,reciverId,'6',bookingData[0]._id,'booking'); 
	req.flash('success', 'Review submitted successfully');
	res.json({'status':'success','message': 'Review submitted successfully'});
}