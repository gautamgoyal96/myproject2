function fbLogin() {
    FB.login(function(e) {
        e.authResponse ? getFbUserData() : document.getElementById("status").innerHTML = "User cancelled login or did not fully authorize."
    }, {
        scope: "email"
    })
}

function getFbUserData() {
    FB.api("/me", {
        locale: "en_US",
        fields: "id,first_name,last_name,email,link,gender,locale,picture"
    }, function(e) {
        userEmail = e.email, "undefined" == typeof e.email && (userEmail = e.id + "@facebook.com");
        var t = {
            fName: e.first_name+" "+e.last_name,
            email: userEmail,
            socialId: e.id,
            image: "http://graph.facebook.com/" + e.id + "/picture?type=large",
            socialType: "facebook"
        };
        url = "/socialRegister";
         $.ajax({
            url: url,
            type: "POST",
            data: t,
            dataType: "json",
            cache: !1,
            success: function(t) {

                 FB.logout(function(response) { 

                    if(t.type= "SR"){
                        console.log(e);
                        localStorage.setItem("fName", e.first_name);
                        localStorage.setItem("lName", e.last_name);
                        localStorage.setItem("email", userEmail);
                        localStorage.setItem("socialId", e.id);
                        localStorage.setItem("socialType", "facebook");
                        localStorage.setItem("image", "http://graph.facebook.com/" + e.id + "/picture?type=large");
                       var image = localStorage.getItem("image");
                      window.location = "/register";

                    }else if(t.type=="SL"){
                    
                        window.location = "/userProfile";
                    
                    }else if(t.type=="AE"){
                    
                        alert("Email id  already exist");

                    } 

                });   
            }
        });
    });
}

function fbLogout() {

    FB.logout(function(response) {

    });
}
window.fbAsyncInit = function() {
        FB.init({
            appId: "1950251375263506",
            cookie: !0,
            xfbml: !0,
            version: "v2.8"
        }), FB.getLoginStatus(function(e) {
            "connected" === e.status && getFbUserData()
        })
    },
    function(e, t, a) {
        var o, i = e.getElementsByTagName(t)[0];
        e.getElementById(a) || (o = e.createElement(t), o.id = a, o.src = "//connect.facebook.net/en_US/sdk.js", i.parentNode.insertBefore(o, i))
    }(document, "script", "facebook-jssdk");