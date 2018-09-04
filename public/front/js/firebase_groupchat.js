
let arrayFliter= function(data){
     var array = [];
              $.each(data, function(key, value) {
                
                if(typeof value != "undefined" || value != null) {

                  if(value.uId!=senderId){
                    array.push(value);
                  }
                }
              });
     return array;
}




let arrayshortbyunide = function(data,rdata){


    let result = data.filter(function(o1){

        return !rdata.some(function(o2){
            return o1.uId === o2.memberId;          // assumes unique id
        });
    }).map(function(o){

       return o;       
    });
   return result;  
}

let add_user = function(e){


  let userName = $(e).data('username'); 
  let profilePic = $(e).data('profile'); 
  let uId = $(e).data('uid'); 
  let firebaseToken = $(e).data('token'); 
  data = {
          'memberId' : uId,
          'profilePic' : profilePic,
          'userName' : userName,
          'type':'member',
          'firebaseToken' : firebaseToken,
          'mute' : 0,
          'createdDate' : Date.now() 
        };
  firebase.database().ref('tempData').child(senderId).child(uId).set(data);

  $("#group_member-err").html('');
  $("#broadcast_member-err").html('');
  $('#add_group_member-err').html("");
  $('#add_broadcast_member-err').html("");

}


let get_member = function(){

    reciveIdRef = firebase.database().ref().child('tempData').child(senderId);
    reciveIdRef.on('value',function(rdata){
          rdata = rdata.val();
          $(".getmemberList").html('');
         if(rdata){
            $.each(rdata, function(i, item) {
              if(typeof item != "undefined" || item != null) {
                chat = '<span id="member'+item.memberId+'"><img src="'+item.profilePic+'"> @'+item.userName+'<a href="javascript:void(0);" onclick="remove_user('+item.memberId+');" title="Remove" ><i class="fa fa-close"></i></a></span>';
                $(".getmemberList").append(chat);
              }
                
            });

        }

    });
}

let remove_user = function(e){

    firebase.database().ref('tempData').child(senderId).child(e).set(null);  
    $("#member"+e).remove();
    $("#group_member-err").html('');
    $("#broadcast_member-err").html('');
    $('#add_group_member-err').html("");
    $('#add_broadcast_member-err').html("");


}

let getUserGet = function(){

    firebase.database().ref('tempData').child(senderId).set(null); 
    $('#groupName-err').html("");
    $('#group_img-err').html("");
    $('#group_member-err').html("");
    $('#pImg').attr('src','http://koobi.co.uk:3000/uploads/default_group.png');
    $("#profileImage").val('');
    $("#groupName").val('');
    allUserGet(); 

}

let allUserGet = function(){

    reciveIdRef12 = firebase.database().ref().child('tempData').child(senderId);
    reciveIdRef12.on('value',function(tdata){
  
      var search = $.trim($("#search_user").val());
      var search = search.toLowerCase();
       reciveIdRef = firebase.database().ref().child('users');
            reciveIdRef.on('value',function(rdata){

                rdata = arrayFliter(rdata.val());

                if(tdata.val()){
                   tdata = arrayFliter(tdata.val());

                    rdata =  arrayshortbyunide(rdata,tdata);
                }

               if(rdata){
                  $("#userList").html(''); 
                  $(".user_record_not").hide();
                  if(search){
                    var rdata = rdata.filter(function(itm){
                      userName = (itm.userName).toLowerCase()
                      return userName.indexOf(search) != -1;
                    });
                  
                  }


                  $.each(rdata, function(i, item) {
                   chat = '<li id="add_member'+item.uId+'"><span><img src="'+item.profilePic+'"> @'+item.userName+'</span><a href="javascript:void(0);" class="btn btn-theme" onclick="add_user(this);" data-profile ="'+item.profilePic+'" data-username="'+item.userName+'" data-uid = "'+item.uId+'" data-token = "'+item.firebaseToken+'" title="Add"><i class="fa fa-plus"></i></a></li>';
                   $("#userList").append(chat);
                      
                  });

              }
                if(rdata.length==0 || $("#userList").html()==''){
                  $(".user_record_not").show();
                }

         });

 });

}; 

let genrated_id = function(e){

    if(e.val()){

      var key = Object.keys(e.val())[0];
      s = key.split("_");
      n= Number(s[1])+Number(1);
     return groupId = 'group_'+n;

    }else{

      return 'group_1';
    }

}

$("#group_create").click(function(){

     var flag = 0;
    let groupName = $.trim(jQuery("#groupName").val());
    let group_img = $.trim(jQuery("#group_img").val());
    let groupDescription = $.trim(jQuery("#groupDescription").val());

    if (groupName == '' || groupName == '') {

        flag = 1;
        $('#groupName-err').html("Please enter group name");

    }else if (groupName.length>=25) {

        flag = 1;
        $('#groupName-err').html("You can't enter more than 25 characters");

    } else {

        $('#groupName-err').html("");

    }

    if (groupDescription == '' || groupDescription == '') {

        flag = 1;
        $('#groupDescription-err').html("Please enter group description");

    }else if (groupDescription.length>=200) {

        flag = 1;
        $('#groupDescription-err').html("You can't enter more than 200 characters");

    } else {

        $('#groupDescription-err').html("");

    }
    reciveIdRef = firebase.database().ref().child('tempData').child(senderId);
    reciveIdRef.once('value',function(rdata){

        rdata = rdata.val();

        if (rdata == null) {

          flag = 1;
          $('#group_member-err').html("Please select at least one group member");

        } else {

          $('#group_member-err').html("");
        }

    });

    if (flag) {

        return false;
    } 
    if(group_img){

      let groupImg = $("#group_img").prop("files")[0];
      var storageRef = firebase.storage().ref();
        var uploadTask = storageRef.child('group/'+ Date.now()).put(groupImg);
         uploadTask.on('state_changed', function(snapshot) {
            $(".loading").show();

          }, function(error) {
              alert(error)

          }, function() {

              uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {

                 reciveIdRef12 = firebase.database().ref().child('group').limitToLast(1);

                  reciveIdRef12.once('value',function(sdata){

                        let t = {

                            'memberId' : Number(senderId),
                            'profilePic' : getValue('ProfilePic1'),
                            'userName' : getValue('userName1'),
                            'type':'admin',
                            'firebaseToken':'',
                            'createdDate' : Date.now(),
                            'mute':0
                          };

                        firebase.database().ref('tempData').child(senderId).child(senderId).set(t);

                        reciveIdRef = firebase.database().ref().child('tempData').child(senderId);
                        reciveIdRef.once('value',function(rdata){

                            rdata = rdata.val();

                            if(rdata){

                              data = {

                                'groupName' : groupName,
                                'groupImg' : downloadURL,
                                'groupDescription' : groupDescription,
                                'adminId' : Number(senderId),
                                'member' : rdata,
                              };

                              firebase.database().ref().child('group').child(genrated_id(sdata)).set(data);
                              firebase.database().ref().child('group').child(genrated_id(sdata)).set(data);
                              memberCount = Object.keys(rdata).length;
                              setchatHistorymsg(genrated_id(sdata),groupName,downloadURL,'',memberCount,'first',0);                            

                            }

                        });

                  });

              

              });
          }); 
        }else{

            let downloadURL = 'http://koobi.co.uk:3000/uploads/default_group.png';

            reciveIdRef12 = firebase.database().ref().child('group').limitToLast(1);

            reciveIdRef12.once('value',function(sdata){

                  let t = {

                      'memberId' : Number(senderId),
                      'profilePic' : getValue('ProfilePic1'),
                      'userName' : getValue('userName1'),
                      'type':'admin',
                      'firebaseToken':'',
                      'createdDate' : Date.now(),
                      'mute':0
                    };

                  firebase.database().ref('tempData').child(senderId).child(senderId).set(t);

                  reciveIdRef = firebase.database().ref().child('tempData').child(senderId);
                  reciveIdRef.once('value',function(rdata){

                      rdata = rdata.val();

                      if(rdata){

                        data = {

                          'groupName' : groupName,
                          'groupImg' : downloadURL,
                          'groupDescription' : groupDescription,
                          'adminId' : Number(senderId),
                          'member' : rdata,
                        };

                        firebase.database().ref().child('group').child(genrated_id(sdata)).set(data);
                        firebase.database().ref().child('group').child(genrated_id(sdata)).set(data);
                        memberCount = Object.keys(rdata).length;
                        setchatHistorymsg(genrated_id(sdata),groupName,downloadURL,'',memberCount,'first',0);                            

                      }

                  });

            });

        }
   
});

