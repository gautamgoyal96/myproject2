

var myConnectionsRef = firebase.database().ref('users/'+senderId+'/connections');
var connectedRef = firebase.database().ref(".info/connected");
var userRef = firebase.database().ref('users/'+senderId+'/isOnline');
var userRef1 = firebase.database().ref('users/'+senderId+'/lastActivity');
  connectedRef.on("value", function(snap) {
    if (snap.val()) {
      userRef.set(1);
      userRef1.set(Date.now());
      userRef.onDisconnect().set(0);
      userRef1.onDisconnect().set(Date.now());
      

    }
  });  

var isonline = function(userId){


  reciveIdRef = firebase.database().ref().child('users').child(userId);
  reciveIdRef.on("value",function(rdata){
      data = rdata.val();
      lastSeen = "last seen "+moment(data.lastActivity).fromNow();
      var a = (data.isOnline==1 )? $("#isOnline"+userId).html('Online') : $("#isOnline"+userId).html(lastSeen);
      $("#isOnline"+userId).slideDown();
      if(data.isOnline==1){
        $("#isOnline"+userId).html('Online');
        getChat3(userId);

      }
      setValue('user_online',data.isOnline);
  });

} 


var sendmsg = function(downloadURL=''){

      var msg =  $.trim($("#msg").val());
      if((msg.length>0 || downloadURL!='') && (senderId!=getValue('reciverId'))){

        if(getValue('type')=="group" && getValue('type')!=null){

          sendGroupMsg(downloadURL='');

        }else if(getValue('type')=="broadcast" && getValue('type')!=null){

          sendBroadcastMsg(downloadURL='');

        }else{      

              var reciverId = getValue('reciverId');
              var userName = getValue('userName');
              var ProfilePic = getValue('ProfilePic');
              var userName1 = getValue('userName1');
              var ProfilePic1 = getValue('ProfilePic1');
              var user_online = getValue('user_online');
              var favouriteStatus = Number(getValue('favouriteStatus'));
              var  data = {
                'reciverId' : reciverId,
                'senderId' : senderId,
                'message' : downloadURL ? downloadURL : msg,
                'readStatus' : user_online ? 1 : 0,
                'messageType' : downloadURL ? 1 : 0,
                'timestamp' : Date.now(),
              };

              chat1 = {
                'reciverId' : reciverId,
                'senderId' : senderId,
                'message' : downloadURL ? downloadURL : msg,
                'readStatus' : user_online ? 1 : 0,
                'messageType' : downloadURL ? 1 : 0,
                'timestamp' : Date.now(),
              }; 
              historyData = data;
              firebase.database().ref('chat').child(reciverId).child(senderId).push(data);
              if(data){
                data.userName = userName; 
                data.profilePic = ProfilePic; 
                data.unreadMessage = 0;
                data.memberCount = 0;
              }
              data.type = "user";   
              historyData.type = "user";   
              historyData.memberType = '';   
              data.memberType = '';   
              data.favourite = favouriteStatus ? favouriteStatus : 0;   

              delete data.readStatus;

              firebase.database().ref('chat_history/' + senderId).child(reciverId).set(data);

              historyData.userName = userName1; 
              historyData.profilePic = ProfilePic1;      
              historyData.unreadMessage = 0;   
              historyData.favourite = 0;   
              historyData.memberCount = 0;   
              delete historyData.readStatus;   
              unreadmesaageget(historyData);

              let to = getValue('firebaseToken');
              let mutestatus = getValue('mutestatus');

              firebase.database().ref().child('mute_user').child(reciverId).child(senderId).once('value', function(snapshot) {
              if (snapshot.val()==null) {
                  if(to){
                    let notification = {
                      'title' : userName1,
                      'body' : downloadURL ? 'image' : msg,
                      'message' : downloadURL ? 'image' : msg,
                      'notifincationType' : '15',
                      'click_action' : 'ChatActivity',
                      'type' : 'chat',
                      'opponentChatId' : senderId
                    };

                    senNotifcation(to,notification,notification);

                  }else{

                    let webNotification = {
                      
                      'title' : userName1,
                      'body' : downloadURL ? 'image' : msg,
                      'url':'/chat?uId='+ getValue('reciverId')
                    };
                    senWebNotifcation(getValue('reciverId'),webNotification);
                  }
                }
              });
              firebase.database().ref('chat').child(senderId).child(reciverId).push(chat1);  
              $("#msg").val('');
              $("#fileInput").val('');
              $("#progressbar").slideUp();
              $('#slimScrollDiv').animate({scrollTop: $('#slimScrollDiv').prop("scrollHeight")}, 1);
              clearTyping();
        }
    }

}

