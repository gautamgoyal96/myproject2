var User = require('../app/models/front/home.js');
var appUser = require('../app/controllers/api/user.js');
var firebase = require("firebase");
const FCM = require('fcm-node');
const serverKey = 'AAAAK1vRFPE:APA91bFDJlGE-pK5f7JarrELoglCDCZl2Bnnm495IBiYjWXte8BInV8ZSdNT9fcW-xx96LQFIQAAGiwvMXYpK8ap6uJX6qfiPXfMCEwbGbfd7KMXtSSm9MLdfpD6AhdpbHbzSQbew5wF'; //put your server key here
const fcm = new FCM(serverKey);
/* var config = {
 apiKey: "AIzaSyAEXQmhBYTNToKyyXSlpta2SXgM0EXcLSc",
 authDomain: "koobi-89a2d.firebaseapp.com",
 databaseURL: "https://koobi-89a2d.firebaseio.com",
 projectId: "koobi-89a2d",
 storageBucket: "koobi-89a2d.appspot.com",
 messagingSenderId: "186224022769",
 gcm_sender_id : "103953800507"
 };*/ // Live

/*var config = {
    apiKey: "AIzaSyD_uX3hbydbD0BEhcaMqKlOs0xQH7jf1FM",
    authDomain: "koobdevelopment.firebaseapp.com",
    databaseURL: "https://koobdevelopment.firebaseio.com",
    projectId: "koobdevelopment",
    storageBucket: "",
    messagingSenderId: "696055690698",
    gcm_sender_id : "103953800507"
};*///Development

var config = {
    apiKey: "AIzaSyDhPcvN0liBX24VqG0tQ38WjODxELozeQQ",
    authDomain: "mualablocal.firebaseapp.com",
    databaseURL: "https://mualablocal.firebaseio.com",
    projectId: "mualablocal",
    storageBucket: "mualablocal.appspot.com",
    messagingSenderId: "714386763021"
  };//local

notifications = 'webnotification';
users = 'users';

firebase.initializeApp(config);
 
exports.sendNotification = function(token, notification, data){

   var message = {
		      
		        to: token,
		        collapse_key: 'your_collapse_key',
		        delay_while_idle : false,
		        priority : "high", 
		        content_available: true,
		        notification: notification,		        
		        data: data,
                mutable_content: true,
                category : '',
                badge : 1
    };

    fcm.send(message, function(err, response){
       
       
        if (err) 
        	return err;           
        else 
           return response;
        

    });
}

exports.sendWebNotification = function(userId, data){


 newPostKey = firebase.database().ref().child(notifications).child(userId).push().key;
 if(newPostKey ){
 
 var updates = {};
 updates[newPostKey] = data;
 firebase.database().ref().child(notifications).child(userId).update(updates);

 }

 return true;

}
/*this function use for get sender and receiver info. */
exports.notificationUser = function(senderId,receiverId,type,notifyId,notifyType){
     
    userArr   =  [];
    userArr   =  [senderId,receiverId];
    User.find({'_id':{ $in:userArr}},{'_id':1,'userName':1,'businessName':1,'userType':1,'firebaseToken':1,'deviceType':1,'profileImage':1}).exec(function(err,userData){
        if(userData){
          
            appUser.sendNotification(senderId,receiverId,type,userData,notifyId,notifyType);
        }
         
        
    });
    
}

/*code for send multiple notification*/

exports.sendNotificationMultiple = function(token, notification, data){
   var message = {
              
                registration_ids: token,
                collapse_key: 'your_collapse_key',
                delay_while_idle : false,
                priority : "high", 
                content_available: true,
                notification: notification,             
                data: data,
                category : '',
                mutable_content: true,
                badge : 1
    };
   
    fcm.send(message, function(err, response){
       
     console.log(err);  
     console.log("///////////////////////");  
     console.log(response);  
        if (err) 
            return err;           
        else 
           return response;
           


    });
}

/* login and register firebase*/

exports.register = function(userId, data){
    
    data.uId = userId;
    
    firebase.database().ref('users').child(userId).set(data);   
    return true;
}




