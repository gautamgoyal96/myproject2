var User            = require('../../models/front/home.js');
var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');
var accountSid = 'ACaffcfdead968e5413e801e5e0ebee02c';
var authToken = "b6decf9d17f523d047e5b75064b788e0";
var client = require('twilio')(accountSid, authToken);
var formidable = require('formidable');
var path = require('path');
var multer = require('multer');
var fs = require('fs');

/*var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, './public/uploads/profile/')
  },
  filename: function(req, file, callback) {
    var image = Date.now() + path.extname(file.originalname);
             console.log(image);
    callback(null, image)
  }
})

var upload = multer({ storage: storage });

exports.imageUpload = function(req,res){

         var upload = multer({
        storage: storage
      }).single('userFile');

      upload(req, res, function(err) {
        res.end('File is uploaded');
      });

}*/

exports.register12 = function(req,res){

     var form = new formidable.IncomingForm();
      form.parse(req, function (err, fields, files) {
        if(files.profileImage){

              var oldpath = files.profileImage.path;
              var imageName = Date.now()+".jpg";
              var newpath = './public/uploads/profile/'+imageName;
              fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;

              });
        
        }  

        console.log(imageName);
        console.log(fields);      
   });

}





exports.verification = function(req, res,next){

   var contactNo = req.body.contactNo; 
   var countryCode = req.body.countryCode; 
   var email = req.body.email;  
   var socialId = req.body.socialId; 
   data = req.body; 

/*     User.find({})
    .or([
        { email: new RegExp(email ? email : '', 'i') },
        { contactNo: new RegExp(contactNo ? contactNo : '', 'i')}
    ])
    .exec(function (err, estates) {
        if (estates)
          console.log(estates);
            return res.send(estates);
        res.status(500).send({ error: err.message });
    });*/
          

     if (contactNo && email) {


            
            User.findOne({
              $or:([{ email: new RegExp(email ? email : '', 'i') },{ contactNo: new RegExp(contactNo ? contactNo : '', 'i')}
              ]) }, function(err, user) {
               if(user){


                 if(user.email==email){

                    res.json({status:'error',message:"Email is already registered"});
                    return;

                 }else if(user.contactNo==contactNo){

                    res.json({status:'error',message:"Contact number already exist"});
                    return;
                    
                 }else{
                 
                   next();
                }

               }else{

               next();

              }

            });


      }else if (contactNo) {

            User.findOne({'contactNo' : contactNo}, function(err, user) {
              
               if(user){

                  res.json({status:'error',message:"Contact number already exist"});
                  return;

               }
               next();

            });


      } else if(email){

          User.findOne({'email' : email}, function(err, user) {
            
              if(user){

                res.json({status:'error',message:"Email already exist"});
                return;

              }

              next();

          });
                
      } 
    
}

exports.sendSms = function(req, res){

var OTP = Math.floor(1000 + Math.random() * 9000);
var contactNo = data.countryCode+data.contactNo;

    client.messages.create({
        to: contactNo,
        from: "+14159972821",
        body: "Mulab otp is: "+OTP, 
        }, function(err, call) {

          
          if(err){

             res.json({status:'error',message:err.message});
             return;

          }else{

            res.json({status:'sucess',message:'Verification code has been sent successfully',otp:OTP});
            return;
          }

    });

}


exports.register = function(req, res) {

       var form = new formidable.IncomingForm();
      form.parse(req, function (err, fields, files) {
        var imageName = "";
        if(files.profileImage){

            var oldpath = files.profileImage.path;
            var imageName = Date.now()+".jpg";
            var newpath = './public/uploads/profile/'+imageName;
            fs.rename(oldpath, newpath, function (err) {
              if (err) throw err;
            });

        }

       if(fields.userName && fields.socialId==0){ 

             User.findOne({ 'userName' :  fields.userName }, function(err, user) {

               if (err) throw err;
            
                if (user) {
                  
                  return res.json({status:"sucess",message:'User name already register'});  

                }

            });

      }   
                  
                  
               User.find().sort([['_id', 'descending']]).limit(1).exec(function(err, userdata) {  

                 
                    // if there is no user with that email
                    // create the user

                    // set the user's local credentials
                    
                  var day =dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss");
                 
                  var active_code=bcrypt.hashSync(Math.floor((Math.random() * 99999999) *54), null, null);
                  var newUser            = new User({fullName:fields.fullName,email:fields.email,userName:fields.userName,created_date:day,updated_date:day,status:1,gender:fields.gender,address:fields.address,countryCode:fields.countryCode,contactNo:fields.contactNo,dob:fields.dob, deviceToken:fields.deviceToken,deviceType: fields.deviceType,socialId:fields.socialId,socialType:fields.socialType,latitude:fields.latitude,longitude:fields.longitude,chatId:fields.chatId,firebaseToken:fields.firebaseToken,profileImage:imageName});

                  newUser.password = newUser.generateHash(fields.password);
                  newUser.authtoken = newUser.authtoken();

                        if(userdata.length > 0){
                            newUser._id = userdata[0]._id+1;
                        }
                        

                    console.log(newUser);
                    // save the user
                    newUser.save(function(err) {
                        if (err){

                            res.json({status:"sucess",message:'User could not be registered. PLease send all the required info and  try again'});
                            return;

                        }else{
                          if(newUser.profileImage)
                            newUser.profileImage = "./public/uploads/profile/"+newUser.profileImage;

                         res.json({status:"sucess",message:'Registration successfully, Verification code has been sent',users:newUser});
                         return;
                       }
                    
                    });
                    
                  });

       
                
   });

}

exports.userLogin = function(req, res){


    var email = req.body.email;
    var password = req.body.password;
    var deviceToken = req.body.deviceToken;
    var deviceType = req.body.deviceType;
    var firebaseToken = req.body.firebaseToken;

    User.findOne({ 'email' :  email }, function(err, user) {
          // if there are any errors, return the error before anything else
          
          if (err){

            res.status(500);
            res.json({status:"fail",message:err});
            return;

          }else if (!user){

              res.json({status:"error",message:'Sorry Your Account Not Exits ,Please Create Account.'});
              return;

          }else if (!user.validPassword(password)){

              res.json({status:"error",message:'Username and Password Does Not Match.'});
              return;

          }else if(user.status === '0'){

            res.json({status:"error",message:'Your Account Not Activated ,Please Check Your Email'});
            return;

          }else{

            User.update({_id:user._id}, 
            {$set: {authtoken:user.authtoken(),deviceType:deviceType,deviceToken:deviceToken,firebaseToken:firebaseToken}},
            function(err, docs){
                if(err) res.json(err);

                if(newUser.profileImage)
                  user.profileImage = "C:/Users/abc/Desktop/mulab/uploads/"+user.profileImage;

                 res.json({status:"sucess",message:'User authentication successfully done!',users:user});
                return;
            });           

          }  

      });



}



    