var unreadmesaageget = function(historyData){
    var reciverId = getValue('reciverId');
   reciveIdRef = firebase.database().ref().child('chat_history').child(reciverId).child(senderId);
        reciveIdRef.once('value',function(rdata){
           s = (rdata.val()) ? rdata.val().unreadMessage ?  Number(rdata.val().unreadMessage)+Number(1) : 1 : 1;
           favourite = (rdata.val()) ? rdata.val().favourite : 0;
           historyData.unreadMessage = s;
           historyData.favourite = favourite;
           firebase.database().ref('/chat_history/' + reciverId).child(senderId).set(historyData);

        });
}

var unreadmesaageset = function(){

     var reciverId = getValue('reciverId');
      reciveIdRef = firebase.database().ref().child('chat_history').child(reciverId).child(senderId);
      reciveIdRef.once('value',function(rdata){
      if(rdata.val()){
        reciveIdRef1 = firebase.database().ref().child('chat_history').child(senderId).child(reciverId).child('unreadMessage');
        reciveIdRef1.once('value',function(rdata1){
          if(rdata1.val()){
            firebase.database().ref('chat_history').child(senderId).child(reciverId).child('unreadMessage').set(0);
          }
        });
      }
  });
}

$("#msg").keypress(function(e) {
    if(e.which == 13) {
        /*sendmsg();*/
    }
});

// to upload imafe
$("#fileInput").change(function(e){

    var input = e.target;


    var size = (input.files[0].size/1024).toFixed(2);

    var fileExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp'];

    if ($.inArray($(input).val().split('.').pop().toLowerCase(), fileExtension) == -1) {

      swal("Alert!","Only this formats are allowed : "+fileExtension.join(', '), "error");

    }else if(size>10240){

       swal("Alert!", "You can't upload more than 10 mb image size", "error");

    
    }else{

            $("#progressbar").slideDown();

            var file = e.target.files[0];

            var reciverId = getValue('reciverId');
            var chatRoom = senderId+"_"+reciverId; 
            if(senderId>reciverId){
              var chatRoom = reciverId+"_"+senderId; 
            }

            firebase.database().ref("block_users").child(chatRoom).once('value', function(snapshot) {

            if(snapshot.val()){
              $("#fileInput").val('');    
              $("#msg").val('');    
              return false;

            }else{

                var storageRef = firebase.storage().ref();
                var uploadTask = storageRef.child('chat/'+ Date.now()).put(file);
                 uploadTask.on('state_changed', function(snapshot) {
                    $(".loading").show();

                  }, function(error) {
                      alert(error)

                  }, function() {

                      uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {

                        $(".loading").hide();
                        if(getValue('type')=="group" && getValue('type')!=null){

                            sendGroupMsg(downloadURL);

                          }else if(getValue('type')=="broadcast" && getValue('type')!=null){

                            sendBroadcastMsg(downloadURL);

                          }else{ 

                            sendmsg(downloadURL);
                          }
                      });
                  });
              } 

            });
      }
});




