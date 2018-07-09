
function addstaff(){

var flag = new Array();
 var i=0;  
  $('.Settime').each(function(){
    var a=0;
    
    $('.workingdata'+i).each(function(){

         var  xe= $('#closeDay_'+i).prop("checked");

           if(!xe){
            flag.push("1");
            $("#openErr"+i+a).text("");
            $("#closeErr"+i+a).text("");
          }else{
      
             if($('#open_'+i+a).val() ==''){



              $(".show_error"+i+a).show();
              flag.push("0");
              $("#openErr"+i+a).text("Opening time is mandatory");
              }else{

                  
                 
                    var s = 1;

                    var y = dataCheck(i);


                    if(y==2 && s!=a){

                        if($('#close_'+i+a).val()!='' && $('#open_'+i+s).val()!=''){
                            matchtime =  timeConvert($('#close_'+i+a).val());
                            var currenttime = timeConvert($('#open_'+i+s).val());

                              if(matchtime>=currenttime){ 


                                flag.push("0");
                                $(".show_error"+i+s).show();
                                $("#openErr"+i+s).text("Time slot in the same day can't intersect");


                              }else{


                                       //    $(".show_error"+i+a).hide();
                                            flag.push("1");
                                            $("#openErr"+i+a).text("");
                           
                              }
                        
                        }   

                    }else{
                      if((jQuery.inArray("0",flag) != -1)){
                      }else{

                        flag.push("1");
                        $("#openErr"+i+a).text("");
                       }

                    }



              }


              if($('#close_'+i+a).val() ==''){


                   $(".show_error"+i+a).show();
                    flag.push("0");
                    $("#closeErr"+i+a).text("Closing time is mandatory");

              }else{


                  var closeTime = timeConvert($('#close_'+i+a).val());
                  var openTime = timeConvert($('#open_'+i+a).val());
                  var aopenTime = addMinutes(openTime, '10');

                  if(openTime<closeTime && openTime!=closeTime){


                       if(aopenTime<closeTime){


                 // console.log('a');

                        //if((jQuery.inArray("0",flag) != -1 || flag==0)){

                          //$(".show_error"+i+a).hide();
                          flag.push("1");
                          $("#closeErr"+i+a).text("");

                      //  }


                      }else{



                          if(aopenTime==closeTime){

                              if((jQuery.inArray("0",flag) != -1 || flag==0)){
                                 // $(".show_error"+i+a).hide();
                                  flag.push("1");
                                  $("#closeErr"+i+a).text("");
                            }

                          }else{

                            $(".show_error"+i+a).show();
                            flag.push("0");
                            $("#closeErr"+i+a).text("Select more than 10 min from opening time.");

                          }


                      }


                  }else{

                      $(".show_error"+i+a).show();
                      flag.push("0");
                      $("#closeErr"+i+a).text("Closing time must be after opening time");

                  }


              }


          }

       a++;
      });
              

  i++;
  });
           console.log(flag);

  checked = $("input[type=checkbox]:checked").length;

  if(checked==0){
      $(".show_error00").show();
      flag.push("0");
      $("#openErr00").text("Opening time is mandatory");
      $("#closeErr00").text("Closing time is mandatory");


  }

   if(jQuery.inArray("0",flag) == -1){


       return addstaff1();

      }else{
          
            return false ;
      }


}


