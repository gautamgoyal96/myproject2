var User            = require('../../models/front/home.js');
exports.checkaccessToken = function(req, res, next)
{

        var token = req.headers['authtoken'];
     
      if (token) { 

           User.findOne({authToken:token}, function(err, userData) {

           

            if(userData==null){

              res.status(300);
              res.json({message:'Invalid Auth Token ',"authtoken":""});
              
            }else{
              authData = userData;
              next();
             
            }

        });

      } else {

        res.status(300);
        res.json({message:'Invalid Auth Token ',"authtoken":""});

      }

}