var isTyping = function(userId,type=''){
    reciverId = userId;
    if(type!="group" || type==''){
      var typingNode = reciverId+"_"+senderId; 
    }else{
      var typingNode = reciverId; 
    } 
  reciveIdRef = firebase.database().ref().child('isTyping').child(typingNode);
  reciveIdRef.on("value",function(rdata){
      data = rdata.val();
      if(data){
        if(data.isTyping==1){
            if(type=="group"){

              if(data.senderId!=senderId){

                var msg = 'typing...';
                $("#online"+data.reciverId).html(msg).show();
                $("#msg"+data.reciverId).hide();
                $("#typing"+data.reciverId).html(msg).show();
                $("#isOnline"+data.reciverId).hide();

              
              }else{
                 $("#isOnline"+data.reciverId).show();
                 $("#msg"+data.reciverId).show();
                 $("#typing"+data.reciverId).html('').hide();

              }


            }else{

              var msg = 'typing...';
              $("#online"+data.senderId).html(msg).show();
              $("#msg"+data.senderId).hide();
              $("#typing"+data.senderId).html(msg).show();
              $("#isOnline"+data.senderId).hide();
            }  

        }
      }else{
         $("#online"+userId).hide();
         $("#msg"+userId).show();
         $("#typing"+userId).html('').hide();
         $("#isOnline"+userId).show();
         

      }
  });

}
var getChat3 = function(userId){

    reciveIdRef = firebase.database().ref().child('chat').child(senderId).child(userId);
    reciveIdRef.on('child_added',function(rdata){
        if(getValue('user_online')==1){
          if(rdata.val().readStatus==1){
            firebase.database().ref().child('chat').child(senderId).child(userId).child(rdata.key).child('readStatus').set(0);
          }
        }

    });
}

var getChat2 = function(userId){

    reciveIdRef = firebase.database().ref().child('chat').child(userId).child(senderId);
    reciveIdRef.on('child_added',function(rdata){
 
      if(rdata.val().senderId==getValue('reciverId')){

         firebase.database().ref().child('chat').child(userId).child(senderId).child(rdata.key).child('readStatus').set(2);
      }
    });
}

