var User            = require('../../models/front/home');
var artistService   = require('../../models/front/artistService.js');
var businesshours       = require('../../models/front/businesshours.js');
var feeds = require('../../models/front/feed.js');
var booking         = require('../../models/front/booking.js');
var Certificate     = require('../../models/front/artistCertificate.js');
var staff               = require('../../models/front/staff_model.js');
var followUnfollow  = require('../../models/front/followersFollowing.js');
var addNotification     = require('../../models/front/notification.js');
var staffService        = require('../../models/front/staffService.js');
var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');
var url = require('url');
var moment = require('moment');
var Cryptr = require('cryptr'),
cryptr = new Cryptr('1234567890');
var lodash = require('lodash');


exports.userList = function(req, res) {

	res.render('admin/customerList.ejs', {
            error : req.flash("error"),
            success : req.flash("success"),
            session : req.session
    });
	 
}


exports.listuser = function(req, res) {

    var latitude = req.query.latitude; 
    var longitude = req.query.longitude; 
    var gender = req.query.gender; 

    data = datae = {};

    datae['userType'] = 'user';
    datae['isDocument'] = 3;
    if(gender){

        datae['gender'] = gender;
    }
    if(latitude){
        data = {
                    "near": {
                     "type": "Point",
                     "coordinates":[parseFloat(latitude), parseFloat(longitude)]
                    },
                    maxDistance: 2* 1609.34,
                    "spherical": true,
                    "distanceField": "distance",
                    distanceMultiplier: 1 / 1609.344 // calculate distance in miles
                }
         query = User.aggregate([{"$geoNear": data },{$match: datae},{ $sort : { _id: -1} }]);

    }else{

        query = User.aggregate([{$match: datae},{ $sort : { _id: -1} }]);

    }  


    query.exec(function(err, data) {
        
            if (err) throw err;
            if(data.length){
                i=0;
                 data.forEach(function(rs) { 

                       if(rs.profileImage){

                      var result = url.parse(rs.profileImage, true);
                      if(result.slashes==true){

                       data[i].profileImage = rs.profileImage;

                      }else{

                        data[i].profileImage = '/uploads/profile/'+rs.profileImage;
                      }
                    }else{

                     data[i].profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

                    }
             i++;       

            });
            }
            var totalStudents = data.length,
            pageSize = 10,
            olddata = data.length/pageSize;
            newdata =  Math.round(data.length/pageSize);
            if(newdata<olddata)
            {
                newdata = (newdata)+1;

            }
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
            if (typeof req.query.page !== 'undefined') {
                currentPage = +req.query.page;
            }

            //show list of students from group
            studentsList = studentsArrays[+currentPage - 1];

            
            res.render('admin/customer_list.ejs', {
                error : req.flash("error"),
                success : req.flash("success"),
                session : req.session,
                categorydata: studentsList,
                pageSize: pageSize,
                totalStudents: totalStudents,
                pageCount: pageCount,
                currentPage: currentPage,
                cryptr : cryptr
        });

});


     
}


exports.artistStatus = function(req, res){

	User.update({_id:cryptr.decrypt(req.params.categoryId)}, 
        {$set: {status:cryptr.decrypt(req.params.status),deviceToken:'',firebaseToken:''}},
        function(err, docs){
            if(err) res.json(err);
            else    {
                req.flash("success","");
                if(cryptr.decrypt(req.params.status)=="1"){

                    req.flash("success","Artist active successfully");

                }else{

                   req.flash("success","Artist inactive successfully"); 
                }
                res.redirect('/artist');
            };
    });


}

exports.artistList = function(req, res) {

    res.render('admin/artistList.ejs', {
            error : req.flash("error"),
            success : req.flash("success"),
            session : req.session
    });
     
}


