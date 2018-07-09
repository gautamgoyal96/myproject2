/*$("#RegisThree").hide();
*/

$('.form-control,.copy').bind('cut copy paste', function (e) {
        e.preventDefault();
    });

function checkSecond(sec) {
  if (sec < 10 && sec >= 0) {sec = "0" + sec}; // add zero in front of numbers < 10
  if (sec < 0) {sec = "59"};
  return sec;
}



$("#inprepration").keypress(function(evt) {

    var charCode = (evt.which) ? evt.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;

});


    var fName = localStorage.getItem("fName");
    var lName = localStorage.getItem("lName");
    var email = localStorage.getItem("email");
    var socialId = localStorage.getItem("socialId");
    var image = localStorage.getItem("image");
    var socialType = localStorage.getItem("socialType");
    $("#fName").val(fName);
    $("#lName").val(lName);
    $("#email").val(email);
    $("#socialId").val(socialId);
    $("#image").val(image);
    $("#socialType").val(socialType);

    localStorage.removeItem("fName");       
    localStorage.removeItem("lName");       
    localStorage.removeItem("email");       
    localStorage.removeItem("socialId");       
    localStorage.removeItem("image");       
    localStorage.removeItem("socialType"); 
        setTimeout(function() {
            $('.alert-danger').fadeOut('fast');
            $('.alert-success').fadeOut('fast');
            $('.alert-warning').fadeOut('fast');
        }, 5000);

function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        jQuery("#phone").parent("div").addClass("has-error");
        return false;
    }
    jQuery("#phone").parent("div").removeClass("has-error");
    return true;
}

function loginValidation() {
    
    var flag = 0;
    var emailLogin = $.trim(jQuery("#emailLogin").val());
    var passwordLogin = $.trim(jQuery("#passwordLogin").val());
    if (emailLogin == '' || emailLogin == '') {
        flag = 1;
        jQuery("#emailLogin").parent("div").addClass("has-error");
        $('#login-email-err').html("<p class=''> Please enter username or email id</p>");
    } else {
        jQuery("#emailLogin").parent("div").removeClass("has-error");
        $('#login-email-err').html("");
    }
    if (passwordLogin == '' || passwordLogin == '') {
        flag = 1;
        jQuery("#passwordLogin").parent("div").addClass("has-error");
        $('#login-password-err').html("<p class=''>Please enter password</p>");
    } else {
        jQuery("#passwordLogin").parent("div").removeClass("has-error");
        $('#login-password-err').html("");
    }
    if (flag) {
        return false;
    } else {
        return true;
    }
}

function isValidEmailAddress(emailAddress) {
        var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
        return pattern.test(emailAddress);
    }


$('#step1Form').submit(function() {
    var btn = $(this);
    var flag = 0;
    $("#phone-err").html("");
    $("#email-err").html("");
    var phone = $.trim(jQuery("#phone").val());
    var email = $.trim(jQuery("#email").val());

    if (phone == '' || phone == '') {
        flag = 1;
        jQuery("#phone").parent("div").addClass("has-error");
        jQuery("#phone").val('');
        $('#phone-err').html("<p class='err_msg'> Please enter phone number</p>");
    } else {
        var phone = $("#phone").val();
         var reg = /^0/gi;
        if (phone.match(reg)) {
           flag = 1;
           jQuery("#phone").parent("div").addClass("has-error");
           $('#phone-err').html("<p class='err_msg'>Please enter a valid phone number</p>");

        }else{

            $('#phone-err').html("");

        }
      
    }
    if (email == '' || email == '') {
        flag = 1;
        jQuery("#email").parent("div").addClass("has-error");
        jQuery("#email").val('');
        $('#email-err').html("<p class='err_msg'> Please enter your email address</p>");
    } else {

        if (!isValidEmailAddress(email)) {

            flag = 1;
            $('#email-err').html("<p class='err_msg'> Please enter a valid email address</p>");

        }else{

            var email = $("#email").val();
            jQuery("#email").parent("div").removeClass("has-error");
            $('#email-err').html("");

        }
    }
    if (flag) {
        return false;
    } else {
        var id = $("#userId").val();
        var phone = $("#phone").val();
        var fName = $("#fName").val();
        var email = $("#email").val();
        var socialId = $("#socialId").val();
        var image = $("#image").val();
        var socialType = $("#socialType").val();
        var phone = $("#phone").val();
        var reg = /^0/gi;
        if (phone.match(reg)) {
           var phone = phone.replace(reg, "");
        }
        otp = Math.floor(Math.random()*(10000-1+1)+1);  
        var form_data = {
            'phone': phone,
            'countryCode' : $("#Countrycode").val(),
            'otp' : otp
        };

        setTimeout(function() {
            $('.alert-danger').fadeOut('fast');
            $('.alert-success').fadeOut('fast');
            $('.alert-warning').fadeOut('fast');
        }, 5000);
        url = "/phoneVerification";
        $.ajax({
            url: url,
            type: "POST",
            data: form_data,
            dataType: 'json',
            cache: false,
            beforeSend: function() {

                $("#changeText").attr("disabled","disabled"); 
                $('.loading').show();

            },
            success: function(data) {
                $('.loading').hide();
                 $("#changeText").removeAttr("disabled");  
                if (data.status == "0") {
                    $("#err-invalid").show();
                    $("#error-invalid").html(data.message);
                } else if (data.status == "1") {
                    $("#err-sucess").show();
                    $("#error-sucess").html('Verification code has been sent successfully');
                    $("#r_data").html('Verify Phone Number');
                    $("#otpOld").val(otp);
                    $("#userId2").val(data.id);
                    $("#phone2").val(phone);
                    $("#RegisOne").hide();
                    $("#RegisTwo").show();

    
                } else if (data.status == "2") {
                    $("#err-invalid").show();
                    $("#error-invalid").html(data.message);
                }
            }
        });
        return true;
    }
});