function addstaff1(){


        setTimeout(function() {
            $('.alert-danger').fadeOut('fast');
            $('.alert-success').fadeOut('fast');
            $('.alert-warning').fadeOut('fast');
        }, 5000);

     var flag = 0;

       checked = $(".workingcheck:checked").length;
    $("#job-err").html("");
    $("#err-invalid").hide();
    $("#error-invalid").html('');
    var job = $.trim(jQuery("#job").val());
    var serviceCount = $.trim(jQuery("#serviceCount").val());
    if (job == '' || job == '') {
        flag = 1;
        jQuery("#job").val('');
        $('#job-err').html("Please select job title");
          
    }
     if (checked==2) {

     //   console.log(checked);
      //  flag = 1;
     //   $(".show_error00").show();
      //  $("#openErr00").text("Opening time is mandatory");
     //   $("#closeErr00").text("Closing time is mandatory");

    }
    if (serviceCount==0) {
        flag = 1;
        $("#err-invalid").show();
        $("#error-invalid").html('Please add staff services');

    }
    if (flag) {
        return false;
    } else {
       
        return true;
    }
}




  function staffSubservice(){
    var flag = 0;
    $("#service-err").html("");
    $("#subService-err").html("");
    $("#artistService-err").html("");
    $("#incallPrice-err").html("");
    $("#incallPrice-err").html("");
    $("#outCallPrice-err").html("");
    $("#inType-err").html("");
    var service = $.trim(jQuery("#services").val());
    var subservice = $.trim(jQuery("#subservice").val());
    var artistService = $.trim(jQuery("#artistService").val());
    var outCallPrice = $.trim(jQuery("#outCallPrice").val());
    var incallPrice = $.trim(jQuery("#incallPrice").val());
    var inCallhiddenPrice = $("#inCallhiddenPrice").val();
    var outCallhiddenPrice = $("#outCallhiddenPrice").val();
    var hours = $.trim(jQuery("#hours").val());
    var minute = $.trim(jQuery("#minute").val());
    var inType = $('#c1').is(':checked');
    var outType = $('#c2').is(':checked');
    if (service == '' || service == '') {
        flag = 1;
        jQuery("#service").val('');
        $('#service-err').html("Please select service");
    }
    if (subservice == '' || subservice == '') {
        flag = 1;
        jQuery("#subservice").val('');
        $('#subService-err').html("Please select sub service");

    }

    if (artistService == '' || artistService == '') {
        flag = 1;
        jQuery("#artistService").val('');
        $('#artistService-err').html("Please select artist service");

    }

    if (inType == '' && outType == '') {
        flag = 1;
        $('#inType-err').html("Please select service type");

    }


    if(inType){
    
      if ((incallPrice == '0.' || incallPrice == '00' || incallPrice == '' || incallPrice == '0' ||  incallPrice=='0.0' ||  incallPrice=='0.00' || incallPrice=='.') && !$('#incallPrice').is('[readonly]')) {
          flag = 1;
          jQuery("#incallPrice").val('');
          $('#incallPrice-err').html("Incall price required field");
      }
    
    }

    if(outType){

      if ((outCallPrice == '0.' || outCallPrice == '00' || outCallPrice == '' || outCallPrice == '0' ||  outCallPrice=='0.0' ||  outCallPrice=='0.00' || outCallPrice=='.') && !$('#outCallPrice').is('[readonly]')) {
          flag = 1;
          jQuery("#outCallPrice").val('');
          $('#outCallPrice-err').html("Outcall price required field");
      }

    }
     if (hours == '' || hours == '') {

        flag = 1;
        jQuery("#hours").val('');
        $('#hours-err').html(" Hours is required field");

    }else if (hours>24) {

        flag = 1;
        $('#hours-err').html("Hours format invalid");

            
    } else {

        var hours = $("#hours").val();
        $('#hours-err').html("");

    }
    if (minute == '' || minute == '') {
        
        flag = 1;
        jQuery("#minute").val('');
        $('#minute-err').html("Minutes is required field");

    }else if ((minute>59) || (minute=='00' && hours=="00")) {

        flag = 1;
        $('#minute-err').html("Please select completion time");

            
    } else {

        var minute = $("#minute").val();
        $('#minute-err').html("");

    }


    if (flag) {
        return false;
    } else {
       

        var form_data = {
            'serviceId': service,
            'subserviceId': subservice,
            'artistServiceId': artistService,
            'outCallPrice': outCallPrice,
            'incallPrice': incallPrice,
            'hours': hours,
            'minute': minute,
            'artistId': $("#staff_artist").val(),
            'type': $("#type").val(),
        };

        setTimeout(function() {
            $('.alert-danger').fadeOut('fast');
            $('.alert-success').fadeOut('fast');
            $('.alert-warning').fadeOut('fast');
        }, 5000);
        url = "/staffServiceAdd";
        $.ajax({
            url: url,
            type: "POST",
            data: form_data,
            dataType: 'json',
            cache: false,
            beforeSend: function() {

                $("#s-btn").attr("disabled","disabled"); 

            },
            success: function(data) {

                  $("#s-btn").removeAttr("disabled");  

                if (data.status == "0") {

                    $("#err-invalid").show();
                    $("#error-invalid").html(data.error);
                } else if (data.status == "1") {

                    $("#err-sucess").show();
                    $("#error-sucess").html(data.message);
                  //  $("#servicAdd").load(" #servicAdd");
                     $.trim(jQuery("#services").val(''));
                    $.trim(jQuery("#subservice").val(''));
                     $.trim(jQuery("#artistService").val(''));
                     $.trim(jQuery("#outCallPrice").val(''));
                    $.trim(jQuery("#incallPrice").val(''));
                   $("#inCallhiddenPrice").val('');
                   $("#outCallhiddenPrice").val('');
                   $.trim(jQuery("#hours").val(''));
                  $.trim(jQuery("#minute").val(''));
                  $.trim(jQuery("#inCallhiddenPrice").val(''));
                  $.trim(jQuery("#outCallhiddenPrice").val(''));
                  $.trim(jQuery("#incallPriceType").html(''));
                  $.trim(jQuery("#outcallPriceType").html(''));
                  $.trim(jQuery("#type").val('insert'));
                    staffserviceList();

                } 

            }
        });
        return true;
    }

  }
