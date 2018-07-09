var Category            = require('../../models/admin/category_model');
var admin            = require('../../models/admin/login_model');
var subCategory            = require('../../models/admin/sub_category_model');
var numeral = require('numeral');
var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');
var User            = require('../../models/front/home');
var Cryptr = require('cryptr'),
 cryptr = new Cryptr('1234567890');
 var lodash = require('lodash');
var moment = require('moment-timezone');
var booking = require('../../models/front/booking.js');
var bookingService = require('../../models/front/bookingService.js');

exports.loggedIn = function(req, res, next)
{
	if (req.session.user) { // req.session.passport._id

		next();

	} else {

		res.redirect('/admin/login');

	}

}

exports.categoryCount = function(req, res, next) {
	categorydata = [];
   Category.find({'deleteStatus':'1'}, function(err, data) {

    	categoryCount = data.length;
    	categorydata = data;
    	next();
    });
 }

exports.subcategoryCount = function(req, res, next) {

   subCategory.find({'deleteStatus':'1'}, function(err, data) {

    	subcategoryCount = data.length;
    	next();
    });
 }   	

exports.userCount = function(req, res, next) {

     User.find({'userType':'user', 'isDocument':3 }).exec(function(err, data) {
           
     	userCount = data.length;
     	next();
    });

} 

exports.artistCount = function(req, res, next) {

     User.find({'userType':'artist', 'isDocument':3 }).exec(function(err, data) {
           
     	artistCount = data.length;
     	next();
    });

} 

exports.graphUsers = function(req, res, next) {
    uGRaph = [];
     User.find({'userType':'user', 'isDocument':3 }).exec(function(err, tdata) {

       User.find({'userType':'user', 'isDocument':3,'gender':'male' }).exec(function(err, mdata) {
       		User.find({'userType':'user', 'isDocument':3,'gender':'female' }).exec(function(err, fdata) {
       			uGRaph1 = {'state':'Today','male':datacount(mdata,'date'),'female':datacount(fdata,'date'),'tUser':datacount(tdata,'date')};
       			uGRaph2 = {'state':'Month','male':datacount(mdata,'month'),'female':datacount(fdata,'month'),'tUser':datacount(tdata,'month')};
       			uGRaph3 = {'state':'All','male':mdata.length,'female':fdata.length,'tUser':tdata.length};
       			uGRaph.push(uGRaph1);
       			uGRaph.push(uGRaph2);
       			uGRaph.push(uGRaph3);
	     		next();
	     	});
     	});
    });

}   

exports.graphartist = function(req, res, next) {

    sGRaph = [];
    User.find({'userType':'artist', 'isDocument':3 }).exec(function(err, tdata) {  	    	
    
       User.find({'userType':'artist', 'isDocument':3,'businessType':'independent' }).exec(function(err, mdata) {
       		User.find({'userType':'artist', 'isDocument':3,'businessType':'business' }).exec(function(err, fdata) {
       			uGRaph1 = {'state':'Today','Independent':datacount(mdata,'date'),'Business':datacount(fdata,'date'),'tservice':datacount(tdata,'date')};
       			uGRaph2 = {'state':'Month','Independent':datacount(mdata,'month'),'Business':datacount(fdata,'month'),'tservice':datacount(tdata,'month')};
       			uGRaph3 = {'state':'All','Independent':mdata.length,'Business':fdata.length,'tservice':tdata.length};
       			sGRaph.push(uGRaph1);
       			sGRaph.push(uGRaph2);
       			sGRaph.push(uGRaph3);
	     		next();
	     	});
     	});
    });

} 

exports.graphBooking = function(req, res, next) {

    bGRaph = [];
    booking.find({'bookStatus':{$nin: ['0','2']}}).exec(function(err, tdata) {  	

         totalOrder = 0;

        

         booking.find({'bookStatus':1 }).exec(function(err, mdata) {
         		booking.find({'bookStatus':3}).exec(function(err, fdata) {

                Total = (fdata.length*10)/100;
                totalOrder = Number(Total).toFixed(0);

         			uGRaph1 = {'state':'Today','Confirm':datacount(mdata,'date'),'Complete':datacount(fdata,'date'),'Total':datacount(tdata,'date')};
         			uGRaph2 = {'state':'Month','Confirm':datacount(mdata,'month'),'Complete':datacount(fdata,'month'),'Total':datacount(tdata,'month')};
         			uGRaph3 = {'state':'All','Confirm':mdata.length,'Complete':fdata.length,'Total':tdata.length};
         			bGRaph.push(uGRaph1);
         			bGRaph.push(uGRaph2);
         			bGRaph.push(uGRaph3);
  	     		next();
  	     	});
       	});
    });

} 

