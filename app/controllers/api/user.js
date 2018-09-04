var User = require('../../models/front/home.js');//it user for table and coulamn information
var businessHour = require('../../models/front/businesshours.js');
var services = require('../../models/admin/category_model.js');
var subService = require('../../models/admin/sub_category_model.js');
var artistservices = require('../../models/front/artistService.js');
var artistMainService = require('../../models/front/artistMainService.js');
var artistSubService = require('../../models/front/artistSubService.js');
var artistCertificate = require('../../models/front/artistCertificate.js');
var artistFavorite = require('../../models/front/artisteFavorite.js');
var followUnfollow = require('../../models/front/followersFollowing.js');
var likes = require('../../models/front/like.js');
var feed = require('../../models/front/feed.js');
var tag = require('../../models/front/tag.js');
var comment = require('../../models/front/comment.js');
var story = require('../../models/front/myStory.js');
var bookingService  = require('../../models/front/bookingService.js');
var booking     = require('../../models/front/booking.js');
var addNotification     = require('../../models/front/notification.js');
var async = require('async');
var formidable = require('formidable');//it user for get form or post data by http
var fs = require('fs');
var dateFormat = require('dateformat');
var bodyParser = require('body-parser')
var bcrypt = require('bcrypt-nodejs');
var accountSid = 'ACaffcfdead968e5413e801e5e0ebee02c';
var authToken = "b6decf9d17f523d047e5b75064b788e0";
var client = require('twilio')(accountSid, authToken);
var artistfavorite = require('../../models/front/artisteFavorite.js');
var multiparty = require('multiparty');
var staff     = require('../../models/front/staff_model.js');
var staffService      = require('../../models/front/staffService.js');
var validUrl = require('valid-url');
var escapere = require('escape-regexp');
var notify = require('../../../lib/notification.js');
var lodash = require('lodash');