let setchatHistorymsg = function(gorupId,groupName,downloadURL,msg='',memberCount='',dType='',messageType=''){


    reciveIdRef = firebase.database().ref().child('group').child(gorupId).child('member');
    reciveIdRef.once('value',function(rdata){
        rdata = rdata.val();
        if(rdata){

            $.each(rdata, function(i, item) {

              if(typeof item != "undefined" || item != null) {

                  reciveIdRef12 = firebase.database().ref().child('chat_history').child(item.memberId).child(gorupId);

                  reciveIdRef12.once('value',function(ddata){
                      var s = 0;
                      var favouriteStatus = 0;

                      if(ddata.val()){


                          if(item.memberId!=senderId){


                            var s = (ddata.val().unreadMessage) ? Number(ddata.val().unreadMessage)+Number(1) : 1;
                            var favouriteStatus = ddata.val().favourite;

                          }else{
                            var s = 0;
                           
                          }
                      }
                      let  data12 = {
                            'reciverId' : gorupId,
                            'senderId' : senderId,
                            'message' : msg,
                            'messageType' : messageType ? messageType : 0,
                            'timestamp' : Date.now(),
                            'type' : 'group',
                            'userName' : groupName,
                            'profilePic' : downloadURL,
                            'unreadMessage' : s,
                            'memberCount' : memberCount,
                            'favourite' : favouriteStatus,
                            'memberType' :  item.type
                        };

                      firebase.database().ref('chat_history/' + item.memberId).child(gorupId).set(data12);
                      firebase.database().ref().child('myGroup').child(item.memberId).child(gorupId).set(gorupId);
                      if(item.memberId!=senderId && item.mute!=1){

                         let to = item.firebaseToken;
                          if(to){

                            let notification = {
                              'title' : msg ? getValue('userName1')+" @ "+groupName : groupName,
                              'message' : msg ? messageType ? 'image' : msg : getValue('userName1')+' added you',
                              'body' : msg ? messageType ? 'image' : msg : getValue('userName1')+' added you',
                              'notifincationType' : '15',
                              "type": "groupChat",
                              "click_action": "ChatActivity",
                              "opponentChatId": gorupId,
                              'adminId' : getValue('adminId')
                            };



                            senNotifcation(to,notification,notification);

                          }else{

                            let webNotification = {
                              
                              'title' : msg ? getValue('userName1')+" @ "+groupName : groupName,
                              'body' : msg ? messageType ? 'image' : msg : getValue('userName1')+' added you',
                              'url':'/chat'
                            };
                            senWebNotifcation(item.memberId,webNotification);
                         }
                      }
                    
                  });
              }

           });
            if(dType=="first"){
                firebase.database().ref('tempData').child(senderId).set(null);  
                $(".loading").hide();
                $('#createGroup').modal('hide');
                $('.cmemberList').load(' .cmemberList');
                $("#profileImage").val('');
                $("#groupName").val('');
                $("#message").click();
            }else{
              $("#msg").val('');
              $("#fileInput").val('');
            }
       }
    });
}


var typingTimer;                //timer identifier
var doneTypingInterval = 100;  //time in ms, 5 second for example
var $input = $('#search_user'); // get input 

//on keyup, start the countdown
$input.on('keyup', function () {

clearTimeout(typingTimer);
typingTimer = setTimeout(allUserGet, doneTypingInterval); //"getChatHistory" is function for call
});

//on keydown, clear the countdown 
$input.on('keydown', function () {
clearTimeout(typingTimer);
});



let arraysearch = function(data,id){

  let array = $.map(data, function(value, index) {
      return [value];
  });
  let result = array.filter(function(o1){

      if(typeof o1 != "undefined" || o1 != null) {

        return o1.memberId==id;
      }

    }).map(function(o){

       return o;       
    });
   return result;  
}

let arrayNotsearch = function(data,id){

  let array = $.map(data, function(value, index) {
      return [value];
  });
  let result = array.filter(function(o1){

      if(typeof o1 != "undefined" || o1 != null) {

        return o1.memberId!=id;
      }

    }).map(function(o){

       return o;       
    });
   return result;  
}

let muteCheck = function(userId) {

    reciveIdRef = firebase.database().ref().child('group').child(userId).child('member').child(senderId);
    reciveIdRef.once('value',function(gdata){

        let data = gdata.val();
        

        if(data){

           if(data.mute==1){

              $("#mutei"+userId).html('<i class="fa fa-bell-slash"></i>');

           }else{

             $("#mutei"+userId).html('');
           
           }
        }
    });

}

let show_group_chat = function(userId='',uId='',urlId=''){
  $("#group").show();
  $("#user").hide();
  $("#broadcast").hide();
 if((userId=='') || (getValue('reciverId')!=$(userId).data('uid'))){

          $("#msg").val('');
          $("#fileInput").val('');
          $("#get_chat").html('');
          $(".loading").show();
          if(uId){

            userId = uId;
          
          }else{
              var membercount = $(userId).data('membercount');
              var profilepic = $(userId).data('profilepic');
              var username = $(userId).data('username');
              var userId = $(userId).data('uid');
              setValue('userName',username);
              setValue('ProfilePic',profilepic);
              setValue('memberCount',membercount);

          }

        setValue('reciverId',userId);
        setValue('type','group');
        getGroupChatDelete(userId);

        firebase.database().ref().child('group').child(userId).child('member').child(senderId).on('value',function(mdata){

            if(mdata.val()==null){
              $(".loading").show();
              getchatHistory();
              setTimeout(function(){ $(".loading").hide(); $(".first").click(); }, 1000);
            }
        });
/*        deviceTokenUpdate(userId);
*/      allUnreadMsgSet();
        reciveIdRef = firebase.database().ref().child('group').child(userId);
        reciveIdRef.on('value',function(gdata){

          let adminId = gdata.val().adminId;
          setValue('adminId',adminId);
          $(".description").html(gdata.val().groupDescription);


          var membercount = Object.keys(gdata.val().member).length;
          var data = arraysearch(gdata.val().member,senderId);


          setValue('memberCount',membercount)

          if(data){

           if(data[0].mute==1){

              $(".unmute").show();
              $(".mute").hide();
              $("#mutei"+userId).html('<i class="fa fa-bell-slash"></i>');

           }else{
              $(".unmute").hide();
              $(".mute").show();
              $("#mutei"+userId).html('');

           }
            setValue('joinCreatedDate',data ? data[0].createdDate: '');
          }

          setValue('startFrom','0');
          setValue('gMembercount',membercount);
          getGroupChat(userId);

          if(senderId==adminId){

            $("#group_add_new_member").show();
            $("#group_remove_member").show();
            $("#all_request").show();
            $("#group_delete").show();
            $("#adminRequest").hide();

          }else{

            $("#group_add_new_member").hide();
            $("#group_remove_member").hide();
            $("#all_request").hide();
            $("#group_delete").show();
            $("#adminRequest").show();
          } 

          setTimeout(function(){ $(".loading").hide();  clearTyping();   if(urlId=="me"){
              $(".first").click();
           
            }}, 2000);
            $(".user_img").html('<img src="'+getValue('ProfilePic')+'">');
            $(".user_name").html(getValue('userName'));
            $(".typing").html('<small id="typing'+userId+'" class=""></small>');
            $(".isOnline").html('<small id="isOnline'+userId+'" class="">'+membercount+' members</small>');
            $(".block_data").attr("id", "block_messgae"+userId);    
            $(".panel-footer").attr("id", "send_msg"+userId);
            $("#send_msg"+userId).show();
            $("#block_messgae"+userId).hide();

            getFavourite();


        });    
    }

}

$("#group_details").click(function(){
     allGroupMember();
      $("#group_edit").show();
     if(senderId!=getValue('adminId')){
        $("#group_edit").hide();
     }
    $("#group_details_modal").modal('show');
});

