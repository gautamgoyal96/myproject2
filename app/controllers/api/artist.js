var User = require('../../models/front/home.js');//it user for table and coulamn information
var businessHour = require('../../models/front/businesshours.js');
var services = require('../../models/admin/category_model.js');
var subService = require('../../models/admin/sub_category_model.js');
var artistservices = require('../../models/front/artistService.js');
var artistMainService = require('../../models/front/artistMainService.js');
var artistSubService = require('../../models/front/artistSubService.js');
var artistCertificate = require('../../models/front/artistCertificate.js');
var feed = require('../../models/front/feed.js');
var tag = require('../../models/front/tag.js');
var followUnfollow = require('../../models/front/followersFollowing.js');
var likes = require('../../models/front/like.js');
var bankDetail = require('../../models/front/bankDetail_model.js');
var formidable = require('formidable');//it user for get form or post data by http
var fs = require('fs');
var dateFormat = require('dateformat');
var bodyParser = require('body-parser')
var bcrypt = require('bcrypt-nodejs');
var accountSid = 'ACaffcfdead968e5413e801e5e0ebee02c';
var authToken = "b6decf9d17f523d047e5b75064b788e0";
var client = require('twilio')(accountSid, authToken);
var multiparty = require('multiparty');
var stripe = require('stripe')('sk_test_8yF1axC0w9jPs6rlmAK3LQh1');
var async = require('async');
var bookingService  = require('../../models/front/bookingService.js');
var booking     = require('../../models/front/booking.js');
var staff     = require('../../models/front/staff_model.js');
var staffService      = require('../../models/front/staffService.js');
var validUrl = require('valid-url');
var escapere = require('escape-regexp');
var lodash = require('lodash');
var notify = require('../../../lib/notification.js');
var addNotification     = require('../../models/front/notification.js');
/*var ffmpeg = require('ffmpeg');
*/exports.artistInfo = function(req, res) {
	var baseUrl =  req.protocol + '://'+req.headers['host'];
        User.aggregate([
        { $match : { _id :Number(authData._id) } },
         {   "$project": {     
            "address":1, 
            "address2":1, 
            "city":1, 
            "state": 1,   
            "country": 1,
            "country": 1,
            "businesspostalCode": 1,
            "bankStatus": 1,   
            "bio": 1,   
            "serviceType": 1,  
            "radius": 1,  
            "outCallpreprationTime": 1,  
            "inCallpreprationTime": 1,
            "longitude": 1,  
            "latitude": 1,  
            "location": 1    
        }}, 
        { "$lookup": {     
                "from": "busineshours",     
                "localField": "_id",     
                "foreignField":"artistId",     
                "as": "businessHour"   
        }},
         { "$lookup": {     
                "from": "artistservices",     
                "localField": "_id",     
                "foreignField":"artistId",     
                "as": "artistService"   
        }}
       
        ],function(err,data){
           
          res.json({status: "success",message: 'successfully',artistRecord:data});
        });
}
/*api for add business hours by artist*/
exports.businessHours = function(req, res) {
  timeSl = JSON.parse(req.body.businessHour);
  jsArr = []
  businessHour.findOne({'artistId':authData._id},function(err, data) {
    if(data){
      businessHour.deleteMany({'artistId':authData._id}, function(err, results){
            businessHour.find().sort([
                ['_id', 'descending']
            ]).limit(1).exec(function(err, userdata) {
                var autoId = 1;

                if (userdata.length > 0) {
                    autoId = userdata[0]._id + 1;

                }

                for (var i = 0; i < timeSl.length; i++) {
                    inc = autoId + i;

                    jsArr.push({
                        _id: inc,
                        day: Number(timeSl[i].day),
                        artistId: Number(authData._id),
                        startTime: timeSl[i].startTime,
                        endTime: timeSl[i].endTime,
                        status: 1
                    });

                }

                businessHour.insertMany(jsArr);
                res.json({
                    'status': "success",
                    "message": jsArr
                });
               return;
            });

      });
    }else{
           businessHour.find().sort([
                ['_id', 'descending']
            ]).limit(1).exec(function(err, userdata) {
                var autoId = 1;

                if (userdata.length > 0) {
                    autoId = userdata[0]._id + 1;

                }

                for (var i = 0; i < timeSl.length; i++) {
                    inc = autoId + i;

                    jsArr.push({
                        _id: inc,
                        day: Number(timeSl[i].day),
                        artistId: Number(authData._id),
                        startTime: timeSl[i].startTime,
                        endTime: timeSl[i].endTime,
                        status: 1
                    });

                }

                businessHour.insertMany(jsArr);
                res.json({
                    'status': "success",
                    "message": jsArr
                });
               return;
            });
    }

  });


}

/*api is use for update rang by artist*/

exports.updateRange = function(req,res){

	User.update({'_id':authData._id},
    {
      $set: {
        radius:req.body.radius,
        serviceType: req.body.serviceType,
        inCallpreprationTime:req.body.inCallpreprationTime,
        outCallpreprationTime:req.body.outCallpreprationTime,
        isDocument: 1
      }
    },	function(err, docs){
	if(err) res.json(err);
	if(docs.ok ==1){
     res.json({'status':"success","message":'Record updated successfully'});
	}
/*	console.log(docs);
*/	}); 
}
exports.allCategory = function(req, res) {
    var baseUrl = req.protocol + '://' + req.headers['host'];

    async.parallel([

            function(callback) {
                var query = services.find({
                    'status': 1,
                    'deleteStatus': 1
                })
                query.exec(function(err, ser) {
                    if (err) {
                        callback(err);
                    }

                    callback(null, ser);
                });
            },
            function(callback) {
                var query = subService.find({
                    'status': 1,
                    'deleteStatus': 1
                })
                query.exec(function(err, sub) {
                    if (err) {
                        callback(err);
                    }

                    callback(null, sub);
                });
            }

        ],


        function(err, results) {
            if (results[0]) {
                serArr = [];

                for (var i = 0; i < results[0].length; i++) {
                    subArr = [];
                    for (var j = 0; j < results[1].length; j++) {
                        if (results[0][i]._id == results[1][j].serviceId) {

                            subArr.push({
                                _id: results[1][j]._id,
                                serviceId: results[1][j].serviceId,
                                image: baseUrl + "/uploads/subservice/" + results[1][j].image,
                                title: results[1][j].title
                            });
                        }
                    }
                    serArr.push({
                        _id: results[0][i]._id,
                        title: results[0][i].title,
                        subService: subArr
                    });
                }


                artistservices.find({
                    'artistId': authData._id,
                    'status': 1,
                    'deleteStatus': 1
                }, {
                    "_id": 1,
                    "serviceId": 1,
                    "subserviceId": 1,
                    "completionTime": 1,
                    "outCallPrice": 1,
                    "inCallPrice": 1,
                    "description": 1,
                    "title": 1
                }, function(err, result) {
                    res.json({
                        status: "success",
                        message: 'ok',
                        serviceList: serArr,
                        artistService: result
                    });
                });


            } else {
                res.json({
                    status: "fail",
                    message: 'No record found.'
                });
                return;
            }

        });

}
exports.allCategoryOld = function(req, res) {
   var baseUrl =  req.protocol + '://'+req.headers['host'];
	services.aggregate([
                    {
                        $match: {
                            status:String(1),
                            deleteStatus:1
                        }
                    },
                       {
                        $lookup: {
                            from: "subservices",
                            localField: "_id",
                            foreignField: "serviceId",
                            as: "subService"
                        }
                    },
          
              { 
	   		"$project": {
		        "_id": 1,
		        "title": 1,
		        "subService._id":1,
		        "subService.serviceId":1,
		        "subService.title":1,
		        "subService.image":1
		        
	         }
		}       

            ],function(err,data){
			  if (data.length==0){
					res.json({status:"fail",message:'No record found'});
				}else{ 
					
				   if(data){ 
					for (i = 0 ; i < data.length ; i++) {
						 	if(data[i].subService.length){ 
							    
								for (j = 0 ; j < data[i].subService.length ; j++) {
									if(data[i].subService[j].image){ 
									 data[i].subService[j].image = baseUrl+"/uploads/subservice/"+ data[i].subService[j].image;

									}
								}
							
							}
						}
		     		}
		             artistservices.find({'artistId':authData._id,'status':1,'deleteStatus':1},{ "_id": 1,"serviceId":1,"subserviceId": 1,"completionTime":1,"outCallPrice":1,"inCallPrice":1,"description":1,"title":1}, function(err,result) {
                      res.json({status:"success",message:'ok',serviceList:data,artistService:result});
                     });
		     		
				}
      
	});
}
exports.subService = function(req, res) {
	
	subService.find({'serviceId':req.body.serviceId,'status':1,'deleteStatus':1}, function(err, data)
	 {
		if (data.length==0){
			res.json({status:"success",message:'No record found'});
		}else{ 
     		res.json({status:"success",message:'ok',subServices:data});
		}
	});

	/* subService.aggregate([
    { $lookup:
       {
         from:'services',
         localField: 'serviceId',
         foreignField: '_id',
         as: 'serviceDetail'
       }
     }
    ], function(err, res) {
    if (err) throw err;
    console.log(JSON.stringify(res));
   
  });*/
}

