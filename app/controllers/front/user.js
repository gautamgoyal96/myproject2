var User            = require('../../models/front/home.js');
var days            = require('../../models/front/businesshours.js');
var bankDetail            = require('../../models/front/bankDetail_model.js');
var Category            = require('../../models/admin/category_model');
var subCategory            = require('../../models/admin/sub_category_model.js');
var artistCategory            = require('../../models/front/artistMainService');
var artistsubCategory            = require('../../models/front/artistSubService');
var artistService = require('../../models/front/artistService.js');
var Certificate     = require('../../models/front/artistCertificate.js');
var formidable = require('formidable');
var fs = require('fs');
var NodeGeocoder = require('node-geocoder');

exports.businessHours = function(req, res) {

	var days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
	res.render('front/reg_business_step1.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session,
			days : days
	
	 	});
	 
}



exports.update_workingTime = function(req, res){



	var openTime = req.body.openTime;
	var closeTime = req.body.closeTime;
	var range = req.body.range;
	var address = req.body.address;
	var serviceType = req.body.serviceType;
	var artistId =req.session.fUser._id;
	var inCallpreprationTime = "";
	if(req.body.inpreprationHours){

		var inpreprationHours = req.body.inpreprationHours;
		if(inpreprationHours.length<2){

			var inpreprationHours = 0+req.body.inpreprationHours;
		}

		var inpreprationminut = req.body.inpreprationminut;
		if(inpreprationminut.length<2){

			var inpreprationminut = 0+req.body.inpreprationminut;
		}

		var inCallpreprationTime = inpreprationHours+":"+inpreprationminut;
	}
	var outCallpreprationTime = "";
	if(req.body.outpreprationHours){

		var outpreprationHours = req.body.outpreprationHours;
		if(outpreprationHours.length<2){

			var outpreprationHours = 0+req.body.outpreprationHours;
		}

		var outpreprationminut = req.body.outpreprationminut;
		if(outpreprationHours.length<2){

			var outpreprationminut = 0+req.body.outpreprationminut;
		}

		var outCallpreprationTime = outpreprationHours+":"+outpreprationminut;

	}
	var day = new days();

	days.remove( {'artistId':artistId}, function(err, result) { });

	days.findOne().sort([['_id', 'descending']]).limit(1).exec(function(err,userdata) { 
			
			var b = 1;
			if(userdata){

				b = userdata._id+1;
			}
			var options = {
				  	provider: 'google',
				  	httpAdapter: 'https',
				  	apiKey: 'AIzaSyCyie5SLruC8QRsZ4VYSaK1uwUE6g4w2IY',
				  	formatter: null		
				};
		 
				var geocoder = NodeGeocoder(options);

				geocoder.geocode(address)
				  .then(function(row) {

		            var myData            = {};
					myData.serviceType = serviceType;
		            myData.radius = range;
		            myData.inCallpreprationTime = inCallpreprationTime;
		            myData.outCallpreprationTime = outCallpreprationTime;
		            myData.isDocument = 1;
		            myData.address = address;
		            myData.city =row[0].city;
                    myData.state =row[0].administrativeLevels.level1long;
                    myData.country =row[0].country;
                    myData.latitude =row[0].latitude;
                    myData.longitude =row[0].longitude;
                    myData.loc =	[row[0].latitude,row[0].longitude];
		            User.update({_id:artistId}, 
		            {$set: myData},
		            function(err, docs){

		            });
        });

			var time = req.body.openTime;

			    jsArr = []
			    y = 0;
			for (var i = 0; i < time.length; i++) {

				if(time){


				data = time[i];
				console.log(data);

					for (var a = 0; a < data.length; a++) {

						if (typeof data[a] !== "undefined") {

							if(data[a][0]){

								var d = data[a][0];
								st = d.split(":");
								oh = st[0];
								if(st[0]<10){

									var oh = 0+st[0];
								}

								var openTime = oh+":"+st[1];

								var c = data[a][1];
								ct = c.split(":");
								ch = ct[0];
								if(ct[0]<10){

									var ch = 0+ct[0];
								}

								var closeTime = ch+":"+ct[1];


								id = b+y;
									
								  jsArr.push({
						                _id: id,
						                day: Number(i),
						                artistId: artistId,
						                startTime: openTime,
						                endTime: closeTime,
						                status: 1
						            });
							  y++;

							}
					    
					    }
					};
				}	


					
			};



			days.insertMany(jsArr,function(err,my) {

				res.redirect('/subCategoryAdd');
					                    
			});	


			days.insertMany(jsArr);



	});	

}