$("#group_edit").click(function(){
    $(".g_img").attr('src',getValue('ProfilePic'));
    $("#e_groupName").val(getValue('userName'));
    $("#group_details_modal").modal('hide');
    $("#group_edit_modal").modal('show');

});


$("#group_update").click(function(){

    var  flag = 0;
    let groupName = $.trim(jQuery("#e_groupName").val());
    let groupDescription = $.trim(jQuery("#e_groupDescription").val());
    let e_group_img = $.trim(jQuery("#e_group_img").val());
    let groupId = getValue('reciverId');
    if (groupName == '' || groupName == '') {

        flag = 1;
        $('#e_groupName-err').html("Please enter group name");

    }else if (groupName.length>=25) {

        flag = 1;
        $('#e_groupName-err').html("You can't enter more than 25 characters");

    } else {

        $('#e_groupName-err').html("");

    }

    if (groupDescription == '' || groupDescription == '') {

        flag = 1;
        $('#e_groupDescription-err').html("Please enter group description");

    }else if (groupDescription.length>=200) {

        flag = 1;
        $('#e_groupDescription-err').html("You can't enter more than 200 characters");

    } else {

        $('#e_groupDescription-err').html("");

    }
    if (flag) {

        return false;
    } 

    firebase.database().ref().child('group').child(groupId).child('groupName').set(groupName);
    firebase.database().ref().child('group').child(groupId).child('groupDescription').set(groupDescription);
    setchatHistoryUpdate(groupId,'userName',groupName);
    setValue('userName',groupName);
    $(".user_name").html(getValue('userName'));

    if(e_group_img){

      let groupImg = $("#e_group_img").prop("files")[0];
      var storageRef = firebase.storage().ref();
      var uploadTask = storageRef.child('group/'+ Date.now()).put(groupImg);

       uploadTask.on('state_changed', function(snapshot) {
        }, function(error) {
            alert(error)

        }, function() {

          uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {

            firebase.database().ref().child('group').child(groupId).child('groupImg').set(downloadURL);
            setchatHistoryUpdate(groupId,'profilePic',downloadURL);
              setValue('ProfilePic',downloadURL);
              $(".user_img").html('<img src="'+getValue('ProfilePic')+'">');
          });
      });
    }
 
    $('#group_edit_modal').modal('hide');

});


let setchatHistoryUpdate = function(gorupId,key,data){


    reciveIdRef = firebase.database().ref().child('group').child(gorupId).child('member');
    reciveIdRef.once('value',function(rdata){
        rdata = rdata.val();
        if(rdata){

            $.each(rdata, function(i, item) {

            if(typeof item != "undefined" || item != null) {
                
               firebase.database().ref('chat_history/' + item.memberId).child(gorupId).child(key).set(data);            
     
              }

           });

       }
    });
}



let gMember_filter = function(data){

   let members = data.filter(function(o1){
        return o1.type == 'member';

    }).map(function(o){

       return o;       
    });


    let admin = data.filter(function(o1){
        return o1.type == 'admin';

    }).map(function(o){

       return o;       
    });

    members.unshift(admin[0]); 
    data = members;
    let result = data.filter(function(o1){
        return o1.memberId != senderId;

    }).map(function(o){

       return o;       
    });

  let result2 = data.filter(function(o1){
        return o1.memberId == senderId;

    }).map(function(o){

       return o;       
    });

   result.push(result2[0]);
   return result;  
}

let allGroupMember = function(){

  let reciverId = getValue('reciverId');

  member = firebase.database().ref().child('group').child(reciverId).child('member');
    member.on('value',function(rdata12){
        mdata = rdata12.val();

        if(mdata){

            mdata = arrayFliter(mdata);
            mdata = gMember_filter(mdata);
            $("#gMemberList").html(''); 
            $.each(mdata, function(i, item) {
              type = (item.type=='admin') ? '<small class="badge badge-success pull-right" style="margin-top: 15px;"> Group Admin</small>' : (getValue('adminId')==senderId) ? '<a href="javascript:void(0);" class="btn btn-theme" title="Remove" onclick="remove_g_member(this);" data-memberid = "'+item.memberId+'"><i class="fa fa-times"></i></a>' : '';
              userName = (item.memberId==senderId) ? 'You' : item.userName;
              chat = '<li id="add_member'+item.memberId+'"><span><img src="'+item.profilePic+'">'+userName+'</span>'+type+'</li><hr>';
              $("#gMemberList").append(chat);

            });
      }

    });  

}; 

let remove_g_member = function(e){

    let reciverId = getValue('reciverId');
    membeerId = $(e).data('memberid');
    firebase.database().ref('chat_history').child(membeerId).child(reciverId).set(null);
    firebase.database().ref().child('group').child(reciverId).child('member').child(membeerId).set(null);
    firebase.database().ref().child('myGroup').child(membeerId).set(null);

}


/*var deviceTokenUpdate = function(group_id){
  
  firebase.database().ref("users").on('value', function(userData){
    if(userData.val()){
      let userData = userData.val();
      $.each(userData, function(i, item) {



      });
    }

  });

}
*/
let sendGroupMsg = function(downloadURL=''){


      let msg =  $.trim($("#msg").val());
      $("#msg").val('');
      $("#fileInput").val('');
      if((msg.length>0 || downloadURL!='') && (senderId!=getValue('reciverId'))){

              let reciverId = getValue('reciverId');
              let userName = getValue('userName');
              let ProfilePic = getValue('ProfilePic');
              let userName1 = getValue('userName1');
              let ProfilePic1 = getValue('ProfilePic1');
              let user_online = getValue('user_online');
              let memberCount = getValue('memberCount');
              a = {};
              a[senderId] = senderId;
              let data = {
                'reciverId' : reciverId,
                'senderId' : senderId,
                'message' : downloadURL ? downloadURL : msg,
                'readStatus' : 0,
                'messageType' : downloadURL ? 1 : 0,
                'userName' : userName1,
                'timestamp' : Date.now(),
                'readMember' : a,
                'memberCount' : memberCount,
              };

              firebase.database().ref('groupChat').child(reciverId).push(data);
 
              setchatHistorymsg(reciverId,userName,ProfilePic,data.message,memberCount,'',data.messageType);  
              setValue('startFrom','0');         
              $('#slimScrollDiv').animate({scrollTop: $('#slimScrollDiv').prop("scrollHeight")}, 1);
    }

}


let readUserUpdate = function(userId,key){
 
   firebase.database().ref().child('groupChat').child(userId).child(key).child('readMember').child(senderId).set(senderId);
    
}

let readStatusUpdate = function(userId,key){
   firebase.database().ref().child('groupChat').child(userId).child(key).child('readStatus').set(2);
    
}



let allUnreadMsgSet = function(){

    let reciverId = getValue('reciverId');
    firebase.database().ref('chat_history').child(senderId).child(reciverId).child('unreadMessage').once('value',function(rdata){
      if(rdata.val()){
        console.log(rdata.val());
        firebase.database().ref('chat_history').child(senderId).child(reciverId).child('unreadMessage').set(0);
      }
    });
}

