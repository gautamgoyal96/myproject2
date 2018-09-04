var User            = require('../../models/front/home.js');
var fs = require('fs');

exports.explore = function(req, res) {

	res.render('front/explore.ejs',{
		session : req.session
	});
	 
}