function Previous1() {

    $('#changeText').text('Resend');
    $("#RegisThree").hide();
    $("#RegisOne").show();
    $("#RegisTwo").hide();

}

function isNumberKey1(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}


function contactVerification() {
    var flag = 0;
    $("#otp-err").html("");
    var code1 = $.trim(jQuery("#code").val());
  
    if (code1 == '') {
        flag = 1;
        $('#otp-err').html("<p class='err_msg'> Please enter your OTP number</p>");
    } else {
        $('#otp-err').html("");
    }
    if (flag) {
        return false;
    } else {

        setTimeout(function() {
            $('.alert-danger').fadeOut('fast');
            $('.alert-success').fadeOut('fast');
            $('.alert-warning').fadeOut('fast');
        }, 5000);

        var otp = $("#code").val();
        var otpOld = $("#otpOld").val();
        if (otp == otpOld) {

            var fName = $("#fName").val();
            if (fName != '') {
                $("#fName2").attr('readonly', 'readonly');
                $("#fName2").val(fName);
                $(".label").addClass('active');
                $(".SPAssword").hide();
            }

            var lName = $("#lName").val();
            if (lName != '') {
                $("#lastName2").attr('readonly', 'readonly');
                $("#lastName2").val(lName);
            }
            var e = $("#email").val();
            var em = e.toLowerCase();
            var email = $.trim(em);
            if (email != '') {
                $("#email2").attr('readonly', 'readonly');
                $("#email2").val(email);

            }
            var socialId = $("#socialId").val();

            if(socialId != ''){

                $("#userName").val(socialId);
                $("#myD").hide();
            }
            var image = $("#image").val();
            var socialType = $("#socialType").val();
            $("#email2").val(email);
            $("#socialId2").val(socialId);
            $("#socialType2").val(socialType);
            $("#image2").val(image);
            document.getElementById('pImg').src = "http://www.cubaselecttravel.com/Content/images/default_user.png";
            if (image != '') {
                document.getElementById('pImg').src = image;
            }
            $("#RegisThree").show();
            $("#RegcntOne").hide();
            $("#RegcntTwo").show();
            $("#RegisOne").hide();
            $("#RegisTwo").hide();
        } else {

             $('#otp-err').html("<p class='err_msg'> Please enter valid OTP number</p>");
           
            $("#code").val('');
    
          
        }
        return true;
    }
}