let getGroupChat = function(userId){
 
  setValue('dateC','0');

  let startFrom = Number(getValue('startFrom'));
  getGroupChatData = firebase.database().ref().child('groupChat').child(userId).limitToLast(15);

  if(startFrom){

    getGroupChatData = firebase.database().ref().child('groupChat').child(userId).orderByChild("timestamp").endAt(startFrom).limitToLast(15);
  }

  getGroupChatData.on('value',function(rdata){
      rdata = rdata.val();
      setValue('startFrom',0);
      msgC = 1;

      if(rdata){


         if (getValue('startFrom') == 0) {

            var keys = Object.keys(rdata);
            k = keys[0];
            setValue('startFrom',rdata[k].timestamp);

          }
          oldTime = getValue('time'+userId);
          if(getValue('reciverId')==userId){
              
              
              $.each(rdata, function(i, item) {
                if(item.readStatus!=2 && item.senderId!=senderId){
                readUserUpdate(userId,i);
                }
                  read = 'unread';

                if(((item.timestamp>oldTime) || oldTime=='')&& item.timestamp>getValue('joinCreatedDate')){
                   if(item.memberCount==Object.keys(item.readMember).length && item.readStatus!=2){
                       readStatusUpdate(userId,i);
                       read = 'read';
                   }
                  Time = moment(item.timestamp).format("hh:mm A");
                  get_msg_label(startFrom,item.timestamp);

                    var c = (senderId==item.senderId) ? 'speech-right': '';
                    msg = stringReplace(item.message);
                    message = item.messageType==0 ? "<pre>"+msg+"</pre>" : " <a href='JavaScript:void(0);'><img src='"+item.message+"' class='img-rounded' width='150' height='120' onclick='showImage(this.src);'></a>";
                    $('#'+item.timestamp).remove();          
                    userName = (senderId!=item.senderId) ? item.userName: '';
                    chat = '<li id="'+item.timestamp+'" class="mar-btm">'+userName+'<div class="media-body pad-hor '+c+'"><div class="speech"><p>'+message+'</p><div class="'+read+'"  id="read'+item.timestamp+'"><i class="fa fa-check" aria-hidden="true"></i><i id="unred'+item.timestamp+'" class="fa fa-check" aria-hidden="true"></i></div></div><p class="speech-time">'+Time+'</p></div></li>';
                    startFrom==0 ? $("#get_chat").append(chat) : $("#get_chat1").append(chat);
                    (senderId!=item.senderId) ? $('#read'+item.timestamp).remove() : '';
                    (item.readStatus==1) ? $("#unred"+item.timestamp).hide() : $("#unred"+item.timestamp).show();

                    msgC++;
                }else{
                  $("#get_chat").html('');
                } 
            });

          }
          
          allUnreadMsgSet();


         if(read=="read" && getValue('reciverId')==userId){

              $(".unread").removeClass('unread').addClass('read');

         }
          if (msgC <= 15) {
             setValue('startFrom',0);
          }
     
         if(startFrom==0){

            $('#slimScrollDiv').animate({scrollTop: $('#slimScrollDiv').prop("scrollHeight")}, 1);

         }else{

            let get_chat1 = $("#get_chat1").html();
            $("#get_chat").prepend(get_chat1);
            $("#get_chat1").html('');
            $("#slimScrollDiv").animate({scrollTop: $("#slimScrollDiv").height()}, 1);
         }
      }else{
        $("#get_chat").html('');
      }
  });

}



let getGroupChatDelete = function(userId){

    deleteBy = firebase.database().ref().child('group_msg_delete').child(senderId).child(userId);
    deleteBy.on('value',function(ddata){
        data = ddata.val() ? ddata.val().deleteBy : '';
        setValue('time'+userId,data);
       
    });

}
$("#group_delete_chat").click(function() {

      swal({
            title: "Are you sure?",
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
                firebase.database().ref('chat_history').child(senderId).child(reciverId).child('message').set('');
                firebase.database().ref('chat_history').child(senderId).child(reciverId).child('messageType').set('');
                firebase.database().ref('group_msg_delete').child(senderId).child(reciverId).child('deleteBy').set(Date.now());
/*                getGroupChat(reciverId);
*/

            }
        });
});

$("#group_delete").click(function() {

      swal({
            title: "Are you sure?",
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
                let reciverId = getValue('reciverId');
                let gMembercount = getValue('gMembercount');
                let adminId = getValue('adminId');

                if(gMembercount==1){

                    firebase.database().ref('chat_history').child(senderId).child(reciverId).set(null);
                    firebase.database().ref().child('group').child(reciverId).set(null);
                    firebase.database().ref().child('myGroup').child(senderId).child(reciverId).set(null);

                }else{
                  if (adminId!=senderId){
                    firebase.database().ref('chat_history').child(senderId).child(reciverId).set(null);
                    firebase.database().ref().child('group').child(reciverId).child('member').child(senderId).set(null);
                    firebase.database().ref().child('myGroup').child(senderId).child(reciverId).set(null);
                    $(".first").click();
                  }else{

                    $("#group_admin_model").modal('show');
                    allGroupAdminMember();

                  }
              }

            }
        });
});


let allGroupAdminMember = function(){

  let reciverId = getValue('reciverId');

  member = firebase.database().ref().child('group').child(reciverId).child('member');
    member.on('value',function(rdata12){
        mdata = rdata12.val();
        $(".add_alll_user_record_not").hide();
        if(mdata){

            mdata = arrayFliter(mdata);
            $("#admin_gMemberList").html(''); 

            $.each(mdata, function(i, item) {
              
              if(item.type!='admin'){
              
                type = '<span class="pull-right"><input name="admindata" type="radio" value="'+item.memberId+'" data-firebase_token = "'+item.firebaseToken+'" data-user_name = "'+item.userName+'" data-member_id = "'+item.memberId+'" data-profile_pic = "'+item.profilePic+'"></span>';
                userName = (item.memberId==senderId) ? 'You' : item.userName;
                chat = '<li id="add_member'+item.memberId+'"><span><img src="'+item.profilePic+'">'+userName+'</span>'+type+'</li><hr>';
                $("#admin_gMemberList").append(chat);
              }

            });
      }else{
       
         $(".admin_gMemberList").show();
         $("#admin_gMemberList").html(''); 


      }

    });  

}; 

$("#group_add_admin").click(function(){

    var e = $('input[name=admindata]:checked');
    let group_id = getValue('reciverId');
    let ProfilePic1 = getValue('ProfilePic1');
    let userName = getValue('userName1');
    var  flag = 0;
    let admindata = e.val();

    if (typeof admindata == 'undefined') {

        flag = 1;
        $('#add_group_admin_member-err').html("Please select user");

    } else {

        $('#add_group_admin_member-err').html("");

    }

    if (flag) {

        return false;
    }    
    
    let  data12 = {

        'userName' : userName,
        'profilePic' : ProfilePic1,
        'senderId' : senderId,
        'createdDate' : Date.now()
    };
    firebase.database().ref('group').child(group_id).child('adminRequest').set(null);
    firebase.database().ref('group').child(group_id).child('adminRequest').child(admindata).set(data12);
    $('#group_admin_model').modal('hide');
    errorMsg('Admin request send sucessfully');
});

$("#adminRequest").click(function(){
  $("#group_admin_request_model").modal('show');
  allGroupAdminRequest();

});


let allGroupAdminRequest = function(){

  let reciverId = getValue('reciverId');
  $(".r_no_msg").hide();
  member = firebase.database().ref().child('group').child(reciverId).child('adminRequest').child(senderId);
    member.on('value',function(rdata12){
        mdata = rdata12.val();
        $("#a_req"+reciverId).remove();

        if(mdata){
          $("#r_action").show();
          $(".r_no_msg").hide();
          time = moment(mdata.createdDate).fromNow();
          type = '<small class="pull-right">'+time+'</small>';
          chat = '<div id="a_req'+reciverId+'"><li><span><img src="'+mdata.profilePic+'">'+mdata.userName+'</span>'+type+'</li><hr></div>';
          $("#admin_req").append(chat);
        }else{

          $("#r_action").hide();
          $(".r_no_msg").show();
        }

    });  

}; 

$("#group_admin_reject").click(function(){

    let group_id = getValue('reciverId');   
    firebase.database().ref('group').child(group_id).child('adminRequest').set(null);
    $('#group_admin_request_model').modal('hide');
    errorMsg('Admin request rejected sucessfully');
});


$("#group_admin_accept").click(function(){
  let group_id = getValue('reciverId');
  let adminId = getValue('adminId'); 
  firebase.database().ref('group').child(group_id).child('adminRequest').set(null);
  firebase.database().ref('group').child(group_id).child('member').child(adminId).set(null);
  firebase.database().ref('group').child(group_id).child('adminId').set(senderId);
  firebase.database().ref('group').child(group_id).child('member').child(senderId).child('type').set('admin');
  firebase.database().ref('myGroup').child(adminId).child(group_id).set(null);
  firebase.database().ref('chat_history').child(adminId).child(group_id).set(null);
  $('#group_admin_request_model').modal('hide');
  errorMsg('Admin request accepted sucessfully');


});