exports.listartist = function(req, res) {

    var latitude = req.query.latitude; 
    var longitude = req.query.longitude; 
    var gender = req.query.gender; 
    var businessType = req.query.businessType; 

    data = datae = {};

     datae['userType'] = 'artist';
    datae['isDocument'] = 3;
    if(gender){

        datae['gender'] = gender;
    }
    if(businessType){

        datae['businessType'] = businessType;
    }
    if(latitude){
        data = {
                    "near": {
                     "type": "Point",
                     "coordinates":[parseFloat(latitude), parseFloat(longitude)]
                    },
                    maxDistance: 2* 1609.34,
                    "spherical": true,
                    "distanceField": "distance",
                    distanceMultiplier: 1 / 1609.344 // calculate distance in miles
                }
         query = User.aggregate([{"$geoNear": data },{$match: datae},{ $sort : { _id: -1} }]);

    }else{

        query = User.aggregate([{$match: datae},{ $sort : { _id: -1} }]);

    }
   


    query.exec(function(err, data) {

            if (err) throw err;
            if(data.length){
                i=0;
                 data.forEach(function(rs) { 

                       if(rs.profileImage){

                      var result = url.parse(rs.profileImage, true);
                      if(result.slashes==true){

                       data[i].profileImage = rs.profileImage;

                      }else{

                        data[i].profileImage = '/uploads/profile/'+rs.profileImage;
                      }
                    }else{

                     data[i].profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

                    }
             i++;       

            });
            }
            var totalStudents = data.length,
            pageSize = 10,
            olddata = totalStudents/pageSize;
            pageCount =  Math.round(totalStudents/pageSize);
            if(pageCount<olddata)
            {
                pageCount = Number(pageCount)+1;

            }
            currentPage = 1,
            students = [],
            studentsArrays = [], 
            studentsList = []; 
   
            //split list into groups
            while (data.length > 0) {
                studentsArrays.push(data.splice(0, pageSize));
            }

            //set current page if specifed as get variable (eg: /?page=2)
            if (typeof req.query.page !== 'undefined') {
                currentPage = +req.query.page;
            }

            //show list of students from group
            studentsList = studentsArrays[+currentPage - 1];

            
            res.render('admin/artist_list.ejs', {
                error : req.flash("error"),
                success : req.flash("success"),
                session : req.session,
                categorydata: studentsList,
                pageSize: pageSize,
                totalStudents: totalStudents,
                pageCount: pageCount,
                currentPage: currentPage,
                cryptr : cryptr
        });

});


     
}


exports.userStatus = function(req, res){

    User.update({_id:cryptr.decrypt(req.params.categoryId)}, 
        {$set: {status:cryptr.decrypt(req.params.status),deviceToken:'',firebaseToken:''}},
        function(err, docs){
            if(err) res.json(err);
            else    {
                
                req.flash("success","");

                if(cryptr.decrypt(req.params.status)=="1"){

                    req.flash("success","User active successfully");

                }else{

                   req.flash("success","User inactive successfully"); 
                }
                res.redirect('/customer');
            };
    });


}


exports.customerview = function(req, res){

    var id = cryptr.decrypt(req.params.id);

    User.findOne({'_id' :  id}).sort([['_id', 'descending']]).exec(function(err, data) {

         if(data.profileImage){

          var result = url.parse(data.profileImage, true);
          if(result.slashes==true){

            data.profileImage = data.profileImage;

          }else{

            data.profileImage = '/uploads/profile/'+data.profileImage;
          }

        }else{

          data.profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

        } 

        feeds.find({userId:id}, function (e, fdata) {

                        data.postCount = data.bookingCount = 0;

                        if(fdata){

                            data.postCount = fdata.length;

                        }

                booking.find({'bookStatus':'3','userId':id}, function(err, bdData) {

                    data.bookingCount = bdData.length ? bdData.length : 0;
            
                res.render('admin/customerview.ejs', {
                    error : req.flash("error"),
                    success: req.flash("success"),
                    session:req.session,
                    data : data,
                    moment : moment 
                });
            });
        });
     

    });


}


exports.artistview = function(req, res){

    var id = cryptr.decrypt(req.params.id);

    User.findOne({'_id' :  id}).sort([['_id', 'descending']]).exec(function(err, data) {
        if(data.profileImage){

          var result = url.parse(data.profileImage, true);
          if(result.slashes==true){

            data.profileImage = data.profileImage;

          }else{

            data.profileImage = '/uploads/profile/'+data.profileImage;
          }

        }else{

          data.profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

        } 


        Certificate.find({'artistId' :  id}).exec(function(err, cdata) {

            businesshours.find({'artistId' :  id}).exec(function(err, bdata) {

                    feeds.find({userId:id}, function (e, fdata) {

                            data.postCount = data.bookingCount = 0;

                            if(fdata){

                                data.postCount = fdata.length;

                            }

                            booking.find({'bookStatus':'3','artistId':id}, function(err, bdData) {

                                data.bookingCount = bdData.length ? bdData.length : 0;
                        
                                res.render('admin/artistview.ejs', {
                                    error : req.flash("error"),
                                    success: req.flash("success"),
                                    session:req.session,
                                    data : data,
                                    moment : moment, 
                                    hours : bdata,
                                    certificate : cdata,
                                    cryptr : cryptr
                                });
                            });
                    });           

            });
        });    
     

    });


}