/*api for add artist service*/
exports.addArtistService = function(req, res){
        artService = JSON.parse(req.body.artistService);
        jsArr = []
        serviceArr =[]
        subServiceArr =[]
        var lookup = {};
        var lookup1 = {};
        var result = [];
        var result1 = [];
        artistservices.deleteMany({'artistId':authData._id}, function(err, results){ 
            User.update({_id:authData._id},{$set:{serviceCount:'0'}},function(err, docs) {});
            /*console.log('delete artist service');*/
        });
        artistMainService.deleteMany({'artistId':authData._id}, function(err, results){ console.log('main service data'); });
        artistSubService.deleteMany({'artistId':authData._id}, function(err, results){  console.log('subService data');});
          for (var i = 0; i < artService.length; i++) {
                var name = artService[i].serviceId;
                var subId = artService[i].subserviceId;
                
                  if (!(name in lookup)) {
                    lookup[name] = 1;
                    result.push({serviceId:name,serviceName:artService[i].serviceName});
                  }
                  if (!(subId in lookup1)) {
                    lookup1[subId] = 1;
                    result1.push({serviceId:artService[i].serviceId,subserviceId:subId,subserviceName:artService[i].subserviceName});
                  }
            }
                async.parallel([

       function(callback) {
            var query = artistMainService.find().sort([['_id', 'descending']]).limit(1)
            query.exec(function(err, ser) {
                if (err) {
                    callback(err);
                }
                var autoId = 1;

                if (ser.length > 0) {
                    autoId = ser[0]._id + 1;

                }

                for (var i = 0; i < result.length; i++) {
                    inc = autoId + i;

                    serviceArr.push({
                        _id: inc,
                        artistId: Number(authData._id),
                        serviceId: result[i].serviceId,
                        serviceName: result[i].serviceName
                        
                    });

                }
                if(serviceArr){callback(null, ser);} 
                
            });
        },
        function(callback) {
            var query = artistSubService.find().sort([['_id', 'descending']
            ]).limit(1)
            query.exec(function(err, sub) {
                if (err) {
                    callback(err);
                }
                var autoId = 1;

                if (sub.length > 0) {
                    autoId = sub[0]._id + 1;

                }

                for (var i = 0; i < result1.length; i++) {
                    inc = autoId + i;

                    subServiceArr.push({
                        _id: inc,
                        artistId: Number(authData._id),
                        serviceId: result1[i].serviceId,
                        subServiceId: result1[i].subserviceId,
                        subServiceName: result1[i].subserviceName
                        
                    });

                }
                if(subServiceArr){callback(null, sub);} 
                
            });
        },
        function(callback) {
            var query = artistservices.find().sort([['_id', 'descending']]).limit(1)
            query.exec(function(err, s) {
                if (err) {
                    callback(err);
                }
                var autoId = 1;
                if (s.length > 0) {
                    autoId = s[0]._id + 1;

                }
                for (var i = 0; i < artService.length; i++) {
                    inc = autoId + i;

                    jsArr.push({
                        _id: inc,
                        artistId: Number(authData._id),
                        serviceId: artService[i].serviceId,
                        subserviceId: artService[i].subserviceId,
                        title: artService[i].title,
                        description: artService[i].description,
                        inCallPrice: artService[i].inCallPrice,
                        outCallPrice: artService[i].outCallPrice,
                        completionTime:artService[i].completionTime
                    });

                }
                if(jsArr){callback(null, s);} 
                
            });
        },
     
    ],
     
    //Compute all results
    function(err, results) {
        artistMainService.insertMany(serviceArr);
        artistSubService.insertMany(subServiceArr);
       // artistservices.insertMany(jsArr);
        artistservices.insertMany(jsArr,function(err,result){
           artistservices.findOne({'artistId':authData._id}).count().exec(function(err,ct) {
                      User.update({ _id:authData._id},{$set:{serviceCount:ct}},function(err, docs) {});
           });

        });
        res.json({
        'status': "success",
        "message": 'Artist added service successfully',
        "artistServices": jsArr
        });
        return;
    });
    

}
exports.addArtistCertificate = function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){
        var baseUrl =  req.protocol + '://'+req.headers['host'];  
        artistId = authData._id;
    	var imageName = "";
         if(fields.bio){
         User.update({_id: artistId},{$set:{bio:fields.bio}}, function(err, docs) {});

        }
        if(files.certificateImage){

            var oldpath = files.certificateImage.path;
            var imageName = Date.now()+".jpg";
            var newpath = './public/uploads/certificateImage/'+imageName;
            fs.rename(oldpath, newpath, function (err) {
              if (err) throw err;
            });

		    autoId = 1;
    		artistCertificate.find().sort([['_id','descending']]).limit(1).exec(function(err,result) {
    			var day = dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss");
    			var addNew = new artistCertificate({artistId:artistId,certificateImage:imageName});
    			if(err) throw err;
    			if(result.length>0){
    		        addNew._id = result[0]._id+1;
    			}
    			count = Number(authData.certificateCount) + 1;
    		    User.update({
                    _id: artistId
                }, {
                    $set: {
                        isDocument: 3,
                        certificateCount: count
                    }
                },
                function(err, docs) {});
    			addNew.save(function(err,data) {
    			if (err){
    				res.json({status:"fail",message:'Please send all the required info and  try again'});
    				return;
    			}else{
    				data.certificateImage = baseUrl+"/uploads/certificateImage/"+data.certificateImage;
    				res.json({status:"success",message:'Certificate added successfully',certificate:addNew});
    				return;
    			}
    			});
    		});
       } 
	});
}
exports.skipPage = function(req,res){
    if(req.body.artistId){
      User.update({_id:Number(req.body.artistId)},{$set: {isDocument:3}},function(err, docs) {
       res.json({status:"success",message:'ok'});
      return;
      });
   }else{
     res.json({status:"fail",message:'artist Id is required.'});
      return;
   }

}
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}
exports.addTag = function(req, res, next) {
    var form = new multiparty.Form();
    var fs = require('fs');
    var moment = require('moment');
    var crd = moment().format();
    fields = {};
    files = {};
    oldTag = [];
    newTag = [];
    tagInfo = [];
    tagId = {};
    form.parse(req, function(err, fields1, files1) {
        fields = fields1;  
        files = files1;  
        if (fields.tag[0]) {
            tags = fields.tag;
            if (tags[0]) {
                var ser = tags[0].split(",");
                var unique = ser.map(function(n) {
                    return n;
                });
            }
            var tagInfo = unique.filter( onlyUnique ); 
            avlTag = [];

            tag.find().sort([
                ['_id', 'descending']
            ]).limit(1).exec(function(err, userdata) {
                var autoIdT = 1;

                if (userdata.length > 0) {
                    autoIdT = userdata[0]._id + 1;

                }

                search = {
                    $in: tagInfo
                };
                jsArrT = [];
                a = 0;

                tag.find({
                    'tag': search
                }, {
                    '_id': 1,
                    'tag': 1,
                    'tagCount': 1
                }).exec(function(err, tgdata) {
                    if (tgdata.length > 0) {
                        count = 0;
                        tgdata.forEach(function(rs) {
                            oldTag.push(rs._id);
                            avlTag.push(rs.tag);
                            count = rs.tagCount + 1;
                            tag.update({
                                _id: rs._id
                            }, {
                                $set: {
                                    'tagCount': count
                                }
                            }, function(err, upd) {});
                        });

                    } else {


                    }

                    inc = autoIdT + a;
                    tagInfo = tagInfo.filter(function(val) {
                        return avlTag.indexOf(val) == -1;
                    });
                    for (var t = 0; t < tagInfo.length; t++) {
                        incT = autoIdT + t;
                        newTag.push(incT);
                        jsArrT.push({
                            _id: incT,
                            userId: Number(fields.userId),
                            tag: tagInfo[t],
                            type: 'hastag',
                            tagCount: 1,
                            crd: crd,
                            upd: crd
                        });

                    }

                    if (jsArrT.length > 0) {
                        tag.insertMany(jsArrT);

                    }

                    var c = oldTag.concat(newTag);
                    tagId = c;
                    req.body.userId = Number(fields.userId);
                    req.body.type ='newsFeed'
                    next();
                });
            });


        } else {
            tagId = '';
            next();
        }

    });

}
exports.addFeed = function(req, res) {



    var fs = require('fs');
    var moment = require('moment');
    var crd = moment().format();
    if (fields.userId) {
        var userId = Number(fields.userId);

    } else {
        var userId = authData._id;
    }
    if (fields.city) {
        var city = fields.city;

    } else {
        var city = '';
    }
    if (fields.country) {
        var country = fields.country;

    } else {
        var country = '';

    }

    var tagData = fields.tagData ? fields.tagData :'';

    count = Number(authData.postCount) + 1;

    var baseUrl = req.protocol + '://' + req.headers['host'];
    jsArr = []
    thumbArr = []
    stor = [];
    oldTag = [];
    newTag = [];
    tagInfo = [];


    if (files.feed) {

        var imgArray = files.feed;
        for (var i = 0; i < imgArray.length; i++) {

            var newPath = './public/uploads/feeds/';

            var singleImg = imgArray[i];
            nmFeed = Date.now() + i;
            if (imgArray[i].headers['content-type'] == 'video/mp4') {
                nm = nmFeed + '.mp4';
                feedUrl = nm;
                thumb = nmFeed + '.jpg';

            } else {
                nm = Date.now() + i + '.jpg';
                feedUrl = nm;
                thumb = '';
            }

            newPath += nm;

            videopath = './public/uploads/feeds/' + nm;
            readAndWriteFile(singleImg, newPath);

            jsArr.push({
                feedPost: feedUrl,
                videoThumb: thumb,

            });

        }

    }
    if (files.videoThumb) {

        var imgArray1 = files.videoThumb;
        for (var i = 0; i < imgArray1.length; i++) {
            var newPath = './public/uploads/feeds/';
            var singleImg = imgArray1[i];
            nmFeed = Date.now() + i;
            nm = Date.now() + i + '.jpg';
            feedUrl = nm;
            newPath += nm;

            videopath = './public/uploads/feeds/' + nm;
            readAndWriteFile2(singleImg, newPath);
            thumbArr.push({
                videoThumb: feedUrl
            });

        }

    }
    if (thumbArr.length > 0) {
        for (var k = 0; k < jsArr.length; k++) {

            for (var j = 0; j < thumbArr.length; j++) {
                if (k == j) {
                    stor.push({
                        feedPost: jsArr[k].feedPost,
                        videoThumb: thumbArr[j].videoThumb

                    });
                }

            }


        }
    } else {
        for (var i = 0; i < jsArr.length; i++) {
            stor.push({
                feedPost: jsArr[i].feedPost,
                videoThumb: ''
            });
        }

    }
    if (fields.feed) {
        ff = fields.feed;
        feeds = [];
    } else {
        feeds = stor;
    }
    if (!tagId) {
        tagId = '';
    }
    var addNew = {
        userId: userId,
        feedType: fields.feedType,
        feedData: feeds,
        caption: fields.caption,
        city: city,
        country: country,
        location: fields.location,
        tagId: tagId,
        serviceTagId: fields.serviceTagId,
        peopleTag: fields.peopleTag ? fields.peopleTag[0] ? JSON.parse(fields.peopleTag) : [] : [],
        crd: crd,
        upd: crd

    };
    autoId = 1; 
    feed.find().sort([
        ['_id', 'descending']
    ]).limit(1).exec(function(err, result) {

        if (result.length > 0) {
            autoId = result[0]._id + 1;
            addNew._id = autoId;
        }
        if(JSON.parse(tagData)){
            t = JSON.parse(tagData);
            t.push(userId);
            var appUser = require("./user");  
           req.body.notifincationType = '16';
           req.body.notifyId   = autoId;
           req.body.notifyType = 'social'; 
           req.body.userId = userId; 
           folInfo.flUser = t;

           appUser.sendMultiple(req,res); 
        }

        feed(addNew).save(function(err, data) {
            if (err) {
                res.json({
                    status: "fail",
                    // message: 'Please send all the required info and  try again'
                    message: err
                });
                return;
            } else {
                if(fields.feedType != 'text'){
                    User.update({ _id: userId},{$set:{postCount: count}},function(err, docs) {});
                  }
                feed.findOne({
                    '_id': autoId
                }).exec(function(err, data) {
                    if (data) {

                    	followUnfollow.find({'userId':Number(userId),'status':1}).sort([['_id', 'ascending']]).exec(function(err, followData) {
							folInfo.flUser  = [];
					        if(followData){

					             a = [];
					             a= followData.map(a => a.followerId);
					             a.push(Number(fields.userId));         
					             folInfo.flUser =a ;

					        }            
	        				if(folInfo.flUser){
                               /*code for notification*/  
                                 var appUser = require("./user");  
                                   req.body.notifincationType = '7';
                                   req.body.notifyId   = autoId;
                                   req.body.notifyType = 'social'; 
                                   req.body.userId = userId; 
                                   appUser.sendMultiple(req,res); 
                                             
                                /*end notification code*/   
                          	} 

                        }); 
                        res.json({status: "success",message: 'Feed added successfully',feeds:data});
                    }
                })

            }

        });

    });

}

exports.addFeedOld = function(req, res) {

    var form = new multiparty.Form();
    var fs = require('fs');
    var moment = require('moment');
     var crd =  moment().format();
    form.parse(req, function(err, fields, files) {
        if(fields.userId){
         var userId = Number(fields.userId);

        } else{
            var userId = authData._id;
        }
        if(fields.city){
          var city =fields.city;

        } else{
           var city ='';
       }
       if(fields.country){
           var country =fields.country;

        } else{
             var country ='';

        }
        count = Number(authData.postCount) + 1;

        var baseUrl = req.protocol + '://' + req.headers['host'];
        jsArr = []
        thumbArr = []
        stor = [];
        oldTag = [];
        newTag = [];
        tagInfo = [];
        if(fields.tag){
            tags = fields.tag;
         if(tags[0]){
            var ser = tags[0].split(",");
            var tagInfo = ser.map(function(n) {
                return n;
            });
         }

            avlTag = [];
           
            tag.find().sort([
                ['_id', 'descending']
            ]).limit(1).exec(function(err, userdata) {
                var autoIdT = 1;

                if (userdata.length > 0) {
                    autoIdT = userdata[0]._id + 1;

                }

                search = {
                    $in: tagInfo
                };
                jsArrT = [];
                a = 0;

                tag.find({
                    'tag': search
                }, {
                    '_id': 1,
                    'tag': 1,
                    'tagCount':1
                }).exec(function(err, tgdata) {
                    if (tgdata.length > 0) {
                        count = 0;
                        tgdata.forEach(function(rs) {
                            oldTag.push(rs._id);
                            avlTag.push(rs.tag);
                            count = rs.tagCount+1;
                            tag.update({ _id:rs._id },{ $set:{'tagCount':count}},function(err,upd) {}); 
                        });

                    } else {


                    }
                    inc = autoIdT + a;
                    tagInfo = tagInfo.filter(function(val) {
                        return avlTag.indexOf(val) == -1;
                    });
                    for (var t = 0; t < tagInfo.length; t++) {
                        incT = autoIdT + t;
                        newTag.push(incT);
                        jsArrT.push({
                            _id: incT,
                            userId: Number(fields.userId),
                            tag: tagInfo[t],
                            type: 'hastag',
                            tagCount:1,
                            crd:crd,
                            upd:crd
                        });

                    }
                   
                    if (jsArrT.length > 0) {
                        tag.insertMany(jsArrT);

                    }

                });

            });

         }
        if (files.feed) {

            var imgArray = files.feed;
            for (var i = 0; i < imgArray.length; i++) {

                var newPath = './public/uploads/feeds/';

                var singleImg = imgArray[i];
                nmFeed = Date.now() + i;
                if (imgArray[i].headers['content-type'] == 'video/mp4') {
                    nm = nmFeed + '.mp4';
                    feedUrl = nm;
                    thumb = nmFeed + '.jpg';

                } else {
                    nm = Date.now() + i + '.jpg';
                    feedUrl = nm;
                    thumb = '';
                }

                newPath += nm;

                videopath = './public/uploads/feeds/' + nm;
                readAndWriteFile(singleImg, newPath);

                jsArr.push({
                    feedPost: feedUrl,
                    videoThumb: thumb,

                });

            }

        }
        /*else{
                      jsArr.push({
                        feedPost: fields.feed
                      });
                }*/
        if (files.videoThumb) {

            var imgArray1 = files.videoThumb;
            for (var i = 0; i < imgArray1.length; i++) {
                var newPath = './public/uploads/feeds/';
                var singleImg = imgArray1[i];
                nmFeed = Date.now() + i;
                nm = Date.now() + i + '.jpg';
                feedUrl = nm;
                newPath += nm;

                videopath = './public/uploads/feeds/' + nm;
                readAndWriteFile2(singleImg, newPath);
                thumbArr.push({
                    videoThumb: feedUrl
                });

            }

        }
        if (thumbArr.length > 0) {
            for (var k = 0; k < jsArr.length; k++) {

                for (var j = 0; j < thumbArr.length; j++) {
                    //console.log(thumbArr[j].videoThumb);
                    if (k == j) {
                        stor.push({
                            feedPost: jsArr[k].feedPost,
                            videoThumb: thumbArr[j].videoThumb

                        });
                    }

                }


            }
        } else {
            for (var i = 0; i < jsArr.length; i++) {
                stor.push({
                    feedPost: jsArr[i].feedPost,
                    videoThumb: ''
                });
            }

        }
        if (fields.feed) {
            ff = fields.feed;
            feeds = [];



        } else {
            feeds = stor;
        }
        var tagId ='';
        var c=oldTag.concat(newTag);
        if(c){
            tagId = c;

        }
        var addNew = {
            userId: userId,
            feedType: fields.feedType,
            feedData: feeds,
            caption: fields.caption,
            city: city,
            country:country,
            location: fields.location,
            tagId: tagId,
            serviceTagId: fields.serviceTagId,
            crd: crd,
            upd: crd
        
        };

        autoId = 1;
        feed.find().sort([
            ['_id', 'descending']
        ]).limit(1).exec(function(err, result) {

            if (result.length > 0) {
                autoId = result[0]._id + 1;
                addNew._id = autoId;
            }

            feed(addNew).save(function(err, data) {
                if (err) {
                    res.json({
                        status: "fail",
                        // message: 'Please send all the required info and  try again'
                        message: err
                    });
                    return;
                } else {

                    User.update({
                            _id: userId
                        }, {
                            $set: {
                                postCount: count
                            }
                        },
                        function(err, docs) {});
                    feed.findOne({
                        '_id': autoId
                    }).exec(function(err, data) {

                        if (data) {



                            res.json({
                                status: "success",
                                message: 'Feed added successfully',
                                feeds: data
                            });

                        }
                    })



                }



            });


        });


    });


}