function registerValidation(type) {
    
    var flag = 0;
    var file = $.trim(jQuery("#file-1").val());
    var fName2 = $.trim(jQuery("#fName2").val());
    var lastName2 = $.trim(jQuery("#lastName2").val());
    var userName = $.trim(jQuery("#userName").val());
    var passwrd2 = $.trim(jQuery("#passwrd2").val());
    var cpassword = $.trim(jQuery("#cpassword").val());
    var dob = $.trim(jQuery("#dob").val());
    var address = $.trim(jQuery("#address").val());
    var businessName = $.trim(jQuery("#businessName").val());
    var buildingNumber = $.trim(jQuery("#buildingNumber").val());
    var checkbox = $("#checkbox").prop("checked");
     $("#fName2").val(fName2);
     $("#lastName2").val(lastName2);
/*     $("#passwrd2").val(passwrd2);
     $("#cpassword").val(cpassword);*/
    if (fName2 == '' || fName2 == '') {
        flag = 1;
        $('#fname-err').html("Please enter first name");
    } else {
        var t = alphabetCharonly(fName2);
        if(t){

            $('#fname-err').html("");

        }else{

            flag = 1;
            $('#fname-err').html("Please enter a valid text");
        }
    }

    if (lastName2 == '' || lastName2 == '') {

        flag = 1;
        $('#lname-err').html("Please enter last name");

    } else {

        var t = alphabetCharonly(lastName2);
        if(t){

            $('#lname-err').html("");

        }else{

            flag = 1;
            $('#lname-err').html("Please enter a valid text");
        }

    }
    if(type=="business"){

        if (businessName == '' || businessName == '') {

            flag = 1;
            $('#businessName-err').html("Please enter business name");

        }else if (businessName.length<4) {

            flag = 1;
            $('#businessName-err').html("Business name must be at least 4 characters long");


        }  else {

            $('#businessName-err').html("");
        }

        if (buildingNumber == '' || buildingNumber == '') {

            flag = 1;
            $('#buildingNumber-err').html("Please enter building number");

        }else {

            $('#buildingNumber-err').html("");
        }

    }

    if (userName == '' || userName == '') {
        flag = 1;
        $('#username-err').html("Please enter user name");

    }else if (userName.length<4) {


        flag = 1;
        $('#username-err').html("User name must be at least 4 characters long");

    } else {
        $('#username-err').html("");
    }

    if (address == '' || address == '') {
        flag = 1;
        $('#address-err').html("Please enter address");
    } else {
       addresscheck(address);
        $('#address-err').html("");
    }

    if (dob == '' || dob == '') {
        flag = 1;
        $('#dob-err').html("Please enter date of birth");
    } else {
        $('#dob-err').html("");
    }

    if (passwrd2 == '' || passwrd2 == '') {
        flag = 1;
        $('#passwrd-err').html("Please enter password");

    }else if (passwrd2.length<8) {
        flag = 1;
        $('#passwrd-err').html("Use at least 8 character, include both one uppercase letter and one number.");

    }else {
        data = specialChar(passwrd2);
        dt = alphabetChar(passwrd2);
        if (data==false) {
            flag = 1;
            $('#passwrd-err').html("Use at least 8 character, include both one uppercase letter and one number.");

        }else{

            if (dt==false) {
                flag = 1;
                $('#passwrd-err').html("Use at least 8 character, include both one uppercase letter and one number.");

            }else{

                $('#passwrd-err').html("");
            }
        }
    }

    if (cpassword == '' || cpassword == '') {
        flag = 1;
        $('#confirm-err').html("Please enter confirm password");

    }else if(passwrd2!=cpassword){

        flag = 1;
        $('#confirm-err').html("Password and confirm password do not match");

    } else {
        $('#confirm-err').html("");
    }

    if (!checkbox) {
        flag = 1;
        $('#condition-err').html("Please accept terms and conditions");
    } else {
        $('#condition-err').html("");
    }
    if (flag) {
        return false;
    } else {
        return true;
    }
}


function profileValidation(type) {

    var flag = 0;
    var fName2 = $.trim(jQuery("#fName2").val());
    var lastName2 = $.trim(jQuery("#lastName2").val());
    var dob = $.trim(jQuery("#dob").val());
    var address = $.trim(jQuery("#address").val());
    var businessName = $.trim(jQuery("#businessName").val());
    var bio = $.trim(jQuery("#bio").val());
    var gender = $('input[name=gender]:checked').val();
    a =  addresscheck();
    if (fName2 == '' || fName2 == '') {
        flag = 1;
        $('#fname-err').html("Please enter first name");
    } else {
        var t = alphabetCharonly(fName2);
        if(t){

            $('#fname-err').html("");

        }else{

            flag = 1;
            $('#fname-err').html("Please enter a valid text");
        }
    }

    if (lastName2 == '' || lastName2 == '') {

        flag = 1;
        $('#lname-err').html("Please enter last name");

    } else {

        var t = alphabetCharonly(lastName2);
        if(t){

            $('#lname-err').html("");

        }else{

            flag = 1;
            $('#lname-err').html("Please enter a valid text");
        }

    }
    if(type=="artist"){

        if (businessName == '' || businessName == '') {

            flag = 1;
            $('#businessName-err').html("Please enter business name");

        }else if (businessName.length<4) {

            flag = 1;
            $('#businessName-err').html("Business name must be at least 4 characters long");


        }  else {

            $('#businessName-err').html("");
        }


        if(bio.length>250){

           flag = 1;
           $('#bio-err').html("You can't enter more than 250 characters");

        } else {

            $('#bio-err').html("");
        }

    }

    if (typeof gender === "undefined") {

        flag = 1;
        $('#gender-err').html("Please select gender");

    } else {

        $('#gender-err').html("");
    }


    if (address == '' || address == '') {
        flag = 1;
        $('#address-err').html("Please enter address");
    } else {
       addresscheck();
    
        $('#address-err').html("");
    }

    if (dob == '' || dob == '') {
        flag = 1;
        $('#dob-err').html("Please enter date of birth");
    } else {
        $('#dob-err').html("");
    }

    if (flag) {
        return false;
    } else {
        return true;
    }
}



