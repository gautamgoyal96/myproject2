var User            = require('../../models/front/home.js');
var booking 									= require('../../models/front/booking.js');
var fs = require('fs');
var Cryptr = require('cryptr'),
 cryptr = new Cryptr('1234567890');
var lodash = require('lodash');

exports.paymenthistory = function(req, res) {


	res.render('front/paymenthistory.ejs',{
		session : req.session,
		error : req.flash("error"),
        success : req.flash("success"),
	});
	 
}

exports.paymentList_data = function(req, res, next) {

	 next();
}



exports.payment_list = function(req, res) {

	var escapere = require('escape-regexp');
	var search = escapere(req.query.search);
	var datae = {};
	
	datae['bookStatus'] = '3';	
	if(user.userType=="artist"){

		datae['artistId'] = userId;	
		if(search){
			if(search=="\\."){
				search='';
			}
		//	datae['userDetail.userName'] = {$regex : search,'$options' : 'i'};
		}
	
	}else{

		datae['userId'] = userId;
		if(search){
			if(search=="\\."){
				search='';
			}
		//	datae['artistDetail.userName'] = {$regex : search,'$options' : 'i'};
		}
	}

	page = Number(req.query.page)-1;
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
			var page = req.query.page;
			var totalStudents = 0,
		        pageCount = 0,
		        currentPage = 1,
		        studentsList = []; 
		        pageSize = 0;
		        
		        if(data){

					if(data.length>0){
					  	pageSize = 10,
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

			 var moment = require('moment-timezone');

			res.render('front/payment_list.ejs',{
				session : req.session,
		 		listdata : studentsList,
		        pageSize: pageSize,
		        totalStudents: totalStudents,
		        pageCount: pageCount,
		        currentPage: currentPage,
		        error : req.flash("error"),
		        success : req.flash("success"),
		        user : user,
		        stafData : my,
		        artistServicesData:artistServicesData,
		        moment : moment,
		        cryptr : cryptr,
		        lodash : lodash
			});
	});
	 
}