function readAndWriteFile(singleImg, newPath) {

        fs.readFile(singleImg.path , function(err,data) {
            fs.writeFile(newPath,data, function(err) {
                if (err) console.log('ERRRRRR!! :'+err);
                console.log('Fitxer: '+singleImg.originalFilename +' - '+ newPath);
            })
        })
}
function readAndWriteFile2(singleImg, newPath) {

        fs.readFile(singleImg.path , function(err,data) {
            fs.writeFile(newPath,data, function(err) {
                if (err) console.log('ERRRRRR!! :'+err);
                console.log('Fitxer: '+singleImg.originalFilename +' - '+ newPath);
            })
        })
}
exports.showArtist = function(req,res){
  var Value_match = escapere(req.body.search);
  if(req.body.distance){distance=(req.body.distance)*1609.34;}else{distance=8046.72;}
   User.aggregate([

    { "$geoNear": {
        "near": {
            "type": "Point",
            "coordinates": [ parseFloat(req.body.latitude),parseFloat(req.body.longitude) ]
        },

         maxDistance: distance,
        "spherical": true,
        "distanceField": "distance",
         distanceMultiplier: 1/1609.344 // calculate distance in miles
    }

},
  { $match : { businessType:'independent',userName:{$regex:Value_match}}},
   
    { 
	   		"$project": {
		        "_id": 1,
		        "userName": 1,
		        "firstName": 1,
		        "lastName":1,
		        "email":1,
		        "profileImage":1
		        
	         }
		} 
    
],function(err, data){
	
	if(data.length){
		for (i = 0 ; i < data.length ; i++) {
			if(data[i].profileImage){ 
				data[i].profileImage = req.headers['host']+"/uploads/profile/"+data[i].profileImage;
			}
		}
       res.json({status: "successs",message: 'ok',artistList: data});
    }else if(data.length==0){
	 	User.aggregate([
		{ "$geoNear": {
		"near": {
		    "type": "Point",
		    "coordinates": [ parseFloat(req.body.latitude),parseFloat(req.body.longitude) ]
		},

		 maxDistance: distance,
		"spherical": true,
		"distanceField": "distance",
		 distanceMultiplier: 1/1609.344 // calculate distance in miles
		}

		},
		{ $match : { businessType:'independent',email:{$regex:Value_match}}},

		{ 
				"$project": {
		        "_id": 1,
		        "userName": 1,
		        "firstName": 1,
		        "lastName":1,
		        "email":1,
		        "profileImage":1
		        
		     }
		} 

		],function(err,data){
			if(data.length){
				for (i = 0 ; i < data.length ; i++) {
					if(data[i].profileImage){ 
						data[i].profileImage = req.headers['host']+"/uploads/profile/"+data[i].profileImage;
					}
				}
				res.json({status: "successs",message: 'ok',artistList: data});
			}

		});
    	
    }else{
    	res.json({status: "fail",message: 'No record found',artistList: data});
    }
     
     

   });

}
exports.updateRecord = function(req,res){
	
 if(req.body){
 	User.update({ _id:authData._id },{ $set:req.body},function(err, result) {
 		
       res.json({status:"success",message:'record update successfully'});
 	 });

 }
}
exports.getAllCertificate = function(req, res) {
   var baseUrl =  req.protocol + '://'+req.headers['host'];
   artistId = req.body.artistId;
   type = req.body.type;
   where ={};
   if(artistId == ''){
        res.json({status:"fail",message:'Artist id is required.'});
        return;
    }
   if(type == ''){
        res.json({status:"fail",message:'Type id is required.'});
        return;
    }
   where['artistId'] = Number(artistId);
   if(type == 'user'){
     where['status'] =1;

   }


   artistCertificate.find(where, function(err, data)
   {
    if (data.length==0){
      res.json({status:"sucess",message:'No record found'});
    }else{ 

        for (i = 0 ; i < data.length ; i++) {
           
          if(data[i].certificateImage){ 
            data[i].certificateImage = baseUrl+"/uploads/certificateImage/"+data[i].certificateImage;
          
          }
        }
      res.json({status:"success",message:'ok',allCertificate:data});
    }
  });
}
exports.deleteCertificate = function(req,res){
    artistId = req.body.artistId;
    certificateId = req.body.certificateId;
    if(artistId == ''){
        res.json({status:"fail",message:'Artist id is required.'});
        return;
    }
    if(certificateId == ''){
        res.json({status:"fail",message:'Certificate id is required.'});
        return;
    }
    if(req.body.certificateId){
        artistCertificate.deleteOne({'_id':certificateId,'artistId':artistId}, function(err, results){
        if(err) throw err;
        artistCertificate.find({'artistId':artistId}).count().exec(function(err,count){ 
              User.update({_id: artistId},{$set:{certificateCount: count}},function(err, docs) {});
           });
        res.json({status:"success",message: 'Certificate delete successfully'});
        });
    }else{
        res.json({status:"fail",message:'certificateId is required.'});
    }

}
exports.stripeaddAccount = function(req, res) {


    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var country = req.body.country;
    var currency = req.body.currency;
    var sort_code = req.body.routingNumber;
    var accountNo = req.body.accountNo;
    var accountHolderType = 'individual';

/*   country = 'US';
    currency = 'usd';
    holderName = 'Elijah Wilson';
    accountHolderType = 'individual';
    routingNumber = '110000000';
    accountNo = '000123456789';
    postal_code = '90046';
    ssnLast = '0000';*/

    stripe.accounts.create({
          country :  "GB",
          type : 'custom',
          external_account: {
            object:'bank_account',
            country: country,
            currency: currency,
            sort_code: sort_code,
            account_number: accountNo
          },
          legal_entity:{

            first_name :firstName,
            last_name : lastName,
            type : accountHolderType

          },
          tos_acceptance:{

            date:Math.floor(Date.now() /1000),
            ip: req.connection.remoteAddress

           },
        }, function(err, token) {

            if(err){

                switch (err.type) {
                      case 'StripeCardError':

                      res.json({'status':'fail','message': err.message});
                        // A declined card error
                        // => e.g. "Your card's expiration year is invalid."
                        break;
                      case 'RateLimitError':

                      res.json({'status':'fail','message': err.message});
                        // Too many requests made to the API too quickly
                        break;
                      case 'StripeInvalidRequestError':

                      res.json({'status':'fail','message': err.message});

                        // Invalid parameters were supplied to Stripe's API
                        break;
                      case 'StripeAPIError':

                      res.json({'status':'fail','message': err.message});

                        // An error occurred internally with Stripe's API
                        break;
                      case 'StripeConnectionError':

                      res.json({'status':'fail','message': err.message});
                        // Some kind of error occurred during the HTTPS communication
                        break;
                      case 'StripeAuthenticationError':

                      res.json({'status':'fail','message': err.message});
                        // You probably used an incorrect API key
                        break;
                      default:

                      res.json({'status':'fail','message': err.message});
                        // Handle any other types of unexpected errors
                        break;
                    }
                }
                    if(token){
                        console.log(token.id);
                        autoId = 1;
                        bankDetail.find().sort([
                            ['_id', 'descending']
                        ]).limit(1).exec(function(err, result) {

                           var addNew = new bankDetail({
                                artistId:authData._id,
                                accountId: token.id
                                             
                            }); 

                            if (result.length > 0) {
                                addNew._id = result[0]._id + 1;
                            }
                            
                           bankDetail(addNew).save(function(err, data) {
                            if (err) {
                            res.json({
                                status: "fail",
                                message: 'Please send all the required info and  try again'
                            });
                            return;
                            } else {

                            User.update({_id:authData._id},{$set:{isDocument: 3,bankStatus:1}},
                            function(err, docs) {});    
                            res.json({
                                status: "success",
                                message: 'successfully'
                               
                            });
                            return;
                            }

                            });             

                      });
                        //res.json({'status':'success','message': token.id});

                        
                    }
    
    });


}