function alphabetCharonly(value) {
    var regex = new RegExp(/^[a-zA-Z\s]+$/);
    if (regex.test(value)) {
        return true;
    }
    else {
        return false;
    }
  } 


function specialChar(value) {

     if((/\d/.test(value))){

        return true;
     }else{

        return false;
     }
  }


function alphabetChar(value) {
     if((/[A-Z]/.test(value))){

        return true;
     }else{

        return false;
     }
  }  



 jQuery.validator.addMethod("specialChar", function(value, element) {

     return (/\W/.test(value));
  }, "Please Fill Correct Value in Field.");

    jQuery('#businessregsterForm').validate({
            rules : {
                password:{

                    required: true, // as space is not a number it will return an error
                    minlength: 6,
                    specialChar:true

                },
                cpassword : {
                    equalTo : "#passwrd2"
                }
            },
            messages:{

                cpassword:{equalTo:"Password and confirm password do not match"},
                password:{minlength:"Passwords must be at least 6 characters long",specialChar:"Your password must have at least one special character"}

            },

             errorPlacement: function(error, element) {
                if(element.attr("name") == "profileImage"){
                    error.appendTo('#profileImage-err');
                    return;
                }
                if(element.attr("name") == "userName"){
                    error.appendTo('#username-err');
                    return;
                }
                if(element.attr("name") == "firstName"){
                    error.appendTo('#fname-err');
                    return;
                }
                if(element.attr("name") == "lastName"){
                    error.appendTo('#lname-err');
                    return;
                }
                if(element.attr("name") == "email"){
                    error.appendTo('#email-err');
                    return;
                }
                if(element.attr("name") == "password"){
                    error.appendTo('#passwrd-err');
                    return;
                }
                if(element.attr("name") == "cpassword"){
                    error.appendTo('#confirm-err');
                    return;
                }
                if(element.attr("name") == "businessName"){
                    error.appendTo('#businessName-err');
                    return;
                }
                if(element.attr("name") == "businesspostalCode"){
                    error.appendTo('#businesspostalCode-err');
                    return;
                }
                if(element.attr("name") == "buildingNumber"){
                    error.appendTo('#buildingNumber-err');
                    return;
                }
                if(element.attr("name") == "dob"){
                    error.appendTo('#dob-err');
                    return;
                }
                if(element.attr("name") == "address"){
                    error.appendTo('#address-err');
                    return;
                }

                if(element.attr("name") == "check"){
                    error.appendTo('#condition-err');
                    return;
                }
        }

        });   



      function usernameCheck(e,userType){

        if(e!=''){
                var em = $.trim(e);
               $.ajax({

                url: '/emailCheck',
                type: "GET", 
                data:{'email':em,'type':0,'userType':userType} ,                 
                cache: false,
                success: function(data){

                    if(data.type==false){
                     $("#m-btn").attr("disabled","disabled"); 
                      $("#username-err").html("Username already exist");
                      return false;

                    }else{
                     $("#m-btn").removeAttr("disabled");  
                      $("#username-err").html("");
                      return true;
                    }


                }

            });

        }else{

             $("#username-err").html("");

        }      
     }



     function emailCheck(e,userType){

        if(e!=''){

               var email = e.toLowerCase();
               var em = $.trim(email);
           $.ajax({

                url: '/emailCheck',
                type: "GET", 
                data:{'email':em,'type':1,'userType':userType} ,                 
                cache: false,
                success: function(data){

                    if(data.type==false){
                     $("#changeText").attr("disabled","disabled"); 
                      $("#email-err").html("<p class='err_msg'>Email id  already exist</p>");
                      return false;

                    }else{
                     $("#changeText").removeAttr("disabled");  
                      $("#email-err").html("");
                      return true;
                    }


                }

            });

        }else{

             $("#email-err").html("");

        }    
     }