$(".group_img").change(function(){

  input = this;

  if (input.files && input.files[0]) {    

    size = (input.files[0].size/1024).toFixed(2);

      let fileExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp'];
      if ($.inArray($(input).val().split('.').pop().toLowerCase(), fileExtension) == -1) {

        $('#group_img-err').html("Only this formats are allowed : "+fileExtension.join(', '));
        $('#e_group_img-err').html("Only this formats are allowed : "+fileExtension.join(', '));

      }else if(size>10240){
        
        $('#group_img-err').html("You can't upload more than 10 mb image size");
        $('#e_group_img-err').html("You can't upload more than 10 mb image size");
      
      }else{

          let reader = new FileReader();

          reader.onload = function(e) {

            $('.pImg').attr('src', e.target.result);
            $('#group_img-err').html('');
            $('#e_group_img-err').html('');

          }

          reader.readAsDataURL(input.files[0]);
      }

  }else{

    $('.pImg').attr('src','http://koobi.co.uk:3000/uploads/default_group.png');
    $('#group_img-err').html('');
    $('#e_group_img-err').html('');
  }

});

$("#group_add_new_member").click(function(){

  $("#add_group_member-err").html('');
  $("#group_add_new_member123").modal('show');
  firebase.database().ref('tempData').child(senderId).set(null); 
  allUserGet123();

});



let allUserGet123 = function(){

  let reciverId = getValue('reciverId');

  member = firebase.database().ref().child('group').child(reciverId).child('member');
    member.on('value',function(rdata12){
        mdata = rdata12.val();

        if(mdata){

            mdata = arrayFliter(mdata);

            reciveIdRef12 = firebase.database().ref().child('tempData').child(senderId);
            reciveIdRef12.on('value',function(tdata){

                 reciveIdRef = firebase.database().ref().child('users');
                    reciveIdRef.on('value',function(rdata){

                        rdata = arrayFliter(rdata.val());

                        if(tdata.val()){
                           tdata = arrayFliter(tdata.val());

                            rdata =  arrayshortbyunide(rdata,tdata);

                        }

                      rdata =  arrayshortbyunide(rdata,mdata);

                       if(rdata){
                          $("#add_userList").html(''); 
                          $(".add_user_record_not").hide();
                          $.each(rdata, function(i, item) {
                           chat = '<li id="add_member'+item.uId+'"><span><img src="'+item.profilePic+'"> @'+item.userName+'</span><a href="javascript:void(0);" class="btn btn-theme" onclick="add_user(this);" data-profile ="'+item.profilePic+'" data-username="'+item.userName+'" data-uid = "'+item.uId+'" data-token = "'+item.firebaseToken+'" title="Add"><i class="fa fa-plus"></i></a></li>';
                           $("#add_userList").append(chat);
                              
                          });

                      }
                        if(rdata.length==0 || $("#add_userList").html()==''){
                          $(".add_user_record_not").show();
                        }

                 });

          });
      }

    });  

}; 



$("#group_add_member").click(function(){

     var flag = 0;
    reciveIdRef = firebase.database().ref().child('tempData').child(senderId);
    reciveIdRef.once('value',function(rdata){
      rdata = rdata.val();
      if (rdata == null) {
        flag = 1;
        $('#add_group_member-err').html("Please select at least one group member");

      } else {

        $('#add_group_member-err').html("");
    }

    });

    if (flag) {
        return false;
    } 

    reciveIdRef = firebase.database().ref().child('tempData').child(senderId);
    reciveIdRef.once('value',function(rdata){
          rdata1 = rdata.val();
          if(rdata1){
            $.each(rdata1, function(i, item) {
              if(typeof item != "undefined" || item != null) {

                reciverId = getValue('reciverId');

                 let  data12 = {

                      'firebaseToken' : item.firebaseToken,
                      'memberId' : item.memberId,
                      'profilePic' : item.profilePic,
                      'type' : item.type,
                      'userName' : item.userName,
                      'createdDate' : Date.now(),
                      'mute' : 0                      
                  };
                firebase.database().ref().child('group').child(reciverId).child('member').child(item.memberId).set(data12);

                 let  chatData = {
                            'reciverId' : reciverId,
                            'senderId' : senderId,
                            'message' : '',
                            'messageType' :0,
                            'timestamp' : Date.now(),
                            'type' : 'group',
                            'userName' : getValue('userName'),
                            'profilePic' : getValue('ProfilePic'),
                            'unreadMessage' : 0,
                            'memberCount' : getValue('memberCount'),
                            'favourite' : 0,
                            'memberType' : ''
                        };

                        firebase.database().ref('chat_history/' + item.memberId).child(reciverId).set(chatData);
                        firebase.database().ref().child('myGroup').child(item.memberId).child(reciverId).set(reciverId);

                        let groupName = getValue('userName');
                         let to = item.firebaseToken;
                          if(to){
                            
                            let notification = {

                              'title' : msg ? getValue('userName1')+" @ "+groupName : groupName,
                              'message' :  getValue('userName1')+' added you',
                              'body' :  getValue('userName1')+' added you',
                              'notifincationType' : '15',
                              "type": "groupChat",
                              "click_action": "ChatActivity",
                              "opponentChatId" : reciverId,
                              'adminId' : getValue('adminId')

                            };

                          senNotifcation(to,notification,notification);

                          }else{

                            let webNotification = {
                              
                              'title' : msg ? getValue('userName1')+" @ "+groupName : groupName,
                              'body' :  getValue('userName1')+' added you',
                              'url':'/chat'
                            };
                            senWebNotifcation(item.memberId,webNotification);
                         }

                }

            }); 

            firebase.database().ref('tempData').child(senderId).set(null);  
            $(".loading").hide();
            $('#group_add_new_member123').modal('hide');
            $('.add_memberList').load(' .add_memberList');                             

          }

    });

});


$(".mute").click(function(){

  let reciverId = getValue('reciverId');

    reciveIdRef = firebase.database().ref().child('group').child(reciverId).child('member').child(senderId).child('mute').set(1);

});


$(".unmute").click(function(){

  let reciverId = getValue('reciverId');

    reciveIdRef = firebase.database().ref().child('group').child(reciverId).child('member').child(senderId).child('mute').set(0);

});

$("#group_report").click(function(){

    $("#group_report_modal").modal('show');
    $("#r_title").val('');
    $("#r_description").val('');
});


$("#report_group").click(function(){

     var flag = 0;
    let r_title = $.trim(jQuery("#r_title").val());
    let r_description = $.trim(jQuery("#r_description").val());

    if (r_title == '' || r_title == '') {

        flag = 1;
        $('#r_title-err').html("Please enter title");

    }else if (r_title.length>=50) {

        flag = 1;
        $('#r_title-err').html("You can't enter more than 50 characters");

    } else {

        $('#r_title-err').html("");

    }

    if (r_description == '' || r_description == '') {

        flag = 1;
        $('#r_description-err').html("Please enter description");

    }else if (r_description.length>=200) {

        flag = 1;
        $('#r_description-err').html("You can't enter more than 200 characters");

    } else {

        $('#r_description-err').html("");

    }
    if (flag) {

        return false;
    } 

    let groupId = getValue('reciverId');
    let adminId = getValue('adminId');

    let data = {

        'groupId' : groupId,
        'senderId' : senderId,
        'title' : r_title,
        'description' : r_description,
        'adminId' : adminId,
        'type': 'Group',
        'timestamp' : Date.now()
      };

    firebase.database().ref().child('group_report').child(groupId).push(data);
    $('#group_report_modal').modal('hide');
    errorMsg('Report send sucessfully');
});


/* broadcast start module*/

let broadcast = function(){

    firebase.database().ref('tempData').child(senderId).set(null); 
    $("#broadcast_msg").modal('show');
   broadCastlUserGet(); 

}


