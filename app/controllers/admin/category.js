var Category            = require('../../models/admin/category_model');
var subCategory            = require('../../models/admin/sub_category_model.js');
var artistCategory            = require('../../models/front/artistMainService');
var artistsubCategory            = require('../../models/front/artistSubService');
var artistService                   = require('../../models/front/artistService.js');

var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');
var url = require('url');
var Cryptr = require('cryptr'),
 cryptr = new Cryptr('1234567890');
exports.loggedIn = function(req, res, next)
{
	if (req.session.user) { // req.session.passport._id

		next();

	} else {

		res.redirect('/admin/login');

	}

}

exports.addCategory = function(req, res) {
	
	res.render('admin/addCategory.ejs', {
		error : req.flash("error"),
		success: req.flash("success"),
		session:req.session,
	
	 });
	 
}

exports.insertCategory = function(req, res) {
	
	 Category.findOne({title:{'$regex' : req.body.title, '$options' : 'i'},'deleteStatus':'1'}, function(err, category) {
        
        if(err){
            res.redirect('/addCategory/');
            req.flash('error', err);
        }
        
        if(category){
            req.flash('error', '');
            req.flash('error', 'Service already exist');
            res.redirect('/addCategory');
        } else {
            
            var title = req.body.title;
            
            Category.find().sort([['_id', 'descending']]).limit(1).exec(function(err, categorydata){
                
                // if there is no user with that email
                // create the user
                var newUser = new Category();

                // set the user's local credentials                
                var day = dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss");
           	 
                var active_code=bcrypt.hashSync(Math.floor((Math.random() * 99999999) *54), null, null);
           	
                newUser.title    = title;
                newUser.created_date = day;
                newUser.updated_date = day;
                newUser.status = '1'; //inactive for email actiavators
                newUser.active_hash = active_code;
                
                if(categorydata.length > 0){
                    newUser._id = categorydata[0]._id + 1;
                } 


                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    req.flash('success', ''); 
                    req.flash('success', 'Service  Added Successfully'); 
                    res.redirect('/listCategory');
                });
                
            });
        }
          
    });
}

exports.listCategory = function(req, res) {

	res.render('admin/categoryList.ejs', {
            error : req.flash("error"),
            success : req.flash("success"),
            session : req.session
    });
	 
}


exports.categoryList = function(req, res) {

    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var search = req.query.search; 

    Category.find({'title' : { $regex : search,'$options' : 'i' },'deleteStatus':'1'}, function(err, data) {
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

            
            res.render('admin/category_list.ejs', {
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
    
    Category.findOne({_id:cryptr.decrypt(req.params.categoryId)}, function(err, categorydata) {
        res.render('admin/edit_category.ejs', {
            error : req.flash("error"),
            success : req.flash("success"),
            session : req.session,
            categorydata : categorydata,
         });
    });
   
}

exports.updateCategory = function(req, res){


    var catId = req.body.categoryid;
    Category.findOne({title:{'$regex' : req.body.title, '$options' : 'i'},_id: {'$ne':catId},'deleteStatus':'1'}, function(err, category) {
        
       
        if(category){

            req.flash('error', '');
            req.flash('error', 'Service already exist');
            res.redirect('/categoryEdit/'+catId);

        } else {

            Category.update({_id:catId}, 
                {$set: {title:req.body.title}},
                function(err, docs){
                    if(err) res.json(err);
                    else    {

                       artistCategory.updateMany({serviceId:catId},{$set: {serviceName:req.body.title}},function(err, docs){ });
                        req.flash("success","Service updated successfully");
                        res.redirect('/listCategory');
                    };
            });
        }
     
    });        


}


exports.categoryStatus = function(req, res){

	Category.update({_id:cryptr.decrypt(req.params.categoryId)}, 
        {$set: {status:cryptr.decrypt(req.params.status)}},
        function(err, docs){
            if(err) res.json(err);
            else    {
                subCategory.updateMany({serviceId:cryptr.decrypt(req.params.categoryId)},{$set: {'deleteStatus':cryptr.decrypt(req.params.status)}},function(err, docs){ });
                artistCategory.updateMany({serviceId:cryptr.decrypt(req.params.categoryId)},{$set: {'deleteStatus':cryptr.decrypt(req.params.status)}},function(err, docs){ });
                artistsubCategory.updateMany({serviceId:cryptr.decrypt(req.params.categoryId)},{$set: {'deleteStatus':cryptr.decrypt(req.params.status)}},function(err, docs){ });
                artistService.updateMany({serviceId:cryptr.decrypt(req.params.categoryId)},{$set: {'deleteStatus':cryptr.decrypt(req.params.status)}},function(err, docs){ });
                req.flash("success","");
                if(cryptr.decrypt(req.params.status)=="1"){

                    req.flash("success","Service active successfully");

                }else{

                   req.flash("success","Service inactive successfully"); 
                }
                res.redirect('/listCategory');
            };
    });


}

exports.categoryDelete = function(req, res){



    Category.update({_id:cryptr.decrypt(req.params.categoryId)}, 
        {$set: {'deleteStatus':0}},
        function(err, docs){
            if(err) res.json(err);
            else    {

                subCategory.updateMany({serviceId:cryptr.decrypt(req.params.categoryId)},{$set: {'deleteStatus':0}},function(err, docs){ });
                artistCategory.updateMany({serviceId:cryptr.decrypt(req.params.categoryId)},{$set: {'deleteStatus':0}},function(err, docs){ });
                artistsubCategory.updateMany({serviceId:cryptr.decrypt(req.params.categoryId)},{$set: {'deleteStatus':0}},function(err, docs){ });
                artistService.updateMany({serviceId:cryptr.decrypt(req.params.categoryId)},{$set: {'deleteStatus':0}},function(err, docs){ });
                req.flash("success","");
                req.flash("success","Service deleted successfully");
                res.redirect('/listCategory');
            };
    });

   
   
}