$("#forgetpassword").click(function(e) {
    var url = "/forgotPassword";
    var email = $('#forget_email').val();
    var type = $('#type').val();

       $("#forget_email_error").html("");

    if (email == '' || email == '') {

        $('#forget_email_error').html("Please enter your email address");

    }else if (!isValidEmailAddress(email)) {

        $('#forget_email_error').html("Please enter a valid email address");

    } else {

        $.ajax({
            type: "POST",
            url: url,
            data: {
                email: email,
                type: type
            },
            beforeSend: function() {

                $("#forgetpassword").attr("disabled","disabled"); 

            },
            success: function(data) {

                $("#forgetpassword").removeAttr("disabled");  

            setTimeout(function() {
                $('.alert-danger').fadeOut('fast');
                $('.alert-success').fadeOut('fast');
                $('.alert-warning').fadeOut('fast');
            }, 5000);
                if (data.status == 0) {
                    $('#errorDiv1').show();
                    $('#error1').html(data.message);
                 
                }else{

                    $('#err-sucess1').show();
                    $('#err-sucess2').html('A new password has been sent on your registered email');
                     setTimeout(function() {
                        $('#forget_email').val('');
                        $(".close").trigger('click');

                    }, 2000);
             }
            }
        });
    }
});


$("#fName2").keypress(function(e) {
    var code = e.keyCode || e.which;
    if ((code < 65 || code > 90) && (code < 97 || code > 122) && code != 32 && code != 46 && code != 9 && code != 8) {
      //  jQuery("#fName2").parent("div").addClass("has-error");
       // $('#fname-err').html("<p class='err_msg'> Only alphabets are allowed</p>");
        return false;
    } else {
       // jQuery("#fName2").parent("div").removeClass("has-error");
        //$('#fname-err').html("");
        return true;
    }
})

$("#lastName2").keypress(function(e) {
    var code = e.keyCode || e.which;
    if ((code < 65 || code > 90) && (code < 97 || code > 122) && code != 32 && code != 46 && code != 9 && code != 8) {
       // jQuery("#lastName2").parent("div").addClass("has-error");
       // $('#lname-err').html("<p class='err_msg'> Only alphabets are allowed</p>");
        return false;
    } else {
      //  jQuery("#lastName2").parent("div").removeClass("has-error");
      //  $('#lname-err').html("");
        return true;
    }
})


$(".bName").keypress(function(e) {
    var code = e.keyCode || e.which;
    if ((code < 65 || code > 90) && (code < 97 || code > 122) && code != 32 && code != 46 && code != 9 && code != 8) {
       // jQuery("#lastName2").parent("div").addClass("has-error");
       // $('#lname-err').html("<p class='err_msg'> Only alphabets are allowed</p>");
        return false;
    } else {
      //  jQuery("#lastName2").parent("div").removeClass("has-error");
      //  $('#lname-err').html("");
        return true;
    }
})


$("#userName").keypress(function(e) {
    var code = e.keyCode || e.which;
    if (code == 32) {

        return false;
    } else {
        
        return true;
    }
})

    function initialize() {
    autocompletee = new google.maps.places.Autocomplete(document.getElementById("address"), {
        types: []
    }), autocompletee.addListener("place_changed",function(){

        var place = this.getPlace();
        var latitude  = place.geometry.location.lat();
        var longitude = place.geometry.location.lng();
        $('#latitude').val(latitude);
        $('#longitude').val(longitude);
         addresscheck() ;
    ajax_fun('1');

    });
}