function subservice_get(e){

      $('#outCallPrice1-err').html(""); 
      $('#incallPrice1-err').html(""); 
      $("#incallPrice").val('');
      $("#outCallPrice").val('');
      $("#hours").val('');
      $("#minute").val('');
      $("#subservice").html('<option value="">Select Sub Service</option>');
      $("#artistService").html('<option value="">Select Artist Service</option>');
      if(e){
  
      var url = '/get_artistsubservices?id='+e;
        $.ajax({
          url: url,
          type: "get",
          cache: false,                 
          success: function(data){

             $("#subservice").html(data);
                    
          }
        });
    }

}

function artistservice_get(e){

    $('#outCallPrice1-err').html(""); 
    $('#incallPrice1-err').html(""); 
    $("#incallPrice").val('');
    $("#outCallPrice").val('');
    $("#hours").val('');
    $("#minute").val('');

   $("#artistService").html('<option value="">Select Artist Service</option>');

      if(e){
    
        var url = '/get_artistservices?id='+e;
          $.ajax({
            url: url,
            type: "get",
            cache: false,                 
            success: function(data){

               $("#artistService").html(data);
                      
            }
          });


      }

}

staffserviceList();
function staffserviceList(){
   $("#staffserviceList").html('');
   var staff_artist = $("#staff_artist").val();
        var url = '/staffserviceList?staffId='+staff_artist;
          $.ajax({
            url: url,
            type: "get",
            cache: false,                 
            success: function(data){

               $("#staffserviceList").html(data);
                      
            }
          });

}

function removestaffservice(e){

      var serviceCount = $.trim(jQuery("#serviceCount").val());
      if (serviceCount==1) {
        
          errorMsg('You have to keep at least one staff service');

      }else{
 
         if(confirm("Are you sure want to delete this service?")){
         
          
              var url = '/removestaffservice?id='+e;
                $.ajax({
                  url: url,
                  type: "get",
                  cache: false,                 
                  success: function(data){

                    $("#err-sucess").show();
                    $("#error-sucess").html(data.message);
                     staffserviceList();

                             setTimeout(function() {
                  $('.alert-danger').fadeOut('fast');
                  $('.alert-success').fadeOut('fast');
                  $('.alert-warning').fadeOut('fast');
              }, 5000);
                            
                  }
                });

           }else{
              return false;
          } 
    }   


}


