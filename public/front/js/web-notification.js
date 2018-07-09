  var config = {
    apiKey: "AIzaSyAEXQmhBYTNToKyyXSlpta2SXgM0EXcLSc",
    authDomain: "koobi-89a2d.firebaseapp.com",
    databaseURL: "https://koobi-89a2d.firebaseio.com",
    projectId: "koobi-89a2d",
    storageBucket: "koobi-89a2d.appspot.com",
    messagingSenderId: "186224022769",
    gcm_sender_id : "103953800507"
  };
 firebase.initializeApp(config);

//notifications = 'webnotification';
 notifications = 'webnotification-local';


  var reciveIdRef = firebase.database().ref().child(notifications).child(senderId);
   reciveIdRef.on("value",rgotData);
function rgotData(rdata){

    var rdata = rdata.val();
    var keys = Object.keys(rdata);
    for (var i = 0; i < keys.length; i++) {
          var k = keys[i];
         var message = rdata[k].body;
         var title = rdata[k].title;
         var url = rdata[k].url;
       notifyBrowser(title, message, url);
      firebase.database().ref().child(notifications).child(senderId).child(k).set(null);

    }
 }

notifyBrowserPermission();

function notifyBrowserPermission() {
    if (!Notification) {
        console.log('Desktop notifications not available in your browser..');
        return;
    }
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}

function notifyBrowser(title, desc, url) {
    if (!Notification) {
        console.log('Desktop notifications not available in your browser..');
        return;
    }
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    } else {
        var notification = new Notification(title, {
            icon: '/front/img/logo.png',
            body: desc,
        });
        notification.onclick = function() {
            window.open(url);
        };
        notification.onclose = function() {
            console.log('Notification closed');
        };
    }
}

notificationGet(5);

function notificationGet(e=''){

        var url = "/api/getNotificationList";
        if(e==5){

            var page = 0;
        
        }else{
            
            var page = $("#page").val();
        
        }
        $.ajax({
          
            url: url,
            type: "POST",
            data:{userId:senderId,page:page,limit:5},    
            headers: {"authToken": authToken},                      
            cache: false,
            beforeSend: function() {
                $(".loading").show();
            }, 
            success: function(data){
                 $(".loading").hide();
                var rs = data.notificationList;
                if(rs.length>0){
                    for (var i = 0; i < rs.length; i++) {

                        var s = rs[i];
                        $("#page").val(Number(page)+1);
                        var url ="#";
                        if(s.type=="booking"){
                           var  url = "/bookingInfo/"+s.redirectId;
                        }
                        $("#notifications_list").append('<a class="content" href="'+url+'"><div class="notification-item"><h4 class="item-title">'+s.message+'</h4><p class="item-info">'+s.timeElapsed+'</p></div></a>');


                    }
                }else if(page==0){

                   $("#notifications_list").html('<div class="notification-item"><p class="item-info" align="center">No notification yet.</p></div>');
 
                }
            }
        }); 

}


  jQuery(function($) {
    $('#notifications_list').on('scroll', function() {
        if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {

            notificationGet();
        }
    })
});

setInterval(function(){   $("#page").val(0);
    notificationGet();
    $("#notifications_list").animate({
    scrollTop: $("#notifications_list").position().top
});
 }, 1000000);
   