exports.bookedServices = function(req, res, next) {

	bchart = bookedServices = [];
    bookingService.find({'bookingStatus':'1'}).exec(function(err, tdata) {  
    	if(categorydata){
    		color = ["#90A4AE","#f83272","#00c0ef","#00a65a"];
    		s = 0;
    		for (var i = 0; i < categorydata.length; i++) {
    			var picked = lodash.filter(tdata, { 'serviceId': categorydata[i]._id } );
    			Total = picked.length*100/tdata.length;
     			uGRaph1 ={ label: categorydata[i].title ,  y: Number(Total).toFixed(2), legendText: categorydata[i].title, color:color[s]}
     			bchart.push(uGRaph1);

     			s++;
     			if(i==3){s=0;};
    		}
    	}
      if(tdata){
        bookedServices = tdata;
      }
    	next();	
	     
    }); 	
    

} 

function datacount(data,type){

	if(type=="date"){
		j= 0;
		for (var i = 0; i < data.length; i++) {

    		d = data[i];    		
    		date =  moment(d.crd).format("YYYY-MM-DD");
    		today =  moment().format("YYYY-MM-DD");
    		if(date==today){

    			j++;

    		}

    	}

    	return j;


    }else{

    	j= 0;
		for (var i = 0; i < data.length; i++) {

    		d = data[i];    		
    		date =  moment(d.crd).format("MM");
    		today =  moment().format("MM");
    		if(date==today){

    			j++;

    		}

    	}

    	return j;


    }


}



exports.home = function(req, res) {

// To decode (This produces an object)

	res.render('admin/home.ejs', {
		error : req.flash("error"),
		success: req.flash("success"),
		session:req.session,
		categoryCount : categoryCount,
		subcategoryCount : subcategoryCount,
		userCount : userCount,
		artistCount : artistCount,
		uGRaph :  JSON.stringify(uGRaph),
		sGRaph :  JSON.stringify(sGRaph),
		bGRaph :  JSON.stringify(bGRaph),
		bchart :  JSON.stringify(bchart)
	
	 });
	 
}


exports.profile = function(req, res) {

	data1 = req.session.user;
	admin.findOne({'_id':data1._id}).exec(function(err, data) {
          
     	res.render('admin/profile.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session,
			data : data	
		});

	});
	 
}


exports.signup = function(req, res) {

	if (req.session.user) {

		res.redirect('/adminDashboard');

	} else {

		res.render('admin/signup', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});
	}

}


exports.login = function(req, res) {


	
	if (req.session.user) {

		res.redirect('/adminDashboard');

	} else {

		res.render('admin/login', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});

	}
	
}



exports.logout = function(req, res) {

 	req.session.destroy();
    res.redirect('admin/login');
}


exports.admin_profile_update = function(req, res) {

	data1 = req.session.user;
    admin.update({_id:data1._id}, 
        {$set: {mail:req.body.email}},
        function(err, docs){
            if(err) res.json(err);
            else    {

                req.flash("success","Profile updated successfully");
                res.redirect('/adminProfile');
            };
    });
	 
}

exports.admin_changepassword = function(req, res) {
		
		data1 = req.session.user;
		admin.findOne({'_id':data1._id}).exec(function(err, data) {


			var oldpassword = req.body.oldpassword;
		    
		    if (!data.validPassword(oldpassword)){

	            res.json({'status':'0',"msg":"Old password not match"});
			    return;
	 		

	 		}else{  

	 			 var my = new admin();
	 			 var password =  my.generateHash(req.body.password);

			    admin.update({_id:data1._id}, 
			        {$set: {password:password}},
			        function(err, docs){
			            if(err) res.json(err);
			            else    {

			                res.json({'status':'1',"msg":"Password updated successfully"});
			                return;
			            };
			    });
			}
		});
	 
}

    