/*      function initialize() {
        var input = document.getElementById('address');
        var autocomplete = new google.maps.places.Autocomplete(input);
      }*/
      google.maps.event.addDomListener(window, 'load', initialize);



      $("#orderForm").validate({

         errorPlacement: function(error, element) {
                if(element.attr("name") == "fullName"){
                    error.appendTo('#username-err');
                    return;
                }
                if(element.attr("name") == "dob"){
                    error.appendTo('#dob-error');
                    return;
                }
                if(element.attr("name") == "gender"){
                    error.appendTo('#gender-error');
                    return;
                }
                if(element.attr("name") == "address"){
                    error.appendTo('#address-error');
                    return;
                }
                if(element.attr("name") == "address"){
                    error.appendTo('#address-error');
                    return;
                }
                if(element.attr("name") == "chargePerMile"){
                    error.appendTo('#charge-error');
                    return;
                }
            }
      });



 $( "#dob" ).datepicker({
          defaultDate: "+1w",
          changeMonth: true,
          changeYear: true,
          numberOfMonths: 1,
          maxDate: 0,
          dateFormat: "dd/mm/yy",
          yearRange: "-100:+0"
        })


  function removecertificate(){

    var id = $("#id").val();
        $.ajax({

            url: '/removecertificate',
            type: "GET", 
            data:{'id':id} ,                 
            cache: false,
            success: function(data){

                window.location.href = "/my_certificate";

            }

        });

  }

  function my(){

   var check_value = $('.serviceType:checked').val();

    var flag = 0;
    $("#inhours-err").html("");
    $("#inminut-err").html("");
    $("#outhours-err").html("");
    $("#outminut-err").html("");
    var inpreprationHours = $.trim(jQuery("#inpreprationHours").val());
    var inpreprationminut = $.trim(jQuery("#inpreprationminut").val());
    var outpreprationHours = $.trim(jQuery("#outpreprationHours").val());
    var outpreprationminut = $.trim(jQuery("#outpreprationminut").val());
    var radius = $.trim(jQuery("#radius").val());
    var address = $.trim(jQuery("#address").val());
    if(check_value==1 || check_value==3){

    if (inpreprationHours == '' || inpreprationHours == '') {

        flag = 1;
        $('#inhours-err').html("Hours is required field");

    }else if (inpreprationHours>04) {

        flag = 1;
        $('#inhours-err').html("Hours format invalid");

            
    } else {

        $('#inhours-er').html("");

    }
    if (inpreprationminut == '' || inpreprationminut == '') {

        flag = 1;
        $('#inminut-err').html("Minutes required field");

    }else if ((inpreprationminut>51) || (inpreprationminut=='00' && inpreprationHours=="00")) {

        flag = 1;
        $('#inminut-err').html("Please select incall buffer time");

    }else {

        $('#inminut-err').html("");
    }
    }

    if (address=='') {

        flag = 1;
        $('#address-err').html("Please enter your address");
        

    }else {

        addresscheck(address);

        $('#address-err').html("");
    }

    if(check_value==2 || check_value==3){

        if (outpreprationHours == '' || outpreprationHours == '') {

            flag = 1;
            $('#outhours-err').html("Hours is required field");

        }else if (outpreprationHours>04) {

            flag = 1;
            $('#outhours-err').html("Hours format invalid");

            
        } else {

            $('#outhours-er').html("");
        }
        if (outpreprationminut == '' || outpreprationminut == '') {
            flag = 1;
            $('#outminut-err').html("Minutes required field");

        }else if ((outpreprationminut>59) || (outpreprationminut=='00' && outpreprationHours=="00") ) {

            flag = 1;
            $('#outminut-err').html("Please select outcall buffer time");

        } else {
            $('#outminut-err').html("");
        }

       

        if (radius==0) {
            flag = 1;
            $('#radius-err').html("Please select radius");

        }else {

            $('#radius-err').html("");
        }
    }
    if (flag) {
        return false;
    } else {
       return true;
    }

  }

  function subservice(){
    
    var flag = 0;
    $("#title-err").html("");
    $("#description-err").html("");
    var title = $.trim(jQuery("#title").val());
    var description = $.trim(jQuery("#description").val());
    var outCallPrice = $.trim(jQuery("#outCallPrice").val());
    var incallPrice = $.trim(jQuery("#incallPrice").val());
    var hours = $.trim(jQuery("#hours").val());
    var minute = $.trim(jQuery("#minute").val());
    var serviceType = $("#serviceType").val();

    if (title == '' || title == '') {
        flag = 1;
        jQuery("#title").val('');
        $('#title-err').html("Sub category name is required field");

    }else if(title.length>30){

           flag = 1;
           $('#title-err').html("You can't enter more than 30 characters");

    } else {
        var title = $("#title").val();
        $('#title-err').html("");
    }
    if (description == '' || description == '') {
        flag = 1;
        jQuery("#description").val('');
        $('#description-err').html("Description is required field");

    }else if(description.length>250){

           flag = 1;
           $('#description-err').html("You can't enter more than 250 characters");

    } else {
        var description = $("#description").val();
        $('#description-err').html("");
    }
    if(serviceType==1 || serviceType==3){

        if (incallPrice == '' || incallPrice == '' ||  incallPrice==0 || incallPrice=='.') {
            flag = 1;
            jQuery("#incallPrice").val('');
            $('#incallPrice-err').html("Incall price required field");
        } else {
            var incallPrice = $("#incallPrice").val();
            $('#incallPrice-err').html("");
        }

         if (outCallPrice=='.') {

            flag = 1;
            jQuery("#outCallPrice").val('');
            $('#outCallPrice-err').html("Outcall price is required field");
        
        } else {
            var outCallPrice = $("#outCallPrice").val();
            $('#outCallPrice-err').html("");
        }

    }

    if(serviceType==2){

        if (outCallPrice == '' || outCallPrice == '' || outCallPrice==0 || outCallPrice=='.') {
            flag = 1;
            jQuery("#outCallPrice").val('');
            $('#outCallPrice-err').html("Outcall price is required field");
        } else {
            var outCallPrice = $("#outCallPrice").val();
            $('#outCallPrice-err').html("");
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
            'title': $("#title").val(),
            'description': $("#description").val(),
            'incallPrice': $("#incallPrice").val(),
            'outCallPrice': $("#outCallPrice").val(),
            'hours': $("#hours").val(),
            'minute': $("#minute").val(),
            'category': $("#category").val(),
            'type': $("#type").val(),
            'subcategory': $("#subcategory").val(),
            'sType' : $("#sType").val()
        };

        setTimeout(function() {
            $('.alert-danger').fadeOut('fast');
            $('.alert-success').fadeOut('fast');
            $('.alert-warning').fadeOut('fast');
        }, 5000);
        url = "/servicesAdd";
        $.ajax({
            url: url,
            type: "POST",
            data: form_data,
            dataType: 'json',
            cache: false,
            beforeSend: function() {

                $("#m-btn").attr("disabled","disabled"); 

            },
            success: function(data) {

                  $("#m-btn").removeAttr("disabled");  

                if (data.status == "0") {

                    $("#err-invalid").show();
                    $("#error-invalid").html(data.error);
                } else if (data.status == "1") {

                    $("#next").prop("onclick", null);
                    $("#err-sucess").show();
                    $("#error-sucess").html(data.message);
                    var cat = $("#category").val();
                    var subcategory = $("#subcategory").val();
                    $( ".checkbox"+subcategory+cat).click();
                } 

            }
        });
        return true;
    }

  }