exports.certificateUpdate = function(req, res){

    var artistId = req.params.artistId;

    query = User.findOne({'_id':cryptr.decrypt(artistId)});
    querySecound = addNotification.findOne().sort([['_id', 'descending']]).limit(1);

    query.exec(function(err,result){

            deviceType = result.deviceType;
            token = result.deviceToken;

            Certificate.update({_id:cryptr.decrypt(req.params.id)}, 
                {$set: {status:cryptr.decrypt(req.params.status)}},
                function(err, docs){
                    if(err) res.json(err);
                    else    {

                         req.flash("success","");
                        if(cryptr.decrypt(req.params.status)=="1"){


                                    body = 'Your certificate has been verified by admin.';
                                    title = 'Certificate verified';
                                    type = 15;
                                    receiverId = result._id
                                   
                                    notification = { title:title,body: body,notifincationType:type,sound: "default"};                                   
                                    data = {title:title,body: body,notifincationType:type };                                   
                                    webData = {title:title,body:body,url:'/aboutUs?id='+artistId};

                                    insertData = {
                                        'senderId' : 1,
                                        'receiverId' : receiverId,
                                        'notifincationType' : type,
                                        'crd' : moment().format(),
                                        'upd' : moment().format(),
                                        'notifyId' : result._id,
                                        'type' : 'certificate'
                                    };                           
                                                                   
                                    querySecound.exec(function(err, result) {

                                        if (result) {
                                            insertData._id = result._id + 1;
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
                            req.flash("success","Certificate verified successfully");

                        }else{

                           req.flash("success","Certificate unverified successfully"); 
                        }
                        res.redirect('/artistview/'+artistId);
                    };
            });

    });


}




exports.company_List_data = function(req, res, next){


        var userId = req.query.id;

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
                    page = req.query.page;
                    next();

        });     

}


exports.staff_List_data = function(req, res, next){


        var userId =  req.query.id;

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
                    page = req.query.page;
                    next();

        });     

}



exports.staff_List = function(req, res) {


        my12 = ( req.query.businessType=="business") ? my : myCp ; 
        var totalStudents = 0,
        pageCount = 0,
        currentPage = 1,
        studentsList = []; 
        pageSize = 0;

        if(my12.length>0){
            var data = my12;
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
        
        res.render('admin/staff_llst.ejs', {
            error : req.flash("error"),
            success : req.flash("success"),
            session : req.session,
            staff : studentsList,
            pageSize: pageSize,
            totalStudents: totalStudents,
            pageCount: pageCount,
            currentPage: currentPage,
            businessType : req.query.businessType,
            cryptr : cryptr
            
        });
     
}


exports.artistServicesListData = function(req, res, next){
    
    var userId = req.query.id;
    datae = {};
    datae['artistId'] = Number(userId);
    datae['status'] = 1;
    datae['deleteStatus'] = 1;

     artistService.aggregate([
        { $lookup:
          {
            from: 'services',
            localField: 'serviceId',
            foreignField: '_id',
            as: 'category'
          }
         
        },
        { $lookup:
          {
            from: 'subservices',
            localField: 'subserviceId',
            foreignField: '_id',
            as: 'subcategory'
          }
         
        },
        {
         $match: datae
        }

      ]).exec(function(err, data) {


            row = data; 
            next();   
    });
}
exports.artistServicesList = function(req, res){
    
    var userId = req.query.id;
    datae = {};
    datae['artistId'] = Number(userId);
    datae['status'] = 1;
    datae['deleteStatus'] = 1;

     artistService.aggregate([
        { $lookup:
          {
            from: 'services',
            localField: 'serviceId',
            foreignField: '_id',
            as: 'category'
          }
         
        },
        { $lookup:
          {
            from: 'subservices',
            localField: 'subserviceId',
            foreignField: '_id',
            as: 'subcategory'
          }
         
        },
        {
         $match: datae
        }

      ]).exec(function(err, data) {


        if (err) throw err;

            var totalStudents = data.length,
            pageSize = 10,
            olddata = totalStudents/pageSize;
            pageCount =  Math.round(totalStudents/pageSize);
            if(pageCount<olddata)
            {
                pageCount = Number(pageCount)+1;

            }
            currentPage = 1,
            students = [],
            studentsArrays = [], 
            studentsList = []; 
   
            //split list into groups
            while (data.length > 0) {
                studentsArrays.push(data.splice(0, pageSize));
            }

            //set current page if specifed as get variable (eg: /?page=2)
            if (typeof req.query.page !== 'undefined') {
                currentPage = +req.query.page;
            }

            //show list of students from group
            studentsList = studentsArrays[+currentPage - 1];

            
            res.render('admin/artistServicesList.ejs', {
                error : req.flash("error"),
                success : req.flash("success"),
                session : req.session,
                categorydata: studentsList,
                pageSize: pageSize,
                totalStudents: totalStudents,
                pageCount: pageCount,
                currentPage: currentPage,

        });
        if (err) throw err;
    
    });
}
exports.booking_data = function(req, res, next) {


    var userId = Number(req.query.id);

    var datae = {};

    datae['bookStatus'] = '3';      

    if(req.query.userType=="artist"){

        datae['artistId'] = userId; 
    
    }else{

        datae['userId'] = userId;
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

                my12 = data;
                page = req.query.page;
                next();
    });

}