var get_msg_label = function(startFrom,timestamp){
 
  var date = moment(timestamp).format('DD/MM/YYYY');
  var todayDate = moment(new Date()).format('DD/MM/YYYY');
  var yesterday = moment(new Date()).add(-1, 'days').format('DD/MM/YYYY');

   if(getValue('dateC')!= date){

         setValue('dateC',date); 
        if(date == todayDate){
          date = 'Today';
        }else if(yesterday == date){
          date = 'Yesterday';
        }
        var idDate = date.replace("/", "");
        var idDate = idDate.replace("/", "");
        if(startFrom==0){
           $('#'+idDate).remove();   
          $('#get_chat').append('<center id='+idDate+' style=" border-bottom:2px dotted #f83272;margin-top:15px;margin-bottom:15px;" >' +date+ '</center>');
        }else{
            if(typeof $('#'+idDate).html() != 'undefined'){
            $('#'+idDate).remove();                   }
          $('#get_chat1').append('<center id='+idDate+' style=" border-bottom:2px dotted #f83272;margin-top:15px;margin-bottom:15px;" >' +date+ '</center>');
        }
    }
  
}
var stringReplace = function(message){
  if(message){
    message = message.replace(/\&/g, '&amp;');
    message = message.replace(/\>/g, '&gt;');
    message = message.replace(/\</g, '&lt;');
    message = message.replace(/\"/g, '&quot;');
    message = message.replace(/\'/g, '&apos;');
    return message;
  }else{
    return '';
  }
}
var getChat = function(userId){
  setValue('dateC','0');
  getChat2(userId);
  var startFrom = Number(getValue('startFrom'));

  getData = firebase.database().ref().child('chat').child(senderId).child(userId).limitToLast(60);

  if(startFrom){

    getData = firebase.database().ref().child('chat').child(senderId).child(userId).orderByChild("timestamp").endAt(startFrom).limitToLast(15);
  }
  getData.on('value',function(rdata){

      rdata = rdata.val();
      setValue('startFrom',0);
      msgC = 1;

      if(rdata){


         if (getValue('startFrom') == 0) {

            var keys = Object.keys(rdata);
            k = keys[0];
            setValue('startFrom',rdata[k].timestamp);

          }

          if(getValue('reciverId')==userId){

              unreadmesaageset();
              $.each(rdata, function(i, item) {
              Time = moment(item.timestamp).format("hh:mm A");
              get_msg_label(startFrom,item.timestamp);

                var c = (senderId==item.senderId) ? 'speech-right': '';
                msg = stringReplace(item.message);
                message = item.messageType==0 ? "<pre>"+msg+"</pre>" : " <a href='JavaScript:void(0);'><img src='"+item.message+"' class='img-rounded' width='150' height='120' onclick='showImage(this.src);'></a>";
                $('#'+item.timestamp).remove();          
                read = (item.readStatus==2) ? 'read' : 'unread';
                chat = '<li id="'+item.timestamp+'" class="mar-btm"><div class="media-body pad-hor '+c+'"><div class="speech"><p>'+message+'</p><div class="'+read+'"  id="read'+item.timestamp+'"><i class="fa fa-check" aria-hidden="true"></i><i id="unred'+item.timestamp+'" class="fa fa-check" aria-hidden="true"></i></div></div><p class="speech-time">'+Time+'</p></div></li>';
                startFrom==0 ? $("#get_chat").append(chat) : $("#get_chat1").append(chat);
                (senderId==item.reciverId) ? $('#read'+item.timestamp).remove() : '';
                (item.readStatus==1) ? $("#unred"+item.timestamp).hide() : $("#unred"+item.timestamp).show();

                msgC++; 
            });
          }
          


         if(read=="read" && getValue('reciverId')==userId && getValue('startFrom') != 0){

/*              $(".unread").removeClass('unread').addClass('read');
*/
         }
          if (msgC <= 15) {
             setValue('startFrom',0);
          }
     
         if(startFrom==0){

            $('#slimScrollDiv').animate({scrollTop: $('#slimScrollDiv').prop("scrollHeight")}, 1);

         }else{

            var get_chat1 = $("#get_chat1").html();
            $("#get_chat").prepend(get_chat1);
            $("#get_chat1").html('');
            $("#slimScrollDiv").animate({scrollTop: $("#slimScrollDiv").height()}, 1);
         }
      }else{
        $("#get_chat").html('');
      }
  });

}


$('#slimScrollDiv').scroll(function() {
    if ($('#slimScrollDiv').scrollTop() == 0) {
        if (getValue('startFrom') != 0) {
          userId = getValue('reciverId');
          if(getValue('type')=="group"){
            getGroupChat(userId);
          }else  if(getValue('type')=="broadcast"){
            getbroadCastChat(userId);
          }else{
            getChat(userId);
          }
        }
    }
});



var arrayshort = function(data){
     var array = [];
              $.each(data, function(key, value) {
                  array.push(value);
              });
     return array.sort(function(a, b) {
          var a1 = a.timestamp,
              b1 = b.timestamp;
          if (a1 == b1) return 0;
          return a1 < b1 ? 1 : -1;
      });
}

var setValue = function(key,value){

  if($('#'+key).length==0){
    $('<input>').attr({type: 'hidden', id: key, name: key,value:value}).appendTo('head');
  }else{
    $("#"+key).val(value);
  }
  return true;
}
var getValue = function(key){
 return $("#"+key).val();
}


var removeValue = function(key){
  return $("#"+key).val('');
}


var userImageUpdate = function(uid){
    if(uId){
      firebase.database().ref("users").child(uid).on('child_changed', function(userData23){
                              

          firebase.database().ref("users").child(uid).once('value', function(userData){
            firebase.database().ref('/chat_history').child(senderId).once('value', function(data){
                if(data.val()){

                    var userDetail = userData.val();
                      if(uId==getValue('reciverId')){
                        $("#"+uId).attr('src',getValue('ProfilePic'));
                        setValue('ProfilePic',userDetail.profilePic);
                        setValue('userName',userDetail.userName);
                      }
                      
                    firebase.database().ref('/chat_history').child(senderId).child(uid).child('profilePic').set(userDetail.profilePic);
                }
              });
          });
      });
    }

}



let arrayshortby_chatType = function(data){


    let result = data.filter(function(o1){

            return o1.type == 'group';          // assumes unique id

    }).map(function(o){

       return o;       
    });
   return result;  
}

let arrayshortby_fav = function(data){


    let result = data.filter(function(o1){

            return o1.favourite == 1;          // assumes unique id

    }).map(function(o){

       return o;       
    });
   return result;  
}

let arrayshortby_myGroupStatus = function(data){


    let result = data.filter(function(o1){


            return o1.memberType == 'admin';          // assumes unique id

    }).map(function(o){

       return o;       
    });
   return result;  
}


let arrayshortby_readStatus = function(data,value){


    let result = data.filter(function(o1){
        if(value!=1){
          return o1.unreadMessage == value;
        }
        return o1.unreadMessage >= value;

    }).map(function(o){

       return o;       
    });
   return result;  
}


$( "#search_chat" ).focus(function() {
  $("#filter").slideDown();
  $("#icon").html('<i class="fa fa-remove"></i>');
});
$("#icon").click(function(){
   $("#filter").slideUp();
   $(".radioCs").prop('checked', false);
   $("#search_chat").val('');
   $("#icon").html('<i class="fa fa-search"></i>');
   $("#all").click();
});

$(".radioCs").click(function(){
   getchatHistory();
});

var getchatHistory = function(){
  var search = $.trim($("#search_chat").val());
  var filter = $('input[name=fliter]:checked').val();
  var search = search.toLowerCase();
   reciveIdRef = firebase.database().ref().child('chat_history').child(senderId);
        reciveIdRef.on('value',function(rdata){
            rdata2 = rdata.val();
            rdata = arrayshort(rdata.val());
            if(rdata){
              $("#not_chat").hide(); 
              $("#chatHistory").html(''); 
              $("#message_send").show();
              $("#record_not").show();
              $(".record_not").hide();
              d=0;
              if(search){
                var rdata = rdata.filter(function(itm){
                  userName = (itm.userName).toLowerCase()
                  return userName.indexOf(search) != -1;
                });
              
              }

              switch (filter) {

                case '1':
                  rdata = rdata;
                  break;

                case '2':
                  rdata = arrayshortby_chatType(rdata);
                  break;
                 
                case '3':
                  rdata = arrayshortby_myGroupStatus(rdata);
                  break;
                 
               case '4':
                  rdata = arrayshortby_readStatus(rdata,0);
                  break;
                 
                case '5':
                  rdata = arrayshortby_readStatus(rdata,1);
                  break;

                case '6':
                  rdata = arrayshortby_fav(rdata);
                  break;                
              }

              s = 0;
              $.each(rdata, function(i, item) {

                if(typeof item != "undefined" || item != null) {

                  uId = (senderId==item.reciverId) ? item.senderId : item.reciverId;
                  (item.type!="group") ? userImageUpdate(uId) : '';

                  Time = moment(item.timestamp).format("DD/MM/YYYY, hh:mm a");
                  msg = stringReplace(item.message);
                  message = (item.messageType==0) ? (item.message.length>50) ? "<pre>"+msg.substr(0, 30) + '</pre>...' : "<pre>"+msg+"</pre>" : "<i class='fa fa-image'></i> IMAGE";

                  first = (s==0) ? ' first' : '';
                  unread = item.unreadMessage ? '<span class="lastTime msgstxt"><p>'+item.unreadMessage+'</p></span>' : '';
                  click = (item.type=="group") ? 'onclick="show_group_chat(this);"' : (item.type=="broadcast") ? 'onclick="show_broadcast_chat(this);"' : 'onclick="show_chat(this);"';
                  chat = '<a class="list-group-item'+first+'" id="'+uId+'" href="JavaScript:void(0);" '+click+'  data-uid="'+uId+'"  data-membercount="'+item.memberCount+'" data-username="'+item.userName+'" data-profilepic="'+item.profilePic+'"><div class="media"><img class="rounded-circle float-left d-flex mr-3" src="'+item.profilePic+'"><div class="media-middle media-body"><h5 class="media-heading">'+item.userName+'</h5><small class="text-muted" id="msg'+uId+'">'+message+'</small><small class="typing_color hidden" id="online'+uId+'"></small><span class="lastTime mutetxt"  id="mutei'+uId+'"></span>'+unread+'<span class="lastTime">'+Time+'</span></div></div></a>';


                  isTyping(uId,item.type);
                  $("#chatHistory").append(chat);
                  d = d+item.unreadMessage;
                  (item.type=="group") ? muteCheck(uId) : userMuteCheck(uId);

                  s++;
                }
                var userId = getValue('reciverId');
                $("#typing"+userId).hide();
                $("#isOnline"+userId).show();

              });


              $("#unreadMsg").html("");
              if(d>0){
                $("#unreadMsg").html('<span class="msg_txt">'+d+"</span>");
              }
          }
            $(".cht-lft-img,.cht-lft-txt,.cht-rht").show();
            $("#not_chat").css('min-height','none');
            if(rdata.length==0){
              $(".record_not").show();
              $("#not_chat").hide();

                if(urlId=="me" && rdata2==null){
                  $("#message_send").hide();
                  $("#record_not").hide();
                  $("#not_chat").show();
                  $("#not_chat").css('min-height','493px');
                }
            }

     });

} 



var show_chat = function(userId='',uId='',urlId=''){
  $("#user").show();
  $("#group").hide();
  $("#broadcast").hide();
  
  if((userId=='') || (getValue('reciverId')!=$(userId).data('uid'))){

          $("#msg").val('');
          $("#fileInput").val('');
          $("#get_chat").html('');
          $(".loading").show();


          if(uId){

            userId = uId;
          
          }else{

              var profilepic = $(userId).data('profilepic');
              var username = $(userId).data('username');
              var userId = $(userId).data('uid');
              setValue('userName',username);
              setValue('ProfilePic',profilepic);

          }
          setValue('reciverId',userId);
          setValue('startFrom','0');
          setValue('type','user');

          getChat(userId);
          setTimeout(function(){ $(".loading").hide();  clearTyping();   if(urlId=="me"){
            $(".first").click();

          }}, 2000);

          $(".block_data").attr("id", "block_messgae"+userId);    
          $(".panel-footer").attr("id", "send_msg"+userId);
          if(urlId!="me"){

                firebase.database().ref("users").child(userId).on('value', function(userData){
                  if(userData.val()){

                    setValue('firebaseToken',userData.val().firebaseToken);
                  }

                });
                $("#user_img").html('<img src="'+getValue('ProfilePic')+'" id="'+userId+'">');
                $("#user_name").html(getValue('userName'));
                $("#typing").html('<small id="isOnline'+userId+'" class=""></small>');
                $("#isOnline").html('<small id="typing'+userId+'" class=""></small>');
                isonline(userId);
                getBlock();
                getMute();
                getFavourite();
                unreadmesaageset();

          }else{
           
            $("#send_msg"+userId).hide();
          }    
    }

}

var typingTimer;                //timer identifier
var doneTypingInterval = 100;  //time in ms, 5 second for example
var $input = $('#search_chat'); // get input 

//on keyup, start the countdown
$input.on('keyup', function () {
clearTimeout(typingTimer);
typingTimer = setTimeout(getchatHistory, doneTypingInterval); //"getChatHistory" is function for call
});

//on keydown, clear the countdown 
$input.on('keydown', function () {
clearTimeout(typingTimer);
});

$("#delete_chat").click(function deleteChat() {

      swal({
            title: "Delete Conversation?",
            text: "You will not be able to recover this chat",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#1976d2',
            confirmButtonText: 'Yes, I am sure!',
            cancelButtonText: "No, cancel it!",
            closeOnConfirm: true,
            closeOnCancel: true
        },

        function(isConfirm) {

            if (isConfirm) {
                var reciverId = getValue('reciverId');
                firebase.database().ref('chat').child(senderId).child(reciverId).set(null);
                firebase.database().ref('chat_history').child(senderId).child(reciverId).set(null);
                setTimeout(deleteData, 500);

            }
        });
});

let deleteData = function(){
    var reciverId = getValue('reciverId');
    firebase.database().ref('chat').child(senderId).child(reciverId).set(null);
    firebase.database().ref('chat_history').child(senderId).child(reciverId).set(null);
}

var getBlock = function(){

    var reciverId = getValue('reciverId');
    var chatRoom = senderId+"_"+reciverId; 
    if(Number(senderId)>Number(reciverId)){
      var chatRoom = reciverId+"_"+senderId; 
    }

    firebase.database().ref("block_users").child(chatRoom).on('value', function(snapshot) {
        if (snapshot.exists()) {
            if(snapshot.val().blockedBy==senderId || snapshot.val().blockedBy=="Both"){

                $('#block').hide();
                $('#unblock').show();
                $("#block_messgae"+reciverId).html("You have blocked this user, you can't send messages.");
               
            }else{
              $('#block').show();
              $('#unblock').hide();
              $("#block_messgae"+reciverId).html("You are blocked by this user, you can't send messages.");

            }
            $("#send_msg"+reciverId).hide();
            $("#block_messgae"+reciverId).show();
            $("#isOnline"+reciverId).hide();
            $("#typing"+reciverId).hide();
            $("#online"+reciverId).html('').hide();
            $("#msg"+reciverId).show();
        
            
        } else{

          $('#unblock').hide();
          $('#block').show();
          $("#send_msg"+reciverId).show();
          $("#block_messgae"+reciverId).hide();
          $("#isOnline"+reciverId).show();
          $("#typing"+reciverId).show();
          $("#online"+reciverId).show();
            
        }
    });
}



var getFavourite = function(){

    var reciverId = getValue('reciverId');
    $('.addFaveroite').show();
    $('.removeFaveroite').hide();

    firebase.database().ref("chat_history").child(senderId).child(reciverId).on('value', function(snapshot) {
        setValue('favouriteStatus',0);
        $('.addFaveroite').show();
        $('.removeFaveroite').hide();

        if (snapshot.exists()) {

            if(snapshot.val().favourite=="1" || snapshot.val().favourite==1){

                setValue('favouriteStatus',snapshot.val().favourite);
                $('.addFaveroite').hide();
                $('.removeFaveroite').show();
               
            }
        }
    });
}



     // for addFaveroite user's
$(".addFaveroite").click(function(){

    var reciverId = getValue('reciverId');    
      firebase.database().ref("chat_history").child(senderId).child(reciverId).once('value', function(snapshot) {    
          if(snapshot.val()){
            
            firebase.database().ref("chat_history").child(senderId).child(reciverId).child('favourite').set(1);
          
          }else{

            var  data = {
                            'reciverId' : reciverId,
                            'senderId' : senderId,
                            'message' : '',
                            'messageType' : 0,
                            'timestamp' : Date.now(),
                            'type' : 'user',
                            'userName' : getValue('userName'),
                            'profilePic' : getValue('ProfilePic'),
                            'unreadMessage' : 0,
                            'memberCount' : 0,
                            'favourite' : 1
                        };

            firebase.database().ref("chat_history").child(senderId).child(reciverId).set(data);

          }
      });
  }); 


    // for removeFaveroite user's
  $(".removeFaveroite").click(function(){

    var reciverId = getValue('reciverId');        
    firebase.database().ref("chat_history").child(senderId).child(reciverId).child('favourite').set(0);

  });



     // for blocking user's
  $("#block").click(function(){

        $("#msg").val('');
        $("#fileInput").val('');
        swal({
            title: "Block User?",
            text: "Blocked user will no longer be able to send you messages and images",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#1976d2',
            confirmButtonText: 'Yes, I am sure!',
            cancelButtonText: "No, cancel it!",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function(isConfirm) {

            if (isConfirm) {
  
              var reciverId = getValue('reciverId');
                var chatRoom = senderId+"_"+reciverId; 
              if(Number(senderId)>Number(reciverId)){
                var chatRoom = reciverId+"_"+senderId; 
              }          
                firebase.database().ref("block_users").child(chatRoom).once('value', function(snapshot) {

                    if (snapshot.exists()) {

                        var updates2 = {};
                        var offer = {
                            blockedBy: 'Both',
                        }
                        updates2['/block_users/' + chatRoom] = offer;
                        return firebase.database().ref().update(updates2);
                    } else {
                        var blockData = {
                            blockedBy: senderId
                        };
                        var chatKey2 = firebase.database().ref('block_users').child(chatRoom).set(blockData);
                    }
               });
            }
        });
  }); 


    // for unblocking user's
  $("#unblock").click(function(){

          var reciverId = getValue('reciverId');
          var chatRoom = senderId+"_"+reciverId; 
          if(Number(senderId)>Number(reciverId)){

            var chatRoom = reciverId+"_"+senderId; 
          }      
        firebase.database().ref("block_users").child(chatRoom).once('value', function(snapshot) {

          var block_id = snapshot.val().blockedBy;
          if (block_id == 'Both') {
              block_id = reciverId;
              firebase.database().ref().child('block_users').child(chatRoom).child('blockedBy').set(block_id);
          } else {
              if (block_id == senderId) {
                  firebase.database().ref().child('block_users').child(chatRoom).set(null);
              }
          }

      });

  });



//for image preview
  function showImage(imgPath){

        var modal = document.getElementById('myModal');
        var modalImg = document.getElementById("img01");
        modal.style.display = "block";
        modalImg.src = imgPath;
        $('body').addClass('static');
        var span = document.getElementsByClassName("close-img-modal")[0];

        // When the user clicks on <span>, close the modal
        span.onclick = function() { 
            modal.style.display = "none";
        }
  }
  $(".close-img-modal").click(function(){
    $('body').removeClass('static');
  });

  var isTypingUpdate = function(){
 
    var reciverId = getValue('reciverId');
      if(getValue('type')!="group"){
        var typingNode = senderId+"_"+reciverId; 
      }else{
        var typingNode = reciverId; 
      } 
             data = {
                'reciverId' : reciverId,
                'senderId' : senderId,
                'isTyping' : 1
              };
            firebase.database().ref('isTyping').child(typingNode).set(data);

}

var clearTyping = function(){
   reciverId = getValue('reciverId');
   if(getValue('type')!="group"){
        var typingNode = senderId+"_"+reciverId; 
    }else{
      var typingNode = reciverId; 
    } 

  firebase.database().ref('isTyping').child(typingNode).set(null);  

}
var typingTimer12;                //timer identifier
var doneTypingInterval12 = 5000;  //time in ms, 5 second for example
var $msg = $('#msg'); // get input 

//on keyup, start the countdown
$msg.on('keyup', function () {
clearTimeout(typingTimer12);
typingTimer12 = setTimeout(clearTyping, doneTypingInterval12); //"getChatHistory" is function for call
});

//on keydown, clear the countdown 
$msg.on('keydown', function () {
isTypingUpdate()
clearTimeout(typingTimer12);
});

function  senNotifcation(to,notification,data){
    console.log(notification);
    fetch('https://fcm.googleapis.com/fcm/send', {
      'method': 'POST',
      'headers': {
        'Authorization': 'key=' + key,
        'Content-Type': 'application/json'
      },
      'body': JSON.stringify({
          to: to,
          collapse_key: 'your_collapse_key',
          delay_while_idle : false,
          priority : "high", 
          content_available: true,
          notification: notification,           
          data: data,
          badge : 1,
          icon : 'icon',

      })
    }).then(function(response) {
      console.log(response);
    }).catch(function(error) {
      console.error(error);
    });
}

function senWebNotifcation(userId,data){

    firebase.database().ref().child(notifications).child(userId).set(null);

     newPostKey = firebase.database().ref().child(notifications).child(userId).push().key;
     if(newPostKey ){
     
       var updates = {};
       updates[newPostKey] = data;
       firebase.database().ref().child(notifications).child(userId).update(updates);

     }

}


$("#mute").click(function(){

  let reciverId = getValue('reciverId');
    reciveIdRef = firebase.database().ref().child('mute_user').child(senderId).child(reciverId).child('mute').set(1);

});


$("#unmute").click(function(){

  let reciverId = getValue('reciverId');
    reciveIdRef = firebase.database().ref().child('mute_user').child(senderId).child(reciverId).set(null);

});

let userMuteCheck = function(userId) {

    reciveIdRef = firebase.database().ref().child('mute_user').child(senderId).child(userId);
    reciveIdRef.once('value',function(gdata){

        let data = gdata.val();

        if(data){

          $("#mutei"+userId).html('<i class="fa fa-bell-slash"></i>');

        }else{

          $("#mutei"+userId).html('');

        }
    });

}


var getMute = function(){

    var userId = getValue('reciverId');
    firebase.database().ref().child('mute_user').child(senderId).child(userId).on('value', function(snapshot) {
      if (snapshot.exists()) {
        $("#unmute").show();
        $("#mute").hide();
        $("#mutei"+userId).html('<i class="fa fa-bell-slash"></i>');     
          
      } else{

        $("#unmute").hide();
        $("#mute").show();
        $("#mutei"+userId).html('');

          
      }
    });
}