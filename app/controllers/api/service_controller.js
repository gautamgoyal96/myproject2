var User = require('../../models/front/home.js');//it user for table and coulamn information
var formidable = require('formidable');
var fs = require('fs');
var dateFormat = require('dateformat');
var bodyParser = require('body-parser')
var bcrypt = require('bcrypt-nodejs');
var accountSid = 'ACaffcfdead968e5413e801e5e0ebee02c';
var authToken = "b6decf9d17f523d047e5b75064b788e0";
var client = require('twilio')(accountSid, authToken);
var nodemailer = require("nodemailer");
var ejs = require("ejs");
var validUrl = require('valid-url');
/*this api use for email and mobile  number verification */

exports.phonVerification = function(req, res) {


    /*var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {*/
  var fields = req.body;
        
        var OTP = Math.floor(1000 + Math.random() * 9000);
        var contactNo = fields.countryCode + fields.contactNo;
        var select = {
            "_id": 1,
            "contactNo": 1,
            "email": 1
        };
        if (fields.contactNo == '') {
            res.json({
                status: "fail",
                message: 'Contact number is required'
            });
            return;

        }
        if (fields.socialId) {
            console.log('social');
            var where = {
                "contactNo": fields.contactNo
            };
        } else {

            if (fields.email && fields.contactNo) {
                var where = {
                    "$or": [{
                        "contactNo": fields.contactNo
                    }, {
                        "email": fields.email.toLowerCase()
                    }]
                };
            } else if (fields.email) {
                var where = {
                    "email": fields.email.toLowerCase()
                };
            } else if (fields.contactNo) {
                var where = {
                    "contactNo": fields.contactNo
                };
            }
        }
        User.findOne(where, select, function(err, data) {
            if (data && data.contactNo == fields.contactNo) {
                res.json({
                    status: "fail",
                    message: 'Contact number already exist'
                });
            } else if (data && data.email == fields.email.toLowerCase()) {
                res.json({
                    status: "fail",
                    message: 'Email already exist'
                });

            } else {
                client.messages.create({
                    to: contactNo,
                    from: "+14159972821",
                    body: "Welcome to Mualab, your phone number verification code is: " + OTP,
                }, function(err, call) {
                    if (err) {
                        res.json({
                            status: 'fail',
                            message: err.message
                        });
                        return;
                    } else {
                        res.json({
                            status: 'success',
                            message: 'Verification code has been sent successfully',
                            otp: OTP
                        });
                        return;
                    }
                });
            }
        });
    /*});*/

}
/*this api is use for user registation (normal and social) both side */
exports.userRegistration = function(req, res){
    var baseUrl =  req.protocol + '://'+req.headers['host'];
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
            var baseUrl =  req.protocol + '://'+req.headers['host'];
            var imageName = "";
            if(fields.contactNo){
                var otpStatus = "checked";
            }else{
                var otpStatus = "unChecked";
            }
        if(fields.userName && fields.socialId == ""){

            User.findOne({
                'userName': fields.userName
            }, function(err, user) {
                if (err) throw err;
                if (user) {
                    return res.json({
                        status: "fail",
                        message: 'User name already registered'
                    });
                }
                if (files.profileImage) {
                    var oldpath = files.profileImage.path;
                    var imageName = Date.now() + ".jpg";
                    var newpath = './public/uploads/profile/' + imageName;
                    fs.rename(oldpath, newpath, function(err) {
                        if (err) throw err;
                    });
                }
                
                User.find().sort([
                    ['_id', 'descending']
                ]).limit(1).exec(function(err, userdata) {

                     if(!fields.latitude){
                      fields.latitude=0.0;
                      fields.longitude=0.0;
                    }
                    var newUser = new User({
                        userName: fields.userName,
                        firstName: fields.firstName,
                        lastName: fields.lastName,
                        email: fields.email.toLowerCase(),
                        countryCode: fields.countryCode,
                        contactNo: fields.contactNo,
                        profileImage: imageName,
                        gender: fields.gender,
                        dob: fields.dob,
                        address: fields.address,
                        address2: fields.address2,
                        city: fields.city,
                        state: fields.state,
                        country: fields.country,
                        latitude: fields.latitude,
                        longitude: fields.longitude,
                        userType: fields.userType,
                        socialId: fields.socialId,
                        socialType: fields.socialType,
                        deviceType: fields.deviceType,
                        deviceToken: fields.deviceToken,
                        chatId: fields.chatId,
                        firebaseToken: fields.firebaseToken,
                        OTP: otpStatus,
                        otpVerified: 1,
                        location: [fields.latitude,fields.longitude]
                        
                    });
                    newUser.password = newUser.generateHash(fields.password);
                    newUser.authToken = newUser.authtoken();
                    
                    if (userdata.length > 0) {
                        newUser._id = userdata[0]._id + 1;
                    }
                  // save the user
                   newUser.save(function(err) {
                        if (err) {
                            res.json({
                                status: "fail",
                                message: err
                            });
                            return;
                        } else {
                            if (newUser.profileImage)
                                newUser.profileImage = baseUrl+"/uploads/profile/" + newUser.profileImage;
                            res.json({
                                status: "success",
                                message: 'Registration successfully',
                                users: newUser
                            });
                            return;
                        }

                    });

                });

            });

        }else{
            var imageName = fields.profileImage;
            User.findOne({
                'socialId': fields.socialId
            },function(err, user){
                if (err) throw err;
                if (user) {
                    User.update({
                            _id: user._id
                        }, {
                            $set: {
                                authtoken: user.authtoken(),
                                deviceType: fields.deviceType,
                                deviceToken: fields.deviceToken,
                                firebaseToken: fields.firebaseToken
                            }
                        },
                        function(err, docs) {
                            if (err) res.json(err);

                            res.json({
                                status: "success",
                                message: 'User authentication successfully done!',
                                users: user
                            });
                            return;
                        });

                }else{
                       if(!fields.latitude){
                      fields.latitude=0.0;
                      fields.longitude=0.0;
                    }
                    User.find().sort([
                        ['_id', 'descending']
                    ]).limit(1).exec(function(err, userdata) {
                      
                        var newUser = new User({
                            userName: fields.userName,
                            firstName: fields.firstName,
                            lastName: fields.lastName,
                            email: fields.email.toLowerCase(),
                            countryCode: fields.countryCode,
                            contactNo: fields.contactNo,
                            profileImage: imageName,
                            gender: fields.gender,
                            dob: fields.dob,
                            address: fields.address,
                            address2: fields.address2,
                            city: fields.city,
                            state: fields.state,
                            country: fields.country,
                            latitude: fields.latitude,
                            longitude: fields.longitude,
                            userType: fields.userType,
                            socialId: fields.socialId,
                            socialType: fields.socialType,
                            deviceType: fields.deviceType,
                            deviceToken: fields.deviceToken,
                            chatId: fields.chatId,
                            firebaseToken: fields.firebaseToken,
                            OTP: otpStatus,
                            otpVerified: 1,
                            location: [fields.latitude,fields.longitude]
                        });
                        newUser.password = newUser.generateHash(fields.password);
                        newUser.authToken = newUser.authtoken();

                        if (userdata.length > 0) {
                            newUser._id = userdata[0]._id + 1;
                        }
                        // save the user
                        newUser.save(function(err) {
                            if (err) {
                                res.json({
                                    status: "fail",
                                    message:err 
                                });
                                return;
                            } else {

                                res.json({
                                    status: "success",
                                    message: 'Registration successfully',
                                    users: newUser
                                });
                                return;
                            }

                        });

                    });

                }

            });
        }
    });
}
/*exports.userRegistration = function(req, res,next){

    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
        console.log(fields);
        if(fields.userName && fields.socialId == ""){

            User.findOne({
                'userName': fields.userName
            }, function(err, user) {
                if (err) throw err;
                if (user) {
                    return res.json({
                        status: "fail",
                        message: 'User name already registered'
                    });
                }
               
                 next();

            });

        }else{
            var imageName = fields.profileImage;
            User.findOne({
                'socialId': fields.socialId
            },function(err, user){
                if (err) throw err;
                if (user) {
                    User.update({
                            _id: user._id
                        }, {
                            $set: {
                                authtoken: user.authtoken(),
                                deviceType: fields.deviceType,
                                deviceToken: fields.deviceToken,
                                firebaseToken: fields.firebaseToken
                            }
                        },
                        function(err, docs) {
                            if (err) res.json(err);

                            res.json({
                                status: "success",
                                message: 'User authentication successfully done!',
                                users: user
                            });
                            return;
                        });

                }else{

                      next();

                }

            });
        }
    });
}*/
exports.registation = function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {

         var imageName = "";
        if(fields.contactNo){
            var otpStatus = "checked";
        }else{
            var otpStatus = "unChecked";
        }
        if (files.profileImage1) {
            var oldpath = files.profileImage.path;
            var imageName = Date.now() + ".jpg";
            var newpath = './public/uploads/profile/' + imageName;
            fs.rename(oldpath, newpath, function(err) {
                if (err) throw err;
            });
        }else{
            var imageName = fields.profileImage;
        }

        User.find().sort([
            ['_id', 'descending']
        ]).limit(1).exec(function(err, userdata) {

            var newUser = new User({
                userName: fields.userName,
                firstName: fields.firstName,
                lastName: fields.lastName,
                email: fields.email,
                countryCode: fields.countryCode,
                contactNo: fields.contactNo,
                profileImage: imageName,
                gender: fields.gender,
                dob: fields.dob,
                address: fields.address,
                city: fields.city,
                state: fields.state,
                country: fields.country,
                latitude: fields.latitude,
                longitude: fields.longitude,
                userType: fields.userType,
                socialId: fields.socialId,
                socialType: fields.socialType,
                deviceType: fields.deviceType,
                deviceToken: fields.deviceToken,
                chatId: fields.chatId,
                firebaseToken: fields.firebaseToken,
                OTP: fields.otp,
                otpVerified: otpStatus,
                location: [fields.latitude, fields.longitude]
            });
            newUser.password = newUser.generateHash(fields.password);
            newUser.authToken = newUser.authtoken();

            if (userdata.length > 0) {
                newUser._id = userdata[0]._id + 1;
            }
            // save the user
            newUser.save(function(err) {
                if (err) {
                    res.json({
                        status: "success",
                        message: 'User could not be registered. PLease send all the required info and  try again'
                    });
                    return;
                } else {
                        if (!validUrl.isUri(newUser.profileImage)){
                                 newUser.profileImage = "/uploads/profile/" + newUser.profileImage;
                        } 
                    res.json({
                        status: "success",
                        message: 'Registration successfully',
                        users: newUser
                    });
                    return;
                }

            });

        });
    });

}
/*this api is use for artist registation (normal and social) both side */
exports.artistRegistration = function(req, res) {
    var baseUrl = req.protocol + '://' + req.headers['host'];
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        var imageName = "";
        if (fields.contactNo) {
            var otpStatus = "checked";
        } else {
            var otpStatus = "unChecked";
        }
        User.findOne({
            'userName': fields.userName
        }, function(err, user) {
            if (err) throw err;
            if (user) {
                return res.json({
                    status: "fail",
                    message: 'User name already registered'
                });
            }
            if (files.profileImage) {
                var oldpath = files.profileImage.path;
                var imageName = Date.now() + ".jpg";
                var newpath = './public/uploads/profile/' + imageName;
                fs.rename(oldpath, newpath, function(err) {
                    if (err) throw err;
                });
            } 
            User.find().sort([
                ['_id', 'descending']
            ]).limit(1).exec(function(err, userdata) {


                var newUser = new User({
                    userName: fields.userName,
                    firstName: fields.firstName,
                    lastName: fields.lastName,
                    email: fields.email.toLowerCase(),
                    countryCode: fields.countryCode,
                    contactNo: fields.contactNo,
                    profileImage: imageName,
                    businessPostCode: fields.businessPostCode,
                    buildingNumber: fields.buildingNumber,
                    postCodeNumber: fields.postCodeNumber,
                    businessName: fields.businessName,
                    gender: fields.gender,
                    dob: fields.dob,
                    address: fields.address,
                    address2: fields.address2,
                    city: fields.city,
                    state: fields.state,
                    country: fields.country,
                    latitude: fields.latitude,
                    longitude: fields.longitude,
                    userType: fields.userType,
                    businessType: fields.businessType,
                    socialId: fields.socialId,
                    socialType: fields.socialType,
                    deviceType: fields.deviceType,
                    deviceToken: fields.deviceToken,
                    isDocument: 0,
                    chatId: fields.chatId,
                    firebaseToken: fields.firebaseToken,
                    OTP: otpStatus,
                    otpVerified: 1,
                    location: [fields.latitude, fields.longitude]

                });
                newUser.password = newUser.generateHash(fields.password);
                newUser.authToken = newUser.authtoken();

                if (userdata.length > 0) {
                    newUser._id = userdata[0]._id + 1;
                }
                // save the user
                newUser.save(function(err) {
                    if (err) {
                        res.json({
                            status: "fail",
                            message: 'User could not be registered. PLease send all the required info and  try again'
                        });
                        return;
                    } else {
                        if (newUser.profileImage)
                            newUser.profileImage = baseUrl+"/uploads/profile/" + newUser.profileImage;
                        res.json({
                            status: "success",
                            message: 'Registration successfully',
                            users: newUser
                        });
                        return;
                    }

                });

            });

        });


    });
}
exports.userLogin = function(req, res) {
    var baseUrl =  req.protocol + '://'+req.headers['host'];
    var fields = req.body;  
    var userName = fields.userName;
    var password = fields.password;
    var deviceToken = fields.deviceToken;
    var deviceType = fields.deviceType;
    var firebaseToken = fields.firebaseToken;
    var typ = fields.userType;

    if (userName == '') {
        res.json({
            status: "fail",
            message: 'Email or username is required'
        });
        return;

    } else if (password == '') {
        res.json({
            status: "fail",
            message: 'Password is required'
        });
        return;

    }

    User.findOne({ 'userType': String(fields.userType),
        $or: [{
            'email': fields.userName.toLowerCase()
        }, {
            'userName': fields.userName
        }]
    }, function(err, user) {
        if (err) {
            res.status(500);
            res.json({
                status: "fail",
                message: err
            });
            return;

        } else if (!user) {
            res.json({
                status: "fail",
                message: 'Please enter valid username or email.'
            });
            return;
        } else if (!user.validPassword(password)) {

            res.json({
                status: "fail",
                message: 'Please enter valid password.'
            });
            return;

        } else if (user.status === '0') {

            res.json({
                status: "fail",
                message: 'Your account has been inactivated by admin, please contact to activate.'
            });
            return;

        } else {
            var test = user.authtoken();
             // User.updateMany({'_id':{$ne :user._id},'firebaseToken':user.firebaseToken,'userType':typ},{$set:{'firebaseToken':''}}, function(err, result){});
            User.update({
                    _id: user._id
                }, {
                    $set: {
                        authToken: test,
                        deviceType: deviceType,
                        deviceToken: deviceToken,
                        firebaseToken: firebaseToken
                    }
                },
                function(err, docs) {
                    if (err) res.json(err);
                    user.authToken = test;
                    user.deviceType=deviceType;
                    user.deviceToken=deviceToken;
                    user.firebaseToken=firebaseToken; 
                    if (user.profileImage)
                        user.profileImage = baseUrl+"/uploads/profile/"+user.profileImage;

                    res.json({
                        status: "success",
                        message: 'User authentication successfully done!',
                        users: user
                    });
                    return;
                });
        }

    });
    

}
exports.forgotPassword = function(req, res,next) {

    if(req.body.email==" "){
        res.json({
            status:"fail",
            message:"Email is required"
        });
        return;
    }else{  
          next();
                     
    }
}
exports.sendMail = function(req, res) {

    if (req.body.email == '') {
        res.json({
            status: "fail",
            message: "Email is required"
        });
        return;

    } else {
        User.findOne({
            'email': req.body.email.toLowerCase()

        }, function(err, user) {
            if (err) {
                res.status(500);
                res.json({
                    status: "fail",
                    message: err
                });
                return;

            } else if (!user) {
                res.json({
                    status: "error",
                    message: 'Email does not exist.'
                });
                return;
            } else if (user.status === '0') {
                res.json({
                    status: "error",
                    message: 'Your Account Not Activated'
                });
                return;

            } else {
                var messagePass = Math.floor((Math.random() * 99999999) + 1);
                var newUser = new User({});
                newPass = newUser.generateHash(messagePass);
                var template = process.cwd() + '/app/templates/resetPassword.ejs';
                var templateData = {
                    Paaword: messagePass
                };
                ejs.renderFile(template, templateData, 'utf8', function(err, file) {
                    if (err) {
                        res.json({
                            'status': "fail",
                            "message": err
                        });
                    } else {

                        var smtpTransport = nodemailer.createTransport({
                            host: 'smtp.gmail.com',
                            port: 465,
                            secure: true,
                            service: "Gmail",
                            secureConnection: true,
                            auth: {
                                user: "sunil.mindiii@gmail.com",
                                pass: "sunil123456"
                            }
                        });
                        var mailOptions = {
                            to: req.body.email,
                            subject: 'Forgot password',
                            html: file
                        }

                        smtpTransport.sendMail(mailOptions, function(error, response) {
                            if (error) {
                                res.json({
                                    'status': "fail",
                                    "message": error
                                });
                            } else {
                                User.update({
                                    '_id': user._id
                                }, {
                                    $set: {
                                        password: newPass
                                    }
                                }, function(err, docs) {
                                    if (err) res.json(err);
                                    if (docs.ok == 1) {
                                        res.json({
                                            'status': "success",
                                            "message": 'Password has been sent to your email'
                                        });
                                    }

                                });

                            }
                        });
                    }
                });

            }

        });

    }

}
exports.checkUser = function(req,res){
   if(req.body.userName){
    User.findOne({
        'userName': req.body.userName
    }, function(err, user) {
        if (err) throw err;
        if (user) {
            return res.json({
                status: "fail",
                message: 'User name already registered'
            });
        }else{
             return res.json({
                status: "success",
                message: 'Not exist.'
            });

        }
    });

   }else{
    return res.json({
                status: "fail",
                message: 'Username is required.'
            });
   }
}
exports.test = function(req, res) {
/*var Cryptr = require('cryptr'),
    cryptr = new Cryptr('myTotalySecretKey');
    var newPass =   Math.floor((Math.random() * 9999) + 1);
    console.log(newPass);
   res.json({status: "success",message:newPass});
                        return;
var encryptedString = cryptr.encrypt('123456'),
    decryptedString = cryptr.decrypt(encryptedString);
 
console.log(encryptedString);  // d7233809c0 
console.log(decryptedString);  // bacon 
//console.log(dec);    */

var validUrl = require('valid-url');

var url = "252985155193958,jpg"
if (!validUrl.isUri(url)){
    console.log('Looks like an URI');
} 
else {
    console.log('Not a URI');
}
   
}




       