function artistservice_detail(e){

$("#incallPrice").val('');
$("#outCallPrice").val('');
 $("#incallPriceType").html('');
 $("#outcallPriceType").html('');
$("#hours").val('');
$("#minute").val('');
   var staff_artist = $("#staff_artist").val();
  if(e){
          var url = '/ArtistStaffServiceDetail?id='+e+'&staffId='+staff_artist;
         $.ajax({
            url: url,
            type: "get",
            data:{page: url},              
            cache: false,                 
            success: function(data){
               var rs = data.data;
                $("#type").val('insert');
               var d = data.data;

                if(data.stafserviceData){

                  var rs = data.stafserviceData;
                  $("#type").val(rs._id);

                }
                 t = rs.completionTime;
                 var time = t.split(":");
                 $("#hours").val(time[0]);
                 $("#minute").val(time[1]);
                 $("#incallPrice").attr('readonly','true');
                 $("#outCallPrice").attr('readonly','true');
                 $('#incallPrice-err').html("");
                 $('#outCallPrice-err').html("");
                 $('#outCallPrice1-err').html("You can not add price for outcall services, first you have to edit your service"); 
                 $('#incallPrice1-err').html("You can not add price for incall services, first you have to edit your service"); 
                 $("#incallDiv").hide();
                 $("#outcallDiv").hide();
                 $("#inType-err").show();
                if(rs.inCallPrice!='0' && rs.inCallPrice!='0.0' && rs.inCallPrice!=0){
                  $("#incallPrice").removeAttr('readonly');
                  $("#incallPrice").val(rs.inCallPrice);
                  $('#incallPrice1-err').html("");
                  $("#inCallhiddenPrice").val(rs.inCallPrice);
                  $("#incallPriceType").html('<input class="" id="c1" name="" value="1" onchange="incallPriceType(this);" type="checkbox" checked><label for="c1" class="grey-text">In Call</label>');
                  $("#incallDiv").show();
                }else{


                  if(d.inCallPrice!='0' && d.inCallPrice!='0.0' && d.inCallPrice!=0){

                    $("#incallPrice").removeAttr('readonly');
                    $("#incallPrice").val(d.inCallPrice);
                    $('#incallPrice1-err').html("");
                    $("#inCallhiddenPrice").val(d.inCallPrice);
                    $("#incallPriceType").html('<input class="" id="c1" name="" value="1" onchange="incallPriceType(this);" type="checkbox"><label for="c1" class="grey-text">In Call</label>');
                    $("#incallDiv").hide();

                  }

                }
                
                if(rs.outCallPrice!='0'  && rs.outCallPrice!='0.0' && rs.outCallPrice!=0){

                  $("#outCallPrice").removeAttr('readonly');
                  $("#outCallPrice").val(rs.outCallPrice);
                  $('#outCallPrice1-err').html("");
                  $("#outCallhiddenPrice").val(rs.outCallPrice);
                  $("#outcallPriceType").html('<input class="" id="c2" name="" value="2" type="checkbox" onchange="outcallPriceType(this);" checked><label for="c2" class="grey-text">Out Call</label>');
                  $("#outcallDiv").show();
                }else{


                  if(d.outCallPrice!='0'  && d.outCallPrice!='0.0' && d.outCallPrice!=0){
                  
                      $("#outCallPrice").removeAttr('readonly');
                      $("#outCallPrice").val(d.outCallPrice);
                      $('#outCallPrice1-err').html("");
                      $("#outCallhiddenPrice").val(d.outCallPrice);
                      $("#outcallPriceType").html('<input class="" id="c2" name="" value="2" type="checkbox" onchange="outcallPriceType(this);"><label for="c2" class="grey-text">Out Call</label>');
                      $("#outcallDiv").hide();
                  }
                }
            }
          });
    }
}



function incallPriceType(e){


   if($(e).is(':checked')){

        $("#incallDiv").show();
        $("#incallPrice").val($("#inCallhiddenPrice").val());

   }else{

        $("#incallDiv").hide();
        $("#incallPrice").val('0');
   }
}

function outcallPriceType(e){


    if($(e).is(':checked')){
      
      $("#outcallDiv").show();
      $("#outCallPrice").val($("#outCallhiddenPrice").val());


    }else{

      $("#outcallDiv").hide();
      $("#outCallPrice").val('0');

    }
}

function timecheck(e){
  var error = new Array();
     var id = $(e).data('id');
  var y = dataCheck(id);
  var position = $(e).data('sid');
  var type = $(e).data('type');
  var currenttime =  timeConvert($(e).val());
  if(type=='close'){

   openTime =  timeConvert($('#open_'+id+position).val());
    var aopenTime = addMinutes(openTime, '10');
    closeTime = currenttime;


       if(openTime<closeTime && openTime!=closeTime){



            if(aopenTime<closeTime){


                              error.push("1");
                              $("#closeErr"+id+position).text("");


                        
                      }else{

                          if(aopenTime==closeTime){
                              
                              error.push("1");
                              $("#closeErr"+id+position).text("");

                          }else{

                            error.push("0");
                            $("#closeErr"+id+position).text("Select more than 10 min from opening time.");

                          }


                      }

                  }else{

                      error.push("0");
                      $("#closeErr"+id+position).text("Closing time must be after opening time");

                  }


       
  

  }


  for(i=0;i<position;i++){
          if($('#close_'+id+i).val()!=''){

              matchtime =  timeConvert($('#close_'+id+i).val());

              if(matchtime>=currenttime && type=="open"){ 

                   error.push("0");
                    $("#openErr"+id+position).text("Time slot in the same day can't intersect");

              }else{

                  if(type=="open" && (jQuery.inArray("0",error) != -1 || error.length==0)){

                      error.push("1");
                      $("#openErr"+id+position).text("");
                  }
              }

          }


  }

  if(type=="open"){

      $('#close_'+id+position).val('');
      $("#closeErr"+id+position).text("");

  }
    var data = Number(position)+1;

     for(i=data;i<y;i++){

        $('#open_'+id+i).val('');
        $('#close_'+id+i).val('');
        $("#openErr"+id+i).text("");
        $("#closeErr"+id+i).text("");
    }



console.log(error);

   if(jQuery.inArray("0",error) == -1){

        $(".show_error"+id+position).show();
        $("#m-btn").removeAttr("disabled");
          return true;
        }else{

          $(".show_error"+id+position).show();
          $("#m-btn").attr("disabled","disabled");  
          return false ;
        }

}