exports.categorydata = function(req, res, next){

	Category.aggregate([
	{
        $match: {
            'status': '1',
            'deleteStatus': 1
        }
    },	
    { $lookup:
      {
        from: 'subservices',
        localField: '_id',
        foreignField: 'serviceId',
        as: 'subcategory'
      }
    }
  ], function(err, data) {
    	categorydata = data;
    	next();
  });
}



exports.subCategoryAdd = function(req, res){
	res.render('front/reg_business_step2.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session,
			categorydata : categorydata,
			serviceCount : serviceCount,
			type : req.query.type ? req.query.type : 0
	
	 	});
}


exports.addsubservices = function(req, res){
	res.render('front/addsubservices.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session,
			subservicesdata:subservicesdata,
			user:user
	
	 	});
}

exports.updatesubservices = function(req, res){


	artistService.findOne({'_id':req.query.id}).exec(function(err, data) {
    if (err) throw err;
    res.json(data);


  });
}

exports.serviceCount  = function(req, res,next){

	var userId = req.session.fUser._id;
	artistService.count({'artistId':userId}).exec(function(err,data) {

		serviceCount = data;
		next();
	});

}
exports.subservicesList = function(req, res, next){


	artistService.find({'subserviceId':req.query.id,'artistId':user._id}).exec(function(err, data) {
    if (err) throw err;

    	subservicesdata = data;
    	next();
  });
}

exports.AddServices  = function(req, res){

	var hours = req.body.hours;
		if(hours.length<2){

			var hours = 0+req.body.hours;
		}

		var minute = req.body.minute;
		if(minute.length<2){

			var minute = 0+req.body.minute;
		}

		var completionTime = hours+":"+minute;

	var newId = 1;
	var artistId =req.session.fUser._id;
	var incallPrice =  req.body.incallPrice ? req.body.incallPrice : 0;
	var outCallPrice =  req.body.outCallPrice ? req.body.outCallPrice : 0;
	var myobj = {
				artistId: artistId,
				serviceId: req.body.category,
				subserviceId: req.body.subcategory,
				title: req.body.title,
				description:  req.body.description,
				inCallPrice:  Number(incallPrice).toFixed(2),
				outCallPrice:  Number(outCallPrice).toFixed(2),
				completionTime:  completionTime

			};


		Category.findOne({'_id':req.body.category}).exec(function(err,rs) {
								
			artistCategory.findOne({'serviceId':req.body.category,'artistId':artistId}).exec(function(err,row) {

				if(row){
				
				}else{

					artistCategory.findOne({}).sort([['_id', 'descending']]).exec(function(err,data) {

						var newId = 1;
						if(data) { var newId = data._id + 1; }
						var catObj = {
							_id: newId,
							artistId: artistId,
							serviceId: req.body.category,
							serviceName: rs.title			
						};

						artistCategory(catObj).save(function (err, data) {});

					
					});
				}	

			
			});

		});
		
		subCategory.findOne({'_id':req.body.subcategory}).exec(function(err,rs) {

			artistsubCategory.findOne({'subServiceId':req.body.subcategory,'artistId':artistId}).exec(function(err,row) {
				
				if(row){

				}else{

					artistsubCategory.findOne({}).sort([['_id', 'descending']]).exec(function(err,data) {

						var newId = 1;
						if(data) { var newId = data._id + 1; }
						var scatObj = {
							_id: newId,
							artistId: artistId,
							serviceId: req.body.category,
							subServiceId: req.body.subcategory,
							subServiceName: rs.title			
						};

						artistsubCategory(scatObj).save(function (err, data) {});


					
					});
				}	

			
			});

		
		});		
	if(req.body.type=="insert"){
	
		artistService.find({}).sort({_id:-1}).limit(1).exec(function(err,data) {
			if(err){ var newId = 1; }
			if(0 < data.length) { var newId = data[0]._id + 1; }else{ var newId = 1; }

				count = serviceCount+1;
				setData = {};
				setData['serviceCount'] = count;
				if(req.body.sType){
					setData['isDocument'] = 3;
				}else{

					setData['isDocument'] = 2;
				}
				User.update({_id:artistId},{$set: setData},function(err, docs){   });

					myobj._id = newId;

						artistService.findOne({'title':myobj.title,'artistId':artistId}).exec(function(err,data) {

							if(data){

								res.json({status:'0',error:"The service name already exist"});

							}else{



								artistService(myobj).save(function (err, data) {
									if (err) throw err;

									res.json({status:'1',message:"Service added successfully"});
									
								});
							}

						});

						
	
			
		});

	}else{

		artistService.findOne({'title':req.body.title,artistId:artistId,_id: {'$ne':req.body.type}}).exec(function(err,data) {

			if(data){

				res.json({status:'0',error:"The service name already exist"});

			}else{

				artistService.update({_id:req.body.type}, 
	                {$set: myobj},
	                function(err, docs){
	                res.json({status:'1',message:"Service updated successfully"});

	            });
			}

		});


	}


}


