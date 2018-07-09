var feeds = require('../../models/front/feed.js');
var likes = require('../../models/front/like.js');
var comment = require('../../models/front/comment.js');

var Cryptr = require('cryptr'),
 cryptr = new Cryptr('1234567890');
var url  = require('url');
var lodash = require('lodash');

exports.isLikeCheck = function(req, res, next) {

	if(req.session.fUser){

		likes.find({likeById:req.session.fUser._id,'type':'feed'} ,function(err,ldata){

			likeCheck = ldata;
			next();

		});

	}else{

		likeCheck = [];
		next();
	}


}

exports.feedData = function(req, res, next) {

	page = req.query.page;
	
	feedSearch = {};
   	feedSearch['userId'] = user._id;
   	limit = 2;
   	if(req.query.type){
   		
   		feedSearch['feedType'] = req.query.type;
   		limit = 10;
	
	}
	page = page*limit;
	   feeds.aggregate([
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
		  { $skip:page },
		  { $limit:limit },

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
		            "userInfo._id":1,
		            "userInfo.userName":1,
		            "userInfo.firstName":1,
		            "userInfo.lastName":1,
		            "userInfo.profileImage":1
		            

		        } 
		   }

	],function(err, data){


			if(data){

				data.forEach(function(rs) {

					var picked = lodash.filter(likeCheck, { 'feedId':rs._id} );
	        		if(picked.length){

	        			rs.isLike = true;	
	        		}else{

	        			rs.isLike = false;
	        		}
					userData = rs.userInfo[0];

		            if(userData.profileImage){ 

		            	var result = url.parse(userData.profileImage, true);
						if(result.slashes==true){

							rs.userInfo[0].profileImage = userData.profileImage;

						}else{

							rs.userInfo[0].profileImage = '/uploads/profile/'+userData.profileImage;
						}


		            }else{

			          		rs.userInfo[0].profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

			        }

		    	});
			}	
	   
	    feedData = data; 
	    page = req.query.page; 
	    type = (req.query.type) ? req.query.type : ''; 
	    next();
	   });

}
	 

exports.feed = function(req, res) {

/*console.log(feedData);
*/	//console.log(cryptr.encrypt(18));

	res.render('front/feed.ejs',{
		session : req.session,
		cryptr : cryptr
	});
	 
}


exports.feed_image_List = function(req, res) {


	//console.log(cryptr.encrypt(18));

	res.render('front/feed_image.ejs',{
		session : req.session,
		cryptr : cryptr
	});
	 
}