exports.deleteRecord = function(req,res){
    var comment = require('../../models/front/comment.js');
    var story = require('../../models/front/myStory.js');
    if(req.query.contactNo){

    User.findOne({'contactNo':req.query.contactNo},function(err, data) {
        if(data){
          businessHour.deleteMany({'artistId':data._id}, function(err, results){ });
          artistservices.deleteMany({'artistId':data._id}, function(err, results){ });
          artistCertificate.deleteMany({'artistId':data._id}, function(err, results){ });
          bankDetail.deleteMany({'artistId':data._id}, function(err, results){ });
          feed.deleteMany({'userId':data._id}, function(err, results){ });
          User.deleteMany({'_id':data._id}, function(err, results){ });
          booking.deleteMany({'userId':data._id}, function(err, results){ });
          booking.deleteMany({'artistId':data._id}, function(err, results){ });
          bookingService.deleteMany({'userId':data._id}, function(err, results){ });
          bookingService.deleteMany({'artistId':data._id}, function(err, results){ });
          //
           artistMainService.deleteMany({'artistId':data._id}, function(err, results){ });
           artistSubService.deleteMany({'artistId':data._id}, function(err, results){ });
           comment.deleteMany({'postUserId':data._id}, function(err, results){ });
           comment.deleteMany({'commentById':data._id}, function(err, results){ });

           followUnfollow.deleteMany({'followerId':data._id}, function(err, results){ });
           followUnfollow.deleteMany({'userId':data._id}, function(err, results){ });

           likes.deleteMany({'userId':data._id}, function(err, results){ });
           likes.deleteMany({'likeById':data._id}, function(err, results){ });

           story.deleteMany({'userId':data._id}, function(err, results){ });

           staff.deleteMany({'businessId':data._id}, function(err, results){ });
           staffService.deleteMany({'artistId':data._id}, function(err, results){ });

         res.json({status: "success",message: 'Deleted successfully.'});

        }else{

            res.json({status: "success",message: 'Contact no. not exist.'});

        }
    });
}else{
    res.json({status: "success",message: 'Contact no. is required.'});
}

}
exports.getAllFeeds = function(req,res,next){
    
var baseUrl =  req.protocol + '://'+req.headers['host'];
//var Value_match = new RegExp(req.body.feedType);
 var Value_match = {$regex:req.body.feedType};
 var feedSearch ={};
 
 feedSearch['feedType'] =Value_match;
 if(folInfo.flUser.length){
   feedSearch['userId'] ={$in:folInfo.flUser};
 }
 
   feed.aggregate([
   {
     $lookup:
       {
         from: "users",
         localField: "userId",
         foreignField: "_id",
         as: "userInfo"
       }
  },
  {
    $sort: {_id: -1}
  },
   {
     $match:feedSearch
  },
  {   
        "$project":{
            "_id":1,
            "feedType":1,
            "feedData":1,
            "caption":1,
            "city":1,
            "country":1,
            "location":1,
            "likeCount":1,
            "crd":1,
            "commentCount":1,
            "peopleTag":1,
            "userInfo._id":1,
            "userInfo.userName":1,
            "userInfo.firstName":1,
            "userInfo.lastName":1,
            "userInfo.profileImage":1
            

        } 
    }
],function(err, dataLength){
   
    if(dataLength){
        newdata = dataLength.length; 
    }else{
        newdata = 0;
    }
    next();
      


   });

}
exports.finalFeed = function(req, res) {
     search   = {};
     search['likeById'] =  Number(req.body.userId);
     search['type'] =  'feed';
     search['status'] =  1;
      var Value_match = {$regex:req.body.feedType};
      var feedSearch ={};
     feedSearch['feedType'] =Value_match;
     if(folInfo.flUser){
         if(folInfo.flUser.length){
            
           feedSearch['userId'] ={$in:folInfo.flUser};
         }
    }
     feedSearch['feedType'] =Value_match;
    if (req.body.page) {
          page = Number(req.body.page)*Number(req.body.limit);
    } else {
      page=0;
    }
    if (req.body.limit) {
        limit = Number(req.body.limit);
    } else {
        limit=10;
    }
    var baseUrl =  req.protocol + '://'+req.headers['host'];
    //var Value_match = new RegExp(req.body.feedType);
    
    async.parallel([

        function(callback) {
            var query = feed.aggregate([
                {
                    $match:feedSearch 
                },
                
                {
                    "$lookup": {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userInfo"
                    }
                },
                {
                   $sort: {_id: -1}
                },
                { $skip:page },
                { $limit:limit },
                {
                    "$project": {
                        "_id":1,
                        "feedType":1,
                        "feedData":1,
                        "caption":1,
                        "city":1,
                        "country":1,
                        "location":1,
                        "likeCount":1,
                        "crd":1,
                        "commentCount":1,
                        "peopleTag":1,
                        "userId":1,
                        "userInfo._id":1,
                        "userInfo.userName":1,
                        "userInfo.firstName":1,
                        "userInfo.lastName":1,
                        "userInfo.profileImage":1
                    }
                }

            ]);
            query.exec(function(err, g) {
                if (err) {
                    callback(err);
                }
                
                callback(null, g);
            });
        },


     function(callback) {
        var query = likes.find({'likeById':Number(req.body.userId),'type':'feed','status':1},{'_id':1,'feedId':1,'status':1})
        query.exec(function(err, ser1) {
            if (err) {
                callback(err);
            }
           
            callback(null, ser1);
        });
     },
        function(callback) {
        var query = followUnfollow.find({'followerId':req.body.userId,'status':1})
        query.exec(function(err, flow) {
            if (err) {
                callback(err);
            }
 
            callback(null, flow);
        });
    }   

    ],
  
    //Compute all results
    function(err, results) {
               
   if (results[0]) {
     
              
       jsArr = [];
    for (var i = 0; i < results[0].length; i++) {
            var likeFeed = results[1].map(a => a.feedId);
             var flowSt = results[2].map(a => a.userId);
           if(results[1].length>0){
                var a = likeFeed.indexOf(results[0][i]._id);

                if(a >-1){
                     results[0][i].isLike = 1
                }else{
                     results[0][i].isLike = 0
                }
           
        }else{
                results[0][i].isLike = 0

        }
                //
        if(results[2].length>0){
           var b = flowSt.indexOf(results[0][i].userId);

        if(b >-1){
            results[0][i].followerStatus = 1
        }else{
           results[0][i].followerStatus = 0
        }

        }else{
          results[0][i].followerStatus = 0

        }  
        //  
      
    }
    jsArr =results[0] ;   

       if(jsArr){
        var moment = require('moment');
            for (i = 0 ; i < jsArr.length ; i++) {
                jsArr[i].timeElapsed = moment(jsArr[i].crd).fromNow();
               
              
                if(jsArr[i].feedData.length){ 
                                
                    for (j = 0 ; j < jsArr[i].feedData.length ; j++) {
                        if(jsArr[i].feedData[j].feedPost){ 
                         jsArr[i].feedData[j].feedPost = baseUrl+"/uploads/feeds/"+ jsArr[i].feedData[j].feedPost;

                        }
                        if(jsArr[i].feedData[j].videoThumb){ 
                         jsArr[i].feedData[j].videoThumb = baseUrl+"/uploads/feeds/"+ jsArr[i].feedData[j].videoThumb;

                        }
                    }
                            
                }
                
                if(jsArr[i].userInfo[0]){
                     if(jsArr[i].userInfo[0].profileImage){ 
                        jsArr[i].userInfo[0].profileImage = baseUrl+"/uploads/profile/"+jsArr[i].userInfo[0].profileImage;

                      }
               }else{
                 jsArr[i].userInfo[0] =[];
               }
            }
        
       }


         res.json({status: "success",message: 'successfully',AllFeeds: jsArr,total:newdata});
         return;   
    } else {
           res.json({status: "fail",message: 'No record found.',AllFeeds:[] });
           return;
    }
      
 });
}
exports.artistBookingInfo = function(req,res,next){
   newDate = req.body.date;
   bookInfo ={};
   bookInfo =req.body;
   sortData = {};
   //sortData["_id"] = 1;
   //sortData["bookingTime"] = 1;
    sortData["timeCount"] = 1;
   var baseUrl =  req.protocol + '://'+req.headers['host'];
    async.parallel([

        function(callback) {
            var query = booking.aggregate([{
                    $match: {
                        'artistId': Number(req.body.artistId),
                        'bookingDate':newDate
                    }
                },
                { $sort :sortData },
                {
                    "$lookup": {
                       "from": "users",
                       "localField": "userId",
                       "foreignField": "_id",
                       "as": "userDetail"
                    }
                },
               
                {
                    "$project": {
                        "_id": 1,
                        "bookingDate": 1,
                        "bookingTime": 1,
                        "totalPrice": 1,
                        "paymentType": 1,
                        "paymentStatus": 1,
                        "location": 1,
                        "bookStatus": 1,
                        "staffInfo.profileImage":1,
                        "userDetail._id": 1,
                        "userDetail.userName": 1,
                        "userDetail.profileImage":1
                       
                    }
                }

            ]);
            query.exec(function(err, g) {
                if (err) {
                    callback(err);
                }
                callback(null, g);
            });
        },

        function(callback) {
            var query = booking.aggregate([
            { $sort:sortData}, 
            {
                    $match: {
                        'artistId': Number(req.body.artistId),
                        'bookingDate':newDate
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
                  { $unwind : "$bookingData" },
                       {
                            "$lookup": {
                                "from": "artistservices",
                                "localField": "bookingData.artistServiceId",
                                "foreignField": "_id",
                                "as": "artistService"
                            }
                        },
                        {
                            "$lookup": {
                               "from": "users",
                               "localField": "bookingData.staff",
                               "foreignField": "_id",
                               "as": "staffInfo"
                            }
                        },
                         {
                            "$lookup": {
                               "from": "users",
                               "localField": "bookingData.artistId",
                               "foreignField": "_id",
                               "as": "artistInfo"
                            }
                        },
               
                {
                    "$project": {
                        "_id":1,
                        "bookingData._id":1,
                        "bookingData.bookingPrice":1,
                        "bookingData.serviceId":1,
                        "bookingData.subServiceId":1,
                        "bookingData.artistServiceId":1,
                        "bookingData.bookingDate":1,
                        "bookingData.startTime":1,
                        "bookingData.endTime":1,
                        "bookingData.staff":1,
                        "artistService._id":1,
                        "artistService.title":1,
                        "staffInfo._id": 1,
                        "staffInfo.userName": 1,
                        "staffInfo.profileImage":1,
                        "artistInfo._id": 1,
                        "artistInfo.userName": 1,
                        "artistInfo.profileImage":1
                       
                    }
                }

            ]);
            query.exec(function(err, s) {
                if (err) {
                    callback(err);
                }

                callback(null, s);
            });
        },

    ],

    //Compute all results
    function(err, results) {
      
        if (results[0]) {
           for (var i = 0; i < results[0].length; i++) {
                    
                    if(results[0][i].userDetail[0]){
                        if(results[0][i].userDetail[0].profileImage){
                         results[0][i].userDetail[0].profileImage =  baseUrl+"/uploads/profile/"+results[0][i].userDetail[0].profileImage; 
                       }

                    }else{
                      results[0][i].userDetail[0] =[];
                    }
                  
                    jsArr = [];
                    for (var j = 0; j < results[1].length; j++) {
                       
                        if (results[0][i]._id == results[1][j]._id) {
                             
                                if(results[1][j].staffInfo ==0){
                                   
                                   jsArr.push({
                                       _id: results[1][j].bookingData._id,
                                       bookingPrice: results[1][j].bookingData.bookingPrice,
                                       serviceId: results[1][j].bookingData.serviceId,
                                       subServiceId: results[1][j].bookingData.subServiceId,
                                       artistServiceId: results[1][j].bookingData.artistServiceId,
                                       bookingDate: results[1][j].bookingData.bookingDate,
                                       artistServiceId: results[1][j].bookingData.artistServiceId,
                                       startTime: results[1][j].bookingData.startTime,
                                       endTime: results[1][j].bookingData.endTime,
                                       staffId: results[1][j].artistInfo[0]._id,
                                       staffName: results[1][j].artistInfo[0].userName,
                                       staffImage:  baseUrl+"/uploads/profile/"+results[1][j].artistInfo[0].profileImage,
                                       artistServiceName: results[1][j].artistService[0].title
                                    });
                                  
                                }else{
                                     if(results[1][j].staffInfo[0].profileImage){
                                       results[1][j].staffInfo[0].profileImage =  baseUrl+"/uploads/profile/"+results[1][j].staffInfo[0].profileImage; 
                                    }
                                        jsArr.push({
                                           _id: results[1][j].bookingData._id,
                                           bookingPrice: results[1][j].bookingData.bookingPrice,
                                           serviceId: results[1][j].bookingData.serviceId,
                                           subServiceId: results[1][j].bookingData.subServiceId,
                                           artistServiceId: results[1][j].bookingData.artistServiceId,
                                           bookingDate: results[1][j].bookingData.bookingDate,
                                           artistServiceId: results[1][j].bookingData.artistServiceId,
                                           startTime: results[1][j].bookingData.startTime,
                                           endTime: results[1][j].bookingData.endTime,
                                           staffId: results[1][j].bookingData.staff,
                                           staffName: results[1][j].staffInfo[0].userName,
                                           staffImage: results[1][j].staffInfo[0].profileImage,
                                           artistServiceName: results[1][j].artistService[0].title
                                        });
                                }
                               


                        }
                    }
                    results[0][i].bookingInfo = jsArr;
            }

        } 
        bookInfo = results;
        next(); 
        
        
    });


}
exports.artistFreeSlot = function(req, res) {
    
    var baseUrl =  req.protocol + '://'+req.headers['host'];
    if (req.body.artistId) {
        if(dateTime){
              curentTime =    parseTime(timeConvert(dateTime));
        }else{
              curentTime =    parseTime(timeConvert(req.body.currentTime));
        }
        console.log(dateTime);
        datae = {};
        datae['artistId'] = req.body.artistId;
        datae['day'] = req.body.day;
        newDate = req.body.date;
        var interval = 10;
        businessHour.find(datae).sort([['_id', 'ascending']]).exec(function(err, data) {
            if (data) {
                
                var start_time = Array();
                var end_time = Array();
                var bussy_slot = Array();
                data.forEach(function(rs) {
                    start_time.push(parseTime(timeConvert(rs.startTime)));
                    end_time.push(parseTime(timeConvert(rs.endTime)));
                });
                var bookData = {};
                bookData['artistId'] = datae.artistId;
                bookData['bookingDate'] = newDate;
                bookData['bookingStatus']= {'$ne':2}
                var AbookingTime = '';
                var AbookingDate = '';
                bookingService.find(bookData).exec(function(err, bdata) {
                    var bookingSTime = Array();
                    var bookingETime = Array();
                    if (bdata) {
                        bdata.forEach(function(rs) {
                            bookingSTime.push(parseTime(timeConvert(rs.startTime)));
                            bookingETime.push(parseTime(timeConvert(rs.endTime)));
                        });
                    }
                    var bussy_slot = bookingTime(bookingSTime, bookingETime, interval);
                    var times_ara = calculate_time_slot_artist(start_time, end_time, interval,newDate, bussy_slot,AbookingDate,curentTime);
                    staff.find({'businessId':req.body.artistId},{'artistId':1,'staffInfo.userName':1,'staffInfo.profileImage':1,'job':1,'staffServiceId':1}).sort([['_id', 'ascending']]).exec(function(err, sdata) {
                       jsStaff = [];
                       if(sdata){

                            for (i = 0 ; i < sdata.length ; i++) {
                                jsStaff.push({
                                    'staffId':sdata[i].artistId,
                                    'staffName':sdata[i]['staffInfo'].userName,
                                    'staffImage': baseUrl+"/uploads/profile/"+sdata[i]['staffInfo'].profileImage,
                                    'staffServiceId':sdata[i].staffServiceId,
                                    'job':sdata[i].job
                                });
                                
                               
                            }
                        }
                        res.json({'status':"success","message": "ok","timeSlots":times_ara,"booking":bookInfo[0],"staffDetail":jsStaff});
                        return;
                    });

                });
            }
        });
    } else {
        res.json({
            'status': 'fail',
            'message': 'No record found.'
        });
        return;
    }
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
function calculate_time_slot_artist(start_time, end_time, interval = "10",day, bussy_slot,AbookingDate,curentTime) {
    var i, formatted_time;
    var a = 0;
    var time_slots = new Array();
    start_time.forEach(function(rs) {
        for (var i = rs; i <= end_time[a]; i = i + interval) {
            /*formatted_time = convertHours(i);
            time_slots.push(formatAMPM(formatted_time));*/
           formatted_time = convertHours(i);
            
            if(currentDay()==day){
            
                if(curentTime<i){
       
/*                    if(AbookingTime){
                           
                        if(AbookingTime<=i){

                            time_slots.push(formatAMPM(formatted_time));
                        }
    
                    }else{*/
                       time_slots.push(formatAMPM(formatted_time));
                   // }



                }


            }else if(AbookingDate==newDate){

                if(AbookingTime<=i){

                    time_slots.push(formatAMPM(formatted_time));
                }


            }else{

                time_slots.push(formatAMPM(formatted_time));

            }
        }
        a++;
    });
    time_slots = time_slots.filter(function(val) {
        return bussy_slot.indexOf(val) == -1;
    });
    return time_slots;
}
function parseTimeService(s) {

  var c = s.split(':');
  return parseInt(c[0]) * 60/10 + parseInt(c[1])/10;

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

    //return today = dd + '-' + mm + '-' + yyyy;
    return today = yyyy + '-' + mm + '-' + dd;

   
}
 function timeDiffrence(start,end){

    var day = '1 1 1970 '
    diff_in_min = ( Date.parse(day + end) - Date.parse(day + start) )/ 1000 / 60;
    return diff_in_min;


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
    hours       = hours<10 ? "0"+hours : hours;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;

}
function parseTime(s) {

 var c = s.split(':');
 return parseInt(c[0]) * 60 + parseInt(c[1]);

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
function convertHours(mins){
    var hour = Math.floor(mins/60);
     var mins = mins%60; 
    var converted = pad(hour, 2)+':'+pad(mins, 2); return converted;
 }
 function pad (str, max) {
      str = str.toString();
     return str.length < max ? pad("0" + str, max) : str;
}
exports.getCurrentTime = function(req, res,next) {

    var latitude = '22.7196';
    var longitude = '75.8577';
    if(req.body.latitude &  req.body.longitude){

        var latitude = req.body.latitude;
        var longitude = req.body.longitude;
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
                        var hours = localdate.getHours();
                        var minutes = localdate.getMinutes();
                        var ampm = hours >= 12 ? 'PM' : 'AM';
                        hours = hours % 12; hours = hours ? hours : 12; // the hour '0' should be '12' minutes = minutes < 10 ? '0'+minutes : minutes;
                        var strTime = hours + ':' + minutes + ' ' + ampm;
                        dateTime = strTime;
                        next();
                     /* res.json({'status':'success','message':'ok','serviceTime':localdate});
                       return;*/


            }
    });
     
}
exports.bookingAction = function(req, res) {
    
     var msg ='';
     type =  req.body.type;
     paymentType =  Number(req.body.paymentType);

     if(type == ''){
       res.json({status: "fail",message: 'Type is required.'});
       return;
     }

    if(req.body.bookingId == ''){
       res.json({status: "fail",message: 'BookingId is required.'});
       return;
    }

     data = {};
     data['artistId']  =  req.body.artistId;
     data['userId']    =  req.body.userId;
     data['_id']       =  req.body.bookingId;
     serviceId    =  req.body.serviceId;
     data['subserviceId']    =  req.body.subserviceId;
     artistServiceId    =  req.body.artistServiceId;
    
     var ser = serviceId.split(",");
     var serId = ser.map(function(n) {
     return n;
     });

    var ar = artistServiceId.split(",");
    var artSerId = ar.map(function(n) {
     return n;
    });
     
    search ={};
    search['serviceId'] = {$in:serId};
    search['artistId'] = Number(data['artistId']);
     
    ar_search ={};
    ar_search['_id'] = {$in:artSerId};
    ar_search['artistId'] = Number(data['artistId']);

   
     updateData ={};
     bookStatus = 1;
     
    switch (type) {

        case 'accept':
          
             updateData['bookStatus'] =1;
             msg = 'Booking has been accepted';
             notifyType = '2';
             break;    
       
        case 'reject':
        
            updateData['bookStatus'] =2; 
            bookStatus = 2
            msg = 'Booking has been rejected';
            notifyType = '3';
            break;
       
        case 'cancel':
          
            updateData['bookStatus'] =2; 
            bookStatus = 2
            msg = 'Booking has been rejected';
            notifyType = '4';
            break;
       
        case 'complete':

            updateData['bookStatus'] =3;
            msg = 'Booking has been completed';
            notifyType = '5';
            
             if(paymentType ==3){

                  var trsNo = Math.floor((Math.random() * 999999) + 1);
                  updateData['transjectionId'] ='txn_'+trsNo;
                  updateData['paymentStatus'] =1;
           

             }
             /*here code for main service count*/
             artistMainService.find(search,{'_id': 1,'bookingCount':1}).exec(function(err, tgdata) {
                if (tgdata.length > 0) {
                    count = 0;
                    tgdata.forEach(function(rs) {
                    count = Number(rs.bookingCount) + 1;
                    artistMainService.update({_id:rs._id},{$set:{'bookingCount':count}},function(err, upd) {});
                    });
                }
            });
   
             /* here code for artist service count*/
            artistservices.find(ar_search,{'_id': 1,'bookingCount':1}).exec(function(err, tgdata) {
                if (tgdata.length > 0) {
                    count = 0;
                    tgdata.forEach(function(rs) {
                    count = Number(rs.bookingCount) + 1;
                    artistservices.update({_id:rs._id},{$set:{'bookingCount':count}},function(err, upd) {});
                    });
                }
            });

          break;
    } 
     
    booking.updateMany({'_id':data._id},{$set:updateData}, function(err, docs){

     bookingService.updateMany({'bookingId':data._id},{$set: {'bookingStatus':bookStatus}}, function(err, docs){}); 
       /*code for notification*/   
             
        var userId    = data['userId'];
        var artistId  = data['artistId'];
        var notifyId   = data['_id'];
        var notifyTy = 'booking';
              console.log(userId) ;  
              console.log(artistId) ;  
        if(type=="cancel"){

            notify.notificationUser(userId,artistId,notifyType,notifyId,notifyTy); 
 
        }else{
            notify.notificationUser(artistId,userId,notifyType,notifyId,notifyTy); 

        }
        
        /*end notification code*/       


        res.json({'status':'success','message':msg});  
        return;
    }); 


     
}
exports.bookingDetails = function(req,res){
    if(req.body.bookingId == ''){
       res.json({status: "fail",message: 'BookingId is required.'});
       return;
    }
   newDate = req.body.date;
   bookInfo ={};
   bookInfo =req.body;
   var baseUrl =  req.protocol + '://'+req.headers['host'];
    async.parallel([

        function(callback) {
            var query = booking.aggregate([{
                    $match: {
                        '_id': Number(req.body.bookingId)
                        
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
                /*{
                    "$lookup": {
                       "from": "users",
                       "localField": "artistId",
                       "foreignField": "_id",
                       "as": "staffInfo"
                    }
                }, */
                {
                    "$project": {
                        "_id": 1,
                        "bookingDate": 1,
                        "bookingTime": 1,
                        "totalPrice": 1,
                        "paymentType": 1,
                        "paymentStatus": 1,
                        "transjectionId":1,
                        "artistId":1,
                        "location": 1,
                        "bookStatus": 1,
                        "staffInfo.profileImage":1,
                        "userDetail._id": 1,
                        "userDetail.userName": 1,
                        "userDetail.profileImage":1
                       
                    }
                }

            ]);
            query.exec(function(err, g) {
                if (err) {
                    callback(err);
                }
                callback(null, g);
            });
        },

        function(callback) {
            var query = booking.aggregate([{
                    $match: {
                        '_id': Number(req.body.bookingId)
                        
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
                  { $unwind : "$bookingData" },
                       {
                            "$lookup": {
                                "from": "artistservices",
                                "localField": "bookingData.artistServiceId",
                                "foreignField": "_id",
                                "as": "artistService"
                            }
                        },
                        {
                            "$lookup": {
                               "from": "users",
                               "localField": "bookingData.staff",
                               "foreignField": "_id",
                               "as": "staffInfo"
                            }
                        },
                         {
                            "$lookup": {
                               "from": "users",
                               "localField": "bookingData.artistId",
                               "foreignField": "_id",
                               "as": "artistInfo"
                            }
                        },
                {
                    "$project": {
                        "_id":1,
                        "bookingData._id":1,
                        "bookingData.bookingPrice":1,
                        "bookingData.serviceId":1,
                        "bookingData.subServiceId":1,
                        "bookingData.artistServiceId":1,
                        "bookingData.bookingDate":1,
                        "bookingData.startTime":1,
                        "bookingData.endTime":1,
                        "bookingData.staff":1,
                        "artistService._id":1,
                        "artistService.title":1,
                        "staffInfo._id": 1,
                        "staffInfo.userName": 1,
                        "staffInfo.profileImage":1,
                        "artistInfo._id": 1,
                        "artistInfo.userName": 1,
                        "artistInfo.profileImage":1
                       
                    }
                }

            ]);
            query.exec(function(err, s) {
                if (err) {
                    callback(err);
                }

                callback(null, s);
            });
        },

    ],

    //Compute all results
    function(err, results) {
       /* res.json({status: "success",message: 'successfully',bookingDetails: results[0],bookingDetails2: results[1]});
        console.log( results[0])
       return console.log(results[1]);  */ 
         serverTime = parseTime(timeConvert(dateTime.curTime));
         bookTime  =  parseTime(timeConvert(results[0][0].bookingTime));
        if (results[0]) {
                if(results[0][0].bookStatus =='1' && ((dateTime.curDate>results[0][0].bookingDate) || (dateTime.curDate == results[0][0].bookingDate && serverTime> bookTime))){
                  
                     results[0][0].isFinsh = 1;

                }else{
                     results[0][0].isFinsh = 0;
                }
                console.log(results);   
               for (var i = 0; i < results[0].length; i++) {
                  if(results[0][i].userDetail[0].profileImage){
                         results[0][i].userDetail[0].profileImage =  baseUrl+"/uploads/profile/"+results[0][i].userDetail[0].profileImage; 
                    }
                    jsArr = [];
                    for (var j = 0; j < results[1].length; j++) {
                       
                        if (results[0][i]._id == results[1][j]._id) {
                             
                                if(results[1][j].staffInfo ==0){
                                   
                                   jsArr.push({
                                       _id: results[1][j].bookingData._id,
                                       bookingPrice: results[1][j].bookingData.bookingPrice,
                                       serviceId: results[1][j].bookingData.serviceId,
                                       subServiceId: results[1][j].bookingData.subServiceId,
                                       artistServiceId: results[1][j].bookingData.artistServiceId,
                                       bookingDate: results[1][j].bookingData.bookingDate,
                                       artistServiceId: results[1][j].bookingData.artistServiceId,
                                       startTime: results[1][j].bookingData.startTime,
                                       endTime: results[1][j].bookingData.endTime,
                                       staffId: results[1][j].artistInfo[0]._id,
                                       staffName: results[1][j].artistInfo[0].userName,
                                       staffImage:  baseUrl+"/uploads/profile/"+results[1][j].artistInfo[0].profileImage,
                                       artistServiceName: results[1][j].artistService[0].title
                                    });
                                  
                                }else{
                                     if(results[1][j].staffInfo[0].profileImage){
                                       results[1][j].staffInfo[0].profileImage =  baseUrl+"/uploads/profile/"+results[1][j].staffInfo[0].profileImage; 
                                    }
                                        jsArr.push({
                                           _id: results[1][j].bookingData._id,
                                           bookingPrice: results[1][j].bookingData.bookingPrice,
                                           serviceId: results[1][j].bookingData.serviceId,
                                           subServiceId: results[1][j].bookingData.subServiceId,
                                           artistServiceId: results[1][j].bookingData.artistServiceId,
                                           bookingDate: results[1][j].bookingData.bookingDate,
                                           artistServiceId: results[1][j].bookingData.artistServiceId,
                                           startTime: results[1][j].bookingData.startTime,
                                           endTime: results[1][j].bookingData.endTime,
                                           staffId: results[1][j].bookingData.staff,
                                           staffName: results[1][j].staffInfo[0].userName,
                                           staffImage: results[1][j].staffInfo[0].profileImage,
                                           artistServiceName: results[1][j].artistService[0].title
                                        });
                                }
                               


                        }
                    }
                    results[0][i].bookingInfo = jsArr;
            }    
           

        } 
        
        
        res.json({status: "success",message: 'successfully',bookingDetails: results[0]});
        return;
        
    });


}
exports.followerFeed = function(req,res,next){
    folInfo = {};
    folInfo =req.body;
    
    if(req.body.userId ==''){
       res.json({status: "fail",message: 'userId is required.'});
       return;
    }
     type ='newsFeed';
    if(req.body.type ==''){
       res.json({status: "fail",message: 'type is required.'});
       return;
    }else{
         type = req.body.type;
    }

    if(type =='newsFeed'){
        followUnfollow.find({'followerId':Number(req.body.userId),'status':1}).sort([['_id', 'ascending']]).exec(function(err, followData) {
            if(followData){

                 a = [];
                 a= followData.map(a => a.userId);
                 a.push(Number(req.body.userId));         
                 folInfo.flUser =a ;


            }else{
                folInfo.flUser = [];
            }
             next();
        });
    }else{
           folInfo.flUser = [];
            next();
    }

}

exports.followerFeedGet = function(req,res,next){

    folInfo = {};
    
    if(fields.userId ==''){
       res.json({status: "fail",message: 'userId is required.'});
       return;
    }

    followUnfollow.find({'userId':Number(fields.userId),'status':1}).sort([['_id', 'ascending']]).exec(function(err, followData) {
      
        if(followData){

             a = [];
             a= followData.map(a => a.followerId);
             a.push(Number(fields.userId));         
             folInfo.flUser =a ;

        }else{
            folInfo.flUser = [];
            
        }

        next();

    });

}

exports.allArtist =function(req,res,next){
  var Value_match = escapere(req.body.search);
  var baseUrl =  req.protocol + '://'+req.headers['host'];
  staff.find({'businessId':req.body.artistId},{'artistId':1},function(err,data){
    jsArr =[];
    if(data.length>0){

        for (d = 0 ; d < data.length ; d++) {
            jsArr.push(Number(data[d].artistId));
        }
    }
    User.find({'_id':{'$nin':jsArr},'businessType':'independent','isDocument':3,
     $or: [{ "userName": {$regex:req.body.search,$options:'i'}}, {"email": {$regex:req.body.search,$options:'i'}
                    }]},{'_id':1,'userName':1,'profileImage':1}).sort([['_id', 'ascending']]).exec(function(err, artistData) {
        if(artistData){
            nextDataTotal = artistData.length;
            next();

        }
      
     });

   });

}
exports.finalAllArtist =function(req,res){
  var Value_match = escapere(req.body.search);
  var baseUrl =  req.protocol + '://'+req.headers['host'];
    if (req.body.page) {
      page = Number(req.body.page)*Number(req.body.limit);
    } else {
        page=0;
    }
    if (req.body.limit) {
    limit = Number(req.body.limit);
    } else {
        limit=10;
    }
  staff.find({'businessId':req.body.artistId},{'artistId':1},function(err,data){
    jsArr =[];
    if(data.length>0){

        for (d = 0 ; d < data.length ; d++) {
            jsArr.push(Number(data[d].artistId));
        }
    }
    User.find({'_id':{'$nin':jsArr},'businessType':'independent','isDocument':3,
     $or: [{ "userName": {$regex:req.body.search,$options:'i'}}, {"email": {$regex:req.body.search,$options:'i'}
                    }]},{'_id':1,'userName':1,'profileImage':1}).sort([['_id', 'ascending']]).skip(page).limit(limit).exec(function(err, artistData) {
        if(artistData){
            for (i = 0 ; i < artistData.length ; i++) {
                if(artistData[i].profileImage){
                    if(!validUrl.isUri(artistData[i].profileImage)){
                         artistData[i].profileImage = baseUrl+"/uploads/profile/"+artistData[i].profileImage;
                    } 
                 
                }
            }
            res.json({status: "success",message: 'ok',totalCount:nextDataTotal,artistList: artistData});
        }
      
     });

   });

}
exports.allArtistOld =function(req,res){
  var Value_match = new RegExp(req.body.search);
  var baseUrl =  req.protocol + '://'+req.headers['host'];
  staff.find({'businessId':req.body.artistId},{'artistId':1},function(err,data){
    jsArr =[];
    if(data.length>0){

        for (d = 0 ; d < data.length ; d++) {
            jsArr.push(Number(data[d].artistId));
        }
    }
    User.find({'_id':{'$nin':jsArr},'businessType':'independent','isDocument':3,'userName':{$regex:Value_match,$options:'i'}},{'_id':1,'userName':1,'profileImage':1}).sort([['_id', 'ascending']]).exec(function(err, artistData) {
        if(artistData){
            for (i = 0 ; i < artistData.length ; i++) {
                if(artistData[i].profileImage){
                    if(!validUrl.isUri(artistData[i].profileImage)){
                         artistData[i].profileImage = baseUrl+"/uploads/profile/"+artistData[i].profileImage;
                    } 
                 
                }
            }
            res.json({status: "success",message: 'ok',artistList: artistData});
        }
      
     });

   });

}
exports.addStaff = function(req,res){
     if(req.body.businessId ==''){
         res.json({'status': "fail","message": "businessId is required."});
         return;

     }
     if(req.body.artistId ==''){
         res.json({'status': "fail","message": "artistId is required."});
         return;

     }
     upd = new Date();
     serviceData = JSON.parse(req.body.staffService);
     staffHour = JSON.parse(req.body.staffHours);
     jsArr = [];
     sortData = {};
     sortData['artistId'] = req.body.artistId;
     sortData['businessId'] = req.body.businessId; 
   
     editId = req.body.editId;
     type = req.body.type;
    if(editId && type =='edit'){
        var data = {
        job: req.body.job,
        mediaAccess: req.body.mediaAccess,
        holiday: req.body.holiday,
        serviceType: req.body.serviceType,
        staffServiceId:serviceData,
        staffHours: staffHour,
        upd:upd
        };
       staff.updateMany({'_id':editId},{$set: data}, function(err, docs){ 
           staffService.updateMany(sortData, {$set: {staffId:editId}},function(err, result) {});
        });
       res.json({'status':'success','message':'update successfully','staffId':editId});
       return;
 
    }else{

            staff.find().sort([['_id', 'descending']]).limit(1).exec(function(err, staffData) {
            User.find({'_id':req.body.artistId},{'_id':1,'userName':1,'profileImage':1}).exec(function(err,artistData){
                var autoId = 1;
                  if (staffData.length > 0) {
                    autoId = staffData[0]._id + 1;
                }
               staffInfo =[];
                staffInfo = {"userName":artistData[0].userName,"profileImage":artistData[0].profileImage }
                var addNew = {
                    _id: autoId,
                    businessId: req.body.businessId,
                    artistId: req.body.artistId,
                    job: req.body.job,
                    mediaAccess: req.body.mediaAccess,
                    holiday: req.body.holiday,
                    serviceType: req.body.serviceType,
                    staffServiceId:serviceData,
                    staffInfo:staffInfo,
                    staffHours: staffHour,
                    upd:upd
                    
                            
                };
             // return console.log(serviceData);
                staff(addNew).save(function(err, data) {
                   if (err) {
                        res.json({status: "fail",message: err });
                        return;
                    } else {
                        staffService.updateMany(sortData, {$set: {staffId:autoId}},function(err, result) {
                           res.json({status: "success", message: 'ok'});
                           return;
                        });
                        
                    }
                });
            
            });
           
         
         });
    }    
    

}
exports.addStaffService = function(req,res){
    if(req.body.businessId ==''){
         res.json({'status': "fail","message": "businessId is required."});
         return;

    }
    if(req.body.artistId ==''){
         res.json({'status': "fail","message": "artistId is required."});
         return;

    }
       timeSl = JSON.parse(req.body.staffService);
       /*console.log(timeSl);*/
        jsArr = []
        staffService.deleteMany({'businessId':req.body.businessId,'artistId':req.body.artistId}, function(err, results){});
        staffService.find().sort([['_id', 'descending']]).limit(1).exec(function(err, userdata) {
                var autoId = 1;

                if (userdata.length > 0) {
                    autoId = userdata[0]._id + 1;

                }

                for (var i = 0; i < timeSl.length; i++) {
                    inc = autoId + i;

                    jsArr.push({
                        _id: inc,
                        businessId: req.body.businessId,
                        artistId: req.body.artistId,
                        serviceId: timeSl[i].serviceId,
                        subserviceId:timeSl[i].subserviceId,
                        artistServiceId:timeSl[i].artistServiceId,
                        inCallPrice: timeSl[i].inCallPrice,
                        outCallPrice: timeSl[i].outCallPrice,
                        completionTime:timeSl[i].completionTime
                    });

                }

                staffService.insertMany(jsArr);
                res.json({status: "success", message:'ok',staffServices:jsArr});
                return;
            });

}
exports.addStaffServiceOld = function(req,res){
    if(req.body.businessId ==''){
         res.json({'status': "fail","message": "businessId is required."});
         return;

    }
    if(req.body.artistId ==''){
         res.json({'status': "fail","message": "artistId is required."});
         return;

    }
    if(req.body.artistServiceId ==''){
         res.json({'status': "fail","message": "artistServiceId is required."});
         return;

    }
    if(req.body.inCallPrice ==''){
         res.json({'status': "fail","message": "inCallPrice is required."});
         return;

    }
     if(req.body.outCallPrice ==''){
         res.json({'status': "fail","message": "outCallPrice is required."});
         return;

    }
        var addNew = {
            
            businessId: req.body.businessId,
            artistId: req.body.artistId,
            serviceId: req.body.serviceId,
            subserviceId: req.body.subserviceId,
            artistServiceId:req.body.artistServiceId,
            inCallPrice: req.body.inCallPrice,
            outCallPrice: req.body.outCallPrice
            
        };
    staffServiceId = req.body.staffServiceId;
    type = req.body.type;
    if(staffServiceId && type =='edit'){
        staffService.updateMany({'_id':staffServiceId}, {$set:addNew},function(err, result) {
             res.json({'status':'success','message':'update successfully','staffServiceId':staffServiceId});
             return;
        });
 
    }else{

        staffService.find().sort([['_id', 'descending']]).limit(1).exec(function(err, servicedata) {
            var autoId = 1;
            if (servicedata.length > 0) {
                autoId = servicedata[0]._id + 1;

            }
            addNew['_id'] = autoId;
            staffService(addNew).save(function(err, data) {
                    if (err) {
                        res.json({status: "fail",message: err });
                        return;
                    } else {
                        res.json({status: "success", message: 'ok'});
                        return;
                    }
                });

        });
    }

}
exports.staffInformation = function(req,res){
    var baseUrl =  req.protocol + '://'+req.headers['host'];
    search   = {};
    search['businessId'] = Number(req.body.businessId);
    search['artistId']   = Number(req.body.artistId);
    async.parallel([

   function(callback) {
        var query =  staff.aggregate([
         { 
           $match:search 
        },    
             
   
       { 
            "$project": {
                "_id": 1,
                "businessId": 1,
                "staffHours": 1,
                "job":1,
                "mediaAccess":1,
                "holiday":1,
                "staffInfo":1,
                "staffServiceId":1,
                "serviceType":1

                        
               
             }
        }
    ])
    query.exec(function(err, ser) {
            if (err) {
                callback(err);
            }
 
            callback(null, ser);
        });
    },
    function(callback) {
        var query = staffService.find(search)
        query.exec(function(err, se) {
            if (err) {
                callback(err);
            }
 
            callback(null, se);
        });
    },
     function(callback) {
        var query = artistservices.find({'artistId':Number(req.body.businessId),'status':1,'deleteStatus':1},{'_id':1,'subserviceId':1,'title':1,'inCallPrice':1,'outCallPrice':1,'completionTime':1})
        query.exec(function(err, s) {
            if (err) {
                callback(err);
            }
 
            callback(null, s);
        });
    }
],
function(err, results) {
         staffInfo = [];


        if(results[0].length>0){
            results[0][0].staffInfo.staffId = Number(req.body.artistId);     
            results[0][0].staffInfo.profileImage = baseUrl+'/uploads/profile/'+results[0][0].staffInfo.profileImage;
        jsArrStaffService =[]
        for (var i = 0;i<results[1].length;i++) {  
             
            for (var r = 0; r < results[2].length; r++) {
                 if (results[1][i].artistServiceId == results[2][r]._id) {
                   
                     results[1][i].title = results[2][r].title;
                 }

            }

            jsArrStaffService.push({
                _id:results[1][i]._id,
                artistId:results[1][i].artistId,
                businessId:results[1][i].businessId,
                serviceId:results[1][i].serviceId,
                subserviceId:results[1][i].subserviceId,
                artistServiceId:results[1][i].artistServiceId,
                inCallPrice:results[1][i].inCallPrice,
                outCallPrice:results[1][i].outCallPrice,
                title:results[1][i].title,
                completionTime:results[1][i].completionTime
                
            });

        }
        results[0][0].staffService =jsArrStaffService;   
            res.json({status: "success", message:"ok",staffDetails:results[0]});
            return;
        }else{
              res.json({status:"fail",message:'No record found'});
        }
 });

}
exports.artistStaff = function(req,res){
     var baseUrl =  req.protocol + '://'+req.headers['host'];
     search = {};
     search['businessId'] =req.body.artistId; 
     staffInfo = [];
    staff.find(search,{'artistId':1,'staffInfo':1,'job':1}).sort([['upd', 'descending']]).exec(function(err, bdata) {
       if(bdata.length>0){
        for(var i=0;i< bdata.length; i++){
             staffInfo.push({
            '_id':bdata[i]._id, 
            'staffId':bdata[i].artistId, 
            'staffName':bdata[i].staffInfo.userName, 
            'job':bdata[i].job, 
            'staffImage':baseUrl+'/uploads/profile/'+ bdata[i].staffInfo.profileImage 
             }); 

        }
        
          res.json({status: "success",message: 'ok',staffList: staffInfo});

       }else{
          res.json({status:"fail",message:'No record found'});

       }
    });
}
exports.artistService =function(req,res){
    if(req.body.artistId ==''){
        res.json({'status': "fail","message": "artistId is required."});
        return;
    } 
    async.parallel([

   function(callback) {
        var query = artistMainService.find({'artistId':Number(req.body.artistId),'status':1,'deleteStatus':1},{'serviceId':1,'serviceName':1})
        query.exec(function(err, ser) {
            if (err) {
                callback(err);
            }
 
            callback(null, ser);
        });
    },
    function(callback) {
        var query = artistSubService.find({'artistId':Number(req.body.artistId),'status':1,'deleteStatus':1})
        query.exec(function(err, sub) {
            if (err) {
                callback(err);
            }
 
            callback(null, sub);
        });
    },
    function(callback) {
        var query = artistservices.find({'artistId':Number(req.body.artistId),'status':1,'deleteStatus':1},{'_id':1,'subserviceId':1,'title':1,'inCallPrice':1,'outCallPrice':1,'completionTime':1})
        query.exec(function(err, s) {
            if (err) {
                callback(err);
            }
 
            callback(null, s);
        });
    }
 
],
 
//Compute all results
function(err, results) {
   
     if(results[0]){
     serArr =[];
    
    for(var i = 0; i < results[0].length; i++) {
        subArr =[];
        for(var j=0;j<results[1].length;j++){
           if(results[0][i].serviceId == results[1][j].serviceId){
      
                subArr.push({
                            _id: results[1][j]._id,
                             serviceId: results[1][j].serviceId,
                             subServiceId: results[1][j].subServiceId,
                             subServiceName: results[1][j].subServiceName
                        });
            }
       }
       serArr.push({
            serviceId:results[0][i].serviceId,
            serviceName:results[0][i].serviceName,
            subServies:subArr
        }); 
    }
    if(serArr){

        for (var s = 0; s < serArr.length; s++) {
             
            for (var k = 0; k < serArr[s].subServies.length; k++) {

                jsArr = [];
                for (var r = 0; r < results[2].length; r++) {
                    //console.log(results[2][r].subserviceId);  
                    if (serArr[s].subServies[k].subServiceId == results[2][r].subserviceId) {
                        jsArr.push({
                        _id: results[2][r]._id,
                        title: results[2][r].title,
                        inCallPrice: parseFloat(results[2][r].inCallPrice),
                        outCallPrice: parseFloat(results[2][r].outCallPrice),
                        completionTime: results[2][r].completionTime
                        });

                    }
                }
                serArr[s].subServies[k].artistservices = jsArr;
            }
        }

    } 
    
  
     res.json({status: "success",message: 'ok',artistServices: serArr});
       return;
    
}else{
   res.json({status: "fail",message: 'No recode found.'});
       return;
}
        
       
});

}
exports.artistServiceOld =function(req,res){
    if(req.body.artistId ==''){
        res.json({'status': "fail","message": "artistId is required."});
        return;
    } 
    async.parallel([

   function(callback) {
        var query = artistMainService.find({'artistId':Number(req.body.artistId),'status':1,'deleteStatus':1},{'serviceId':1,'serviceName':1})
        query.exec(function(err, ser) {
            if (err) {
                callback(err);
            }
 
            callback(null, ser);
        });
    },
    function(callback) {
        var query = artistSubService.find({'artistId':Number(req.body.artistId),'status':1,'deleteStatus':1})
        query.exec(function(err, sub) {
            if (err) {
                callback(err);
            }
 
            callback(null, sub);
        });
    },
    function(callback) {
        var query = artistservices.find({'artistId':Number(req.body.artistId),'status':1,'deleteStatus':1},{'_id':1,'subserviceId':1,'title':1,'inCallPrice':1,'outCallPrice':1,'completionTime':1})
        query.exec(function(err, s) {
            if (err) {
                callback(err);
            }
 
            callback(null, s);
        });
    }
 
],
 
//Compute all results
function(err, results) {
   
     if(results[0]){
     serArr =[];
    
    for(var i = 0; i < results[0].length; i++) {
        subArr =[];
        for(var j=0;j<results[1].length;j++){
           if(results[0][i].serviceId == results[1][j].serviceId){
      
                subArr.push({
                            _id: results[1][j]._id,
                             serviceId: results[1][j].serviceId,
                             subServiceId: results[1][j].subServiceId,
                             subServiceName: results[1][j].subServiceName
                        });

             //change code
               jsArr = [];
                for (var r = 0; r < results[2].length; r++) {
                  
                    if (results[1][j].subServiceId == results[2][r].subserviceId) {
                        jsArr.push({
                        _id: results[2][r]._id,
                        title: results[2][r].title,
                        inCallPrice: parseFloat(results[2][r].inCallPrice),
                        outCallPrice: parseFloat(results[2][r].outCallPrice),
                        completionTime: results[2][r].completionTime
                        });

                    }
                }
                subArr[0].artistService = jsArr;
              //end code
            }


       }
       serArr.push({
            serviceId:results[0][i].serviceId,
            serviceName:results[0][i].serviceName,
            subServies:subArr
        }); 
    }
  
     res.json({status: "success",message: 'ok',artistServices: serArr});
       return;
    
}else{
   res.json({status: "fail",message: 'No recode found.'});
       return;
}
        
       
});

}
exports.deleteStaffService = function(req,res){
    if(req.body.addServiceId){
        staffService.deleteOne({'_id':req.body.addServiceId}, function(err, results){
        if(err) throw err;

        res.json({status:"success",message: 'Staff service has been removed.'});
        });
    }else{
        res.json({status:"fail",message:'addServiceId is required.'});
    }

}
exports.deleteStaff = function(req,res){
    if(req.body.businessId==''){
        res.json({status:'fail',message:'businessId is required.'});
        return;
    
    }
    if(req.body.staffId==''){
        res.json({status:'fail',message:'staffId is required.'});
        return;
     
    }
    
    search ={};
    
    search['artistId']=Number(req.body.businessId);
    search['staff']=Number(req.body.staffId);
    search['bookingStatus']=1;

    bookingService.find(search).count().exec(function(err,count){
      if(count==0){
          staff.deleteOne({'businessId':req.body.businessId,'artistId':req.body.staffId}, function(err, results){
            if(err) throw err;
             staffService.deleteMany({'businessId':req.body.businessId,'artistId':req.body.staffId}, function(err, results){ });
            res.json({status:"success",message: 'Staff removed successfully'});
          });
        }else{
          res.json({status:"fail",message:"This staff service is already booked , you can't remove the staff."});
        }
    });
}
exports.deleteCompany = function(req,res){
    if(req.body.businessId==''){
        res.json({status:'fail',message:'businessId is required.'});
        return;
    
    }
    if(req.body.staffId==''){
        res.json({status:'fail',message:'staffId is required.'});
        return;
     
    }
     search ={};
      
      search['artistId']=Number(req.body.businessId);
      search['staff']=Number(req.body.staffId);
      search['bookingStatus']=1;

      bookingService.find(search).count().exec(function(err,count){
        if(count==0){
            staff.deleteOne({'businessId':req.body.businessId,'artistId':req.body.staffId}, function(err, results){
              if(err) throw err;
              staffService.deleteMany({'businessId':req.body.businessId,'artistId':req.body.staffId}, function(err, results){ });
              res.json({status:"success",message: 'Company removed successfully'});
            });
          }else{
            res.json({status:"fail",message:"This company service is already booked , you can't remove the company."});
          }
      });
} 
exports.availableStaffList = function(req,res){
    var baseUrl =  req.protocol + '://'+req.headers['host'];
    var appUser = require("./user");
    businessId =  req.body.businessId;
    artistId =  req.body.artistId;
    artistServiceId =  req.body.artistServiceId;
    day =  Number(req.body.day);
    date = req.body.bookingDate;
    serviceTime = req.body.serviceTime;
    bookTime = req.body.startTime;
    bookStaffId = req.body.bookStaffId;
    search = {};
    search['businessId']= Number(businessId);
    search['staffServiceId'] = {$in:[artistServiceId]};
    search["staffHours.day"] = day;
   // search["staffHours.day"] = {$in:[day]};
    
      staff.aggregate( [
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
            "holiday":1, 
            "status": 1,
            "staffHours": 1,
            "staffInfo": 1,
            "mediaAccess":1,
           /* "bookingService":"$bookingService"*/
            
            "bookingService.bookingDate":1,
            "bookingService.startTime":1,
            "bookingService.endTime":1,
            "bookingService.staff":1,
            "bookingService.artistId":1,
            "bookingService.bookingStatus":1,

         }
       },
       { $match :search },
       
    ],function(err, staffData){
       
        if(staffData.length>0){
             i=0; 
          
            async.each(staffData, function(element, callback){
                
                /*here code for get staff start time and end time*/
                var staffInfo = staffData[i];
                var staffHour = staffData[i].staffHours;
                var bookingData = staffData[i].bookingService;
                var staff_start_time =  Array();
                var staff_end_time =  Array();

                staffHour.forEach(function(rs) {
                    if(rs.day==Number(req.body.day)){
                        staff_start_time.push(parseTime(timeConvert(rs.startTime)));
                        staff_end_time.push(parseTime(timeConvert(rs.endTime)));
                    }

                });
                /*end*/
                /* here code for get all booking time for staff*/
                var booking_staff_start_time = Array();
                var booking_staff_end_time = Array(); 

              
                if(bookingData){

                    bookingData.forEach(function(bdata) {

                        if(bdata.bookingStatus!='2'){
                            //if(bdata.bookingDate == req.body.bookingDate){
                                booking_staff_start_time.push(parseTime(timeConvert(bdata.startTime)));
                                booking_staff_end_time.push(parseTime(timeConvert(bdata.endTime)));
                           // }
                        
                        }

                    });
                }
                if(staffInfo.staffInfo){
                    if(staffInfo.staffInfo.profileImage){
                      staffInfo.staffInfo.profileImage = baseUrl+"/uploads/profile/"+ staffInfo.staffInfo.profileImage;
                    }
                    
                } 
                
                req.body.staffId = staffInfo.artistId;
                req.body.booking_staff_start_time = booking_staff_start_time;
                req.body.booking_staff_end_time = booking_staff_end_time;
                req.body.staff_start_time = staff_start_time;
                req.body.staff_end_time = staff_end_time;
                req.body.serviceTime = serviceTime;
             
                staff_slots =   appUser.staffFreeSlot(req,res,callback);
               /* console.log(staff_slots);
                console.log(bookTime);
                console.log(staffInfo.artistId);*/

                if(staff_slots.length==0){
                  delete staffData[i];
                }else if(staff_slots.includes(bookTime)==false && bookStaffId!=staffInfo.artistId){
                    
                    delete staffData[i];
                  // staffData.remove(i);
           
               } 
            /* query here */
            callback();
            i++;
            },function(){
                /* stuff there */

                newData = staffData.filter(function(x) { return x !== null });
                staffJsArr =[]  
                if(newData.length){
                      newData.forEach(function(rs) {
                         staffJsArr.push({
                            _id:rs._id,
                            job:rs.job,
                            mediaAccess:rs.mediaAccess,
                            holiday:rs.holiday,
                            staffId:rs.artistId,
                            staffName:rs.staffInfo.userName,
                            staffImage:rs.staffInfo.profileImage
                         });
                      });
                      
                     res.json({status: "success",message: 'ok',availableStaff:staffJsArr});
                }else{
                     res.json({status:"fail",message:'No record found',availableStaff:[]});
                } 
             
            }); 
        }else{
             res.json({status:"fail",message:'No record found',availableStaff:[]});
        }

   });
   

}                 
/*new code for testing*/
exports.getCurrentTimeNew = function(req, res,next) {

    var latitude = '22.7196';
    var longitude = '75.8577';
    if(req.body.latitude &  req.body.longitude){

        var latitude = req.body.latitude;
        var longitude = req.body.longitude;
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
                        var hours = localdate.getHours();
                        var minutes = localdate.getMinutes();
                        var ampm = hours >= 12 ? 'PM' : 'AM';
                        hours = hours % 12; hours = hours ? hours : 12; // the hour '0' should be '12' minutes = minutes < 10 ? '0'+minutes : minutes;
                        var strTime = hours + ':' + minutes + ' ' + ampm;
                       // dateTime = strTime;

                        dateTime = {};
                        //var curDate =  localdate.getUTCFullYear()+'-'+localdate.getUTCMonth()+'-'+localdate.getUTCDate();
                        var dd = localdate.getDate();
                        var mm = localdate.getMonth()+1; //January is 0!
                        var yyyy = localdate.getFullYear();

                        if(dd<10) {
                           dd = '0'+dd
                        } 
                        if(mm<10) {
                          mm = '0'+mm
                        } 
                        today = yyyy + '-' + mm + '-' + dd;
                        dateTime ={'curTime':strTime,'curDate':today};
                        next();
                     /* res.json({'status':'success','message':'ok','serviceTime':localdate});
                       return;*/


            }
    });
     
}
exports.artistPendingInfoNew = function(req,res,next){

   newDate = req.body.date;
   pendingInfo ={};
   pendingInfo =req.body;
   
   if(newDate<dateTime.curDate){
        res.json({'status':'fail','message':'You can not select previous date'});
        return;
    }
   sortData = {};
  // sortData["_id"] = -1;
  searchData = {};
  datae12 = {};
    var datae = {};

  searchData["bookingDate"] = {$gte:dateTime.curDate};
  
  searchData['bookStatus']= '0';
  
  if(req.body.staffId){

        if(req.body.staffId=="All"){

            datae12 = { $or: [ { 'bookingData.artistId': Number(req.body.artistId) }, { 'bookingData.staff': Number(req.body.artistId) } ] };


        }else{

            searchData['bookingData.staff']= Number(req.body.staffId);
            searchData['artistId']= Number(req.body.artistId);
            datae['artistId'] = Number(req.body.artistId);         


        }


  }else{

    searchData['artistId']= Number(req.body.artistId);
    datae['artistId'] = Number(req.body.artistId);         

  }

   sortData["bookingDate"] = 1;
   sortData["timeCount"] = 1;
   var baseUrl =  req.protocol + '://'+req.headers['host'];
    datae['bookingDate'] = {$gte:dateTime.curDate};
    datae['bookStatus'] = '0';
    async.parallel([

        function(callback) {
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
                { $sort:sortData},
                {
                    "$project": {
                        "_id": 1,
                        "bookingDate": 1,
                        "artistId": 1,
                        "bookingTime": 1,
                        "totalPrice": 1,
                        "paymentType": 1,
                        "paymentStatus": 1,
                        "location": 1,
                        "bookStatus": 1,
                        "timeCount":1,
                        "staffInfo.profileImage":1,
                        "userDetail._id": 1,
                        "userDetail.userName": 1,
                        "userDetail.profileImage":1
                       
                    }
                }

            ]);
            query.exec(function(err, g) {
                if (err) {
                    callback(err);
                }

                callback(null, g);
            });
        },

        function(callback) {
            var query = booking.aggregate([
               { $sort:sortData},
               {
                    "$lookup": {
                        "from": "bookingservices",
                        "localField": "_id",
                        "foreignField": "bookingId",
                        "as": "bookingData"
                    }
                },
                  { $unwind : "$bookingData" },
                       {
                            "$lookup": {
                                "from": "artistservices",
                                "localField": "bookingData.artistServiceId",
                                "foreignField": "_id",
                                "as": "artistService"
                            }
                        },
                        {
                            "$lookup": {
                               "from": "users",
                               "localField": "bookingData.staff",
                               "foreignField": "_id",
                               "as": "staffInfo"
                            }
                        },
                         {
                            "$lookup": {
                               "from": "users",
                               "localField": "bookingData.artistId",
                               "foreignField": "_id",
                               "as": "artistInfo"
                            }
                        },
               { $match:searchData},
               { $match:datae12},
                {
                    "$project": {
                        "_id":1,
                        "bookingData._id":1,
                        "bookingData.bookingPrice":1,
                        "bookingData.serviceId":1,
                        "bookingData.subServiceId":1,
                        "bookingData.artistServiceId":1,
                        "bookingData.bookingDate":1,
                        "bookingData.startTime":1,
                        "bookingData.endTime":1,
                        "bookingData.staff":1,
                        "artistService._id":1,
                        "artistService.title":1,
                        "staffInfo._id": 1,
                        "staffInfo.userName": 1,
                        "staffInfo.profileImage":1,
                        "artistInfo._id": 1,
                        "artistInfo.userName": 1,
                        "artistInfo.profileImage":1,
                        "artistInfo.businessName":1
                       
                    }
                }

            ]);
            query.exec(function(err, s) {

                if (err) {
                    callback(err);
                }

                callback(null, s);
            });
        },

    ],

    //Compute all results
    function(err, results) {
     
     /*  console.log(results[0]);
       console.log("//");
       console.log(results[1]);*/
        if (results[0]) {
           
           for (var i = 0; i < results[0].length; i++) {
             
               
                 if(results[0][i].userDetail[0].profileImage){
                      results[0][i].userDetail[0].profileImage =  baseUrl+"/uploads/profile/"+results[0][i].userDetail[0].profileImage; 
                  }
                    jsArr = [];
                    for (var j = 0; j < results[1].length; j++) {
                       
                        if (results[0][i]._id == results[1][j]._id) {
                           
                                
                                if(results[1][j].staffInfo==0){
                                   
                                   jsArr.push({
                                       _id: results[1][j].bookingData._id,
                                       bookingPrice: results[1][j].bookingData.bookingPrice,
                                       serviceId: results[1][j].bookingData.serviceId,
                                       subServiceId: results[1][j].bookingData.subServiceId,
                                       artistServiceId: results[1][j].bookingData.artistServiceId,
                                       bookingDate: results[1][j].bookingData.bookingDate,
                                       artistServiceId: results[1][j].bookingData.artistServiceId,
                                       startTime: results[1][j].bookingData.startTime,
                                       endTime: results[1][j].bookingData.endTime,
                                       staffId: results[1][j].artistInfo[0]._id,
                                       staffName: results[1][j].artistInfo[0].userName,
                                       staffImage:  baseUrl+"/uploads/profile/"+results[1][j].artistInfo[0].profileImage,
                                       artistServiceName: results[1][j].artistService[0].title,
                                       companyId: results[1][j].artistInfo[0]._id,
                                       companyName: results[1][j].artistInfo[0].businessName,
                                       companyImage:  baseUrl+"/uploads/profile/"+results[1][j].artistInfo[0].profileImage
                                    });
                                  
                                }else{
                                     if(results[1][j].staffInfo[0].profileImage){
                                       results[1][j].staffInfo[0].profileImage =  baseUrl+"/uploads/profile/"+results[1][j].staffInfo[0].profileImage; 
                                    }
                                      
                                        jsArr.push({
                                           _id: results[1][j].bookingData._id,
                                           bookingPrice: results[1][j].bookingData.bookingPrice,
                                           serviceId: results[1][j].bookingData.serviceId,
                                           subServiceId: results[1][j].bookingData.subServiceId,
                                           artistServiceId: results[1][j].bookingData.artistServiceId,
                                           bookingDate: results[1][j].bookingData.bookingDate,
                                           artistServiceId: results[1][j].bookingData.artistServiceId,
                                           startTime: results[1][j].bookingData.startTime,
                                           endTime: results[1][j].bookingData.endTime,
                                           staffId: results[1][j].bookingData.staff,
                                           staffName: results[1][j].staffInfo[0].userName,
                                           staffImage: results[1][j].staffInfo[0].profileImage,
                                           companyId: results[1][j].artistInfo[0]._id,
                                           companyName: results[1][j].artistInfo[0].businessName,
                                           companyImage:  baseUrl+"/uploads/profile/"+results[1][j].artistInfo[0].profileImage,
                                           artistServiceName: results[1][j].artistService[0].title
                                        });
                                }
                               
                                

                        }
                    }
                    results[0][i].bookingInfo = jsArr;
   

                }    
            }

       // } 
        pendingInfo = results;

        if(results[0][0] &&results[0][0].bookingInfo.length==0 &&pendingInfo.length == 0){

            results[0] = [];
            
        }
       next(); 
      /*  res.json({status: "success",message: 'successfully',artistDetail: bookInfo});
        return;*/
        
    });


}
exports.artistBookingInfoNew = function(req,res,next){
   newDate = req.body.date;
   bookInfo ={};
   bookInfo =req.body;
   
   if(newDate<dateTime.curDate){
        res.json({'status':'fail','message':'You can not select previous date'});
        return;
    }
   sortData = {};
  // sortData["_id"] = -1;
  searchData = {};
  datae12 = {};
  datae = {};

  /*searchData["bookingDate"] = {$gte:dateTime.curDate};*/
  searchData['bookingDate']= newDate;
  searchData['bookStatus']= {$ne:'0'};
  
   
  if(req.body.staffId){

        if(req.body.staffId=="All"){

            datae12 = { $or: [ { 'bookingData.artistId': Number(req.body.artistId) }, { 'bookingData.staff': Number(req.body.artistId) } ] };


        }else{

            searchData['bookingData.staff']= Number(req.body.staffId);
            searchData['artistId']= Number(req.body.artistId);
            datae['artistId']= Number(req.body.artistId);


        }


  }else{

    searchData['artistId']= Number(req.body.artistId);
    datae['artistId']= Number(req.body.artistId);

  }

    datae['bookingDate'] = newDate;
    datae['bookStatus'] = {$ne:'0'};
  
   sortData["timeCount"] = 1;
  
   var baseUrl =  req.protocol + '://'+req.headers['host'];
    async.parallel([

        function(callback) {
            var query = booking.aggregate([
                 
              
                { $sort:sortData},
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
                    "$project": {
                        "_id": 1,
                        "bookingDate": 1,
                        "artistId": 1,
                        "bookingTime": 1,
                        "totalPrice": 1,
                        "paymentType": 1,
                        "paymentStatus": 1,
                        "location": 1,
                        "bookStatus": 1,
                        "timeCount":1,
                        "staffInfo.profileImage":1,
                        "userDetail._id": 1,
                        "userDetail.userName": 1,
                        "userDetail.profileImage":1
                       
                    }
                }

            ]);
            query.exec(function(err, g) {
                if (err) {
                    callback(err);
                }

                callback(null, g);
            });
        },

        function(callback) {
            var query = booking.aggregate([
               { $sort:sortData},
               {
                    "$lookup": {
                        "from": "bookingservices",
                        "localField": "_id",
                        "foreignField": "bookingId",
                        "as": "bookingData"
                    }
                },
                  { $unwind : "$bookingData" },
                       {
                            "$lookup": {
                                "from": "artistservices",
                                "localField": "bookingData.artistServiceId",
                                "foreignField": "_id",
                                "as": "artistService"
                            }
                        },
                        {
                            "$lookup": {
                               "from": "users",
                               "localField": "bookingData.staff",
                               "foreignField": "_id",
                               "as": "staffInfo"
                            }
                        },
                         {
                            "$lookup": {
                               "from": "users",
                               "localField": "bookingData.artistId",
                               "foreignField": "_id",
                               "as": "artistInfo"
                            }
                        },
               { $match:searchData},
               { $match:datae12},

                {
                    "$project": {
                        "_id":1,
                        "bookingData._id":1,
                        "bookingData.bookingPrice":1,
                        "bookingData.serviceId":1,
                        "bookingData.subServiceId":1,
                        "bookingData.artistServiceId":1,
                        "bookingData.bookingDate":1,
                        "bookingData.startTime":1,
                        "bookingData.endTime":1,
                        "bookingData.staff":1,
                        "artistService._id":1,
                        "artistService.title":1,
                        "staffInfo._id": 1,
                        "staffInfo.userName": 1,
                        "staffInfo.profileImage":1,
                        "artistInfo._id": 1,
                        "artistInfo.userName": 1,
                        "artistInfo.profileImage":1,
                        "artistInfo.businessName":1
                       
                    }
                }

            ]);
            query.exec(function(err, s) {
                if (err) {
                    callback(err);
                }

                callback(null, s);
            });
        },

    ],

    //Compute all results
    function(err, results) {
       /* res.json({status: "success",message: 'successfully',booking: results[0],bookingInfo: results[1]});
       return console.log(results[1]);  */ 
      /* console.log(results[0]);
       console.log("//");
       console.log(results[1]);*/
        if (results[0]) {
           
           for (var i = 0; i < results[0].length; i++) {
             
               
                 if(results[0][i].userDetail[0].profileImage){
                      results[0][i].userDetail[0].profileImage =  baseUrl+"/uploads/profile/"+results[0][i].userDetail[0].profileImage; 
                  }
                    jsArr = [];
                    for (var j = 0; j < results[1].length; j++) {
                       
                        if (results[0][i]._id == results[1][j]._id) {
                                
                                if(results[1][j].staffInfo ==0){

                                   
                                   jsArr.push({
                                       _id: results[1][j].bookingData._id,
                                       bookingPrice: results[1][j].bookingData.bookingPrice,
                                       serviceId: results[1][j].bookingData.serviceId,
                                       subServiceId: results[1][j].bookingData.subServiceId,
                                       artistServiceId: results[1][j].bookingData.artistServiceId,
                                       bookingDate: results[1][j].bookingData.bookingDate,
                                       artistServiceId: results[1][j].bookingData.artistServiceId,
                                       startTime: results[1][j].bookingData.startTime,
                                       endTime: results[1][j].bookingData.endTime,
                                       staffId: results[1][j].artistInfo[0]._id,
                                       staffName: results[1][j].artistInfo[0].userName,
                                       staffImage:  baseUrl+"/uploads/profile/"+results[1][j].artistInfo[0].profileImage,
                                       artistServiceName: results[1][j].artistService[0].title,
                                       companyId: results[1][j].artistInfo[0]._id,
                                       companyName: results[1][j].artistInfo[0].businessName,
                                       companyImage:  baseUrl+"/uploads/profile/"+results[1][j].artistInfo[0].profileImage
                                    });
                                  
                                }else{
                                     if(results[1][j].staffInfo[0].profileImage){
                                       results[1][j].staffInfo[0].profileImage =  baseUrl+"/uploads/profile/"+results[1][j].staffInfo[0].profileImage; 
                                    }
                                       
                                        jsArr.push({
                                           _id: results[1][j].bookingData._id,
                                           bookingPrice: results[1][j].bookingData.bookingPrice,
                                           serviceId: results[1][j].bookingData.serviceId,
                                           subServiceId: results[1][j].bookingData.subServiceId,
                                           artistServiceId: results[1][j].bookingData.artistServiceId,
                                           bookingDate: results[1][j].bookingData.bookingDate,
                                           artistServiceId: results[1][j].bookingData.artistServiceId,
                                           startTime: results[1][j].bookingData.startTime,
                                           endTime: results[1][j].bookingData.endTime,
                                           staffId: results[1][j].bookingData.staff,
                                           staffName: results[1][j].staffInfo[0].userName,
                                           staffImage: results[1][j].staffInfo[0].profileImage,
                                           companyId: results[1][j].artistInfo[0]._id,
                                           companyName: results[1][j].artistInfo[0].businessName,
                                           companyImage:  baseUrl+"/uploads/profile/"+results[1][j].artistInfo[0].profileImage,
                                           artistServiceName: results[1][j].artistService[0].title
                                        });
                                }
                               
                              

                        }
                    }
                    results[0][i].bookingInfo = jsArr;
                    

                }    
            }

       // } 
        
        bookInfo = results;
      /*  if(results[0][0] &&results[0][0].bookingInfo.length==0){
            console.log("welcome");
            results[0] = [];
        }*/
        next(); 
       /* res.json({status: "success",message: 'successfully',artistDetail: results[0]});
        return;*/
        
    });


}
exports.artistFreeSlotNew = function(req, res) {
     var baseUrl =  req.protocol + '://'+req.headers['host'];

     //return console.log(bookInfo[0]);
    if (req.body.artistId) {
        if(dateTime){
              curentTime =    parseTime(timeConvert(dateTime.curTime));
        }else{
              curentTime =    parseTime(timeConvert(req.body.currentTime));
        }
        
        datae = {};
        datae['artistId'] = req.body.artistId;
        datae['day'] = req.body.day;
        newDate = req.body.date;
        var interval = 10;

        staffSearch={};
        if(req.body.staffId == ''){
            staffSearch["artistId"] = Number(req.body.artistId);
        }else{

            if(req.body.staffId=="All"){

               staffSearch["artistId"] = Number(req.body.artistId);

            }else{

                staffSearch["artistId"] = Number(req.body.staffId);
                staffSearch["businessId"] = Number(req.body.artistId);

            }
           
              
        }

        businessHour.find(datae).sort([['_id', 'ascending']]).exec(function(err, data) {
            if (data) {
                
                var start_time = Array();
                var end_time = Array();
                var bussy_slot = Array();
                data.forEach(function(rs) {
                    start_time.push(parseTime(timeConvert(rs.startTime)));
                    end_time.push(parseTime(timeConvert(rs.endTime)));
                });

       staff.find(staffSearch,{'staffHours.startTime':1,'staffHours.endTime':1,'staffHours.day' :1}).sort([['_id', 'ascending']]).exec(function(err, staffData) {
           var staff_start_time =  Array();
           var staff_end_time =  Array();
       
            if(staffData.length>0){
                
                staffData.forEach(function(rs1) {         
                sdt = rs1.staffHours;
              
                sdt.forEach(function(rs) {
                    if(rs.day==Number(req.body.day)){
                        staff_start_time.push(parseTime(timeConvert(rs.startTime)));
                        staff_end_time.push(parseTime(timeConvert(rs.endTime)));
                    }

                });
            });    

            } 

                var bookData = {};
                bookData['artistId'] = datae.artistId;
                bookData['bookingDate'] = newDate;
                bookData['bookingStatus']= {'$ne':2}
                 if(req.body.staffId){
                 bookData['staff'] = Number(req.body.staffId);
                }
                var AbookingTime = '';
                var AbookingDate = '';
                bookingService.find(bookData).exec(function(err, bdata) {

                    var bookingSTime = Array();
                    var bookingETime = Array();
                    if (bdata) {
                        bdata.forEach(function(rs) {
                            bookingSTime.push(parseTime(timeConvert(rs.startTime)));
                            bookingETime.push(parseTime(timeConvert(rs.endTime)));
                        });
                    }

                   /*if independent join staff*/
                   if(req.body.staffId == ''){
                       if(staff_start_time.length>0){
                                var bookingSTime = staff_start_time.concat(bookingSTime);
                        }
                        if(staff_end_time.length>0){
                                var bookingETime = staff_end_time.concat(bookingETime);
                        }
                    }
                   
                    var bussy_slot = bookingTime(bookingSTime, bookingETime, interval);
                    if(req.body.staffId){
                        /*console.log('welcome mulab');*/
                      
                        start_time = staff_start_time;
                        end_time =staff_end_time;
                         
                    }
                  /*  console.log(bookingSTime);
                        console.log('//');
                        console.log(bookingETime);*/
                    var times_ara = calculate_time_slot_artist(start_time, end_time, interval,newDate, bussy_slot,AbookingDate,curentTime);
                    staff.find({'businessId':req.body.artistId},{'artistId':1,'staffInfo.userName':1,'staffInfo.profileImage':1,'job':1,'staffServiceId':1}).sort([['_id', 'ascending']]).exec(function(err, sdata) {
                       jsStaff = [];
                       if(sdata){

                            for (i = 0 ; i < sdata.length ; i++) {
                                jsStaff.push({
                                    'staffId':sdata[i].artistId,
                                    'staffName':sdata[i]['staffInfo'].userName,
                                    'staffImage': baseUrl+"/uploads/profile/"+sdata[i]['staffInfo'].profileImage,
                                    'staffServiceId':sdata[i].staffServiceId,
                                    'job':sdata[i].job
                                });
                                
                               
                            }
                        }
                        res.json({'status':"success","message": "ok","timeSlots":times_ara,"today":bookInfo[0],"pending":pendingInfo[0],"staffDetail":jsStaff});
                        return;
                    });
                 });
            });
            }
        });
    } else {
        res.json({
            'status': 'fail',
            'message': 'No record found.'
        });
        return;
    }
}

