  /* Creater by Developer Gautam Goyal */

   $("#bankPayment").click(function(){
          var firstName = $("#firstName").val();
          var accountNumber = $("#accountNumber").val();
          var routingnumber = $("#routingnumber").val();
          var requestId = $("#requestId").val();
          data = {holderName:firstName,accountNo:accountNumber,routingnumber:routingnumber,id:requestId};

          jQuery("#firstName").parent("div").removeClass("has-error");
              $('#firstName_error').html("");
          jQuery("#accountNumber").parent("div").removeClass("has-error");
              $('#accountNumber_error').html("");  
          jQuery("#routingnumber").parent("div").removeClass("has-error");
              $('#routingnumber_error').html("");  
       
  

            if(firstName==""){

                    jQuery("#firstName").parent("div").addClass("has-error");
                    $('#firstName_error').html("Holder Name field is required");

            }else if(accountNumber==""){

                    jQuery("#accountNumber").parent("div").addClass("has-error");
                    $('#accountNumber_error').html("Account Number field is required");

            }else if(routingnumber==""){

                    jQuery("#routingnumber").parent("div").addClass("has-error");
                    $('#routingnumber_error').html("Routing number field is required");

            }else{

                var btn = $(this);             
                var url = "/bankPayment";
                $.ajax({
                  
                    url: url,
                    type: "Get",
                    data:data,    
                    beforeSend: function() {
                       $(btn).buttonLoader('start'); 
                       setTimeout(function(){ $(btn).buttonLoader('stop'); errorMsg('Your payment has failed. please try again');}, 30000);

                    },  
                    cache: false,
                    success: function(data){
                       $(btn).buttonLoader('stop'); 
                      if(data.status=="fail"){
                          errorMsg(data.message)

                       }else{

                         window.location = "/paymenthistory";

                       }


                    }
                }); 
            }        
    });


    $("#cardPayment").click(function(){

          var holderName = $("#holderName").val();
           var cardNumber = $("#cardNumber").val();
          var expiryMonth = $("#expiryMonth").val();
          var expiryYear = $("#expiryYear").val();
          var cvvNumber = $("#cvvNumber").val();
          var requestId = $("#requestId").val();
          data = {holderName:holderName,number:cardNumber,exp_month:expiryMonth,exp_year:expiryYear,cvv:cvvNumber,id:requestId};

          jQuery("#holderName").parent("div").removeClass("has-error");
              $('#holderName_error').html("");
          jQuery("#cardNumber").parent("div").removeClass("has-error");
              $('#cardNumber_error').html("");
          jQuery("#expiryMonth").parent("div").removeClass("has-error");
              $('#expiryMonth_error').html("");
          jQuery("#expiryYear").parent("div").removeClass("has-error");
              $('#expiryYear_error').html("");
          jQuery("#cvvNumber").parent("div").removeClass("has-error");
              $('#cvvNumberr_error').html("");  
        
             

            if(cardNumber==""){

                    jQuery("#cardNumber").parent("div").addClass("has-error");
                    $('#cardNumber_error').html("Card number field is required");

            }else if(expiryMonth==""){

                    jQuery("#expiryMonth").parent("div").addClass("has-error");
                    $('#expiryMonth_error').html("Expiry month field is required");

            }else if(expiryYear==""){

                    jQuery("#expiryYear").parent("div").addClass("has-error");
                    $('#expiryYear_error').html("Expiry year field is required");

            }else if(cvvNumber==""){

                    jQuery("#cvvNumber").parent("div").addClass("has-error");
                    $('#cvvNumberr_error').html("CVV number field is required");

            }else{

                var btn = $(this); 
                var url = "/cardPayment";
                $.ajax({
                  
                    url: url,
                    type: "Get",
                    data:data,    
                    beforeSend: function() {
                      $(btn).buttonLoader('start'); 
                       setTimeout(function(){ $(btn).buttonLoader('stop'); errorMsg('Your payment has failed. please try again');}, 30000);
                    },  
                    cache: false,
                    success: function(data){

                     $(btn).buttonLoader('stop');

                     if(data.status=="fail"){

                        errorMsg(data.message)

                     }else{

                       window.location = "/paymenthistory";

                     }
                    

                    }
                }); 
            }        
    });
  /* File Code End */

