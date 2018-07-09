const FirebaseAuth = require('firebaseauth');
var firebase = require("firebase");

 var config = {
    apiKey: "AIzaSyDV9ngSHp9510BAhFttucgJyOUIdz39M4w",
    authDomain: "testgk-2705a.firebaseapp.com",
    databaseURL: "https://testgk-2705a.firebaseio.com",
    projectId: "testgk-2705a",
    storageBucket: "testgk-2705a.appspot.com",
    messagingSenderId: "470800820231",

  };

 firebase.initializeApp(config);


exports.fregister = function(req, res){

  importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');


firebase.initializeApp({
  "gcm_sender_id": "103953800507"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
messaging.requestPermission()
.then(function() {
  console.log('Notification permission granted.');
  // TODO(developer): Retrieve an Instance ID token for use with FCM.
  // ...
})
.catch(function(err) {
  console.log('Unable to get permission to notify.', err);
});


	 /*        var postData = {"firebaseId": '12345', "firebaseToken": "123455", "image": 'image',"name":'name',"time": 'time'};

                             newPostKey  = firebase.database().ref().child('users').child('12334').key;
                      if(newPostKey ){
                             
                               var updates = {};
                              updates[newPostKey] = postData;
                              firebase.database().ref().child("users").update(updates);

                            }*//*
var firebase = new FirebaseAuth('AIzaSyDV9ngSHp9510BAhFttucgJyOUIdz39M4w');
var email = "gautamgoyal96@gmail.com";
var password = "123456";
var name = "gautam";

firebase.signInWithEmail(email, password, function(err, result){
    if (err)
		firebase.registerWithEmail(email, password, name, function(err, result){

		    if (err)
		        console.log(err);
		    else
		        console.log(result.token);



		});
    else
        console.log(result.token);
      res.end(result.token);
});*/

}