function removedata(a,d){

    var b = $("#check"+a).val();
    if(b){

        $("#data"+a+d).remove();
        $("#check"+a).val(Number(b)-Number(1));
        $('.thelink'+a).removeClass('disabled');

    } 

}
function closeDays(e)
    {

       var now = formatAMPM();
       var  xe= $('#closeDay_'+e).prop("checked");
       if (!xe) {
        $("#remove"+e).click();
        $("#add"+e).hide();
        $('#open_'+e+0).prop('readonly',true); 
        $('#close_'+e+0).prop('readonly',true);
       
        $('#open_'+e+0).val('');
        $('#close_'+e+0).val('');
        $('#open_'+e+0).removeClass('datepickDate');
        $('#close_'+e+0).removeClass('datepickDate');


     
      }else{

       $("#add"+e).show();
          var openOld = $('#openOld_'+e+0).val();
          var closeOld = $('#closeOld_'+e+0).val();
          $('#open_'+e+0).val(openOld);
          $('#close_'+e+0).val(closeOld);
          $('#open_'+e+0).addClass('datepickDate');
          $('#close_'+e+0).addClass('datepickDate');
          $('#open_'+e+0).prop('readonly',false);
          $('#close_'+e+0).prop('readonly', false);
          $(".show_error00").hide();
          $("#openErr00").text("");
          $("#closeErr00").text("");

          var closeOld2 = $('#closeOld_'+e+1).val();
          if(closeOld2){
              
              addfield(e);
              var openOld1 = $('#openOld_'+e+1).val();
              var closeOld1 = $('#closeOld_'+e+1).val();
              $('#open_'+e+1).val(openOld1);
              $('#close_'+e+1).val(closeOld1);
          
          }
      }
   
     
    }
    function formatAMPM() {
    var date    = new Date();
    var hours   = date.getHours();
    var minutes = date.getMinutes();
    var ampm    = hours >= 12 ? 'PM' : 'AM';
    hours       = hours % 12;
    hours       = hours ? hours : 12; // the hour '0' should be '12'
    minutes     = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
   
    }


$('#applyCheck').on("click",function(){
      var  xe= $('#applyCheck').prop("checked");
    if (xe) {

        var i=0;  
        $('.Settime').each(function(){

        $("#add"+i).show();
        $('#open_'+i+0).prop('readonly', false); 
        $('#close_'+i+0).prop('readonly', false); 
              var  xe= $('#closeDay_0').prop("checked");
           if($('#open_00').val() =='' || $('#close_00').val() ==''){
                $('#closeDay_'+i).prop('checked', true); // Checks it  
                 $('#open_'+i+0).val('10:00 AM');
                $('#close_'+i+0).val('07:00 PM'); 
             }else{

                $('#closeDay_'+i).prop('checked', true); // Checks it  
                 $('#open_'+i+0).val($('#open_00').val());
                $('#close_'+i+0).val($('#close_00').val()); 

             }  
          i++;
        });

  }else{
      var i=0;
      $('.Settime').each(function(){

            $("#add"+i).hide();
            $("#remove"+i).click();
              $('#open_'+i+0).prop('readonly', true); 
                $('#close_'+i+0).prop('readonly', true); 

                $('#closeDay_'+i).prop('checked', false); // Checks it 
                $('#open_'+i+0).removeAttr('placeholder'); // Checks it 
                $('#close_'+i+0).removeAttr('placeholder'); // Checks it 
                $('#open_'+i+0).val(''); 
                $('#close_'+i+0).val(''); 
         
          i++;
        });

  } 
  
});


 function addMinutes(time, minsToAdd) {
  function D(J){ return (J<10? '0':'') + J;};
  var piece = time.split(':');
  var mins = piece[0]*60 + +piece[1] + +minsToAdd;

  return D(mins%(24*60)/60 | 0) + ':' + D(mins%60);  
}  

function timeConvert(otime){


      var ohours = Number(otime.match(/^(\d+)/)[1]);
      var ominutes = Number(otime.match(/:(\d+)/)[1]);
      var AMPM = otime.match(/\s(.*)$/)[1];
      if(AMPM == "PM" && ohours<12) ohours = ohours+12;
      if(AMPM == "AM" && ohours==12) ohours = ohours-12;
      var osHours = ohours.toString();
      var osMinutes = ominutes.toString();
      if(ohours<10) osHours = "0" + osHours;
      if(ominutes<10) osMinutes = "0" + osMinutes;
     return osHours + ":" + osMinutes;
}
function dataCheck(i){
  
    var y=0;
       $('.workingdata'+i).each(function(){
       y++;
       });
     return y;
}

