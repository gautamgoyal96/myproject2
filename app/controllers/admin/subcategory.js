var Category            = require('../../models/admin/category_model');
var subCategory            = require('../../models/admin/sub_category_model.js');
var artistsubCategory            = require('../../models/front/artistSubService');
var artistService                   = require('../../models/front/artistService.js');

var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');
var url = require('url');
var formidable = require('formidable');
var fs = require('fs');
var Cryptr = require('cryptr'),
 cryptr = new Cryptr('1234567890');
 var lodash = require('lodash');

exports.addSubCategory = function(req, res) {

    Category.find({status:1,deleteStatus:1}, function(err, categorydata) {
        res.render('admin/addsubCategory.ejs', {
            error : req.flash("error"),
            success : req.flash("success"),
            session : req.session,
            categorydata : categorydata,
        });
    }); 

     
}


exports.insertSubCategory = function(req, res) {


    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {

        var image = '';    
        subCategory.findOne({title:{'$regex' : fields.title, '$options' : 'i'},'deleteStatus' : 1}, function(err, category) {

            
            if(category){
                req.flash('error', '');
                req.flash('error', 'Sub service already exist');
                res.redirect('/addSubCategory');
            } else {
                
                var title = fields.title;
                
                subCategory.find().sort([['_id', 'descending']]).limit(1).exec(function(err, categorydata){
                    
                    // if there is no user with that email
                    // create the user
                    var newUser = new subCategory();

                    // set the user's local credentials                
                    var day = dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss");
                 
                    var active_code=bcrypt.hashSync(Math.floor((Math.random() * 99999999) *54), null, null);
                
                    newUser.title    = title;
                    newUser.serviceId    = fields.serviceId;
                    newUser.created_date = day;
                    newUser.updated_date = day;
                    newUser.status = '1'; //inactive for email actiavators
                    newUser.active_hash = active_code;
                    
                    if(categorydata.length > 0){
                        newUser._id = categorydata[0]._id + 1;
                    } 


                    // save the user

                      // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        req.flash('success', ''); 
                        req.flash('success', 'Sub service  Added Successfully'); 
                        res.redirect('/listSubCategory');
                    });
                    
                });
            }
              
        });
    });
}


exports.listsubCategory = function(req, res) {

    res.render('admin/subcatList.ejs', {
            error : req.flash("error"),
            success : req.flash("success"),
            session : req.session
    });
     
}


exports.subcategoryList = function(req, res) {

    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var search = req.query.search; 

    subCategory.aggregate([
        { $lookup:
          {
            from: 'services',
            localField: 'serviceId',
            foreignField: '_id',
            as: 'category'
          }
         
        },
        {
         $match: {
          'title': {$regex : search,'$options' : 'i'},
          'deleteStatus' : 1
         }
        }

      ]).exec(function(err, data) {
            if (err) throw err;

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

            
            res.render('admin/subcat_List.ejs', {
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


exports.edit = function(req, res) {

    Category.find({status:1}, function(err, categorydata) {
    
        subCategory.findOne({_id:cryptr.decrypt(req.params.categoryId)}, function(err, subcategorydata) {
            res.render('admin/edit_subcategory.ejs', {
                error : req.flash("error"),
                success : req.flash("success"),
                session : req.session,
                categorydata : subcategorydata,
                row : categorydata
             });
        });

    });
   
}

exports.subServicesStatus = function(req, res){

    subCategory.update({_id:cryptr.decrypt(req.params.categoryId)}, 
        {$set: {status:cryptr.decrypt(req.params.status)}},
        function(err, docs){
            if(err) res.json(err);
            else    {
                artistsubCategory.updateMany({subServiceId:cryptr.decrypt(req.params.categoryId)},{$set: {'deleteStatus':cryptr.decrypt(req.params.status)}},function(err, docs){ });
                artistService.updateMany({subserviceId:cryptr.decrypt(req.params.categoryId)},{$set: {'deleteStatus':cryptr.decrypt(req.params.status)}},function(err, docs){ });

                 req.flash("success","");
                if(cryptr.decrypt(req.params.status)=="1"){

                    req.flash("success","Sub service active successfully");

                }else{

                   req.flash("success","Sub service inactive successfully"); 
                }
                res.redirect('/listSubCategory');
            };
    });


}


exports.updateSubCategory = function(req, res){

    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {

        var catId = fields.id;
        subCategory.findOne({title:{'$regex' : req.body.title, '$options' : 'i'},_id: {'$ne':catId},'deleteStatus':1}, function(err, category) {
                       
            if(category){

                req.flash('error', '');
                req.flash('error', 'Sub service already exist');
                res.redirect('/categorySubEdit/'+catId);

            } else {



                    subCategory.update({_id:fields.id}, 
                        {$set: {title:fields.title,serviceId:fields.serviceId}},
                        function(err, docs){
                            if(err) res.json(err);
                            else    {
                                artistsubCategory.updateMany({subServiceId:catId},{$set: {subServiceName:fields.title}},function(err, docs){ });
                                req.flash("success","");
                                req.flash("success","Sub service updated successfully");
                                res.redirect('/listSubCategory');
                            };
                    });
            } 

        });      

    });
}

exports.categoryDelete = function(req, res){

    subCategory.update({_id:cryptr.decrypt(req.params.categoryId)}, 
        {$set: {'deleteStatus':0}},
        function(err, docs){
            if(err) res.json(err);
            else    {
                artistsubCategory.updateMany({subServiceId:cryptr.decrypt(req.params.categoryId)},{$set: {'deleteStatus':0}},function(err, docs){ });
                artistService.updateMany({subserviceId:cryptr.decrypt(req.params.categoryId)},{$set: {'deleteStatus':0}},function(err, docs){ });
               req.flash('success', '');
               req.flash('success', 'Sub service deleted successfully');
                res.redirect('/listSubCategory');
            };
    });
  
   
}

exports.total_services = function(req, res) {

    res.render('admin/total_services.ejs', {
            error : req.flash("error"),
            success : req.flash("success"),
            session : req.session
    });
     
}


exports.total_services_list = function(req, res) {

    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var search = req.query.search; 

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
         { $lookup:
          {
            from: 'users',
            localField: 'artistId',
            foreignField: '_id',
            as: 'artistDetail'
          }
         
        },
        {
         $match: {
          'title': {$regex : search,'$options' : 'i'},
          'deleteStatus' : 1
         }
        }

      ]).exec(function(err, data) {

            if (err) throw err;

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

            
            res.render('admin/total_services_List.ejs', {
                error : req.flash("error"),
                success : req.flash("success"),
                session : req.session,
                categorydata: studentsList,
                pageSize: pageSize,
                totalStudents: totalStudents,
                pageCount: pageCount,
                currentPage: currentPage,
                cryptr : cryptr,
                lodash : lodash
        });

});


     
}