exports.registerStep3 = function(req, res){

	res.render('front/reg_business_step3.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session	
	 	});
}


exports.certificate_upload = function(req, res){

	   var form = new formidable.IncomingForm();
	    form.parse(req, function (err, fields, files) {


		      var oldpath = files.file1.path;


		      var imageName = Date.now()+".jpg";
		      var newpath = './public/uploads/certificateImage/'+imageName;
		      fs.rename(oldpath, newpath, function (err) {
		        if (err) throw err;
		      });

		    res.render('front/showimage.ejs', {
					imageName:imageName,
					imageCount: fields.imgCount

	
	 		});
      	    
	        
		});


}

exports.addBackAccount = function(req, res){



	Certificate.findOne().sort([['_id', 'descending']]).limit(1).exec(function(err,userdata) { 
			
			var b = 1;
			if(userdata){

				b = userdata._id+1;
			}


			artistId =req.session.fUser._id;
			img = req.body.img;
            var myData            = {};
			myData.certificateCount = user.certificateCount;
			if(img){

				myData.certificateCount = Number(user.certificateCount)+(img.length);
			}
			myData.bio = '';
			if(req.body.about){

				myData.bio = req.body.about;
			}

            myData.isDocument = 3;
            myData.bankStatus = 1;
            User.update({_id:artistId}, 
            {$set: myData},
            function(err, docs){

            });

             bankDetail.find().sort([['_id', 'descending']]).limit(1).exec(function(err, bankdata) {  

			                 
                  var newbank    = new bankDetail({artistId:artistId,accountId:req.body.accountId});

                        if(bankdata.length > 0){
                            newbank._id = bankdata[0]._id+1;
                        }
                        		
                    newbank.save(function(err) {  });
                    
            });

		if(img){	

			for (var i = 0; i < img.length; i++) {

				id = b+i;
				var data =[{_id: id,certificateImage:img[i],artistId:artistId}]; 
				Certificate.insertMany(data,function(err,my) {
						                    
				});		
			};
		}

		if(req.session.fUser.businessType=="business"){
	    
	    	res.redirect('/staffManagement?type=first');
		
		}else{

			res.redirect('/artistDashboard');
		}



	});	


}
exports.skipstep3 = function(req, res){

	console.log(req.session.fUser._id);

	artistId = req.session.fUser._id;
	if(artistId){

	    User.update({_id:artistId}, 
	    {$set: {isDocument:3}},
	    function(err, docs){

	    });
	    
	   	if(req.session.fUser.businessType=="business"){
	    
	    	res.redirect('/staffManagement?type=first');
		
		}else{

			res.redirect('/artistDashboard');
		}

	}

}