function subservicesChanges(id){

    if(id==""){

            var cat = $("#category").val();
            var subcategory = $("#subcategory").val();
            $( ".checkbox"+subcategory+cat).click();

    }else{




         var url = '/updatesubservices?id='+id;
        $.ajax({
          url: url,
          type: "get",
          data:{page: url},              
          cache: false,
                      
          success: function(data){
            t = data.completionTime;
           // console.log(data);
        var time = t.split(":");
            $("#category").val(data.serviceId);
            $("#subcategory").val(data.subserviceId);
            $("#title").val(data.title);
            $("#description").val(data.description);
            $("#outCallPrice").val(data.outCallPrice);
            $("#incallPrice").val(data.inCallPrice);
            $("#type").val(data._id);
            $("#hours").val(time[0]);
            $("#minute").val(time[1]);
                    
          }
        });

    }

}


function certificateAdd(){


    
    var flag = 0;
    $("#title_error").html("");
    $("#file_error").html("");
    var title = $.trim(jQuery("#title").val());
    var file = $.trim(jQuery("#file1").val());

    if (title == '' || title == '') {
        flag = 1;
        jQuery("#title").val('');
        $('#title_error').html("<p class='err_msg'> Title is required field</p>");
    } else {
        var title = $("#title").val();
        $('#title_error').html("");
    }
    if (file == '' || file == '') {
        flag = 1;
        jQuery("#file").val('');
        $('#file_error').html("<p class='err_msg'> Certificate image is required field</p>");
    } else {
        var file = $("#file").val();
        $('#file_error').html("");
    }

    if (flag) {
        return false;
    } else {
       
 var dataa = new FormData();
        var fileInput = document.getElementById("file1");
        console.log(fileInput.files[0]);
         var title = $('#title').val();

        dataa.append("file1", fileInput.files[0]);
        dataa.append("title", title);
   
        url = "/certificateAdd";
        $.ajax({

            url: url,
           type: "POST",
           data: dataa,
           cache: false,
           processData: false,
           contentType: false,
           async: false,
            beforeSend: function() {

                $("#m-btn").attr("disabled","disabled"); 

            },
            success: function(data) {

                  $("#m-btn").removeAttr("disabled");  

                if (data.status == "0") {

                    $("#err-invalid").show();
                    $("#error-invalid").html(data.error);
                } else if (data.status == "1") {

                    $("#err-sucess").show();
                    $("#error-sucess").html(data.message);
                    $("#title").val('');
                    $("#file1").val('');
                    $("#type").val(data.count);
                } 

            }
        });
        return true;
    }


}



    function addBackAccount(){
          var flag = 0;
          var file1 = $("#file1").val();
          var about = $("#about").val();
          var firstName = $("#firstName").val();
          var lastName = $("#lastName").val();
          var accountNumber = $("#accountNumber").val();
          var countryCode = $("#countryCode").val();
          var currency = $("#currency").val();
          var routingnumber = $("#routingnumber").val();
              $('#file_error').html("");
              $('#about_error').html("");
              $('#firstName_error').html("");
              $('#lastName_error').html("");
              $('#accountNumber_error').html("");  
              $('#routingnumber_error').html(""); 
            var imgCount = $("#imgCount").val();
            if(firstName==""){
                 var flag = 1;
                    $('#firstName_error').html("First Name field is required");

            }else if(lastName==""){
                    var flag = 1;
                    $('#lastName_error').html("Last Name field is required");

            }else if(routingnumber==""){
                    var flag = 1;
                    $('#routingnumber_error').html("Sort code field is required");

            }else if(accountNumber==""){
                    var flag = 1;
                    $('#accountNumber_error').html("Account number field is required");

            }
            if(flag){

                return false;
            }else{

                data = {firstName:firstName,lastName:lastName,accountNo:accountNumber,country:countryCode,currency:currency,routingNumber:routingnumber};

                var url = "/stripe";

                 $.ajax({
                  
                    url: url,
                    type: "POST",
                    data:data,    
                    beforeSend: function() {
                        
                        $("#m-btn").attr("disabled","disabled"); 

                    },  
                    cache: false,
                    success: function(data){
                        setTimeout(function() {
                            $('.alert-danger').fadeOut('fast');
                            $('.alert-success').fadeOut('fast');
                            $('.alert-warning').fadeOut('fast');
                        }, 5000);

                        $("#m-btn").removeAttr("disabled");
                        if(data.status=="fail"){
                            $("#err-invalid").show();
                            $("#error-invalid").html(data.message);
                        
                        }else{


                            $("#accountId").val(data.message);
                            $("#bankform").submit();


                        }


                      //  window.location = "/";
                    }
                });


/*                return true;
*/
            }
           
    }


    function addMorePropImg(){

        var ext = $('#file1').val().split('.').pop().toLowerCase();
        if($.inArray(ext, ['gif','png','jpg','jpeg']) == -1) {
            $('#file1').val('')
            if(ext!=""){

                $("#file_error").html('invalid extension!');
            }

        }else{
            $('#file_error').html('');
            var count = $('#imgCount').val();
            var imgCount = Number(count)+Number(1);   
            var dataa = new FormData();
            var fileInput = document.getElementById("file1");
            dataa.append("file1", fileInput.files[0]);
            dataa.append("imgCount", imgCount);
       
            url = "/certificateAdd";
            $.ajax({

               url: url,
               type: "POST",
               data: dataa,
               cache: false,
               processData: false,
               contentType: false,
               async: false,
               success: function(data) {
                console.log(data);

                    $("#newImages").append(data);
                    $('#imgCount').val(imgCount);
                    /*$('#file1').val('');*/

                }
            });
        }
        
    }
    


    function deletePropertyImages(id){

        var count = $('#imgCount').val();
        var imgCount = Number(count)-Number(1);   
        $('#imgCount').val(imgCount);
        $('#dImg'+id).remove();
        $('#hideImg'+id).val('');
    }

    function isNumberprice(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode;
    if(charCode!=46){

        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            jQuery("#phone").parent("div").addClass("has-error");
            return false;
        }

    }
    jQuery("#phone").parent("div").removeClass("has-error");
    return true;
}