exports.artistSearch = function(req, res,next){
    var baseUrl =  req.protocol + '://'+req.headers['host'];
    var subservice = req.body.subservice;
    var service = req.body.service;
    var serviceType = Number(req.body.serviceType);
    var city = req.body.city;
    var rating = req.body.rating;
    var day = req.body.day;
    var time = req.body.time;
    var sortType = req.body.sortType;
    var sortSearch = req.body.sortSearch;
    datae = {};
    if(req.body.text){
    var text = escapere(req.body.text);
        datae = {$or: [{'cate.serviceName' : { $regex : text,'$options' : 'i' } },{'subcate.subServiceName' : { $regex : text,'$options' : 'i' } },{'service.title' : { $regex : text,'$options' : 'i' } }, {'userName' : { $regex : text,'$options' : 'i' }}]};
    }
    search   = {};
    sortData   = {};
    search['userType'] = 'artist';
    search['isDocument'] = 3;
    if(sortSearch=='price'){
        if(sortType==1){
            sortData["service.inCallPrice"] = -1;
        }else{
          sortData["service.inCallPrice"] = 1;
        }
    }else{
         if(sortType==1){
           sortData["distance"] = -1;
         }else{
           sortData["distance"] = 1;
         }
    }
    if(serviceType){
      search['serviceType'] = {'$ne':serviceType};
    }else{
         search['serviceType'] = {'$ne':2};
    }
    if(service){
        var ser = service.split(",");
        var service = ser.map(function(n) { return Number(n); });
        search['service.serviceId'] = { $in: service};
     }
   
    if(subservice){
        var subSer = subservice.split(",");
        var subservice = subSer.map(function(n) {return Number(n);});
        search['service.subserviceId'] = { $in: subservice};
    }

   if(rating){
        var rat = rating.split(",");
        var rating = rat.map(function(n) {return Number(n);});
        search['ratingCount'] = { $in: rating};
    }

    if(day){
        search['businesshours.day'] = Number(day);
    }

    if(time){
        search["businesshours.startTime"] = {$gte:time};
        search["businesshours.endTime"] = {$gte:time};
    }

        User.aggregate([{
            "$geoNear": {
                  "near": {
                         "type": "Point",
                         "coordinates": [parseFloat(req.body.latitude), parseFloat(req.body.longitude)]
                          },
            maxDistance: 8046.72,
            "spherical": true,
            "distanceField": "distance",
            distanceMultiplier: 1 / 1609.344 // calculate distance in miles "item.name": { $eq: "ab" } }
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
                    from: "artistmainservices", 
                    localField: "_id", 
                    foreignField: "artistId",
                    as: "cate"
            }
         
        }, 
        {  
            $lookup:{
                    from: "artistsubsrervices", 
                    localField: "_id", 
                    foreignField: "artistId",
                    as: "subcate"
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
            $match:search 
        },
        { $sort:sortData},
        { 
            "$project": {
                "_id": 1,
                "userName": 1,
                "firstName": 1,
                "profileImage":1,
                "reviewCount":1,
                "ratingCount":1,
                "businessType":1,
                "businessName":"$businessName",
                "distance":1,
                "service._id":1,
                "service.serviceId":1,
                "service.subserviceId":1,
                "service.title":1,
                "service.description":1,
                "service.inCallPrice":1,
                "service.outCallPrice":1
                /*"businesshours._id":1,
                "businesshours.day":1,
                "businesshours.startTime":1,
                "businesshours.endTime":1*/
             }
        },
        { 
             $match:datae 
        }
    ],function(err, data) {
        

        if(data){
            for (i = 0 ; i < data.length ; i++) {
                if(data[i].profileImage){ 
                    data[i].profileImage = baseUrl+"/uploads/profile/"+data[i].profileImage;
                }
            }
            newData = data.length;
            next();
           
        }else{
            res.json({status:"fail",message:'No record found'});
        }
        
     
    }); 

}
exports.finalData = function(req,res){
   
    var baseUrl =  req.protocol + '://'+req.headers['host'];
    var subservice = req.body.subservice;
    var service = req.body.service;
    var serviceType = Number(req.body.serviceType);
    var city = req.body.city;
    var rating = req.body.rating;
    var day = req.body.day;
    var time = req.body.time;
    var sortType = req.body.sortType;
    var sortSearch = req.body.sortSearch;

    if (req.body.page) {
            page = Number(req.body.page)*Number(req.body.limit);
        } else {
                pg=0;
        }
        if (req.body.limit) {
             limit = Number(req.body.limit);
        } else {
                lmt=10;
        }
        
        User.aggregate([{
            "$geoNear": {
                  "near": {
                         "type": "Point",
                         "coordinates": [parseFloat(req.body.latitude), parseFloat(req.body.longitude)]
                          },
            maxDistance:  8046.72,
            "spherical": true,
            "distanceField": "distance",
            distanceMultiplier: 1 / 1609.344 // calculate distance in miles "item.name": { $eq: "ab" } }
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
                    from: "artistmainservices", 
                    localField: "_id", 
                    foreignField: "artistId",
                    as: "cate"
            }
         
        }, 
        {  
            $lookup:{
                    from: "artistsubsrervices", 
                    localField: "_id", 
                    foreignField: "artistId",
                    as: "subcate"
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
             $match:search 
         },
        { $sort:sortData},
        
       { 
            "$project": {
                "_id": 1,
                "userName": 1,
                "firstName": 1,
                "profileImage":1,
                "reviewCount":1,
                "ratingCount":1,
                "businessType":1,
                "businessName":"$businessName",
                "distance":1,
                "service._id":1,
                "service.serviceId":1,
                "service.subserviceId":1,
                "service.title":1,
                "service.description":1,
                "service.inCallPrice":1,
                "service.outCallPrice":1
                
             }
        },
        { 
             $match:datae 
        },
        { $skip:page },
        { $limit:limit }
    ],function(err, data) {
       

        if(data){
            for (i = 0 ; i < data.length ; i++) {
                if(data[i].profileImage){ 
                    data[i].profileImage = baseUrl+"/uploads/profile/"+data[i].profileImage;
                }
            }
           res.json({status: "success",message: 'successfully',totalCount:newData,artistList:data});
        }else{
            res.json({status:"fail",message:'No record found'});
        }
        
     
    }); 
     

}
exports.artistDetail = function(req,res,next){
    var baseUrl =  req.protocol + '://'+req.headers['host'];
    artistId = Number(req.body.artistId);
    if(req.body.businessType=='independent' ){
  User.aggregate(
    [
        { $match : { _id :artistId } },
        {   "$project": {     
            "userName":"$userName", 
            "firstName":"$firstName", 
            "lastName":"$lastName", 
            "profileImage":"$profileImage", 
            "ratingCount":"$ratingCount", 
            "reviewCount":"$reviewCount", 
            "postCount":"$postCount",
            "businessName":"$businessName",  
            "businessHo": "$businessHo",   
            "serviceType": "$serviceType",   
            "inCallpreprationTime": "$inCallpreprationTime",  
            "outCallpreprationTime": "$outCallpreprationTime",   
            "address": "$address",   
            "latitude": "$latitude",   
            "longitude": "$longitude",
            "radius":"$radius",
            "bankStatus":"$bankStatus"   
        }}, 
        { "$lookup": {     
                "from": "busineshours",     
                "localField": "_id",     
                "foreignField": "artistId",     
                "as": "openingTime"   
        }},
       
    ],function(err, data){
       
       if(data){
            for (i = 0 ; i < data.length ; i++) {
                
                
                 if(data[i].profileImage){ 
                    data[i].profileImage = baseUrl+"/uploads/profile/"+data[i].profileImage;

                }
            }
        
       }

     artistData = data;
     next();

   });
    }else{
  User.aggregate(
    [
        { $match : { _id :artistId } },
        {   "$project": {     
            "userName":"$userName", 
            "firstName":"$firstName", 
            "lastName":"$lastName", 
            "profileImage":"$profileImage", 
            "ratingCount":"$ratingCount", 
            "reviewCount":"$reviewCount", 
            "postCount":"$postCount", 
            "businessName":"$businessName", 
            "businessHo": "$businessHo",
            "serviceType": "$serviceType", 
            "inCallpreprationTime": "$inCallpreprationTime" ,  
            "outCallpreprationTime": "$outCallpreprationTime",
            "address": "$address",   
            "latitude": "$latitude",   
            "longitude": "$longitude",
            "radius":"$radius",
            "bankStatus":"$bankStatus"      
        }}, 
        { "$lookup": {     
                "from": "busineshours",     
                "localField": "_id",     
                "foreignField": "artistId",     
                "as": "openingTime"   
        }}

    ],function(err, data){
       data[0].staffInfo = [{'_id':1,'userName':'raj','profileImage':'http://koobi.co.uk:3000/uploads/profile/1519309064722.jpg','serviceName':'Expert'},{'_id':2,'userName':'ankit','profileImage':'http://koobi.co.uk:3000/uploads/profile/1519309064722.jpg','serviceName':'Beginner'}];
       if(data){
            for (i = 0 ; i < data.length ; i++) {
                
                
                 if(data[i].profileImage){ 
                    data[i].profileImage = baseUrl+"/uploads/profile/"+data[i].profileImage;

                }
            }
            
        
       }
       artistData = data;
       next();
     

    });
  }

}
exports.artistDetailNew = function(req,res,next){
    var baseUrl =  req.protocol + '://'+req.headers['host'];
    artistId = Number(req.body.artistId);
    if(req.body.businessType=='independent' ){
  User.aggregate(
    [
        { $match : { _id :artistId } },
        {   "$project": {     
            "userName":"$userName", 
            "firstName":"$firstName", 
            "lastName":"$lastName", 
            "profileImage":"$profileImage", 
            "ratingCount":"$ratingCount", 
            "reviewCount":"$reviewCount", 
            "postCount":"$postCount",
            "businessName":"$businessName",  
            "businessHo": "$businessHo",   
            "serviceType": "$serviceType",   
            "inCallpreprationTime": "$inCallpreprationTime",  
            "outCallpreprationTime": "$outCallpreprationTime",   
            "address": "$address",   
            "latitude": "$latitude",   
            "longitude": "$longitude",
            "radius":"$radius",
            "bankStatus":"$bankStatus"   
        }}, 
        { "$lookup": {     
                "from": "busineshours",     
                "localField": "_id",     
                "foreignField": "artistId",     
                "as": "openingTime"   
        }},
     
    ],function(err, data){
       
       if(data){
            for (i = 0 ; i < data.length ; i++) {
                
                
                 if(data[i].profileImage){ 
                    data[i].profileImage = baseUrl+"/uploads/profile/"+data[i].profileImage;

                }
            }
        
       }

     artistData = data;
     next();

   });
    }else{
  User.aggregate(
    [
        { $match : { _id :artistId } },
        {   "$project": {     
            "userName":"$userName", 
            "firstName":"$firstName", 
            "lastName":"$lastName", 
            "profileImage":"$profileImage", 
            "ratingCount":"$ratingCount", 
            "reviewCount":"$reviewCount", 
            "postCount":"$postCount", 
            "businessName":"$businessName", 
            "businessHo": "$businessHo",
            "serviceType": "$serviceType", 
            "inCallpreprationTime": "$inCallpreprationTime" ,  
            "outCallpreprationTime": "$outCallpreprationTime",
            "address": "$address",   
            "latitude": "$latitude",   
            "longitude": "$longitude",
            "radius":"$radius",
            "bankStatus":"$bankStatus"      
        }}, 
        { "$lookup": {     
                "from": "busineshours",     
                "localField": "_id",     
                "foreignField": "artistId",     
                "as": "openingTime"   
        }},
    
        { "$project": {
            "_id":1, 
            "userName": 1, 
            "firstName": 1, 
            "lastName": 1, 
            "businessName": 1, 
            "profileImage": 1, 
            "address": 1, 
            "latitude": 1, 
            "longitude": 1, 
            "postCount": 1, 
            "reviewCount": 1, 
            "ratingCount": 1, 
            "radius": 1,
            "bankStatus":1, 
            "serviceType": 1, 
            "inCallpreprationTime": 1, 
            "outCallpreprationTime": 1, 
            "openingTime": "$openingTime"  
        }} 
    ],function(err, data){
      
       
        if(data){
            if(data[0].profileImage){ 
                data[0].profileImage = baseUrl+"/uploads/profile/"+data[0].profileImage;
            }
        }
       artistData = data;
       next();
    
      

    });
  }

}
exports.getArtistService = function (req,res){ 
    artistId = Number(req.body.artistId);
    async.parallel([

   function(callback) {
        var query = artistMainService.find({'artistId':artistId,'status':1,'deleteStatus':1},{'serviceId':1,'serviceName':1})
        query.exec(function(err, ser) {
            if (err) {
                callback(err);
            }
 
            callback(null, ser);
        });
    },
    function(callback) {
        var query = artistSubService.find({'artistId':artistId,'status':1,'deleteStatus':1})
        query.exec(function(err, sub) {
            if (err) {
                callback(err);
            }
 
            callback(null, sub);
        });
    },
    function(callback) {
        var query = artistservices.find({'artistId':artistId,'status':1,'deleteStatus':1},{'_id':1,'subserviceId':1,'title':1,'inCallPrice':1,'outCallPrice':1,'completionTime':1})
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
    
    
   // return res.send(200,  serArr);
}else{
    console.log('hello');
}
     artistData[0]['allService'] =serArr;
      //  var combineResults = {'artistInfo':artistData[0],'allService':results[0]};
        res.json({status: "success",message: 'successfully',artistDetail: artistData[0]});
       return;
});
}
exports.getArtistServiceNew = function (req,res){ 
    var baseUrl =  req.protocol + '://'+req.headers['host'];
     artistId = Number(req.body.artistId);
     search ={};
     search['businessId'] = artistId;
     
    async.parallel([

   function(callback) {
        var query = artistMainService.find({'artistId':artistId,'status':1,'deleteStatus':1},{'serviceId':1,'serviceName':1})
        query.exec(function(err, ser) {
            if (err) {
                callback(err);
            }
 
            callback(null, ser);
        });
    },
    function(callback) {
        var query = artistSubService.find({'artistId':artistId,'status':1,'deleteStatus':1})
        query.exec(function(err, sub) {
            if (err) {
                callback(err);
            }
 
            callback(null, sub);
        });
    },
    function(callback) {
        var query = artistservices.find({'artistId':artistId,'status':1,'deleteStatus':1},{'_id':1,'subserviceId':1,'title':1,'inCallPrice':1,'outCallPrice':1,'completionTime':1})
        query.exec(function(err, s) {
            if (err) {
                callback(err);
            }
 
            callback(null, s);
        });
    },
 
     function(callback) {
      
        var query =   staff.aggregate( [
                      {  
                        $lookup:{
                            from: "staffservices", 
                            localField: "_id", 
                            foreignField: "staffId",
                            as: "staffService"
                        }
                      },
                     
                     { $match :{'businessId':artistId} },

                     
                    ]);
            query.exec(function(err, stfService) {
            if (err) {
                callback(err);
            }
 
            callback(null, stfService);
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
              /* jsArr = [];
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
                subArr[0].artistService = jsArr;*/
               //console.log(subArr[0]);
               //end code
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
    
    
    
    staffInfo = [];
    if(results[3].length>0){
        //console.log(results[3]);
        for (var i = 0;i<results[3].length;i++) {  
          

          for (var t = 0;t<results[3][i].staffService.length;t++) {  
          
            for (var r = 0; r < results[2].length; r++) {
               
                 if (results[3][i].staffService[t].artistServiceId == results[2][r]._id) {

                     results[3][i].staffService[t].title = results[2][r].title;
 
                 }

            }
         }          
            staffInfo.push({
                'staffId':results[3][i].artistId,
                'staffName':results[3][i].staffInfo.userName,
                'staffImage':baseUrl+'/uploads/profile/'+results[3][i].staffInfo.profileImage,
                'staffHours':results[3][i].staffHours,
                'job':results[3][i].job,
                'mediaAccess':results[3][i].mediaAccess,
                'holiday':results[3][i].holiday,    
                'staffServiceId':results[3][i].staffServiceId,   
                'staffService':results[3][i].staffService   
            });
        }
    }
     //return res.send(200,  results[3].staffDet = staffInfo);
    
}else{
    console.log('hello');
}
     artistData[0]['allService'] =serArr;
     artistData[0]['staffInfo'] =staffInfo;
      //  var combineResults = {'artistInfo':artistData[0],'allService':results[0]};
        res.json({status: "success",message: 'successfully',artistDetail: artistData[0]});
       return;
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
       
         
            res.json({status:"success",message:'ok',serviceList:data});
           
                    
                }
      
    });
}
exports.allCategory = function(req, res) {
   var baseUrl =  req.protocol + '://'+req.headers['host'];

       async.parallel([

   function(callback) {
        var query = services.find({'status':1,'deleteStatus':1})
        query.exec(function(err, ser) {
            if (err) {
                callback(err);
            }
 
            callback(null, ser);
        });
    },
    function(callback) {
        var query = subService.find({'status':1,'deleteStatus':1})
        query.exec(function(err, sub) {
            if (err) {
                callback(err);
            }
 
            callback(null, sub);
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
           if(results[0][i]._id == results[1][j].serviceId){
      
                subArr.push({
                            _id: results[1][j]._id,
                             serviceId: results[1][j].serviceId,
                             image: baseUrl+"/uploads/subservice/"+results[1][j].image,
                             title: results[1][j].title
                        });
            }
       }
       serArr.push({
            _id:results[0][i]._id,
            title:results[0][i].title,
            subService:subArr
        }); 
    }
      
   
      
    res.json({status:"success",message:'ok',serviceList:serArr});
   // return res.send(200,  serArr);
}else{
     res.json({status: "fail",message:'No record found.'});
       return;
}
    
});

}
exports.addFavorite = function(req,res){
    userId = req.body.userId;
    artistId = req.body.artistId;
    type = req.body.type;
   
    if(userId ==''){
       res.json({status: 'fail',message: "User id is required."});
       return;
    }
    if(artistId == ''){
         res.json({status: 'fail',message: "Artist id is required."});
         return;
    }
    if(type == ''){
         res.json({status: 'fail',message: "Type is required."});
         return;

    }
     var addNew = {
            userId:userId,
            artistId:artistId
         };
    
    if(type == 'favorite'){
        autoId = 1;
        artistFavorite.find().sort([['_id', 'descending']]).limit(1).exec(function(err, result) {

            if (result.length > 0) {
                addNew._id = result[0]._id + 1;
            }
       
            artistFavorite(addNew).save(function(err, data) {
                if (err) {
                    res.json({status:"fail",message:err});
                    return;
                } else {
                        /*code for notification*/ 
                        var typ = '12';
                        var sender     =userId;
                        var receiver   = artistId; 
                        var notifyId   = artistId;
                        var notifyType = 'social';  
    
                        if(sender!=receiver){
                           notify.notificationUser(sender,receiver,typ,notifyId,notifyType); 
                        }

                        /*end notification code*/ 

                    res.json({status:"success",message: 'ok'});
                    return;
                }

            });
      
        });

    }else{
          artistFavorite.deleteMany(addNew, function(err, results){
          if(err) throw err;
            res.json({status:"success",message: 'ok'});
          });
    }


}
exports.updateRecord = function(req,res){
    console.log(req.body);
 if(req.body){
    User.update({ _id:authData._id },{ $set:req.body},function(err, result) {
        
       res.json({status:"success",message:'record update successfully'});
     });

 }
}
function readAndWriteFile(singleImg, newPath) {

        fs.readFile(singleImg.path , function(err,data) {
            fs.writeFile(newPath,data, function(err) {
                if (err) console.log('ERRRRRR!! :'+err);
                console.log('Fitxer: '+singleImg.originalFilename +' - '+ newPath);
            })
        })
}
function readAndWriteFile1(singleImg, newPath) {
     

        fs.readFile(singleImg[0].path , function(err,data) {
            fs.writeFile(newPath,data, function(err) {
                if (err) console.log('ERRRRRR!! :'+err);
                console.log('Fitxer: '+singleImg.originalFilename +' - '+ newPath);
            })
        })
}
exports.addMyStory = function(req,res){
  
    var form = new multiparty.Form();
    var fs = require('fs');
    var moment = require('moment');
    var crd =  moment().format();
    form.parse(req, function(err, fields, files) { 
        followUnfollow.find({'userId':Number(fields.userId),'status':1}).sort([['_id', 'ascending']]).exec(function(err, followData) {
            folInfo = [];   
            if(followData){

                 a = [];
                 a= followData.map(a => a.followerId);
                 a.push(Number(fields.userId));         
                 folInfo.flUser =a ;

            }else{
                folInfo.flUser = [];
                
            }

           if(fields.userId){
            var userId = Number(fields.userId);
           }else{
             var userId = authData._id;
           }
            
            var baseUrl =  req.protocol + '://'+req.headers['host'];
                jsArr = []
                thumbArr = []
                if(files.myStory){
                    
                    var imgArray = files.myStory;
                    for (var i = 0; i < imgArray.length; i++) {
                         
                    var newPath = './public/uploads/myStory/';
                   
                    var singleImg = imgArray[i];
                    nmFeed = Date.now()+i;
                    if(imgArray[i].headers['content-type']=='video/mp4'){
                         nm = nmFeed+ '.mp4';
                         feedUrl = nm;
                         //thumb   =  nmFeed+ '.jpg';
                         thumb   =  nmFeed+ '.jpg';

                    }else{
                         nm = Date.now()+i+ '.jpg';
                         feedUrl = nm;
                         thumb='';
                    }    
                    
                   
                    newPath+= nm;
                    //console.log(newPath);
                    videopath ='./public/uploads/myStory/'+nm;
                    readAndWriteFile(singleImg, newPath);
                  /* if(imgArray[i].headers['content-type']=='video/mp4'){
                     var ffmpeg=require('fluent-ffmpeg');
                     
                        ffmpeg(videopath).screenshots({
                                count: 1, //number of thumbnail want to generate
                                folder: './public/uploads/myStory',//path where you want to save
                                filename: nmFeed + '.jpg',
                                size: '320x240'
                            }).on('end', function () {
         
                           });
                            
                   }*/
                    jsArr.push({
                     myStory: feedUrl,
                     type:'image'
                     
                   
                });
                           
                    }  

                }

                if(files.videoThumb){
                    
                    var imgArray1 = files.videoThumb;
                    for (var i = 0; i < imgArray1.length; i++) {
                         
                    var newPath = './public/uploads/myStory/';
                   
                    var singleImg = imgArray1[i];
                    nmFeed = Date.now()+i;
                    nm = Date.now()+i+ '.jpg';
                    feedUrl = nm;
                   
                   
                    newPath+= nm;
                    
                    videopath ='./public/uploads/myStory/'+nm;
                    readAndWriteFile2(singleImg, newPath);
                     thumbArr.push({
                     videoThumb: feedUrl
                     
                   
                });
                           
                    }  

                }

           /* feeds = jsArr;*/
            stor =[];
          if(thumbArr.length>0){
           for(var i = 0; i < jsArr.length; i++) {
                     
                for(var j = 0; j < thumbArr.length; j++) {
                     //console.log(thumbArr[j].videoThumb);
                     if(i==j){
                        stor.push({
                            myStory: jsArr[i].myStory,
                            videoThumb:thumbArr[j].videoThumb,
                            type:'video',
                            userId: userId
                        });
                    }

                }


           

               }
            }else{
                  for(var i = 0; i < jsArr.length; i++) {
                    stor.push({
                    myStory: jsArr[i].myStory,
                    videoThumb:'',
                    type:'image',
                    userId: userId


                    });
               }

            }
           
            var addNew = [];

            autoId = 1;
            
                story.find().sort([
                    ['_id', 'descending']
                ]).limit(1).exec(function(err, userdata) {
                    var autoId = 1;

                    if (userdata.length > 0) {
                        autoId = userdata[0]._id + 1;

                    }

                    for (var k = 0; k < stor.length; k++) {
                        inc = autoId + k;

                        addNew.push({
                            _id: inc,
                            myStory: stor[k].myStory,
                            videoThumb: stor[k].videoThumb,
                            type: stor[k].type,
                            userId: stor[k].userId,
                            crd: crd,
                            upd: crd
                            
                        });

                    }
                   // console.log(addNew);

                    story.insertMany(addNew);
                    if(folInfo.flUser){
                        console.log(folInfo.flUser);
                           /*code for notification*/   

                               var appUser = require("./user");  
                               req.body.notifincationType = '13';
                               req.body.notifyId   = inc;
                               req.body.notifyType = 'social'; 
                               req.body.userId = userId; 

                               appUser.sendMultiple(req,res); 
                                         
                            /*end notification code*/   
                    } 
                    res.json({
                        'status': "success",
                        "message": 'ok'
                    });
                   return;
                });
        });
    });
}
function readAndWriteFile2(singleImg, newPath) {

        fs.readFile(singleImg.path , function(err,data) {
            fs.writeFile(newPath,data, function(err) {
                if (err) console.log('ERRRRRR!! :'+err);
                console.log('Fitxer: '+singleImg.originalFilename +' - '+ newPath);
            })
        })
}
exports.deleteOldStory = function(req,res,next){
     var moment = require('moment');
     var currentDate =  moment().format();
     //var then = "2018-03-26T08:54:34+00:00";

     nextData ={};
     nextData = req.body;
     story.find({},{'_id':1,'crd':1}, function(err, dataUser)
       {
        if (dataUser.length==0){
           res.json({status:"sucess",message:'No record found'});
           return;
        }else{ 
             jsArr =[];
            for (d = 0 ; d < dataUser.length ; d++) {
                var endTime =  moment(currentDate).diff(moment(dataUser[d].crd), 'hours');
                 
                if(endTime>=24){
                    jsArr.push(Number(dataUser[d]._id));
                  
                }
          
            }
            story.remove({'_id':{'$in':jsArr}},function(err,result){
           	addNotification.remove({'notifyId':{'$in':jsArr},'notifincationType':13},function(err,result){});
             nextData = result;
             next(); 
            })
        }
    });
}
exports.getMyStoryUser =function(req,res){
     var baseUrl =  req.protocol + '://'+req.headers['host'];
    story.aggregate(
    [   {$group:{_id:"$userId", dups:{$push:"$userId"}, count: {$sum: 1}}},
     
        { "$lookup": {     
                "from": "users",     
                "localField": "_id",     
                "foreignField": "_id",     
                "as": "userInfo"   
        }},
         { "$unwind": "$userInfo" }, 
        { "$project": { 
            _id :"$userInfo._id",
            userName :"$userInfo.userName",
            firstName :"$userInfo.firstName",
            lastName :"$userInfo.lastName",
            profileImage :"$userInfo.profileImage",
            count:1
           
        }} 
    ],function(err,data){
        for (i = 0 ; i < data.length ; i++) {
            if(data[i].profileImage){ 
             data[i].profileImage = baseUrl+"/uploads/profile/"+data[i].profileImage;
            }
        }
            res.json({status: "success",message: 'ok',myStoryList: data});
        });

}
exports.getMyStory = function(req,res){
       var baseUrl =  req.protocol + '://'+req.headers['host'];
       if(req.body.userId){
         user_id =req.body.userId;        
        }else{
          user_id =authData._id;
        }
       story.find({'userId':user_id}, function(err, data)
       {
        if (data.length==0){
          res.json({status:"sucess",message:'No record found'});
        }else{ 

            for (i = 0 ; i < data.length ; i++) {
               
              if(data[i].myStory){ 
                data[i].myStory = baseUrl+"/uploads/myStory/"+data[i].myStory;
              
              }
              if(data[i].videoThumb){ 
                data[i].videoThumb = baseUrl+"/uploads/myStory/"+data[i].videoThumb;
              
              }
            }
          res.json({status:"success",message:'ok',allMyStory:data});
        }
      }).sort( { _id: 1 } );
}

exports.bookingInfo = function(req,res,next){
    bookInfo =req.body;
    //bookInfo ={};
    if(req.body.bookingId){
        bookingService.findOne({'_id':req.body.bookingId}).exec(function(err, bdata) {
            if(bdata){
                bookingService.findOne({'userId':req.body.userId,'artistId':req.body.artistId,'bookingStatus':0},{'startTime':1,'bookingDate':1}).count().exec(function(err, bcdata) {
               // bookInfo={'bookStartTime':bdata.startTime,'bookingDt':bdata.bookingDate,'totalBooking':bcdata}; 
                bookInfo.bookStartTime =bdata.startTime;
                bookInfo.bookingDt =  bdata.bookingDate;
                bookInfo.totalBooking= bcdata; 
                next();
               });
            }
       
        });

    }
    else{
        bookInfo =req.body;
        next();
    }

}
 exports.artistTimeSlot = function(req, res) {
  
    datae = {};
    datae["artistId"] = Number(req.body.artistId);
    datae["day"] = Number(req.body.day);
    date = req.body.date;
    //var rew = date.split("/");
    //var newDate = rew[2]+'-'+rew[1]+'-'+rew[0];
    var newDate = req.body.date;
    var userId  = Number(req.body.userId);
    var type =  req.body.type;
   // var BookingTime  =  req.body.BookingTime;
    //var bookingDate  =  req.body.bookingDate;
    var BookingId  =    req.body.bookingId;
    //var bookingCount  =     req.body.bookingCount;
    /*if(req.body.currentTime){
        curentTime =    parseTime(timeConvert(req.body.currentTime));
    }else{
      curentTime =0;
    }*/
    if(date<dateTime.curDate){
        res.json({'status':'fail','message':'You can not select previous date'});
        return;
    }
    if(bookInfo.bookStartTime){
        var BookingTime  =  bookInfo.bookStartTime;
    }else{
        var BookingTime  = '';
    }
    if(bookInfo.bookingDt){
       var bookingDate  =   bookInfo.bookingDt;
    }else{
       var bookingDate  =   '';
    }
    if(bookInfo.totalBooking){
       var bookingCount  =  bookInfo.totalBooking;
    }else{
       var bookingCount  =  '';
    }
    if(dateTime){
        curentTime =    parseTime(timeConvert(dateTime.curTime));
    }else{
        curentTime =    parseTime(timeConvert(req.body.currentTime));
    }
    serviceTime =   req.body.serviceTime;
    

    businessHour.find(datae).sort([['_id', 'ascending']]).exec(function(err, data) {
        
        if(data){
           
            var start_time =  Array();
            var end_time =  Array();
            var bussy_slot = Array();
            //var Ntime_slots = Array();

            data.forEach(function(rs) {

                start_time.push(parseTime(timeConvert(rs.startTime)));
                end_time.push(parseTime(timeConvert(rs.endTime)));

            });

            var bookData = {};
                bookData['artistId'] = Number(req.body.artistId);
                bookData['bookingDate'] = date;
                bookData['bookingStatus']= {'$ne':2}
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
                
                if(AbookingDate<=date){
                    
                    var bussy_slot = bookingTime(bookingSTime, bookingETime, interval);
                    var times_ara = calculate_time_slot( start_time, end_time, interval,date,bussy_slot,AbookingTime,curentTime,AbookingDate,date);
                    var Ntime_slots = final_time_slot(times_ara, serviceTime);
                }

                var selectData = Array();

                    if(type=="edit"){

                    Ntime_slots.forEach(function(data) {
                        
                        if(data==BookingTime && date==bookingDate){

                            selectData.push(1);

                        }else{

                            selectData.push(0);
                        }

                    });
                }
                res.json({'status':'success','message':'ok','timeSlots':Ntime_slots,selectData:selectData});
                return;
                });
            });

        }

    });
     
}
exports.bookArtist = function(req, res){
   if(req.body.startTime==''){
       res.json({status: "fail",message: 'Start time is required.'});
       return;
    }
    if(req.body.endTime==''){
        res.json({status: "fail",message: 'End time is required.'});
        return;

    }

    data = {};
    var staff = req.body.staff;
    var userId  = req.body.userId;
    data['artistId'] = req.body.artistId;
    staff1 = staff ? staff : 0; 
    if(staff){
        data['staff'] = staff;
    }
    data['serviceId'] = req.body.serviceId;
    data['subServiceId'] = req.body.subServiceId;
    data['artistServiceId'] = req.body.artistServiceId;
    data['bookingDate'] = req.body.bookingDate;
    data['startTime'] = req.body.startTime;
    data['endTime'] = req.body.endTime;
    data['userId'] = userId;
    data['serviceType'] = req.body.serviceType;
    data['bookingPrice'] = req.body.price;
    data['timeCount'] = parseTime(timeConvert(req.body.startTime));
    BookingId = req.body.bookingId;

    if(BookingId){

        bookingService.find({'artistId':data.artistId,'userId':userId,'bookingStatus':0}).sort([['_id', 'descending']]).exec(function(err,brd) { 

                bookingService.findOne({'_id':BookingId}).sort([['_id', 'descending']]).exec(function(err,rd) { 

                if(rd){

                    if(rd.bookingDate==data.bookingDate && rd.startTime==data.startTime && data.endTime==rd.endTime){
                                    
                        res.json({'status':'success','message':'Service already updated','bookingId':BookingId});
                        return;

                    }else{

                        if(rd.bookingDate>data.bookingDate || (brd[0].bookingDate>data.bookingDate)){
                          
                            bookingService.updateMany({'_id':BookingId},{$set: data}, function(err, docs){  });
                            res.json({'status':'success','message':'Service update successfully','bookingId':BookingId});
                            return;


                        }else if(brd[0].bookingDate==data.bookingDate && parseTime(timeConvert(data.startTime))<=parseTime(timeConvert(brd[0].startTime))){
                                
                            bookingService.updateMany({'_id':BookingId},{$set: data}, function(err, docs){  });
                            res.json({'status':'success','message':'Service update successfully','bookingId':BookingId});
                            return;


                        }else{

                        
                                bookingService.remove( {'_id':BookingId}, function(err, result) { });
                                bookingService.findOne().sort([['_id', 'descending']]).limit(1).exec(function(err,userdata) { 
                                        
                                    var b = 1;
                                    if(userdata){

                                        b = userdata._id+1;
                                    }
                                    data['_id'] = b;

                                   
                                    bookingService.insertMany(data,function(err,my) {
                                                                
                                    }); 

                                    res.json({'status':'success','message':'Service update successfully','bookingId':data._id});
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
                
                if(red.staff==staff ){
                    res.json({'status':'fail','message':'Service already added','bookingId':red._id});
                    return;

                }else{
                     bookingService.updateMany({'_id':red._id},{$set: data}, function(err, docs){  });
                     res.json({'status':'success','message':'Service update successfully','bookingId':red._id});
                     return;

                }


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

                        res.json({'status':'success','message':'Service added successfully','bookingId':data._id});
                        return;

                   });


                    }

                });
            }

        });

    }
    

}
exports.confirmBooking = function(req,res){
    if(req.body.userId==''){
        res.json({status:'fail',message:'userId is required.'});
        return;
    
    }
    if(req.body.artistId==''){
        res.json({status:'fail',message:'artistId is required.'});
        return;
     
    }
    data = {};
    var userId  = req.body.userId;

    data['artistId'] = req.body.artistId;
    data['bookingDate'] = req.body.bookingdate;
    data['bookingTime'] = req.body.bookingTime;
    data['location'] = req.body.location;
    data['totalPrice'] = req.body.totalPrice;
    data['paymentType'] = req.body.paymentType;
    data['timeCount'] = parseTime(timeConvert(req.body.bookingTime));
    data['userId'] = userId;

    bookingService.remove( {'userId':userId,'artistId':{'$ne':data.artistId},'bookingStatus':0}, function(err, result) { });


    booking.findOne().sort([['_id', 'descending']]).limit(1).exec(function(err,userdata) { 

        var b = 1;
        if(userdata){

            b = userdata._id+1;
        }
        data['_id'] = b;

        bookingService.updateMany({'userId':userId,'artistId':Number(data.artistId),'bookingStatus':0},{$set: {'bookingStatus':1,'bookingId':b}}, function(err, docs){  });

        booking.insertMany(data,function(err,my) {

            /*code for notification*/   
            
            var type = '1';
            var userId    = data['userId'];
            var artistId  = data['artistId']; 
            var notifyId   = data['_id'];
            var notifyType = 'booking'; 
            notify.notificationUser(userId,artistId,type,notifyId,notifyType); 
            
            /*end notification code*/   
                                    
        }); 
        res.json({'status':'success','message':'Booking added successfully'});  
        return;

    }); 
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
function calculate_time_slot(start_time, end_time, interval = "10", day, bussy_slot, AbookingTime,curentTime,AbookingDate,newDate){



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
    //console.log(time_slots); 
 return time_slots;
 }
 function final_time_slot(times_ara, serviceTime){
    if(serviceTime){
     serviceTime =    parseTimeService(serviceTime);
    }
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
                        /* res.json({'status':'success','message':'ok','serviceTime':today});
                        return;*/


            }
    });
     
}
exports.like = function(req,res){
    if(req.body.userId){
       var userId = Number(req.body.userId);
     }else{
        res.json({status: 'fail',message: "User id is required."});
         return;
     }
     
    if(req.body){
        var addNew = {
            feedId:req.body.feedId,
            userId:req.body.userId,
            likeById:req.body.likeById,
            gender:req.body.gender ? req.body.gender : 'male',
            age:req.body.age ? req.body.age : 20,
            city:req.body.city ? req.body.city : 'indore',
            state:req.body.state ? req.body.state : 'mp',
            country:req.body.country ? req.body.country : 'India',
            type:req.body.type
            
         };
    }else{
         res.json({status: 'fail',message: "feedId is required."});
         return;
    }
    autoId = 1;
    likes.find().sort([
        ['_id', 'descending']
    ]).limit(1).exec(function(err, result) {
            if (result.length > 0) {
                addNew._id = result[0]._id + 1;
            }
             likes.findOne({'feedId':req.body.feedId,'likeById':req.body.likeById,'type':'feed'}, function(err, data) {
            if(data){
 
                        feed.findOne({'_id':req.body.feedId,'status':1}, function(err, result1) {
                            
                            if(data.status==1){
                                   setValue = {'status':0}
                                   if(result1.likeCount>0){
                                    count = result1.likeCount-1;
                                }else{
                                    count =0;
                                }
                                   
                            }else{
                                    setValue = {'status':1}
                                    count = Number(result1.likeCount)+1;
                            }
                            likes.update({ _id:data._id },{ $set:setValue},
                            function(err, result2) { });
                            feed.update({ _id:req.body.feedId },{ $set:{likeCount:count}},
                            function(err, result2) {res.json({status: "success",message: 'ok'});
                                    return; });

                            if(data.status==0){

                               /*code for notification*/ 
                                var typ = '10';
                                var sender     = addNew.likeById;
                                var receiver   = addNew.userId; 
                                var notifyId   = addNew.feedId;
                                var notifyType = 'social';  
                                if(sender!=receiver){
                                   notify.notificationUser(sender,receiver,typ,notifyId,notifyType); 
                                }

                                /*end notification code*/
                                
                            } 
                         });
                    }else{

                            likes(addNew).save(function(err, data) {
             
                                if (err) {
                                    res.json({
                                        status: "fail",
                                        message:err
                                    });
                                    return;
                                } else {

                                    feed.findOne({'_id':req.body.feedId,'status':1}, function(err, result4) {
                                      
                                     count = Number(result4.likeCount)+1;
                                     feed.update({ _id:req.body.feedId },{ $set:{likeCount:count}},
                                     function(err, result5) { });
                                     
                                     });

                                    /*code for notification*/ 
                                    var typ = '10';
                                    var sender     = addNew.likeById;
                                    var receiver   = addNew.userId; 
                                    var notifyId   = addNew.feedId;
                                    var notifyType = 'social';  
                                    if(sender!=receiver){
                                       notify.notificationUser(sender,receiver,typ,notifyId,notifyType); 
                                    }

                                    /*end notification code*/ 

                                    res.json({status: "success",message: 'ok'});
                                    return;
                                }
                            });
                    }
           });
    });       
}
exports.likeList = function (req,res,next){ 
    var baseUrl =  req.protocol + '://'+req.headers['host'];
     //var Value_match = new RegExp(req.body.search);
     var Value_match =  escapere(req.body.search);
    async.parallel([
 
    function(callback) {
        var query =     likes.aggregate([
                    
                       {
                        $lookup: {
                            from: "users",
                            localField: "likeById",
                            foreignField: "_id",
                            as: "userInfo"
                        }
                    },
                     { "$unwind": "$userInfo" },
                     {
                        $match: {
                          'userInfo.userName':{$regex:Value_match,$options:'i'},
                          'feedId':Number(req.body.feedId),
                          'type':'feed',
                          'status':1
                        }
                    },
                    {   
                        $project:{
                            "likeById" :1,
                            userName :"$userInfo.userName",
                            firstName :"$userInfo.firstName",
                            lastName :"$userInfo.lastName",
                            profileImage :"$userInfo.profileImage"

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
        var query = followUnfollow.find({'userId':req.body.userId,'status':1})
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
    if(results[0]){
        newData = results[0].length;

  }else{
        newData = 0;
 
  }
  next();  

});
}
exports.likeListFinal = function (req,res){ 
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
     var Value_match = escapere(req.body.search);
    async.parallel([
 
    function(callback) {
        var query =     likes.aggregate([
                    
                       {
                        $lookup: {
                            from: "users",
                            localField: "likeById",
                            foreignField: "_id",
                            as: "userInfo"
                        }
                    },
                     { "$unwind": "$userInfo" },
                     {
                        $match: {
                          'userInfo.userName':{$regex:Value_match,$options:'i'},
                          'feedId':Number(req.body.feedId),
                          'type':'feed',
                          'status':1
                        }
                    },
                    { $skip:page },
                    { $limit:limit },
                    {   
                        $project:{
                            "likeById" :1,
                            userName :"$userInfo.userName",
                            firstName :"$userInfo.firstName",
                            lastName :"$userInfo.lastName",
                            profileImage :"$userInfo.profileImage"

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
        var query = followUnfollow.find({'followerId':req.body.userId,'status':1})
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
    
    if (err) {
        console.log(err);
        return res.send(400);
    }
 
    if (results == null) {
        return res.send(400);
    }
     //

     if(results[0]){

    for(var i = 0; i < results[0].length; i++) {
        if(results[0][i].profileImage){ 
            results[0][i].profileImage = baseUrl+"/uploads/profile/"+ results[0][i].profileImage;
        }
/*        if(results[1].length>0){ 
            for(var j = 0; j < results[1].length; j++) {
                                  
                if(results[0][i].likeById==results[1][j].followerId){
                      results[0][i].followerStatus = 1;
                    }else{
                        results[0][i].followerStatus = 0;
                    }
                    
                    
                } 
         }else{
            
            results[0][i].followerStatus = 0;
         }*/  

        var likeFeed = results[1].map(a => a.userId);
        console.log(likeFeed);
        console.log(results[0][i].likeById);
        if(results[1].length>0){
            var a = likeFeed.indexOf(results[0][i].likeById);

            if(a >-1){
                results[0][i].followerStatus = 1
            }else{
              results[0][i].followerStatus = 0
            }

        }else{
             results[0][i].followerStatus = 0

        }     
            
     
    }
    
}else{
    res.json({status:"fail",message:'No record found'});
}
   // var combineResults =   { goal1: results[0], goal: results[1]};
    var combineResults =    results[0];
   console.log(combineResults);
    res.json({status:"success",message:'ok',likeList:combineResults,'total':newData});
});
}
exports.followFollowing = function(req, res) {
     var userId = req.body.userId;
     var followerId = req.body.followerId;
     if(req.body.followerId){
        var addNew = {
            followerId:userId,
            userId: followerId
        }

    } else {
        return res.json({status: 'fail',message: "followerId is required."});
        
    }
    autoId = 1;
    followUnfollow.find().sort([
        ['_id', 'descending']
    ]).limit(1).exec(function(err, result) {
        if (result.length > 0) {
            addNew._id = result[0]._id + 1;
        }
        User.findOne({'_id':followerId},{'followersCount':1},function(err, fwCount) {
                       
             User.findOne({'_id':userId},{'followingCount':1},function(err, userFlCount) {
                       
                followUnfollow.findOne({'followerId': userId,'userId':followerId},function(err,data){
                    
                    if (data) {
                        if (data.status == 1) {

                                setValue = {'status': 0}
                                followerUserCount = Number(fwCount.followersCount) - 1;
                                followingUserCount = Number(userFlCount.followingCount) - 1;
                        }else{
                                setValue = {'status':1}
                                followerUserCount = Number(fwCount.followersCount)+1;
                                followingUserCount = Number(userFlCount.followingCount)+1;
                        }

                        User.update({_id:followerId},{$set:{followersCount:followerUserCount}},function(err, result) {});
                        User.update({_id:userId},{$set:{followingCount: followingUserCount}},function(err, result) {});    
                    
                        followUnfollow.update({_id:data._id},{$set:setValue},function(err, docs) {

                            if(data.status==0){

                                /*code for notification*/ 
                                    var type = '12';
                                    var sender     =userId;
                                    var receiver   = followerId; 
                                    var notifyId   = userId;
                                    var notifyType = 'social';  
                
                                    if(sender!=receiver){
                                       notify.notificationUser(sender,receiver,type,notifyId,notifyType); 
                                    }

                                /*end notification code*/ 
                            }
                            if (err) res.json(err);
                            return res.json({status: "success",message: 'ok'});
                        });

                    }else{
                            followUnfollow(addNew).save(function(err, data) {
                                if (err) {
                                    return res.json({status:"fail",message:err});
                                } else {
                                        followerUserCount = Number(fwCount.followersCount)+1;
                                        followingUserCount = Number(userFlCount.followingCount)+1;
                                                  
                                        User.update({_id:followerId},{$set:{followersCount:followerUserCount}},function(err, result) {});
                                        User.update({_id:userId},{$set:{followingCount: followingUserCount}},function(err, result) {});
                                            
                                         /*code for notification*/ 
                                            var type = '12';
                                            var sender     =userId;
                                            var receiver   = followerId; 
                                            var notifyId   = userId;
                                            var notifyType = 'social';  
                        
                                            if(sender!=receiver){
                                               notify.notificationUser(sender,receiver,type,notifyId,notifyType); 
                                            }

                                         /*end notification code*/ 
                                        return res.json({status:"success",message:'ok'});
                                }

                            });

                    }

                });      
            }); 

        });

    });
}
exports.followFollowingRight = function(req, res) {
     var userId = req.body.userId;
     var followerId = req.body.followerId;
     if(req.body.followerId){
        var addNew = {
            followerId:userId,
            userId: followerId
        }

    } else {
        res.json({
            status: 'fail',
            message: "followerId is required."
        });
        return;
    }
    autoId = 1;
    followUnfollow.find().sort([
        ['_id', 'descending']
    ]).limit(1).exec(function(err, result) {
        if (result.length > 0) {
            addNew._id = result[0]._id + 1;
        }
        followUnfollow.findOne({'followerId': userId,'userId':followerId},function(err,data){
            if (data) {
                if (data.status == 1) {
                    setValue = {'status': 0}
                    
                    User.findOne({'_id':followerId},{'followersCount':1},function(err, fw) {
                        count = Number(fw.followersCount) - 1;
                        User.update({_id:followerId},{$set:{followersCount:count}},function(err, result) {});
                    });

                    User.findOne({'_id':userId},{'followingCount':1},function(err, data) {
                        count = Number(data.followingCount) - 1;
                        User.update({_id:userId},{$set:{followingCount:count}},function(err, result) {});
                    });


                } else {
                    setValue = {'status':1}
                    User.findOne({'_id':followerId},{'followersCount':1},function(err, fw) {
                        count = Number(fw.followersCount) + 1;
                        User.update({_id:followerId},{$set:{followersCount:count}},function(err, result) {});
                    });

                    User.findOne({'_id':userId},{'followingCount':1 }, function(err, data) {
                        count = Number(data.followingCount) + 1;
                        User.update({_id:userId},{$set:{followingCount:count}},function(err, result) {});
                    });
                }
                followUnfollow.update({_id:data._id},{$set:setValue},function(err, docs) {
                        if (err) res.json(err);
                        return res.json({status: "success",message: 'ok'});
                    });
            } else {
                followUnfollow(addNew).save(function(err, data) {
                    if (err) {
                        res.json({status:"fail",message:err});
                        return;
                    } else {

                        User.findOne({'_id':followerId},{'followersCount':1},function(err, fw) {
                            count = Number(fw.followersCount) + 1;
                            User.update({_id:followerId},{$set:{followersCount:count}},function(err, result) {});
                        });

                        User.findOne({'_id':userId},{'followingCount':1},function(err, data) {
                            count = Number(data.followingCount) + 1;
                            User.update({_id:userId},{$set:{followingCount: count}},function(err, result) {});
                        });
                        res.json({status:"success",message:'ok'});
                        return;
                    }

                });
            }

        });


    });
}

exports.followerLisOld = function(req,res){
    var baseUrl =  req.protocol + '://'+req.headers['host'];
    followUnfollow.aggregate([{$match: {userId:authData._id,status:1}},
                    {$lookup: {from: "users",localField: "followerId",foreignField: "_id",as:"userInfo"}},
                    { "$unwind": "$userInfo" },
                    {   
                        $project:{
                            followerId :"$userInfo._id",
                            userName :"$userInfo.userName",
                            firstName :"$userInfo.userName",
                            lastName :"$userInfo.userName",
                            profileImage :"$userInfo.profileImage"
                            
                        } 
                    }

         ],function(err,data){
              if (data.length==0){
                    res.json({status:"fail",message:'No record found'});
                }else{ 
                       if(data){ 
                            for (i = 0 ; i < data.length ; i++) {
                                if(data[i].profileImage){ 
                                 data[i].profileImage = baseUrl+"/uploads/profile/"+ data[i].profileImage;
                                }
                            }
                        }
                    res.json({status:"success",message:'ok',followerList:data});
                }
      
    });
 
}
exports.followerListOld = function(req,res,next){
    userId = req.body.userId;
    loginUserId = req.body.loginUserId;
    if(userId == ''){
        res.json({status:"fail",message:'User id is required.'});
        return;

    }
    if(loginUserId ==''){
        res.json({status:"fail",message:'User id is required.'});
        return;

    }
    var baseUrl =  req.protocol + '://'+req.headers['host'];
    followUnfollow.aggregate([{$match: {userId:Number(req.body.userId),status:1}},
                    {$lookup: {from: "users",localField: "followerId",foreignField: "_id",as:"userInfo"}},
                    { "$unwind": "$userInfo" },
                    {   
                        $project:{
                            followerId :"$userInfo._id",
                            userName :"$userInfo.userName",
                            firstName :"$userInfo.userName",
                            lastName :"$userInfo.userName",
                            profileImage :"$userInfo.profileImage"
                            
                        } 
                    }

         ],function(err,data){
              if (data.length==0){
                    res.json({status:"fail",message:'No record found'});
                }else{ 

                    dataLength = data.length;
                    next();
                      /* if(data){ 
                            for (i = 0 ; i < data.length ; i++) {
                                if(data[i].profileImage){ 
                                 data[i].profileImage = baseUrl+"/uploads/profile/"+ data[i].profileImage;
                                }
                            }
                        }
                    res.json({status:"success",message:'ok',followerList:data});*/
                }
      
    });
 
}
exports.followerList = function(req,res,next){
  
    folData = {};
    folData = req.body;
    followUnfollow.aggregate([{$match: {userId:Number(req.body.userId),status:1}},
                    {$lookup: {from: "users",localField: "followerId",foreignField: "_id",as:"userInfo"}},
                    { "$unwind": "$userInfo" },
                    {   
                        $project:{
                            followerId :"$userInfo._id",
                            userName :"$userInfo.userName",
                            firstName :"$userInfo.userName",
                            lastName :"$userInfo.userName",
                            profileImage :"$userInfo.profileImage"
                            
                        } 
                    }

         ],function(err,data){
              if (data.length==0){
                    res.json({status:"fail",message:'No record found'});
                }else{ 

                    folData.total = data.length;
                    folData.mData = mData;
                    next();
                     
                }
      
    });
 
}

exports.followerListFinal = function(req,res){
    console.log(req.body.userId);
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
    async.parallel([

        function(callback) {
            var query = followUnfollow.aggregate([{$match: {userId:Number(req.body.userId),status:1}},
                    {$lookup: {from: "users",localField: "followerId",foreignField: "_id",as:"userInfo"}},
                    { "$unwind": "$userInfo" },
                    { $skip:page },
                    { $limit:limit },
                    {   
                        $project:{
                            userId:1,
                            followerId :"$userInfo._id",
                            userName :"$userInfo.userName",
                            firstName :"$userInfo.userName",
                            lastName :"$userInfo.userName",
                            profileImage :"$userInfo.profileImage"
                            
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
        var query = followUnfollow.find({'followerId':Number(req.body.loginUserId),'status':1})
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
     
         var flowSt = results[1].map(a => a.followerId);     
        jsArr = [];
    for (var i = 0; i < results[0].length; i++) {
                 
                //
        if(results[1].length>0){
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
            for (i = 0 ; i < jsArr.length ; i++) {
                if(jsArr[i].profileImage){ 
                     jsArr[i].profileImage = baseUrl+"/uploads/profile/"+ jsArr[i].profileImage;
                }
            }
        
       }


         res.json({status: "success",message: 'successfully',followerList: jsArr,total:dataLength});
         return;   
    } else {
           res.json({status: "fail",message: 'No record found.',followerList:[] });
           return;
    }
      
 });
 
}
exports.followingListOld = function(req,res){
    var baseUrl =  req.protocol + '://'+req.headers['host'];
    followUnfollow.aggregate([{$match: {followerId:authData._id,status:1}},
                    {$lookup: {from: "users",localField: "userId",foreignField: "_id",as:"userInfo"}},
                    { "$unwind": "$userInfo" },
                    {   
                        $project:{
                            userId :"$userInfo._id",
                            userName :"$userInfo.userName",
                            firstName :"$userInfo.userName",
                            lastName :"$userInfo.userName",
                            profileImage :"$userInfo.profileImage"
                            
                        } 
                    }

         ],function(err,data){
              if (data.length==0){
                    res.json({status:"fail",message:'No record found'});
                }else{ 
                       if(data){ 
                            for (i = 0 ; i < data.length ; i++) {
                                if(data[i].profileImage){ 
                                 data[i].profileImage = baseUrl+"/uploads/profile/"+ data[i].profileImage;
                                }
                            }
                        }
                    res.json({status:"success",message:'ok',followingList:data});
                }
      
    });
 
}
exports.followingList11 = function(req,res,next){
    userId = req.body.userId;
    loginUserId = req.body.loginUserId;
    if(userId == ''){
        res.json({status:"fail",message:'User id is required.'});
        return;

    }
    if(loginUserId ==''){
        res.json({status:"fail",message:'User id is required.'});
        return;

    }
    var bas
    var baseUrl =  req.protocol + '://'+req.headers['host'];
    followUnfollow.aggregate([{$match: {followerId:Number(req.body.userId),status:1}},
                    {$lookup: {from: "users",localField: "userId",foreignField: "_id",as:"userInfo"}},
                    { "$unwind": "$userInfo" },
                    {   
                        $project:{
                            userId :"$userInfo._id",
                            userName :"$userInfo.userName",
                            firstName :"$userInfo.userName",
                            lastName :"$userInfo.userName",
                            profileImage :"$userInfo.profileImage"
                            
                        } 
                    }

         ],function(err,data){
              if (data.length==0){
                    res.json({status:"fail",message:'No record found'});
                }else{ 

                    dataLength = data.length;
                    next();
                     
                }
      
    });
 
}
exports.followingList = function(req,res,next){
    folData = {};
    folData = req.body;
   
    followUnfollow.aggregate([{$match: {followerId:Number(req.body.userId),status:1}},
                    {$lookup: {from: "users",localField: "followerId",foreignField: "_id",as:"userInfo"}},
                    { "$unwind": "$userInfo" },
                    {   
                        $project:{
                            userId :"$userInfo._id",
                            userName :"$userInfo.userName",
                            firstName :"$userInfo.userName",
                            lastName :"$userInfo.userName",
                            profileImage :"$userInfo.profileImage"
                            
                        } 
                    }

         ],function(err,data){
              if (data.length==0){
                    res.json({status:"fail",message:'No record found'});
                }else{ 

                   folData.total = data.length;
                   folData.mData = mData;
                    next();
                     
                }
      
    });
 
}

exports.followingListFinal = function(req,res){
    console.log(req.body.userId);
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
    async.parallel([

        function(callback) {
            var query = followUnfollow.aggregate([{$match: {followerId:Number(req.body.userId),status:1}},
                    {$lookup: {from: "users",localField: "userId",foreignField: "_id",as:"userInfo"}},
                    { "$unwind": "$userInfo" },
                    { $skip:page },
                    { $limit:limit },
                    {   
                        $project:{
                            followerId:1,
                            userId :"$userInfo._id",
                            userName :"$userInfo.userName",
                            firstName :"$userInfo.userName",
                            lastName :"$userInfo.userName",
                            profileImage :"$userInfo.profileImage"
                            
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
        var query = followUnfollow.find({'followerId':Number(req.body.loginUserId),'status':1})
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
          
             var flowSt = results[1].map(a => a.followerId);
              
                //
        if(results[1].length>0){
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
            for (i = 0 ; i < jsArr.length ; i++) {
                if(jsArr[i].profileImage){ 
                     jsArr[i].profileImage = baseUrl+"/uploads/profile/"+ jsArr[i].profileImage;
                }
            }      
        
       }


         res.json({status: "success",message: 'successfully',followingList: jsArr,total:dataLength});
         return;   
    } else {
           res.json({status: "fail",message: 'No record found.',followingList:[] });
           return;
    }
      
 });
 
}
exports.commentList = function(req,res,next){
    var baseUrl =  req.protocol + '://'+req.headers['host'];
    var Value_match =escapere(req.body.search);
    comment.aggregate([ 
                    {$lookup: {from: "users",localField: "commentById",foreignField: "_id",as:"userInfo"}},
                    { "$unwind": "$userInfo" },
                     {
                        $match: {
                          'userInfo.userName':{$regex:Value_match,$options:'i'},
                          'feedId':Number(req.body.feedId),
                          
                          
                        }
                    },
                    {   
                        $project:{

                            commentById :1,
                            comment :1,
                            commentLikeCount :1,
                            crd :1,
                            userName :"$userInfo.userName",
                            firstName :"$userInfo.userName",
                            lastName :"$userInfo.userName",
                            profileImage :"$userInfo.profileImage"
                            
                        } 
                    }

         ],function(err,data1){
            if(data1){
                newdata = data1.length; 
            }else{
                newdata = 0;
            }
            next();
      
    });
    
}
exports.finalCommentList = function(req,res){
    var baseUrl =  req.protocol + '://'+req.headers['host'];
    var Value_match = escapere(req.body.search);
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
    comment.aggregate([ { $sort : { _id : -1 } },
                    {$lookup: {from: "users",localField: "commentById",foreignField: "_id",as:"userInfo"}},
                    { "$unwind": "$userInfo" },
                     {
                        $match: {
                          'userInfo.userName':{$regex:Value_match,$options:'i'},
                          'feedId':Number(req.body.feedId)
                          
                        }
                    },
                    { $skip:page },
                    { $limit:limit },
                    {   
                        $project:{
                            _id:1,
                            commentById :1,
                            comment :1,
                            commentLikeCount :1,
                            type :1,
                            crd :1,
                            userName :"$userInfo.userName",
                            firstName :"$userInfo.userName",
                            lastName :"$userInfo.userName",
                            profileImage :"$userInfo.profileImage"
                            
                        } 
                    }

         ],function(err,data){
              if (data.length==0){
                    res.json({status:"fail",message:'No record found'});
                }else{ 
                       if(data){
                           likes.find({'type':'comment','likeById':req.body.userId,'status':1}).exec(function(err,adata) { 
                          
                            var moment = require('moment');
                            var time =  moment().toDate().getTime();
                            
                            for (i = 0 ; i < data.length ; i++) {
                                var likeFeed = adata.map(a => a.feedId);
                                
                             if(adata.length>0){
                                var a = likeFeed.indexOf(data[i]._id);
                                if(a >-1){
                                    data[i].isLike = 1
                                }else{
                                    data[i].isLike = 0
                                }

                           }else{
                                 
                             
                             data[i].isLike = 0
                           }      
                                data[i].timeElapsed = moment(data[i].crd).fromNow();
                                if(data[i].profileImage){ 
                                    data[i].profileImage = baseUrl+"/uploads/profile/"+ data[i].profileImage;
                                }
                                if(data[i].type=='image'){ 
                                    data[i].comment = baseUrl+"/uploads/commentImage/"+ data[i].comment;
                                }
                            }
                           res.json({status:"success",message:'ok',commentList:data,total:newdata});
                         
                           });



                        }
                    
                }
      
    });
    
}
exports.addComment = function(req,res){
	var baseUrl =  req.protocol + '://'+req.headers['host'];
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
    req.body=fields;
    var userId = req.body.userId;
    var moment = require('moment');
    var crd =  moment().format();
    if(fields.type ==''){
         res.json({status: 'fail',message: "Comment type is required."});
         return;
    }
    if(files.comment){
        var oldpath = files.comment.path;
        var imageName = Date.now()+".jpg";
        var newpath = './public/uploads/commentImage/'+imageName;
        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;
        });
        var addNew = {
            feedId:req.body.feedId,
            postUserId:req.body.postUserId,
            commentById:req.body.userId,
            comment:imageName,
            gender:req.body.gender ? req.body.gender : 'male',
            age:req.body.age ? req.body.age : 20,
            city:req.body.city ? req.body.city : 'Indore',
            state:req.body.state ? req.body.state : 'mp',
            country:req.body.country ? req.body.country : 'India',
            type:req.body.type,
            crd:crd,
            upd:crd
        };
    }else{
            var addNew = {
            feedId:req.body.feedId,
            postUserId:req.body.postUserId,
            commentById:req.body.userId,
            comment:req.body.comment,
            gender:req.body.gender ? req.body.gender : 'male' ,
            age:req.body.age ? req.body.age : 20,
            city:req.body.city ? req.body.city : 'Indore',
            state:req.body.state ? req.body.state : 'mp',
            country:req.body.country ? req.body.country : 'India',
            type:req.body.type,
            crd:crd,
            upd:crd
        };
    }
  

    autoId = 1;
    comment.find().sort([
        ['_id', 'descending']
    ]).limit(1).exec(function(err, result) {
        if (result.length > 0) {
            addNew._id = result[0]._id + 1;
        }
        comment(addNew).save(function(err, data) {
                if (err) {
                    res.json({
                        status: "fail",
                        message: err
                    });
                    return;
                } else {
                    feed.findOne({
                        '_id': addNew.feedId,
                        'status': 1
                    }, function(err, result) {
                       count = Number(result.commentCount) + 1;
                        feed.update({
                                _id: addNew.feedId
                            }, {
                                $set: {
                                    commentCount : count
                                }
                            },
                            function(err, result) {

                               /*code for notification*/   

                                var typ = '9';
                                var sender     = userId;
                                var receiver   = addNew.postUserId; 
                                var notifyId   = addNew.feedId;
                                var notifyType = 'social'; 
                                 if(sender!=receiver){
                                   notify.notificationUser(sender,receiver,typ,notifyId,notifyType); 
                                 }
                                /*end notification code*/  
                               addNew.commentCount =count;
                              
                                if(addNew.type == 'image'){
                                     addNew.comment =  baseUrl+"/uploads/commentImage/"+ addNew.comment; 

                                }  
                                res.json({status:"success",message:'ok',commentData:addNew});
                                return;

                            });
                    });
                    
                }
            });
        
    });
});
}
exports.deleteBookService = function(req,res){
    if(req.body.bookingId){
        bookingService.deleteOne({'_id':req.body.bookingId}, function(err, results){
        if(err) throw err;

        res.json({status:"success",message: 'bookingService deleted successfully'});
        });
    }else{
        res.json({status:"fail",message:'bookingId is required.'});
    }

}
exports.deleteAllBookService = function(req,res){
    if(req.body.artistId){
        bookingService.deleteMany({'artistId':req.body.artistId,'userId':req.body.userId,'bookingStatus':0}, function(err, results){
         if(err) throw err;
          res.json({status:"success",message: 'bookingService delete successfully'});
         });
      
    }else{
        res.json({status:"fail",message:'artistId is required.'});
    }

}
exports.deleteUserBookService = function(req,res){
    if(req.body.userId){
        bookingService.deleteMany({'userId':req.body.userId,'bookingStatus':0}, function(err, results){
         if(err) throw err;
          res.json({status:"success",message: 'bookingService deleted successfully'});
         });
      
    }else{
        res.json({status:"fail",message:'userId is required.'});
    }

}
/*userId = comment userId likeById login userId*/
exports.commentLike = function(req,res){
    var userId = req.body.userId;
    var likeById = req.body.likeById;
    
    if(req.body){
        var addNew = {
            feedId:req.body.commentId,
            userId:req.body.userId,
            likeById:req.body.likeById,
            gender:req.body.gender ? req.body.gender : 'male',
            age:req.body.age ? req.body.age : 20,
            city:req.body.city ? req.body.city :'Indore',
            state:req.body.state ? req.body.state :'mp',
            country:req.body.country ? req.body.country : 'Indore',
            type:req.body.type
            
         };
    }else{
         res.json({status: 'fail',message: "comment Id is required."});
         return;
    }
    autoId = 1;
    likes.find().sort([
        ['_id', 'descending']
    ]).limit(1).exec(function(err, result1) {
            if (result1.length > 0) {
                addNew._id = result1[0]._id + 1;
            }
             likes.findOne({'feedId':req.body.commentId,'likeById':req.body.likeById,'type':'comment'}, function(err, data) {
            if(data){ 
                        comment.findOne({'_id':req.body.commentId}, function(err, result) {
                            
                            if(data.status==1){
                                   setValue = {'status':0}
                                    if(result.commentLikeCount==0){
                                        count =0;
                                    }else{
                                        count = Number(result.commentLikeCount)-1;
                                    }
                            }else{
                                    setValue = {'status':1}
                                    count = Number(result.commentLikeCount)+1;
                            }
                            likes.update({ _id:data._id },{ $set:setValue},
                            function(err, result) { });
                            comment.update({ _id:req.body.commentId },{ $set:{commentLikeCount:count}},
                            function(err, result) {res.json({status: "success",message: 'ok'});
                                    return; });
                         });
                    }else{

                            likes(addNew).save(function(err, data) {
                                if (err) {
                                    res.json({
                                        status: "fail",
                                        message:err
                                    });
                                    return;
                                } else {
                                    comment.findOne({'_id':req.body.commentId}, function(err, result) {
                                     count = Number(result.commentLikeCount)+1;
                                     comment.update({ _id:req.body.commentId },{ $set:{commentLikeCount:count}},
                                     function(err, resData) { });
                                                                         /*code for notification (feed user and comment user) */
                                    var typ = '11';
                                    var sender     =likeById;
                                    var notifyId   = result.feedId;
                                    var notifyTyp = 'social';
                                    if(sender!= result.postUserId){
                                        notify.notificationUser(sender,result.postUserId,typ,notifyId,notifyTyp);
                                    }
                                    if(sender!=result.commentById){
                                         notify.notificationUser(sender,result.commentById,typ,notifyId,notifyTyp); 

                                    }
                                     
                                   
                                    /*end code*/
                                     
                                     });

                                    res.json({status: "success",message: 'ok'});
                                    return;
                                }
                            });
                    }
           });
    }); 
}  
exports.addTag = function(req,res){
    tags = req.body.tag;

    var ser = tags.split(",");
    var service = ser.map(function(n) { return n; });
        
    tag1 = ['sunil','anil'];
    tag2 = ['1'];
    var c=tag1.concat(tag2);
    console.log(c.toString());
    tagId = [];
    jsArr = [];
            tag.find().sort([
                ['_id', 'descending']
            ]).limit(1).exec(function(err, userdata) {
                var autoId = 1;

                if (userdata.length > 0) {
                    autoId = userdata[0]._id + 1;

                }

                for (var i = 0; i < tag1.length; i++) {
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

                tag.insertMany(jsArr);
                res.json({
                    'status': "success",
                    "massage": jsArr
                });
               return;
            });
   
}
exports.tagSearch = function(req,res){
     var type =  req.body.type;
     var baseUrl =  req.protocol + '://'+req.headers['host'];
     var Value_match = {$regex:req.body.search,$options:'i'};
     if(req.body.type){
        User.find({'isDocument':3,'userName':Value_match},{'_id':1,'firstName':1,'lastName':1,'userName':1,'profileImage':1}).exec(function(err, data) {
            if (data) {
                  for (i = 0 ; i < data.length ; i++) {
                    if(data[i].profileImage){ 
                        data[i].profileImage = baseUrl+"/uploads/profile/"+ data[i].profileImage;
                    }
                }
                res.json({
                    'status': "success",
                    "massage": "ok",
                    "allTags":data
                });
               return;
            }else{
            res.json({
                    'status': "fail",
                    "massage": "No record found."
                });
               return;
              }
         });
    
    }else{
          tag.find({'tag':Value_match},{'_id':1,'tag':1}).exec(function(err, data) {
            if (data) {
             
                res.json({
                    'status': "success",
                    "massage": "ok",
                    "allTags":data
                });
               return;
            }else{
            res.json({
                    'status': "fail",
                    "massage": "No record found."
                });
               return;
              }
         });

    }

}
exports.userList = function(req, res) {
    var baseUrl =  req.protocol + '://'+req.headers['host'];
    if(req.body.userId ==''){
         res.json({'status': "fail","massage": "userId is required."});
         return;

    }
        User.aggregate([
            { 

            "$project": {     
            "userName":1, 
            "firstName":1, 
            "lastName":1, 
            "profileImage":1   
             
        }}, 
       /* { "$lookup": {     
                "from": "busineshours",     
                "localField": "_id",     
                "foreignField":"artistId",     
                "as": "businessHour"   
        }},*/
       
       
        ],function(err,data){
           if(data){
                for (i = 0 ; i < data.length ; i++) {
                    if(data[i].profileImage){ 
                         data[i].profileImage = baseUrl+"/uploads/profile/"+ data[i].profileImage;
                    }

                }
                res.json({status: "success",message: 'ok',userList:data});
           }
          
        });
}
function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
exports.exploreSearch = function(req, res,next) {
    var baseUrl =  req.protocol + '://'+req.headers['host'];
   // var Value_match = new RegExp(req.body.search);
   var ser = req.body.search;
   var ser = escapeRegExp(ser);
   var Value_match = ser;
    var id =[];
    id =  Number(req.body.userId); 
    search   = {};
    search['_id'] = { $nin: id};
    search['userName'] = {$regex:ser,$options:'i'}
     search['OTP'] = 'checked';
    if(req.body.userId ==''){
         res.json({'status': "fail","massage": "userId is required."});
         return;

    }
    if(req.body.type ==''){
         res.json({'status': "fail","massage": "type is required."});
         return;

    }
    var type = 'top';
    if(req.body.type){
         var type =  req.body.type;

    }
    if(type =='top'){
        User.find(search,{"_id":1,"userName":1,"firstName":1,"lastName":1,"profileImage":1,'postCount':1,'userType' : 1  }).exec(function(err, data) {
                if(data){
                    nextDataTotal = data.length;
                    next();

               }           
         });

    }else if(type =='people'){
         
        
         User.find(search,{"_id":1,"userName":1,"firstName":1,"lastName":1,"profileImage":1,'postCount':1,'userType' : 1 }).exec(function(err, data) {
                if(data){
                    nextDataTotal = data.length;
                    next();

               }           
         });

    }else if(type == 'hasTag'){
         tag.find({'type':'hastag','tag':{$regex:Value_match,$options:'i'}},{"_id":1,"tag":1,"tagCount":1}).exec(function(err, data) {
            if(data){

                nextDataTotal = data.length;
                next();

               }           
         });

    }else if(type == 'place'){
            feed.find({'location':{$regex:Value_match,$options:'i'}}).distinct("location").exec(function(err, data) {
            if(data){

                nextDataTotal = data.length;
                next();

               }           
         });
    }else if(type =='serviceTag'){
        res.json({status: "success",message: 'ok',totalCount:0,serviceTagList:[]});
        return; 

    }

}
exports.exploreSearchFinal = function(req,res){
    var baseUrl =  req.protocol + '://'+req.headers['host'];
   // var Value_match = new RegExp(req.body.search);
    var type = req.body.type;
    var ser = req.body.search;
    var ser = escapeRegExp(ser);
    var Value_match = ser;
    var id =[];
    id =  Number(req.body.userId); 
    search   = {};
/*    search['_id'] = { $nin: id};
*/    search['userName'] = {$regex:ser,$options:'i'}
    search['OTP'] = 'checked';
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
    if(req.body.userId ==''){
         res.json({'status': "fail","massage": "userId is required."});
         return;

    }
    var type = 'top';
    if(req.body.type){
         var type =  req.body.type;

    }
    if(type =='top'){  
         var id =[];
         id =  Number(req.body.userId); 
         User.find(search,{"_id":1,"userName":1,"firstName":1,"lastName":1,"profileImage":1,'postCount':1 ,'userType' : 1  }).skip(page).limit(limit).exec(function(err, data) {
                if(data){
                    
                    for (i = 0 ; i < data.length ; i++) {
                        if(data[i].profileImage){ 
                             data[i].profileImage = baseUrl+"/uploads/profile/"+ data[i].profileImage;
                        }

                    }
                    res.json({status: "success",message: 'ok',totalCount:nextDataTotal,topList:data});
               }           
         });

    }else if(type =='people'){
         
         var id =[];
         id =  Number(req.body.userId); 
         User.find(search,{"_id":1,"userName":1,"firstName":1,"lastName":1,"profileImage":1,'postCount':1 ,'userType' : 1 }).skip(page).limit(limit).exec(function(err, data) {
                if(data){
                    
                    for (i = 0 ; i < data.length ; i++) {
                        if(data[i].profileImage){ 
                             data[i].profileImage = baseUrl+"/uploads/profile/"+ data[i].profileImage;
                        }

                    }
                    res.json({status: "success",message: 'ok',totalCount:nextDataTotal,peopleList:data});
               }           
         });

    }else if(type =='hasTag'){
            tag.find({'type':'hastag','tag':{$regex:Value_match,$options:'i'}},{"_id":1,"tag":1,"tagCount":1 }).sort([['tagCount', 'descending']]).skip(page).limit(limit).exec(function(err, data) {
                if(data){
                  
                    res.json({status: "success",message: 'ok',totalCount:nextDataTotal,hasTagList:data});
               }           
         });

    }else if(type =='place'){
        feed.aggregate([
            { $match : { location : {$regex:Value_match,$options:'i'}} },
            { "$group": { "_id": "$location" } },
            /* {$group:{_id:"$_id", location:{$push:"$location"}, count: {$sum: 1}}},*/
            { "$skip": page },
            { "$limit": limit },
           ],function(err,data){
            jsArr =[];
            if(data.length>0){
                a = 1;
                 for (var i = 0; i < data.length; i++) {
                      console.log(data[i]._id);
                    jsArr.push({
                        _id: a,
                        location: data[i]._id
                  
                    });
                     a++;
                }

            }
            res.json({status: "success",message: 'ok',totalCount:nextDataTotal,placeList:jsArr});
         });   
      /* feed.find({'location':Value_match}).distinct("location").skip(page).limit(limit).exec(function(err, data) {
         if(data){
            res.json({status: "success",message: 'ok',totalCount:nextDataTotal,placeList:data});
          }           
         });*/
    }

}
exports.userFeedByTag = function(req,res,next){
    tagId = {};
    var findData = req.body.findData;
    if(req.body.type =='hasTag'){
         if(findData == ''){
            res.json({'status': "fail","massage": "tag is required."});
             return;
        }
        
        tag.findOne({'tag':req.body.findData,'type':'hastag'},{'_id':1}).sort([['_id', 'ascending']]).limit(1).exec(function(err, adata) {

        if(adata){
            tagId = adata;
            next();
        }
        });
    }else{
        tagId = '';  
        next();
    }

}
exports.userFeed = function(req,res,next){
  
var baseUrl =  req.protocol + '://'+req.headers['host'];
 var Value_match = {$regex:req.body.feedType};
 var type = req.body.type;
 var feedSearch ={};
 var findData = req.body.findData;
// feedSearch['feedType'] =Value_match;
 feedSearch['feedType'] ={'$ne':'text'};
 
  if(req.body.type =='user'){
    if(findData == ''){
        res.json({'status': "fail","massage": "userId is required."});
        return;
    }
    
     feedSearch['userId'] = Number(findData);
     
 }
 if(req.body.type =='hasTag'){
    if(findData == ''){
        res.json({'status': "fail","massage": "tag is required."});
        return;
    }
      if(tagId){
        feedSearch['tagId'] = { $in: [tagId._id]};
      }
    
     
 }
 if(req.body.type =='place'){
        if(findData == ''){
          res.json({'status': "fail","massage": "place is required."});
          return;
        }
       feedSearch['location'] = {$regex:findData};
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
exports.finalUserFeed = function(req, res) {
     search   = {};
     search['likeById'] =  Number(req.body.userId);
     search['type'] =  'feed';
     search['status'] =  1;
     var Value_match = {$regex:req.body.feedType};
     var feedSearch ={};
     var findData = req.body.findData;
    // feedSearch['feedType'] =Value_match;
    feedSearch['feedType'] ={'$ne':'text'};
    if(req.body.type =='user'){
        if(findData == ''){
          res.json({'status': "fail","massage": "userId is required."});
         return;
        }

        feedSearch['userId'] = Number(findData);

    }
     if(req.body.type =='hasTag'){
        if(findData == ''){
            res.json({'status': "fail","massage": "tag is required."});
            return;
        }
          if(tagId){
            feedSearch['tagId'] = { $in: [tagId._id]};
        }
         
     }
     if(req.body.type =='place'){
        if(findData == ''){
          res.json({'status': "fail","massage": "place is required."});
         return;
        }
       feedSearch['location'] = {$regex:findData};
    }       
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


         res.json({status: "success",message: 'successfully',AllUserFeeds: jsArr,total:newdata});
         return;   
    } else {
           res.json({status: "fail",message: 'No record found.',AllUserFeeds:[] });
           return;
    }
      
 });
}
exports.feedDetails = function(req,res){
  var baseUrl =  req.protocol + '://'+req.headers['host'];
  var feedSearch ={};

  search   = {};
  search['likeById'] =  Number(req.body.userId);
  search['type'] =  'feed';
  search['status'] =  1;

 if(req.body.feedId ==''){
   
        res.json({'status': "fail","massage": "feedId is required."});
        return;
      
 }

 if(req.body.userId ==''){
        res.json({'status': "fail","massage": "userId is required."});
        return;
   }
feedSearch['_id'] =Number(req.body.feedId);

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
                    "$project": {
                        "_id":1,
                        "feedType":1,
                        "feedData":1,
                        "caption":1,
                        "city":1,
                        "country":1,
                        "location":1,
                        "likeCount":1,
                        "peopleTag":1,
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
        var query = likes.find({'likeById':Number(req.body.userId),'feedId':Number(req.body.feedId),'type':'feed','status':1},{'_id':1,'feedId':1,'status':1})
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


         res.json({status: "success",message: 'successfully',feedDetail: jsArr});
         return;   
    } else {
           res.json({status: "fail",message: 'No record found.',feedDetail:[] });
           return;
    }
      
 });

}
exports.staffFreeSlot = function(req, res, callback){

       // console.log(req.body);
        search = {};
        search['artistId'] = req.body.businessId;
        search['day'] = Number(req.body.day);
        var day = req.body.day;
        newDate = req.body.bookingDate;
        bookingSTime = req.body.booking_staff_start_time;
        bookingETime = req.body.booking_staff_end_time;
        start_time = req.body.staff_start_time;
        end_time = req.body.staff_end_time;
        staffId = req.body.staffId;
        serviceTime = req.body.serviceTime;
        var  interval = 10;
        curentTime = parseTime(timeConvert(req.body.curentTime));
        var bussy_slot = bookingTime(bookingSTime, bookingETime, interval);
        //console.log(bussy_slot);
        var times_ara = calculate_time_slot_artist(start_time, end_time, interval,bussy_slot,curentTime,day);
        var checkSlot = check_service_start_end_time(times_ara, serviceTime)
       // console.log(checkSlot);
       return checkSlot;
                   
            
}  

function calculate_time_slot_artistOld(start_time, end_time, interval = "10", bussy_slot,curentTime,day){

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

function check_service_start_end_timeOld(times_ara, serviceTime){
    if(serviceTime){
     serviceTime =    parseTimeService(serviceTime);
    }

    d=0;
    var s = serviceTime*10;
     
    Ntime_slots = Array();
    times_ara.forEach(function(rs) {

        var end = Number(d)+Number(serviceTime);
        var end_time = times_ara[end];
       
        var currentSlot = rs;
        var end = timeDiffrence(currentSlot,end_time); 

        if(s==end){
            Ntime_slots.push(rs);
        }

    d++;    
    });

    return Ntime_slots;

}
function check_service_start_end_time(times_ara, serviceTime){
     if(serviceTime){
     serviceTime =    parseTimeService(serviceTime);
    }
   
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
/* test code for customer side*/
exports.artistTimeSlotNew = function(req, res) {
  

    datae = {};
    datae["artistId"] = Number(req.body.artistId);
    datae["day"] = Number(req.body.day);
    date = req.body.date;
    var newDate = req.body.date;
    var userId = Number(req.body.userId);
    var type = req.body.type;
    var businessType = req.body.businessType;
    var BookingId = req.body.bookingId;
    var staffId = req.body.staffId;
    var bookStaffId  =     req.query.bookStaffId;

    if (date < dateTime.curDate) {
        res.json({
            'status': 'fail',
            'message': 'You can not select previous date'
        });
        return;
    }
    if (bookInfo.bookStartTime) {
        var BookingTime = bookInfo.bookStartTime;
    } else {
        var BookingTime = '';
    }
    if (bookInfo.bookingDt) {
        var bookingDate = bookInfo.bookingDt;
    } else {
        var bookingDate = '';
    }
    if (bookInfo.totalBooking) {
        var bookingCount = bookInfo.totalBooking;
    } else {
        var bookingCount = '';
    }
    if (dateTime) {
        curentTime = parseTime(timeConvert(dateTime.curTime));
    } else {
        curentTime = parseTime(timeConvert(req.body.currentTime));
    }
    serviceTime = req.body.serviceTime;

    var bookingSTime = Array();
    var bookingETime = Array();
    // end under construction 
    staffSearch = {};
    if (staffId == ''|| staffId==0 || staffId=='0') {
        staffSearch["artistId"] = Number(req.body.artistId);
    } else {
        staffSearch["artistId"] = Number(req.body.staffId);
        staffSearch["businessId"] = Number(req.body.artistId);

    }
    staffSearch["staffHours.day"] = Number(req.body.day);

    businessHour.find(datae).sort([
        ['_id', 'ascending']
    ]).exec(function(err, data) {

        if (data) {

            var start_time = Array();
            var end_time = Array();
            var bussy_slot = Array();


            data.forEach(function(rs) {

                start_time.push(parseTime(timeConvert(rs.startTime)));
                end_time.push(parseTime(timeConvert(rs.endTime)));

            });

            staff.find(staffSearch, {
                'staffHours.startTime': 1,
                'staffHours.endTime': 1,
                'staffHours.day': 1
            }).sort([
                ['_id', 'ascending']
            ]).exec(function(err, staffData) {
                var staff_start_time = Array();
                var staff_end_time = Array();

                if (staffData) {

                    staffData.forEach(function(rs1) {
                        sdt = rs1.staffHours;

                        sdt.forEach(function(rs) {
                            if (rs.day == Number(req.body.day)) {
                                staff_start_time.push(parseTime(timeConvert(rs.startTime)));
                                staff_end_time.push(parseTime(timeConvert(rs.endTime)));
                            }

                        });
                    });

                }
                // return res.send(staff_start_time);
                var bookData = {};
                bookData['artistId'] = Number(req.body.artistId);
                bookData['bookingDate'] = date;
                bookData['bookingStatus'] = {
                    '$ne': 2
                }
               
                if (type == "edit") {

                    bookData['_id'] = {
                        '$ne': BookingId
                    };
                }else{
                        if (staffId) {
                            bookData['staff'] = Number(staffId);
                        }

                }

                bookingService.find(bookData).sort([
                    ['_id', 'ascending']
                ]).exec(function(err, bdata) {
                    var t = 0;
                    if (type == "edit") {
                        var t = 10;
                    }

                    if (bdata) {
                        bdata.forEach(function(rs) {
                            bookingSTime.push(parseTime(timeConvert(rs.startTime)) + t);
                            bookingETime.push(parseTime(timeConvert(rs.endTime)));
                        });
                    }
                    bsSearch = {};
                    bsSearch['userId'] = userId;
                    bsSearch["artistId"] = Number(req.body.artistId);
                    bsSearch["bookingStatus"] = 0;

                   /* if (staffId) {
                        bsSearch['staff'] = Number(staffId);
                    }*/
                   var sortKey = 'descending';
                    if(type=="edit"){

                    var sortKey = 'ascending';

                    }
                    bookingService.find(bsSearch).sort([
                        ['_id',sortKey]
                    ]).limit(1).exec(function(err, adata) {

                        var interval = 10;
                        var AbookingTime = '';
                        var AbookingDate = '';
                      
                        if (adata.length > 0) {

                            var AbookingTime = parseTime(timeConvert(adata[0].endTime));
                            var AbookingDate = adata[0].bookingDate;

                       
                        }
                        if (type == "edit") {

                            var AbookingTime = '';
                            var AbookingDate = '';
                            if (bookingCount != 1) {
                                if (BookingId != adata[0]._id) {
                                    if (adata.length > 0) {
                                        var AbookingTime = parseTime(timeConvert(adata[0].endTime));
                                        var AbookingDate = adata[0].bookingDate;

                                    }
                                }
                            }
                        }

                        var Ntime_slots = Array();

                        if (AbookingDate <= date) {

                            var bussy_slot = bookingTime(bookingSTime, bookingETime, interval);

                            if (staffId == '' || staffId==0 || staffId=='0') {
                                var bussy_slot_staff = bookingTime(staff_start_time, staff_end_time, interval);
                                var bussy_slot = bussy_slot.concat(bussy_slot_staff);
                            } else {
                                start_time = staff_start_time;
                                end_time = staff_end_time;
                            }
                            var times_ara = calculate_time_slot(start_time, end_time, interval, date, bussy_slot, AbookingTime, curentTime, AbookingDate, date);


                            var Ntime_slots = final_time_slot(times_ara, serviceTime);
                        }

                        var selectData = Array();

                        if (type == "edit") {
 
                            staffId = staffId ? staffId : 0;
                            Ntime_slots.forEach(function(data) {

                                if (data == BookingTime && date == bookingDate && bookStaffId==staffId) {

                                    selectData.push(1);

                                } else {

                                    selectData.push(0);
                                }

                            });
                        }
                        res.json({
                            'status': 'success',
                            'message': 'ok',
                            'timeSlots': Ntime_slots,
                            selectData: selectData
                        });
                        return;
                    });
                });
            });

        }


    });


}
/*end test code*/
/* api for user side show favorite list*/
exports.favoriteArtist = function(req,res,next){
    data = {};
    data = req.body;
    userId = req.body.userId;
   
    if(userId ==''){
         res.json({status: 'fail',message: "User id is required."});
         return;
    }
    search = {};
    sortData = {};
    search['userId']=Number(req.body.userId);
    //sortData['_id']='descending';
    artistFavorite.find(search,function(err,favData){
        
        if(favData.length){
            data.total = favData.length;
            data.favoriteArtist = favData;

            next();
         
        }else{
            res.json({status:"fail",message:'No record found',favoriteList:[]});
        }

    }).sort( { _id: -1 } );

}
exports.favoriteList = function(req,res){
    var baseUrl =  req.protocol + '://'+req.headers['host'];
    var subservice = req.body.subservice;
    var service = req.body.service;
    var serviceType = Number(req.body.serviceType);
    var city = req.body.city;
    var rating = req.body.rating;
    var day = req.body.day;
    var time = req.body.time;
    var sortType = req.body.sortType;
    var sortSearch = req.body.sortSearch;
    datae = {};
    if(req.body.text){
        var text = escapere(req.body.text);
        datae = {$or: [{'cate.serviceName' : { $regex : text,'$options' : 'i' } },{'subcate.subServiceName' : { $regex : text,'$options' : 'i' } },{'service.title' : { $regex : text,'$options' : 'i' } }, {'userName' : { $regex : text,'$options' : 'i' }}]};
    }
    a = [];
    a= data.favoriteArtist.map(a => a.artistId);       
    search = {};
    search['_id'] = {$in:a};
  
     search['userType'] = 'artist';
    search['isDocument'] = 3;
    if(sortSearch=='price'){
        if(sortType==1){
            sortData["service.inCallPrice"] = -1;
        }else{
          sortData["service.inCallPrice"] = 1;
        }
    }else{
         if(sortType==1){
           sortData["distance"] = -1;
         }else{
           sortData["distance"] = 1;
         }
    }
    if(serviceType){
      search['serviceType'] = {'$ne':serviceType};
    }else{
         search['serviceType'] = {'$ne':2};
    }
    if(service){
        var ser = service.split(",");
        var service = ser.map(function(n) { return Number(n); });
        search['service.serviceId'] = { $in: service};
     }
   
    if(subservice){
        var subSer = subservice.split(",");
        var subservice = subSer.map(function(n) {return Number(n);});
        search['service.subserviceId'] = { $in: subservice};
    }

   if(rating){
        var rat = rating.split(",");
        var rating = rat.map(function(n) {return Number(n);});
        search['ratingCount'] = { $in: rating};
    }

    if(day){
        search['businesshours.day'] = Number(day);
    }

    if(time){
        search["businesshours.startTime"] = {$gte:time};
        search["businesshours.endTime"] = {$gte:time};
    }

   if (req.body.distance1) {
            var dista = (req.body.distance1) * 1609.34;
        } else {
            dista = 8046.72;
        }

    if (req.body.page) {
            page = Number(req.body.page)* 10;
    } else {
            page=0;
    }
    if (req.body.limit) {
            limit = Number(req.body.limit);
        } else {
             limit=10;;
        }
        User.aggregate([{
            "$geoNear": {
                  "near": {
                         "type": "Point",
                         "coordinates": [parseFloat(req.body.latitude), parseFloat(req.body.longitude)]
                          },
          maxDistance: dista,
            "spherical": true,
            "distanceField": "distance",
            distanceMultiplier: 1 / 1609.344 // calculate distance in miles "item.name": { $eq: "ab" } }
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
                    from: "artistmainservices", 
                    localField: "_id", 
                    foreignField: "artistId",
                    as: "cate"
            }
         
        }, 
        {  
            $lookup:{
                    from: "artistsubsrervices", 
                    localField: "_id", 
                    foreignField: "artistId",
                    as: "subcate"
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
        {$match:search},
        { $skip:page },
        { $limit:limit },
        
       { 
            "$project": {
                "_id": 1,
                "userName": 1,
                "firstName": 1,
                "profileImage":1,
                "reviewCount":1,
                "ratingCount":1,
                "businessType":1,
                "businessName":"$businessName",
                "distance":1,
                "service._id":1,
                "service.serviceId":1,
                "service.subserviceId":1,
                "service.title":1,
                "service.description":1,
               "service.inCallPrice":1,
                "service.outCallPrice":1
               
             }
        },
         { 
             $match:datae 
        }
    ],function(err, result) {
        

        if(result){
            for (i = 0 ; i < result.length ; i++) {
                if(result[i].profileImage){
                    if(!validUrl.isUri(result[i].profileImage)){
                          result[i].profileImage = baseUrl+"/uploads/profile/"+result[i].profileImage;
                    } 
                }
            }
           
            res.json({status: "success",message: 'ok',total:data.total,artistList:result});
        }else{
            res.json({status:"fail",message:'No record found'});
        }
        
     
    }); 
}
exports.getProfile = function(req,res){
    var baseUrl =  req.protocol + '://'+req.headers['host'];
    userId = Number(req.body.userId);
    viewBy = req.body.viewBy;
    if(userId ==''){
        res.json({status: "fail",message: 'userId is required.'});
        return;
    }
    search ={};
    search['_id'] = userId;
    search['status'] ='1';
    search['isDocument'] = 3;
    User.aggregate( [

      { $match :search },
      {  $project: {
         _id:1,
         firstName:1,
         lastName:1,
         userName:1,
         profileImage:1,
         businessName:1,
         businesspostalCode:1,
         buildingNumber:1,
         businessType:1,
         email:1,
         dob:1,
         gender:1,
         address:1,
         address2:1,
         countryCode:1,
         contactNo:1,
         userType:1,
         followersCount:1,
         followingCount:1,
         serviceCount:1,
         certificateCount:1,
         postCount:1,
         reviewCount:1,
         ratingCount:1,
         bio:1,
         serviceType:1,
         radius:1
         }
      },
      
    ],function(err,jsArr){
       if(jsArr==''){

          res.json({status: "fail",message: 'Your account has been inactivated by admin, please contact to activate',userDetail: jsArr});
          return;

       }else{
            artistCertificate.findOne({'artistId':userId,'status':1}).count().exec(function(err, data){
             feed.findOne({'userId':userId}).count().exec(function(err, postData){
             artistservices.findOne({'artistId':userId,'status':1,'deleteStatus':1}).count().exec(function(err, serviceData){            
              if(jsArr!=''){
                    jsArr[0].postCount = postData;
                    jsArr[0].serviceCount = serviceData;
                    
                    if(viewBy == 'user'){
                         jsArr[0].certificateCount = data;  
                    } 
                   
                    if(data>0){
                        jsArr[0].isCertificateVerify = 1;
                    }else{
                         jsArr[0].isCertificateVerify =0;
                    }
                   
                    if(jsArr[0].profileImage){
                        if(!validUrl.isUri(jsArr[0].profileImage)){
                             jsArr[0].profileImage = baseUrl+"/uploads/profile/"+jsArr[0].profileImage;
                        } 
                     
                    }

                   if(mData){
                            
                        var picked = lodash.filter(mData, { 'followerId': jsArr[0]._id} );
                        if(picked.length){

                           jsArr[0].followerStatus = 1;    
                        }else{

                           jsArr[0].followerStatus = 0;
                        }
                    }
                  
                    if(favData){
                            
                        var picked = lodash.filter(favData, { 'artistId': jsArr[0]._id} );
                        if(picked.length){

                           jsArr[0].favoriteStatus = 1;    
                        }else{

                           jsArr[0].favoriteStatus = 0;
                        }
                    }
               

                res.json({status: "success",message: 'ok',userDetail: jsArr});
            }
        });
        });
        }); 
    }

});

}
exports.profileFeed = function(req,res,next){
 
 userId = req.body.userId;

 if(userId == ''){
   res.json({status:"fail",message:'User id is required.'});
 } 
 var Value_match = {$regex:req.body.feedType};
 var feedSearch ={};
 
 feedSearch['feedType'] =Value_match;
 feedSearch['userId'] =Number(userId);

 feed.aggregate([
   
  {
    $sort: {_id: -1}
  },
   {
     $match:feedSearch
  },
  {   
        "$project":{
             "_id":1,
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
exports.finalProfileFeed = function(req, res) {
    var baseUrl = req.protocol + '://' + req.headers['host'];
     var Value_match = {
        $regex: req.body.feedType
    };
    var feedSearch = {};
    feedSearch['feedType'] = Value_match;
    feedSearch['userId'] = Number(req.body.userId);

    if (req.body.page) {
        page = Number(req.body.page) * Number(req.body.limit);
    } else {
        page = 0;
    }
    if (req.body.limit) {
        limit = Number(req.body.limit);
    } else {
        limit = 10;
    }

    var query = feed.aggregate([{
            $match: feedSearch
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
            $sort: {
                _id: -1
            }
        },
        {
            $skip: page
        },
        {
            $limit: limit
        },
        {
            "$project": {
                "_id": 1,
                "feedType": 1,
                "feedData": 1,
                "caption": 1,
                "city": 1,
                "country": 1,
                "location": 1,
                "likeCount": 1,
                "crd": 1,
                "commentCount": 1,
                "peopleTag":1,
                "userId": 1,
                "userInfo._id": 1,
                "userInfo.userName": 1,
                "userInfo.firstName": 1,
                "userInfo.lastName": 1,
                "userInfo.profileImage": 1
            }
        }

    ]);
    query.exec(function(err, jsArr) {
        if (err) {
            return console.log(err);
        }
        if (jsArr.length) {
            var moment = require('moment');
            for (i = 0; i < jsArr.length; i++) {
                jsArr[i].timeElapsed = moment(jsArr[i].crd).fromNow();
                if(mData){
                        
                    var picked = lodash.filter(mData, { 'followerId': jsArr[i].userId} );
                    if(picked.length){

                       jsArr[i].followerStatus = 1;    
                    }else{

                       jsArr[i].followerStatus = 0;
                    }
                }
                if(likeData){
                  
                    var picked1 = lodash.filter(likeData, { 'feedId': jsArr[i]._id} );
                      
                    if(picked1.length){

                       jsArr[i].isLike = 1;    
                    }else{

                       jsArr[i].isLike = 0;
                    }
                }

                if (jsArr[i].feedData.length) {

                    for (j = 0; j < jsArr[i].feedData.length; j++) {
                        if (jsArr[i].feedData[j].feedPost) {
                            jsArr[i].feedData[j].feedPost = baseUrl + "/uploads/feeds/" + jsArr[i].feedData[j].feedPost;

                        }
                        if (jsArr[i].feedData[j].videoThumb) {
                            jsArr[i].feedData[j].videoThumb = baseUrl + "/uploads/feeds/" + jsArr[i].feedData[j].videoThumb;

                        }
                    }

                }

                if (jsArr[i].userInfo[0]) {
                    if (jsArr[i].userInfo[0].profileImage) {
                        jsArr[i].userInfo[0].profileImage = baseUrl + "/uploads/profile/" + jsArr[i].userInfo[0].profileImage;

                    }
                } else {
                    jsArr[i].userInfo[0] = [];
                }
            }
            res.json({
                status: "success",
                message: 'successfully',
                AllFeeds: jsArr,
                total: newdata
            });
            return;

        } else {
            res.json({
                status: "fail",
                message: 'No record found.',
                AllFeeds: []
            });
            return;
        }

    });

}
exports.sendNotification = function(senderId,receiverId,type,dataInfo,notifyId,notifyType){
      

  
            switch (type) {

                 case '1':

                     var body = 'sent a booking request.';
                     var title = 'Booking Request';
                     break;

                 case '2':
                     var body = 'accepted your booking request.'
                     var title = 'Booking Accept';
                     break;

                 case '3':
                     var body = 'rejected your booking request.';
                     var title = 'Booking Reject';
                     break;

                 case '4':
                     var body = 'has cancelled your booking request';
                     var title = 'Booking Cancel';
                     break;

                 case '5':
                     var body = 'completed your booking request.';
                     var title = 'Booking Complete';
                     break;

                 case '6':
                     var body = 'given review for booking.';
                     var title = 'Booking Review';
                     break;

                 case '7':
                     var body = 'added a new post.';
                     var title = 'New Post';
                     break;

                case '8':
                    var body = 'Payment has completed by';
                    var title = 'Payment';
                    break;

                 case '9':
                     var body = 'commented on your post.';
                     var title = 'Comment';
                     break;

                 case '10':
                     var body = 'likes your post.';
                     var title = 'Post Like';
                     break;

                 case '11':
                     var body = 'likes your comment.';
                     var title = 'Comment Like';
                     break;
                 case '12':
                     var body = 'started following you.';
                     var title = 'Following';
                     break;

                case '13':
                     var body = 'added to their story.';
                     var title = 'Story';
                     break;
               
                case '14':
                     var body = 'added you as a favourites.';
                     var title = 'Favourites';
                     break;  
                case '16':
                 var body = 'tagged you in a post.';
                 var title = 'Tag';
                 break;         


            }
   
    notification = {
        title:title, 
        body: body,
        notifincationType:type,
        sound: "default",
        'notifyId' : notifyId,
        click_action:"ChatActivity"
    };
   
    data = {
        title:title, 
        body: body,
        notifincationType:type,
        notifyId : notifyId,
        click_action:"ChatActivity"
    };
   
    webData = {
        title:title,
        body:body,
        url:'/allBookinghistory'
    }
    if(dataInfo){
  
        var i = 0;
        async.each(dataInfo, function(rs, callback){

       
        if(rs._id==receiverId){

            token = rs.firebaseToken;
            deviceType = rs.deviceType;
  
            //userName = rs.userName;

            }else{

               userName = rs.userName;
               profileImage = "http://koobi.co.uk:3000/uploads/profile/"+rs.profileImage;
               userType = rs.userType;
               businessName = rs.businessName;

            }
            callback();
            i++;
        },function(){
            
            uName =   userName[0].toUpperCase() + userName.slice(1);
            if(type=='8'){
                notification.body = body+' '+uName;
                data.body = body+' '+uName;
                webData.body =body+' '+uName;

            }else{

                notification.body = uName+' '+body;
                data.body = uName+' '+body;
                webData.body = uName+' '+body;
            }
           
            data.urlImageString = profileImage;
            data.userType =  notification.userType =  userType;
            data.userName =  notification.userName =  uName;
  
            var moment = require('moment');
            var crd = moment().format();
            insertData={};
           
            insertData['senderId']   = senderId;
            insertData['receiverId'] = receiverId;
            insertData['notifincationType'] =type;
            insertData['crd'] = crd;
            insertData['upd'] = crd;
            insertData['notifyId'] = notifyId;
            insertData['type'] = notifyType;
                                                   
            addNotification.find().sort([['_id', 'descending']]).limit(1).exec(function(err, result) {
               

                if (result.length > 0) {
                    insertData._id = result[0]._id + 1;
                }else{
                    insertData._id = 1;
                }
           
                addNotification(insertData).save(function(err, notifyData) {
                    
                    if(deviceType =='3'){
                    
                        notify.sendWebNotification(receiverId,webData);
                    
                    }else{
                          notify.sendNotification(token,notification,data);
                    }
                });
          
           });   

            
        });
    } 
}
exports.userBooking = function(req,res,next){
   bookInfo ={};
   bookInfo =req.body;
   userId= Number(req.body.userId);
   sortData = {};
   searchData = {};

    sortData["bookingDate"] = 1;
    sortData["timeCount"] = 1;
    
    type = req.body.type;

   if(type =='past'){
   
     
     searchData['userId'] = userId;
     searchData['paymentStatus'] = 1; 
     searchData['bookStatus'] = '3';
     sortData["bookingDate"] = -1;
     sortData["timeCount"] = -1; 

   }else{
 
     searchData['userId'] = userId;
     searchData['paymentStatus'] = {$ne : 1};
     searchData['bookStatus'] = {$ne :'2'}; 
  
   }

    booking.aggregate([ 
      { $match:searchData},
      { $sort:sortData}, 
      {   
        "$project":{
            "_id":1
        } 
      }
    ],function(err, dataLength){
   
    if(dataLength){
        total = dataLength.length; 
    }else{
        total = 0;
    }
    next();
      
  }); 
}
exports.userBookingInfo = function(req,res,next){

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

 booking.aggregate([
    { $match:searchData},
    { $sort:sortData},
    { $skip:page},
    { $limit:limit },           
    {
        "$lookup": {
           "from": "users",
           "localField": "artistId",
           "foreignField": "_id",
           "as": "artistDetail"
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
            "timeCount":1,
            "reviewStatus":1,
            "reviewByUser":1,
            "reviewByArtist":1,
            "userRating":1,
            "artistRating":1,
            "artistId": { "$arrayElemAt": [ "$artistDetail._id",0] },
            "userName":{ "$arrayElemAt": [ "$artistDetail.userName",0] },
            "profileImage":{ "$arrayElemAt": [ "$artistDetail.profileImage",0] }
            
           
        }
    },
   
],function(err, data){
   
    if(data){

        userBookingInfo = data;
        next();
    }else{
         res.json({status: "fail",message: 'No record found.'});
        return;
    }
   
      


   });

}
exports.userBookingFinal = function(req,res){
    var baseUrl =  req.protocol + '://'+req.headers['host'];
    bookId = [];
    bookId= userBookingInfo.map(bookId => bookId._id);
     
    
    bookingService.aggregate([
    {
        "$lookup": {
           "from": "users",
           "localField": "artistId",
           "foreignField": "_id",
           "as": "staffInfo"
        }
    },
       
    {
        "$lookup": {
            "from": "artistservices",
            "localField": "artistServiceId",
            "foreignField": "_id",
            "as": "artistService"
        }
    },
    
    { $match:{
               bookingId:{$in:bookId}
             }
    },
              
    {
        "$project": {
            "bookingId": 1,
            /*"staff":1,
            "staffName": { "$arrayElemAt": [ "$staffInfo.userName",0] },
            "bookingPrice": 1,
            "bookingStatus": 1,
            "serviceId": 1,
            "subServiceId": 1,*/
            "artistServiceId": 1,
            "artistServiceName": { "$arrayElemAt": [ "$artistService.title",0] },
            /*"bookingDate": 1,
            "startTime":1,
            "endTime":1,
            "serviceType":1,
            "artistId":1*/
            
            
                  
        }
    },
   
],function(err, data){
    
    if(data){
              
        for (var i = 0; i < userBookingInfo.length; i++) {
              if(userBookingInfo[i].profileImage){
                    userBookingInfo[i].profileImage =  baseUrl+"/uploads/profile/"+userBookingInfo[i].profileImage; 
                }
                 serviceArr = [];
                for (var j = 0; j < data.length; j++) {
                   
                    if (userBookingInfo[i]._id == data[j].bookingId) {
                         
                        serviceArr.push(data[j].artistServiceName)


                    }
                }
                userBookingInfo[i].artistService = serviceArr;
        }
         res.json({status: "success",message: 'ok',total:total,Booking:userBookingInfo});

    }else{
         res.json({status: "fail",message: 'No record found.'});
        return;
    }
   
      


   });

}
exports.bookingReviewRating = function(req,res){

    bookingId      =  Number(req.body.bookingId);
    reviewByUser   =  req.body.reviewByUser;
    reviewByArtist =  req.body.reviewByArtist;
    rating         =  req.body.rating; 
    userId         =  Number(req.body.userId); 
    artistId         =  Number(req.body.artistId); 
    msg            =  '';     
    updateData = {};
    
    if(bookingId ==''){
        res.json({status:"fail",message:'Booking id is required.'});
    }

    if(reviewByUser){
        updateData['reviewByUser'] = reviewByUser;
        updateData['userRating']       = rating;
        msg = 'Review submitted successfully.';
        rs = {'artistId' :artistId,'userRating':{$ne:0}};
        where     = {'_id':artistId};
        senderId  =  userId;
        reciverId = artistId;
    }

    if(reviewByArtist){
        updateData['reviewByArtist'] = reviewByArtist;
        updateData['artistRating']         = rating;
        msg = 'Review submitted successfully.';
        
        rs = {'userId' : userId,'artistRating':{$ne:0}}; 
        where = {'_id':userId};

        senderId =   artistId;
        reciverId =  userId;
    }


    booking.findOne({'_id':bookingId}).exec(function(err,data){
     if(data){
        
            if((reviewByUser!='' && data.artistRating!='')||(reviewByArtist!='' && data.userRating!='')){
                 console.log("welcome");  
                 updateData.reviewStatus = 1;
            }
            booking.updateMany({'_id':data._id},{$set:updateData}, function(err, docs){  

                booking.find(rs, function(err, userData) {

                    if(userData){
                        count = userData.length;
                        console.log(count);
                        total = 0;
                        userData.forEach(function(rd) {
                            
                            if(reviewByArtist){

                                total = rd.artistRating+total;

                            }else{

                               total = rd.userRating+total;

                            }

                        });

              
                        r = total/count;
                        rating = Number(r).toFixed(0);
                        
                        User.updateMany(where,{$set:{ratingCount:rating,reviewCount:count}}, function(err, docs){  });
                    }

                });
                
            });

     }
    
   
    });

     /*code for notification*/
   
      var type = '6';
      var notifyId   = bookingId;
      var notifyType = 'booking'; 
      notify.notificationUser(senderId,reciverId,type,notifyId,notifyType);
    
     /*end code*/     
    res.json({status:"success",message:msg});
   
}
exports.bookingReviewRatingOld = function(req,res){

    bookingId      =  Number(req.body.bookingId);
    reviewByUser   =  req.body.reviewByUser;
    reviewByArtist =  req.body.reviewByArtist;
    rating         =  req.body.rating; 
    userId         =  Number(req.body.userId); 
    artistId         =  Number(req.body.artistId); 
    msg            =  '';     
    updateData = {};
     searchData ={}
     search ={};  
    if(bookingId ==''){
        res.json({status:"fail",message:'Booking id is required.'});
    }

    if(reviewByUser){
        updateData['reviewByUser'] = reviewByUser;
        //updateData['reviewStatus'] = 1;
        updateData['userRating'] = rating;
        msg = 'Review submitted successfully.';
       
       searchData['artistId']     = artistId;
       searchData['artistRating'] = {$ne:"0"};

       search['_id'] = artistId;

    }

    if(reviewByArtist){
         updateData['reviewByArtist'] = reviewByArtist;
         updateData['artistRating'] = rating;
         msg = 'Review submitted successfully.';

        searchData['userId']     =  userId;
        searchData['userRating'] =  {$ne:"0"};

        search['_id'] = userId;
    }

    booking.updateMany({'_id':bookingId},{$set:updateData}, function(err, result){
          if(result.n){

                if(rating){
                   
                    booking.aggregate([
                      { 
                        $match: searchData
                      }, 
                   
                     {$group:{_id:"$artistId", rating:{$push:"$userRating"}, totalUser: {$sum: 1}}},
                      ],function(err,updata){
                           
                            total =  updata[0].totalUser;
                            var sum = 0, arr = updata[0].rating;
                           
                            for (var i = arr.length; !!i--;){
                                   sum += Number(arr[i]);
                            }
                           rat = Math.round(sum/total);
                           if(rat){
                            userUpdate ={};
                            userUpdate['reviewCount']= total;
                            userUpdate['ratingCount']= rat;

                              User.updateMany(search,{$set:userUpdate}, function(err, result){});
                            }
                    });     
                    
                }
             /*code for notification*/
              var type = '6';
              var notifyId   = bookingId;
              var notifyType = 'booking'; 
              if(reviewByArtist){
                    notify.notificationUser(userId,artistId,type,notifyId,notifyType);
           

              }else{
                    notify.notificationUser(artistId,userId,type,notifyId,notifyType);
              }
             /*end code*/     
             res.json({status:"success",message:msg});
              
          }else{
             res.json({status:"fail",message:'Something went wrong.'});
          }
    })
}
exports.followrsCheckData = function(req,res, next){

    userId = Number(req.body.userId); 
    loginUserId = Number(req.body.loginUserId);

    if(userId == ''){
        res.json({status:"fail",message:'User id is required.'});
        return;

    }
    if(loginUserId ==''){
        res.json({status:"fail",message:'User id is required.'});
        return;

    }
    if(loginUserId){

        followUnfollow.aggregate([
            {
                $match: {followerId:loginUserId,status:1}
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
 
    followUnfollow.aggregate([
        {
            $match: {userId:userId,status:1}
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

        { $skip:page },
 
        { $limit:limit },
 
        {   
            $project:{
                userId:1,
                followerId :"$userInfo._id",
                userName :"$userInfo.userName",
                firstName :"$userInfo.firstName",
                lastName :"$userInfo.lastName",
                profileImage :"$userInfo.profileImage"
                
            } 

        }],function(err,data){
                
               if(data){ 
                    for (i = 0 ; i < data.length ; i++) {
                        if(data[i].profileImage){ 
                            data[i].profileImage = baseUrl+"/uploads/profile/"+ data[i].profileImage;
                        }

                        if(folData.mData){

                 
                            var picked = lodash.filter(mData, { 'followerId': data[i].followerId} );
                            if(picked.length){

                                data[i].followerStatus = 1;    
                            }else{

                                data[i].followerStatus = 0;
                            }
                        }
          

                    }
                    res.json({status: "success",message: 'successfully',followerList: data,total:folData.total});
                    return;  
                } else {
                   res.json({status: "fail",message: 'No record found.',followerList:[] });
                    return;
                }

                            
      
    });
 
}
exports.followingData = function(req, res, next){
  
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
 
    followUnfollow.aggregate([
        {
            $match: {followerId:userId,status:1}
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

        { $skip:page },
 
        { $limit:limit },
 
        {   
            $project:{
                userId:1,
                followerId :"$userInfo._id",
                userName :"$userInfo.userName",
                firstName :"$userInfo.firstName",
                lastName :"$userInfo.lastName",
                profileImage :"$userInfo.profileImage"
                
            } 

        }],function(err,data){
                
               if(data){ 
                    for (i = 0 ; i < data.length ; i++) {
                        if(data[i].profileImage){ 
                            data[i].profileImage = baseUrl+"/uploads/profile/"+ data[i].profileImage;
                        }

                        if(folData.mData){

                 
                            var picked = lodash.filter(mData, { 'followerId': data[i].followerId} );
                            if(picked.length){

                                data[i].followerStatus = 1;    
                            }else{

                                data[i].followerStatus = 0;
                            }
                        }
          

                    }
                    res.json({status: "success",message: 'successfully',followingList: data,total:folData.total});
                    return;  
                } else {
                   res.json({status: "fail",message: 'No record found.',followingList:[] });
                    return;
                }

                            
      
    });
 
}
exports.getNotificationList = function(req,res,next){

    userId  = Number(req.body.userId);
    type    = req.body.type;
 
    if(userId == ''){
        res.json({status:"fail",message:'User id is required.'});
        return;
    }
    /* if(type == ''){
        res.json({status:"fail",message:'Type id is required.'});
        return;
    }*/

    addNotification.aggregate([
    {
        $match: {
                 receiverId:userId
                }
    },

    {
        $lookup: {
            from: "users",
            localField: "senderId",
            foreignField: "_id",
            as:"userInfo"
            }
    },

    { "$unwind": "$userInfo" },

    {   
        $project:{
            senderId :"$userInfo._id",
            userName :"$userInfo.userName",
            firstName :"$userInfo.firstName",
            lastName :"$userInfo.lastName",
            profileImage :"$userInfo.profileImage",
            userType :"$userInfo.userType",
            notifincationType :1,
            type :1,
            readStatus :1
            
        } 

    }],function(err,data){
      
        
        if(data){
        
            total = data.length;
            

        }
        next();
 });


}
exports.getNotificationListFinal = function(req,res){

    var Cryptr = require('cryptr'),
    cryptr = new Cryptr('1234567890');
    
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

    sortData = {};
    
    sortData["_id"] = -1;

    addNotification.aggregate([
    {
        $match: {
                 receiverId:userId
                }
    },
    { $sort:sortData},
    {
        $lookup: {
            from: "users",
            localField: "senderId",
            foreignField: "_id",
            as:"userInfo"
            }
    },

    { "$unwind": "$userInfo" },
    { $skip:page },
    { $limit:limit },
    {   
        $project:{
            senderId :"$userInfo._id",
            userName :"$userInfo.userName",
            firstName :"$userInfo.firstName",
            lastName :"$userInfo.lastName",
            profileImage :"$userInfo.profileImage",
            userType :"$userInfo.userType",
            notifincationType :1,
            notifyId :1,
            type :1,
            readStatus :1,
            crd:1
            
        } 

    }],function(err,data){
        var moment = require('moment');            
        if(data){
        
             for (i = 0 ; i < data.length ; i++) {
                
                if(data[i].profileImage){

                    if(!validUrl.isUri(data[i].profileImage)){
                         data[i].profileImage = baseUrl+"/uploads/profile/"+data[i].profileImage;
                    } 
                 
                }
            data[i].redirectId = cryptr.encrypt(data[i].notifyId);
            data[i].timeElapsed = moment(data[i].crd).fromNow();
            switch (String(data[i].notifincationType)) {

                case '1':

                     var body = 'sent a booking request.';
                     var title = 'Booking Request';
                     break;

                 case '2':
                     var body = 'accepted your booking request.'
                     var title = 'Booking Accept';
                     break;

                 case '3':
                     var body = 'rejected your booking request.';
                     var title = 'Booking Reject';
                     break;

                 case '4':
                     var body = 'has cancelled your booking request';
                     var title = 'Booking Cancel';
                     break;

                 case '5':
                     var body = 'completed your booking request.';
                     var title = 'Booking Complete';
                     break;

                 case '6':
                     var body = 'given review for booking.';
                     var title = 'Booking Review';
                     break;

                 case '7':
                     var body = 'added a new post.';
                     var title = 'New Post';
                     break;

                case '8':
                    var body = 'Payment has completed by';
                    var title = 'Payment';
                    break;

                 case '9':
                     var body = 'commented on your post.';
                     var title = 'Comment';
                     break;

                 case '10':
                     var body = 'likes your post.';
                     var title = 'Post Like';
                     break;

                 case '11':
                     var body = 'likes your comment.';
                     var title = 'Comment Like';
                     break;
                 case '12':
                     var body = 'started following you.';
                     var title = 'Following';
                     break;

                case '13':
                     var body = 'added to their story.';
                     var title = 'Story';
                     break;
               
                case '14':
                     var body = 'added you as a favourites.';
                     var title = 'Favourites';
                     break;  

                case '15':

                    data[i].profileImage = baseUrl+'/front/img/loader.png';
                    data[i].userName = '';
                    var body = 'Your certificate has been verified by admin.';
                    var title = 'Certificate verified';
                    break;   
                case '16':
                 var body = 'tagged you in a post.';
                 var title = 'Tag';
                 break;          
            }
            

            data[i].message = body;
            
            if(data[i].notifincationType =='8'){
                
                 data[i].message = body+' '+data[i].userName;

            }else if(data[i].notifincationType !='15'){
              
                 data[i].message = data[i].userName+' '+body;
                
            }

            }
             res.json({status:"success",message:'ok',total:total,notificationList:data});    

        }else{
               res.json({status:"fail",message:'No record found'});
        }
        
 });


}
exports.readNotification = function(req,res){

    notificationId = Number(req.body.notificationId);

    if(notificationId == ''){
   
        res.json({status:"fail",message:'Notification id is required.'});
        return;

    }

    addNotification.updateMany({'_id':notificationId},{$set:{readStatus:1}}, function(err, result){
      if(result.n){
          res.json({status:"success",message:'ok'});
      }else{
         res.json({status:"fail",message:'Something went wrong.'});
      }
  
    });
}

exports.checkFavorite = function(req,res,next){
    artistFavorite.find({'userId':Number(loginUserId)}).exec(function(err,userData){
        if(userData){
             favData = userData;
        }else{
             favData = [];
        }
       
        next();
    });

}
exports.paymentList = function(req,res,next){
     var userId = Number(req.body.userId);
     var userType = req.body.userType;
     var baseUrl =  req.protocol + '://'+req.headers['host'];
     if(userId == ''){
   
        res.json({status:"fail",message:'User id is required.'});
        return;

    }
    if(userType == ''){
   
        res.json({status:"fail",message:'User type is required.'});
        return;

    }
    whereData = {};
 
    whereData['bookStatus'] = '3';  

    if(userType =='artist'){
        
         whereData['artistId'] = userId; 
     
     }else{
        
         whereData['userId'] = userId;
     }
     

    booking.aggregate([ 
      { $match:whereData},
      { $sort : { 'bookingDate':-1,'timeCount':-1 } },
      {   
        "$project":{
            "_id":1
        } 
      }
    ],function(err, dataLength){
   
    if(dataLength){
        total = dataLength.length; 
    }else{
        total = 0;
    }
    next();
      
  });



}
exports.paymentListInfo= function(req,res,next){
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

 booking.aggregate([
   { $match:whereData},
   { $sort : { 'bookingDate':-1,'timeCount':-1 } },
    { $skip:page},
    { $limit:limit },
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
        "$project": {
            "_id": 1,
            "bookingDate": 1,
            "bookingTime": 1,
            "totalPrice": 1,
            "paymentType": 1,
            "paymentStatus": 1,
            "location": 1,
            "bookStatus": 1,
            "timeCount":1,
            "reviewStatus":1,
            "reviewByUser":1,
            "reviewByArtist":1,
            "userRating":1,
            "artistRating":1,
            "transjectionId":1,
            "artistId": { "$arrayElemAt": [ "$artistDetail._id",0] },
            "artistName":{ "$arrayElemAt": [ "$artistDetail.userName",0] },
            "artistProfileImage":{ "$arrayElemAt": [ "$artistDetail.profileImage",0] },
            "userId": { "$arrayElemAt": [ "$userDetail._id",0] },
            "userName":{ "$arrayElemAt": [ "$userDetail.userName",0] },
            "userProfileImage":{ "$arrayElemAt": [ "$userDetail.profileImage",0] }
            
           
        }
    },
   
],function(err, data){
   
    if(data){
        
        bookingInfo = data;
        next();
    }else{
         res.json({status: "fail",message: 'No record found.'});
        return;
    }
   
      


   });
}
exports.paymentListFinal = function(req,res){
    var baseUrl =  req.protocol + '://'+req.headers['host'];
    bookId = [];
    bookId= bookingInfo.map(bookId => bookId._id);
     
    
    bookingService.aggregate([
    {
        "$lookup": {
           "from": "users",
           "localField": "staff",
           "foreignField": "_id",
           "as": "staffInfo"
        }
    },
       
    {
        "$lookup": {
            "from": "artistservices",
            "localField": "artistServiceId",
            "foreignField": "_id",
            "as": "artistService"
        }
    },
    
    { $match:{
               bookingId:{$in:bookId}
             }
    },
              
    {
        "$project": {
            "bookingId": 1,
            "artistServiceId": 1,
            "artistServiceName": { "$arrayElemAt": [ "$artistService.title",0] }
     
                  
        }
    },
   
],function(err, data){
    
    if(data){
              
        for (var i = 0; i < bookingInfo.length; i++) {
              if(bookingInfo[i].userProfileImage){
                    bookingInfo[i].userProfileImage =  baseUrl+"/uploads/profile/"+bookingInfo[i].userProfileImage; 
                }
               if(bookingInfo[i].artistProfileImage){
                    bookingInfo[i].artistProfileImage =  baseUrl+"/uploads/profile/"+bookingInfo[i].artistProfileImage; 
                }
                 serviceArr = [];
                for (var j = 0; j < data.length; j++) {
                   
                    if (bookingInfo[i]._id == data[j].bookingId) {
                         
                        serviceArr.push(data[j].artistServiceName)


                    }
                }
                bookingInfo[i].artistService = serviceArr;
        }
         res.json({status: "success",message: 'ok',total:total,paymentList:bookingInfo});

    }else{
         res.json({status: "fail",message: 'No record found.'});
        return;
    }
 });

}


 exports.sendMultiple = function(req, res) {

     userId = Number(req.body.userId);
     senderId = userId;
     notifincationType = req.body.notifincationType;
     notifyId = req.body.notifyId;
     nId = req.body.notifyId;
     notifyType = req.body.notifyType;

     User.find({'_id':{$in:folInfo.flUser}},{'_id':1,'userName':1,'businessName':1,'userType':1,'firebaseToken': 1,'deviceType': 1,'profileImage': 1
     }).exec(function(err, userData) {



         if (userData.length>0) {
            
             var filteredAry = userData.filter(function(e) {
                 return e._id !== userId
             });

              var myArray = userData.filter(function(i) {
                 return i._id == userId
             });

             userName = myArray[0].userName;
             userType = myArray[0].userType;
             var baseUrl =  req.protocol + '://'+req.headers['host'];
             profileImage = baseUrl+"/uploads/profile/"+myArray[0].profileImage;
            var notifyId = req.body.notifyId;
            switch (notifincationType) {

                 case '1':

                     var body = 'sent a booking request.';
                     var title = 'Booking Request';
                     break;

                 case '2':
                     var body = 'accepted your booking request.'
                     var title = 'Booking Accept';
                     break;

                 case '3':
                     var body = 'rejected your booking request.';
                     var title = 'Booking Reject';
                     break;

                 case '4':
                     var body = 'has cancelled your booking request.';
                     var title = 'Booking Cancel';
                     break;

                 case '5':
                     var body = 'completed your booking request.';
                     var title = 'Booking Complete';
                     break;

                 case '6':
                     var body = 'given review for booking.';
                     var title = 'Booking Review';
                     break;

                 case '7':
                     var body = 'added a new post.';
                     var title = 'New Post';
                     break;

                case '8':
                    var body = 'Payment has completed by';
                    var title = 'Payment';
                    break;

                 case '9':
                     var body = 'commented on your post.';
                     var title = 'Comment';
                     break;

                 case '10':
                     var body = 'likes your post.';
                     var title = 'Post Like';
                     break;

                 case '11':
                     var body = 'likes your comment.';
                     var title = 'Comment Like';
                     break;
                 case '12':
                     var body = 'started following you.';
                     var title = 'Following';
                     break;

                case '13':
                     var body = 'added to their story.';
                     var title = 'Story';
                     var notifyId = userId;
                     break;
               
                case '14':
                     var body = 'added you as a favourites.';
                     var title = 'Favourites';
                     break;  
                case '16':
                 var body = 'tagged you in a post.';
                 var title = 'Tag';
                 break;            


             }

             notification = {
                 title: title,
                 body: body,
                 notifincationType: notifincationType,
                 sound: "default",
                 notifyId : notifyId,
                 click_action:"ChatActivity"
             };

             data = {
                 title: title,
                 body: body,
                 notifincationType: notifincationType,
                 notifyId : notifyId,
                 click_action:"ChatActivity"
             };
       
             webData = {
                 title: title,
                 body: body,
                 url: '/allBookinghistory'
             }

             multiDta = [];
             tok = []
             async.each(filteredAry, function(rs, callback) {

                 var moment = require('moment');
                 var crd = moment().format();
                 insertData = {};

                 insertData['senderId'] = senderId;
                 insertData['receiverId'] = rs._id;
                 insertData['notifincationType'] = notifincationType;
                 insertData['crd'] = crd;
                 insertData['upd'] = crd;
                 token = '';
                 multiDta.push(insertData);
                 tok.push(rs.firebaseToken);

                 callback();

             }, function() {

                addNotification.find().sort([['_id', 'descending']]).limit(1).exec(function(err, nData) {
                     var autoId = 1;

                     if (nData.length > 0) {
                        
                         autoId = nData[0]._id + 1;

                     }
                     jsArr = [];
                     for (var i = 0; i < multiDta.length; i++) {
                        
                         inc = autoId + i;

                         jsArr.push({
                             _id: inc,
                             senderId: multiDta[i].senderId,
                             receiverId: multiDta[i].receiverId,
                             notifincationType: multiDta[i].notifincationType,
                             notifyId: nId,
                             type: notifyType,
                             crd: multiDta[i].crd,
                             upd: multiDta[i].upd
                         });

                     }
                     addNotification.insertMany(jsArr);
                     uName = userName[0].toUpperCase() + userName.slice(1);
                     notification.body = uName + ' ' + body;

                     data.body = uName + ' ' + body;
                     data.urlImageString = profileImage;
                     data.userType = notification.userType = userType;
                     data.userName = notification.userName = uName;
                     webData.body = uName + ' ' + body;
                     notify.sendNotificationMultiple(tok, notification, data);

                 });

            });
        }
    });

}
/*api for user  active status*/

exports.checkUserStatus = function(req,res){
    userId = req.body.userId;
    if(userId ==''){
        res.json({status:"fail",message:"UserId is required."});
        return; 
    }
    User.findOne({'_id':userId},{_id:1,status:1}).exec(function(err,result){
         if(result){
             res.json({status: "success",message: 'ok',userStatus:result});
         }else{
            res.json({status:'fail',message:'No record found.'});
         }
    });

}

/*api for like status*/

exports.checkLike = function(req,res,next){
    likes.find({'likeById':Number(loginUserId),'type':'feed','status':1}).exec(function(err,userData){
        if(userData){
             likeData = userData;
        }else{
             likeData = [];
        }
       
        next();
    });

}