exports.booking_list = function(req, res) {


        var totalStudents = 0,
        pageCount = 0,
        currentPage = 1,
        studentsList = []; 
        pageSize = 0;

        if(my12.length>0){
            var data = my12;
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
        
        res.render('admin/booking_llst.ejs', {
            error : req.flash("error"),
            success : req.flash("success"),
            session : req.session,
            staff : studentsList,
            pageSize: pageSize,
            totalStudents: totalStudents,
            pageCount: pageCount,
            currentPage: currentPage,
            userType : req.query.userType,
            moment : moment,
            cryptr : cryptr
            
        });
     
}



exports.followingData = function(req, res, next){


    var userId = Number(req.query.id);

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
             page = req.query.page;
            next();                          
      
    });
 
}


exports.followersData = function(req, res, next){


    var userId = Number(req.query.id);

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

        {   
            $project:{
                followerId :"$userInfo._id",
                userName :"$userInfo.userName",
                firstName :"$userInfo.firstName",
                lastName :"$userInfo.lastName",
                profileImage :"$userInfo.profileImage",
                userType :"$userInfo.userType"
                
            } 

        }],function(err,data){
                
               if(data){ 
                    for (i = 0 ; i < data.length ; i++) {

                      
                        
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
            page = req.query.page;       

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
        

    res.render('admin/followingList.ejs', {
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

exports.bookingview = function(req, res){

    res.render('admin/bookingview.ejs', {
        error : req.flash("error"),
        success: req.flash("success"),
        session:req.session,
        rs : bookingData,
        moment : moment,
        cryptr : cryptr
    });
}

exports.invoice_print = function(req, res){

    res.render('admin/invoice_print.ejs', {
        error : req.flash("error"),
        success: req.flash("success"),
        session:req.session,
        rs : bookingData,
        moment : moment,
        cryptr : cryptr
    });
}


exports.admin_staff_List_data = function(req, res, next){


        var userId =  bookingData[0].artistId;

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
                    next();

        });     

}

exports.payment_history = function(req, res) {

    res.render('admin/payment_history.ejs', {
            error : req.flash("error"),
            success : req.flash("success"),
            session : req.session
    });
     
}


exports.payment_list = function(req, res) {

    var escapere = require('escape-regexp');
    var search = escapere(req.query.search);
    var datae = {};
    
    datae['paymentStatus'] = 1;  

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
            res.render('admin/payment_history_list.ejs',{
                session : req.session,
                listdata : studentsList,
                pageSize: pageSize,
                totalStudents: totalStudents,
                pageCount: pageCount,
                currentPage: currentPage,
                error : req.flash("error"),
                success : req.flash("success"),
                moment : moment,
                cryptr : cryptr
            });
    });
     
}

exports.staff_Info = function(req, res, next){


        var id = cryptr.decrypt(req.params.id);
        var staffData = staffInfo = [];
        businessType = cryptr.decrypt(req.params.businessType);

    var query = staff.aggregate([

                        {
                            "$lookup": {
                                "from": "users",
                                "localField": "businessId",
                                "foreignField": "_id",
                                "as": "artistDetail"
                            }
                        },

                        {
                            $match: {'_id' : Number(id)}
                        },
                    ]);    


        query.exec(function(err, data) {



                    var newdata= [];
                    staffData = data[0]; 
                    if(staffData){


                            userData = (businessType=="business") ? staffData.staffInfo : staffData.artistDetail[0];
                            staffData.staffInfo =  userData;
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

exports.staffview = function(req, res){

    res.render('admin/staffview.ejs', {
        error : req.flash("error"),
        success: req.flash("success"),
        session:req.session,
        data : staffInfo,
        moment : moment, 
        hours : staffInfo.staffHours,
        cryptr : cryptr,
        businessType : businessType
    });

}

exports.staffServiceList  = function(req, res){

    artistId =  req.query.artistId; 
    businessId =  req.query.id;

    query =  staffService.find({'artistId':artistId,'businessId':businessId});

    query.exec(function(err,data) {

        res.render('admin/staffServiceList.ejs',{
            data : data,
            seession : req.session,
            lodash : lodash
        });


    });
}