exports.changeStaff =function(req,res){


    if(req.body.bookId==''){
        res.json({status:'fail',message:'bookId is required.'});
        return;
    
    }
    if(req.body.staffId==''){
        res.json({status:'fail',message:'staffId is required.'});
        return;
     
    }
    
     bookingService.update({ _id:Number(req.body.bookId)},{$set: {'staff':Number(req.body.staffId)}},function(err, result) {
       
       res.json({status:"success",message:'Staff has been changed successfully'});
     });
}

exports.companyInfo = function(req,res,next){
  var baseUrl =  req.protocol + '://'+req.headers['host'];
  if(req.body.artistId ==''){
    res.json({'status': "fail","message": "artistId is required."});
    return;

  }
  search = {};
  search['artistId']=Number(req.body.artistId);
  
  staff.aggregate( [
  {  
    $lookup:{
        from: "staffservices", 
        localField: "_id", 
        foreignField: "staffId",
        as: "staffSer"
    }
  },
  
  {  
    $lookup:{
        from: "users", 
        localField: "businessId", 
        foreignField: "_id",
        as: "userInfo"
    }
  },
 { $match :search },
 { 
  "$project": {
      "_id": 1,
      "artistId": 1,
      "businessId": 1,
      "job": 1,
      "mediaAccess": 1,
      "holiday": 1,
      "staffHours": 1,
      "staffService": "$staffSer",
      "businessName": { "$arrayElemAt": [ "$userInfo.businessName",0] },
     "userName": { "$arrayElemAt": [ "$userInfo.userName",0] },
     "profileImage": { "$arrayElemAt": [ "$userInfo.profileImage",0] },
     "address": { "$arrayElemAt": [ "$userInfo.address",0] }
     
     
      

   }
 },

 
],function(err,company){
      if(company){
        for (i = 0 ; i < company.length ; i++) {
            if(company[i].profileImage){
                if(!validUrl.isUri(company[i].profileImage)){
                     company[i].profileImage = baseUrl+"/uploads/profile/"+company[i].profileImage;
                } 
             
            }
        }
        
    }
     data = company;
  next();

});

}
exports.staffService = function(req,res){
      search = {};
  search['artistId']=Number(req.body.artistId);
  
  staff.aggregate( [
  {  
    $lookup:{
        from: "staffservices", 
        localField: "_id", 
        foreignField: "staffId",
        as: "staffSer"
    }
  },
  { $unwind : "$staffSer" },
  {  
    $lookup:{
        from: "artistservices", 
        localField: "staffSer.artistServiceId", 
        foreignField: "_id",
        as: "artistService"
    }
  },
 { $match :search },
 { 
  "$project": {
      
      "artistServiceId": { "$arrayElemAt": [ "$artistService._id",0] },
      "title": { "$arrayElemAt": [ "$artistService.title",0] }
    
     
      

   }
 },

 
],function(err,company){
    if(company){
      if(data){
        for (i = 0 ; i < data.length ; i++) {
          for(j = 0; j<data[i].staffService.length;j++){
            for(k = 0; k<company.length;k++){
                if(data[i].staffService[j].artistServiceId == company[k].artistServiceId){
                    data[i].staffService[j].title = company[k].title;

                }

            }

          }

        }

      }
      res.json({status: "success",message: 'ok',businessList:data});
    }

});
   
}
exports.checkBooking = function(req,res,next){
   newDate = req.body.date;
      
   if(newDate<dateTime.curDate){
        res.json({'status':'fail','message':'You can not select previous date'});
        return;
    }
   checkData = {}; 
   checkData["bookingDate"] = dateTime.curDate;
   checkData['bookStatus']= '0';
   checkData['artistId']= Number(req.body.artistId);
   serverTime = parseTime(timeConvert(dateTime.curTime));
   booking.aggregate([{$match:checkData}],function(err,userData){
     if(userData.length>0){
                       
               var i = 0;
              async.each(userData, function(element, callback){
                
                  if (parseTime(timeConvert(userData[i].bookingTime)) < serverTime) {
                     
                       booking.deleteMany({'_id':userData[i]._id},function(err, results) {});
                       addNotification.deleteMany({'notifyId':userData[i]._id,'type':'booking'},function(err, results) {});
                       bookingService.deleteMany({'bookingId':userData[i]._id},function(err, results) {});
                        
                  }              
             
                callback();
                    
            i++;
            },function(){
            
            });

    }
    next()   
   
  });            
  
}