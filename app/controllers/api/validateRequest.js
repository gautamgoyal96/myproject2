var User = require('../../models/front/home.js');
var formidable = require('formidable');
exports.checkaccessToken = function(req, res, next){
    //  console.log(JSON.stringify(req.headers));
         
        var token = req.headers['authtoken'];
         //console.log(token);
      if (token) { 
            User.findOne({authToken:token}, function(err, userData) {
             if(userData==null){
              res.status(401);
              res.json({status:'fail',message:'Invalid Auth Token',"authtoken":""});
              
            }else{ //console.log(userData);

              if(userData.status=='1'){
                authData = userData;
                next();
              }else{
                res.status(301);
                res.json({status:'fail',message:'Your account has been inactivated by admin, please contact to activate',"authtoken":""});
              }
             
            }

        });

      } else {
            res.status(401);
             res.json({status:'fail',message:'Invalid Auth Token',"authtoken":""});
      }

}

exports.nextData = function(req, res, next){
    //  console.log(JSON.stringify(req.headers));
         
        var token = req.headers['authtoken'];
        // console.log(token);
      if (token) { 
            User.findOne({authToken:token}, function(err, userData) {
             if(userData==null){
              res.status(300);
              res.json({message:'Invalid Auth Token',"authtoken":""});
              
            }else{ //console.log(userData);
              authData = userData;
              next();
             
            }

        });

      } else {
            res.status(300);
            res.json({message:'Invalid Auth Token ',"authtoken":""});
      }

}