let broadCastlUserGet = function(){

    reciveIdRef12 = firebase.database().ref().child('tempData').child(senderId);
    reciveIdRef12.on('value',function(tdata){
  
      var search = $.trim($("#broadcast_search_user").val());
      var search = search.toLowerCase();
       reciveIdRef = firebase.database().ref().child('users');
            reciveIdRef.on('value',function(rdata){

                rdata = arrayFliter(rdata.val());

                if(tdata.val()){
                   tdata = arrayFliter(tdata.val());

                    rdata =  arrayshortbyunide(rdata,tdata);
                }

               if(rdata){
                  $("#broadcastUser").html(''); 
                  $(".broadcast_record_not").hide();
                  if(search){
                    var rdata = rdata.filter(function(itm){
                      userName = (itm.userName).toLowerCase()
                      return userName.indexOf(search) != -1;
                    });
                  
                  }


                  $.each(rdata, function(i, item) {
                   chat = '<li id="add_member'+item.uId+'"><span><img src="'+item.profilePic+'"> @'+item.userName+'</span><a href="javascript:void(0);" class="btn btn-theme" onclick="add_user(this);" data-profile ="'+item.profilePic+'" data-username="'+item.userName+'" data-uid = "'+item.uId+'" data-token = "'+item.firebaseToken+'" title="Add"><i class="fa fa-plus"></i></a></li>';
                   $("#broadcastUser").append(chat);
                      
                  });

              }
              if(rdata.length==0 || $("#broadcastUser").html()==''){
                $(".broadcast_record_not").show();
              }

         });

 });

}; 

var typingTimer;                //timer identifier
var doneTypingInterval = 100;  //time in ms, 1 second for example
var $input = $('#broadcast_search_user'); // get input 

//on keyup, start the countdown
$input.on('keyup', function () {

  clearTimeout(typingTimer);
  typingTimer = setTimeout(broadCastlUserGet, doneTypingInterval); //"broadCastlUserGet" is function for call
});

//on keydown, clear the countdown 
$input.on('keydown', function () {
  clearTimeout(typingTimer);
});


let genrated_broadcast_id = function(e){

    if(e.val()){

      var key = Object.keys(e.val())[0];
      s = key.split("_");
      n= Number(s[1])+Number(1);
     return groupId = 'broadcast_'+n;

    }else{

      return 'broadcast_1';
    }

}
$("#send_Broadcast").click(function(){

     var flag = 0;
    reciveIdRef = firebase.database().ref().child('tempData').child(senderId);
    reciveIdRef.once('value',function(rdata){

        rdata = rdata.val();

        if (rdata == null) {

          flag = 1;
          $('#broadcast_member-err').html("Please select at least two member");

        }else if ( Object.keys(rdata).length < 2) {

          flag = 1;
          $('#broadcast_member-err').html("Please select at least two member");

        } else {

          $('#broadcast_member-err').html("");
        }

    });

    if (flag) {

        return false;
    } 

     reciveIdRef12 = firebase.database().ref().child('broadcast').limitToLast(1);

      reciveIdRef12.once('value',function(sdata){


            reciveIdRef = firebase.database().ref().child('tempData').child(senderId);
            reciveIdRef.once('value',function(rdata){

                rdata = rdata.val();

                if(rdata){

                  data = {

                    'groupName' : Object.keys(rdata).length+" Members",
                    'groupImg' : 'http://koobi.co.uk:3000/front/img/loader.png',
                    'adminId' : Number(senderId),
                    'member' : rdata
                  };

                  firebase.database().ref().child('broadcast').child(genrated_broadcast_id(sdata)).set(data);
                  firebase.database().ref('tempData').child(senderId).set(null); 
                  let  data12 = {
                          'reciverId' : genrated_broadcast_id(sdata),
                          'senderId' : senderId,
                          'message' : '',
                          'messageType' : 0,
                          'timestamp' : Date.now(),
                          'type' : 'broadcast',
                          'userName' : data.groupName,
                          'profilePic' : data.groupImg,
                          'unreadMessage' : 0,
                          'memberCount' : Object.keys(rdata).length,
                          'favourite' : 0,
                          'memberType' : ''
                      };
                   firebase.database().ref('chat_history/' + senderId).child(genrated_broadcast_id(sdata)).set(data12);
                     
                  $("#broadcast_msg").modal('hide');

                }

            });

      });
   
});



let show_broadcast_chat = function(userId='',uId='',urlId=''){
  $("#broadcast").show();
  $("#user").hide();
  $("#group").hide();
  $(".block_data").hide();

  if((userId=='') || (getValue('reciverId')!=$(userId).data('uid'))){

          $("#msg").val('');
          $("#fileInput").val('');
          $("#get_chat").html('');
          $(".loading").show();
          if(uId){

            userId = uId;
          
          }else{
              var membercount = $(userId).data('membercount');
              var profilepic = $(userId).data('profilepic');
              var username = $(userId).data('username');
              var userId = $(userId).data('uid');
              setValue('userName',username);
              setValue('ProfilePic',profilepic);

          }
        setValue('reciverId',userId);
        setValue('startFrom','0');
        m = username.split(" ");
        setValue('b_membercount',m[0]);
        
        setValue('type','broadcast');
        setTimeout(function(){ $(".loading").hide();  clearTyping();   if(urlId=="me"){
                  $(".first").click();
               
                }}, 2000);
        getbroadCastChat(userId);

        $(".user_img").html('<img src="'+getValue('ProfilePic')+'">');
        $(".user_name").html(getValue('userName'));
        $(".panel-footer").attr("id", "send_msg"+userId);
        $("#send_msg"+userId).show();
        $("#block_messgae"+userId).hide();
        $(".isOnline").html('');
    }

}


