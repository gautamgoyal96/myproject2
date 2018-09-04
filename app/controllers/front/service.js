var service = require('../../models/admin/category_model.js');
var subservices = require('../../models/admin/sub_category_model.js');
var artistService = require('../../models/front/artistService.js');
var User            = require('../../models/front/home.js');
var Cryptr = require('cryptr'),
 cryptr = new Cryptr('1234567890');


exports.servicesdata = function(req, res, next){

	var query = artistService.aggregate([

	 			
	            {
	                $match: {
	                    'artistId': Number(user._id),
	                    'status': 1,
	                    'deleteStatus': 1,
	                }
	            },
	            {
	                "$lookup": {
	                    "from": "artistsubsrervices",
	                    "localField": "subserviceId",
	                    "foreignField": "subServiceId",
	                    "as": "subService"
	                }
	            },

	            {
	                "$project": {
	                    "_id": 1,
	                    "title": 1,
	                    "description": 1,
	                    "inCallPrice": 1,
	                    "outCallPrice": 1,
	                    "completionTime": 1,
	                    "serviceId": 1,
	                    "subserviceId": 1,
	                    "subServiceName": { "$arrayElemAt": [ "$subService.subServiceName",0] }
	                }
	            }	            

	        ]);
        query.exec(function(err, data) {

            servicesdata = data;

    		next();

        });

}
exports.serviceManagement = function(req, res) {


	res.render('front/my_services.ejs',{
		session : req.session,
		cryptr : cryptr
	});
	 
}

