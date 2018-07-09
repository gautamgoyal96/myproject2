var User            = require('../../models/front/home.js');
var Category            = require('../../models/admin/category_model');

exports.userInfo = function(req, res) {

  res.json({message:'ok ',"user":authData});

}


exports.categoryList = function(req, res) {

    Category.find({ 'status' :  1 },null,{sort:{'_id':'desc'}}, function(err, data) {

              if (data.length==0){

              res.json({status:"sucess",message:'No record found'});

          }else{

          res.json({status:"sucess",message:'ok',data:data});
      }
                

    });


}



    