var getbroadCastChat = function(userId){

  setValue('dateC','0');


  var startFrom = Number(getValue('startFrom'));
  reciveIdRef = firebase.database().ref().child('broadcastChat').child(userId).limitToLast(60);

  if(startFrom){

    reciveIdRef = firebase.database().ref().child('broadcastChat').child(userId).orderByChild("timestamp").endAt(startFrom).limitToLast(15);
  }

  reciveIdRef.on('value',function(rdata){

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
                (item.readStatus==1) ? $("#unred"+item.timestamp).hide() : $("#unred"+item.timestamp).hide();

                msgC++; 
            });
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


let sendBroadcastMsg = function(downloadURL=''){


      let msg =  $.trim($("#msg").val());
      $("#msg").val('');
      $("#fileInput").val('');
      if((msg.length>0 || downloadURL!='') && (senderId!=getValue('reciverId'))){

              let reciverId = getValue('reciverId');
              let userName = getValue('userName');
              let ProfilePic = getValue('ProfilePic');
              let userName1 = getValue('userName1');
              let ProfilePic1 = getValue('ProfilePic1');
              let user_online = getValue('user_online');

              let data = {
                'reciverId' : reciverId,
                'senderId' : senderId,
                'message' : downloadURL ? downloadURL : msg,
                'readStatus' : 0,
                'messageType' : downloadURL ? 1 : 0,
                'timestamp' : Date.now()
              };

              firebase.database().ref('broadcastChat').child(reciverId).push(data);

              data.userName = userName; 
              data.profilePic = ProfilePic; 
              data.unreadMessage = 0;
              data.memberCount = 0;
              data.type = "broadcast"; 

              firebase.database().ref('chat_history/' + senderId).child(reciverId).set(data);
              sendBroadcasttHistorymsg(reciverId,userName1,ProfilePic1,data.message,data.messageType);           
              $('#slimScrollDiv').animate({scrollTop: $('#slimScrollDiv').prop("scrollHeight")}, 1);
              getbroadCastChat(reciverId);
    }

}
let sendBroadcasttHistorymsg = function(bId,bName,profilePic,msg,messageType){

    reciveIdRef = firebase.database().ref().child('broadcast').child(bId).child('member');
    reciveIdRef.once('value',function(rdata){
        rdata = rdata.val();

        if(rdata){
            $.each(rdata, function(i, item) {

              if(typeof item != "undefined" || item != null) {

                  var membeerId = item.memberId;
                  var chatRoom = senderId+"_"+membeerId; 
                  if(Number(senderId)>Number(membeerId)){
                    var chatRoom = membeerId+"_"+senderId; 
                  }

                firebase.database().ref("block_users").child(chatRoom).once('value', function(snapshot) {
                  if (snapshot.exists()) {

                  }else{

                    reciveIdRef12 = firebase.database().ref().child('chat_history').child(item.memberId).child(bId);

                    reciveIdRef12.once('value',function(ddata){
                        var s = 0;
                        var favouriteStatus = 0;

                        if(ddata.val()){

                            if(item.memberId!=senderId){

                              var s = (ddata.val().unreadMessage) ? Number(ddata.val().unreadMessage)+Number(1) : 1;
                              var favouriteStatus = ddata.val().favouriteStatus;

                            }else{

                              var s = 0;
                            }
                        }
                        let  data12 = {
                              'reciverId' : item.memberId,
                              'senderId' : senderId,
                              'message' : msg,
                              'messageType' : messageType,
                              'timestamp' : Date.now(),
                              'type' : 'user',
                              'userName' : bName,
                              'profilePic' : profilePic,
                              'unreadMessage' : s,
                              'memberCount' : 0,
                              'favourite' : favouriteStatus,
                              'memberType' : ''
                          };

                        firebase.database().ref('chat_history/' + item.memberId).child(senderId).set(data12);

                        var  data = {
                            'reciverId' : item.memberId,
                            'senderId' : senderId,
                            'message' : msg,
                            'readStatus' : 0,
                            'messageType' : messageType,
                            'timestamp' : Date.now(),
                        };
                        firebase.database().ref('chat').child(item.memberId).child(senderId).push(data);
                        firebase.database().ref('chat').child(senderId).child(item.memberId).push(data);

                         let to = item.firebaseToken;
                          if(to){

                             let notification = {

                                'title' : getValue('userName1'),
                                'message' : msg,
                                'body' :  msg,
                                "type": "chat",
                                "notifincationType": "15",
                                "click_action": "ChatActivity",
                                "opponentChatId" : senderId

                              };

                            senNotifcation(to,notification,notification);

                          }else{

                            let webNotification = {
                              
                              'title' : getValue('userName1'),
                              'body' : messageType ? 'image' : msg ,
                              'url':'/chat?uId='+ item.memberId
                            };
                            senWebNotifcation(item.memberId,webNotification);
                         }
                      
                    });
                  
                  }

                });
              }

           });
            
       }
    });
}
/* broadcast module end*/

let joinFilter = function(mData,data,reqData){
   
        rdata = [];
        $.each(data, function(i, item) {
          

          var d = mData.filter(function(itm){
                return itm.indexOf(i) != -1;
              });
          if(d==''){
            if(reqData){

              var s = reqData.filter(function(itm){
                return itm.indexOf(i) != -1;
              });
              
              if(s==''){
                
                item['groupId'] = i;
                rdata.push(item);
              
              }

            }else{
              item['groupId'] = i;
              rdata.push(item);
            }
          }
        });
        return rdata;
}

let groupAdminDataGet = function(data){

    data = arrayshort(data);

    let result = data.filter(function(o1){


            return o1.type == 'admin';          // assumes unique id

    }).map(function(o){

       return o;       
    });
   return result;  
}


let getAllGroup = function(){

  $(".chatFilter").hide();
  $("#joinGroup").show();
  $(".backButton").show();
  $("#chatHistory").hide();

   myGroupR = firebase.database().ref().child('my_group_request').child(senderId);
    myGroupR.on('value',function(Rdata){

      myGroup = firebase.database().ref().child('myGroup').child(senderId);
          myGroup.on('value',function(mdata){
        reciveIdRef = firebase.database().ref().child('group');
                reciveIdRef.on('value',function(rdata){

                    rdata2 = rdata.val();
                    mdata = arrayshort(mdata.val());
                    reqData = arrayshort(Rdata.val());
                    rdata = joinFilter(mdata,rdata2,reqData); 
                   $("#joinGroup").html(''); 
               
                    if(rdata){

                      s = 0;

                      $.each(rdata, function(i, item) {
                        if(typeof item != "undefined" || item != null) {
                           admin = groupAdminDataGet(item.member);
                           let firebaseToken = (admin!='') ? admin[0].firebaseToken : '';

                          chat = '<span class="list-group-item" id="'+item.groupId+'"><div class="media"><img class="rounded-circle float-left d-flex mr-3" src="'+item.groupImg+'"><div class="media-middle media-body"><h5 class="media-heading">'+item.groupName+'</h5><a class="lastTime mutetxt" href="javascript:void(0);" onclick="send_g_request(this);"  data-group_id="'+item.groupId+'" data-admin_id="'+item.adminId+'" data-firebaseToken="'+firebaseToken+'" data-group_name="'+item.groupName+'">Join</a></div></div></span>';
                          $("#joinGroup").append(chat);

                          s++;
                        }

                      });

                  }

             });
      });

  });


}

let send_g_request = function(e){
    
    let group_id = $(e).data('group_id');
    let admin_id = $(e).data('admin_id');
    let to = $(e).data('firebaseToken');
    let groupName = $(e).data('group_name');
    let userName = getValue('userName1');
    $("#"+group_id).remove();     
    
    let  data12 = {
            'groupId' : group_id,
            'senderId' : senderId,
            'timestamp' : Date.now(),
        };

    firebase.database().ref('group_request').child(admin_id).push(data12);
    firebase.database().ref('my_group_request').child(senderId).child(group_id).set(group_id);
    let msg = userName+' send a request to join '+groupName+' group.';
    let title = 'Group request';
    if(to){

      let notification = {
        'title' : title,
        'body' : msg,
        'message' : msg,
        'notifincationType' : 15,
        'click_action' : 'ChatActivity',
        'type' : 'chat',
        'opponentChatId' : group_id,
        'adminId' : getValue('adminId')
      };

      senNotifcation(to,notification,notification);

    }else{

      let webNotification = {
        
        'title' : title,
        'body' : msg,
        'url': ''
      };
      senWebNotifcation(admin_id,webNotification);
    }

}


let getGroupRequest = function(){

  $(".chatFilter").hide();
  $(".backButton").show();
  $("#joinGroup").show();
  $("#chatHistory").hide();
  $("#joinGroup").html(''); 

    myGroupR = firebase.database().ref().child('group_request').child(senderId);
    myGroupR.on('value',function(grdata){

      grdata = grdata.val();
      if(grdata){
     


          $.each(grdata, function(i, item) {

            if(typeof item != "undefined" || item != null) {

                firebase.database().ref().child('users').child(item.senderId).once('value',function(udata){
                firebase.database().ref().child('group').child(item.groupId).once('value',function(gdata){
                    img = udata.val().profilePic;
                    userName = udata.val().userName;
                    firebaseToken = udata.val().firebaseToken;
                    groupName = gdata.val().groupName;
                    g_img = gdata.val().groupImg;
                    member = gdata.val().member;
                    member_count = Object.keys(member).length;
                    Time = moment(item.timestamp).fromNow();
                    $('#req'+item.groupId).remove();
                    chat = '<span class="list-group-item" id="req'+item.groupId+'"><div class="media"><img class="rounded-circle float-left d-flex mr-3" src="'+img+'"><div class="media-middle media-body"><h5 class="media-heading">'+userName+'</h5><small class="text-muted" id="msg'+uId+'">Wants to join <b>'+groupName+'</b> group</small><a class="lastTime mutetxt btn btn-success" href="javascript:void(0);" onclick="send_accept_request(this);"  data-group_id="'+item.groupId+'" data-sender_id="'+item.senderId+'" data-time="'+i+'" data-img="'+img+'" data-g_img="'+g_img+'" data-group_name="'+groupName+'"  data-img="'+img+'" data-user_name="'+userName+'"   data-firebase_token="'+firebaseToken+'" data-member_count="'+member_count+'">Accept</a> <a class="lastTime mutetxt btn btn-danger" href="javascript:void(0);" onclick="send_reject_request(this);"  data-group_id="'+item.groupId+'" data-sender_id="'+item.senderId+'" data-time="'+i+'">Reject</a><span class="lastTime">'+Time+'</span></div></div></span>';
                    $("#joinGroup").append(chat);
                  });
                });

            }

          });

      }

   });
}

let send_reject_request = function(e){

    let group_id = $(e).data('group_id');

    let r_sender_id = Number($(e).data('sender_id'));
    let time = $(e).data('time');
    $("#req"+group_id).remove();     
    firebase.database().ref('group_request').child(senderId).child(time).set(null);
    firebase.database().ref('my_group_request').child(r_sender_id).child(group_id).set(null);

}

let send_accept_request = function(e){

    let group_id = $(e).data('group_id');

    let r_sender_id = Number($(e).data('sender_id'));
    let time = $(e).data('time');
    let img = $(e).data('g_img');
    let group_name = $(e).data('group_name');
    let memberCount = Number($(e).data('member_count'))+Number(1);
    let firebase_token = $(e).data('firebase_token');
    let profilePic = $(e).data('img');
    let userName = $(e).data('user_name');
    $("#req"+group_id).remove();     
    let  data12 = {

                  'firebaseToken' : firebase_token,
                  'memberId' : r_sender_id,
                  'profilePic' : profilePic,
                  'type' : 'member',
                  'userName' : userName,
                  'createdDate' : Date.now(),
                  'mute' : 0                      
              };

    firebase.database().ref().child('group').child(group_id).child('member').child(r_sender_id).set(data12);

    let  chatData = {
                'reciverId' : group_id,
                'senderId' : senderId,
                'message' : '',
                'messageType' :0,
                'timestamp' : Date.now(),
                'type' : 'group',
                'userName' : group_name,
                'profilePic' : img,
                'unreadMessage' : 0,
                'memberCount' : memberCount,
                'favourite' : 0,
                'memberType' : ''
            };

    firebase.database().ref('chat_history/' + r_sender_id).child(group_id).set(chatData);
    firebase.database().ref().child('myGroup').child(r_sender_id).child(group_id).set(group_id);
    firebase.database().ref('group_request').child(senderId).child(time).set(null);
    firebase.database().ref('my_group_request').child(r_sender_id).child(group_id).set(null);

    let senderName = getValue('userName1');
    let msg = senderName+' accepted your '+group_name+' group request.';
    let title = 'Group request';
    let to = firebase_token;
    if(to){

      let notification = {
        'title' : title,
        'body' : msg,
        'message' : msg,
        'notifincationType' : '15',
        'click_action' : 'ChatActivity',
        'type' : 'chat',
        'opponentChatId' : group_id,
        'adminId' : getValue('adminId')
      };

      senNotifcation(to,notification,notification);

    }else{

      let webNotification = {
        
        'title' : title,
        'body' : msg,
        'url': ''
      };
      senWebNotifcation(r_sender_id,webNotification);
    }


}


$("#broadcast_delete").click(function deleteChat() {

      swal({
            title: "Are you sure?",
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
                firebase.database().ref('chat_history').child(senderId).child(reciverId).set(null);
                firebase.database().ref().child('broadcast').child(reciverId).set(null);
                firebase.database().ref().child('broadcastChat').child(reciverId).set(null);
                $(".first").click();

            }
        });
});