function addresscheck(a){

$("#address-err").html('');
  
  var address = $("#address").val();
  jQuery.ajax({
    type: "GET",
    dataType: "json",
    url: "http://maps.googleapis.com/maps/api/geocode/json",
    data: {'address': address,'sensor':false},
    success: function(data){

            if(data.status!='ZERO_RESULTS'){

                $("#address-err").html('');
                $("#m-btn").removeAttr("disabled");  
                return true;

            }else if(data.status=='OVER_QUERY_LIMIT' || data.status=='ZERO_RESULTS'){
               flag = 1;
                $("#m-btn").attr("disabled","disabled"); 
                $("#address-err").html('Invalid address');  
                return false;

            }else{
                flag = 1;
                $("#m-btn").attr("disabled","disabled"); 
                $("#address-err").html('Invalid address');
                return false;
           }
    }
});

}

window.addEventListener( "pageshow", function ( event ) {
  var historyTraversal = event.persisted || ( typeof window.performance != "undefined" && window.performance.navigation.type === 2 );
  if ( historyTraversal ) {
    // Handle page restore.
    window.location.reload();
  }
});



function authTokenCheck() {


        var url = "/authTokenCheck";
        $.ajax({
            type: "POST",
            url: url,
            success: function(data) {
                if (data.status == 0) {
                    
                    auth_message = 'Your session has been expired. Please re-login to renew your session';
                    $('#authTokenCheckModel').modal({backdrop: 'static'});

                }else if (data.status == 1) {
                    
                    auth_message = 'Your account has been inactivated by admin, please contact to activate';
                    $('#authTokenCheckModel').modal({backdrop: 'static'});
                }
                $("#auth_message").html(auth_message);
            }
        });
    
}

if(senderId){

 setInterval(function() {
        authTokenCheck();
    }, 10000);
}