$("#broadcast_delete_chat").click(function deleteChat() {

      swal({
            title: "Are you sure?",
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
                let reciverId = getValue('reciverId');
                firebase.database().ref('chat_history').child(senderId).child(reciverId).child('message').set('');
                firebase.database().ref().child('broadcastChat').child(reciverId).set(null);
            }
        });
});

$("#broadcast_details").click(function(){
     allbroadcastMember();
    $("#broadcast_details_modal").modal('show');
});




let allbroadcastMember = function(){

  let reciverId = getValue('reciverId');

  member = firebase.database().ref().child('broadcast').child(reciverId).child('member');
    member.on('value',function(rdata12){
        mdata = rdata12.val();

        if(mdata){
            mdata = arrayFliter(mdata);
            let member_count = Object.keys(mdata).length;
            $("#bMemberList").html(''); 
            $.each(mdata, function(i, item) {

              type = member_count!=2 ?'<a href="javascript:void(0);" class="btn btn-theme" title="Remove" onclick="remove_b_member(this);" data-memberid = "'+item.memberId+'" data-member_count = "'+member_count+'"><i class="fa fa-times"></i></a>': '';
              userName = item.userName;
              chat = '<li id="add_member'+item.memberId+'"><span><img src="'+item.profilePic+'">'+userName+'</span>'+type+'</li><hr>';
              $("#bMemberList").append(chat);

            });
      }

    });  

}; 



let remove_b_member = function(e){
    let reciverId = getValue('reciverId');
    let membeerId = $(e).data('memberid');
    var member_count = Number($(e).data('member_count'))- Number(1);
    let b_name = member_count+" Members";
    firebase.database().ref('broadcast').child(reciverId).child('member').child(membeerId).set(null);
    firebase.database().ref('broadcast').child(reciverId).child('groupName').set(b_name);
    firebase.database().ref('chat_history').child(senderId).child(reciverId).child('userName').set(b_name);
    $(".user_name").html(b_name);
    setValue('userName',b_name);

}


$("#broadcast_add_new_member").click(function(){

  $("#add_group_member-err").html('');
  $("#broadcast_add_new_member_model").modal('show');
  firebase.database().ref('tempData').child(senderId).set(null); 
  allBroadcastUserGet123();

});



let allBroadcastUserGet123 = function(){

  let reciverId = getValue('reciverId');

  member = firebase.database().ref().child('broadcast').child(reciverId).child('member');
    member.on('value',function(rdata12){
        mdata = rdata12.val();

        if(mdata){

            mdata = arrayFliter(mdata);

            reciveIdRef12 = firebase.database().ref().child('tempData').child(senderId);
            reciveIdRef12.on('value',function(tdata){

                 reciveIdRef = firebase.database().ref().child('users');
                    reciveIdRef.on('value',function(rdata){

                        rdata = arrayFliter(rdata.val());

                        if(tdata.val()){
                           tdata = arrayFliter(tdata.val());

                            rdata =  arrayshortbyunide(rdata,tdata);

                        }

                      rdata =  arrayshortbyunide(rdata,mdata);

                       if(rdata){
                          $("#add_b_userList").html(''); 
                          $(".add_broadcast_record_not").hide();
                          $.each(rdata, function(i, item) {
                           chat = '<li id="add_member'+item.uId+'"><span><img src="'+item.profilePic+'"> @'+item.userName+'</span><a href="javascript:void(0);" class="btn btn-theme" onclick="add_user(this);" data-profile ="'+item.profilePic+'" data-username="'+item.userName+'" data-uid = "'+item.uId+'" data-token = "'+item.firebaseToken+'" title="Add"><i class="fa fa-plus"></i></a></li>';
                           $("#add_b_userList").append(chat);
                              
                          });

                      }
                      if(rdata.length==0 || $("#add_b_userList").html()==''){
                        $(".add_broadcast_record_not").show();
                      }

                 });

          });
      }

    });  

}; 



$("#broadcast_add_member").click(function(){

     var flag = 0;
    reciveIdRef = firebase.database().ref().child('tempData').child(senderId);
    reciveIdRef.once('value',function(rdata){
      rdata = rdata.val();
      if (rdata == null) {
        flag = 1;
        $('#add_broadcast_member-err').html("Please select at least one group member");

      } else {

        $('#add_broadcast_member-err').html("");
    }

    });

    if (flag) {
        return false;
    } 

    reciveIdRef = firebase.database().ref().child('tempData').child(senderId);
    reciveIdRef.once('value',function(rdata){
          rdata1 = rdata.val();
          let bname = getValue('userName');
          let m = bname.split(" ");
          let member_count = Number(m[0])+ Number(1);
          let b_name = member_count+" Members";

          if(rdata1){
            $.each(rdata1, function(i, item) {
              if(typeof item != "undefined" || item != null) {

                let reciverId = getValue('reciverId');
                 let  data12 = {

                      'firebaseToken' : item.firebaseToken,
                      'memberId' : item.memberId,
                      'profilePic' : item.profilePic,
                      'type' : item.type,
                      'userName' : item.userName,
                      'createdDate' : Date.now(),
                      'mute' : 0                      
                  };
                firebase.database().ref().child('broadcast').child(reciverId).child('member').child(item.memberId).set(data12);
                firebase.database().ref().child('broadcast').child(reciverId).child('groupName').set(b_name);
                firebase.database().ref('chat_history/' + senderId).child(reciverId).child('userName').set(b_name);
                }

            }); 
            firebase.database().ref('tempData').child(senderId).set(null);
            $(".user_name").html(b_name);
            setValue('userName',b_name);     
            $('#broadcast_add_new_member_model').modal('hide');
            $('.add_b_memberList').load(' .add_b_memberList');  


          }

    });

});


$("#back_buttton").click(function(){

$("#chatFilter").show();
$("#chatHistory").show();
$("#joinGroup").hide();
$(".backButton").hide();

});