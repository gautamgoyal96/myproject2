var adminHome = require('../app/controllers/admin/home');
var adminCategory = require('../app/controllers/admin/category');
var adminSubCategory = require('../app/controllers/admin/subcategory');
var adminuser = require('../app/controllers/admin/userList');
var frontHome = require('../app/controllers/front/home');
var User = require('../app/controllers/front/user');
var login = require('../app/controllers/front/login');
var booking = require('../app/controllers/front/booking');
var explore = require('../app/controllers/front/explore');
var payment = require('../app/controllers/front/payment');
var frontService = require('../app/controllers/front/service');
var fregister = require('../app/controllers/admin/firebaseregister');
var stripe = require('../app/controllers/front/stripe');
var staff = require('../app/controllers/front/staff');

//Api //

var artist         =   require('../app/controllers/api/artist');
var user         =   require('../app/controllers/api/user');
var appUser         =   require('../app/controllers/api/user');
var service       =   require('../app/controllers/api/service_controller');
var authtokenCheck = require('../app/controllers/api/validateRequest');

//Api//
//you can include all your controllers

module.exports = function (app, passport) {

    app.get('/admin/login', adminHome.login);
    app.get('/signup', adminHome.signup);
    app.get('/fregister', fregister.fregister);
    app.get('/logout', adminHome.logout);
    app.get('/',login.profileCheck,booking.locationGet,booking.categoryGet,booking.searchbooking);    
    app.get('/home',frontHome.loggedIn,login.profileCheck,booking.locationGet,booking.categoryGet,booking.searchbooking);

    app.get('/adminDashboard', adminHome.loggedIn, adminHome.categoryCount, adminHome.subcategoryCount, adminHome.userCount, adminHome.artistCount, adminHome.home);//home
    app.get('/adminProfile', adminHome.loggedIn, adminHome.profile);//admin profile



    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/adminDashboard', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));
    // process the login form

    app.post('/admin/login', passport.authenticate('local-login', {
        
        successRedirect: '/adminDashboard', // redirect to the secure profile section
        failureRedirect: '/admin/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages

    }));

  
    /* Category module start*/

    app.get('/addCategory',adminCategory.loggedIn, adminCategory.addCategory);
    app.post('/createCategory', adminCategory.loggedIn , adminCategory.insertCategory);
    app.get('/listCategory',adminCategory.loggedIn, adminCategory.listCategory);
    app.get('/categoryList', adminCategory.categoryList);
    app.get('/categoryEdit/:categoryId',adminCategory.loggedIn, adminCategory.edit);
    app.get('/categoryStatus/:categoryId/:status',adminCategory.loggedIn, adminCategory.categoryStatus);
    app.post('/updateCategory', adminCategory.loggedIn , adminCategory.updateCategory);
    app.get('/categoryDelete/:categoryId',adminCategory.loggedIn, adminCategory.categoryDelete);

    /* Category module end*/


    /* Sub Category module start*/

    app.get('/addSubCategory',adminCategory.loggedIn, adminSubCategory.addSubCategory);
    app.post('/createSubCategory', adminCategory.loggedIn , adminSubCategory.insertSubCategory);
    app.get('/listSubCategory',adminCategory.loggedIn, adminSubCategory.listsubCategory);
    app.get('/subcategoryList', adminSubCategory.subcategoryList);
    app.get('/categorySubEdit/:categoryId',adminCategory.loggedIn, adminSubCategory.edit);
    app.get('/subServicesStatus/:categoryId/:status',adminCategory.loggedIn, adminSubCategory.subServicesStatus);
    app.post('/updateSubCategory', adminCategory.loggedIn , adminSubCategory.updateSubCategory);
    app.get('/categorySubDelete/:categoryId',adminCategory.loggedIn, adminSubCategory.categoryDelete);
        
    /* Sub Category module end*/


      /* userList and artist module start*/

    app.get('/artist',adminCategory.loggedIn, adminuser.artistList);
    app.get('/listArtist', adminuser.listartist);
    app.get('/artistStatus/:categoryId/:status',adminCategory.loggedIn, adminuser.artistStatus);
    app.get('/artistview/:id',adminCategory.loggedIn, adminuser.artistview);
    app.get('/artistServicesList',adminuser.artistServicesList);

    app.get('/customer',adminCategory.loggedIn, adminuser.userList);
    app.get('/listcutomer', adminuser.listuser);
    app.get('/customerStatus/:categoryId/:status',adminCategory.loggedIn, adminuser.userStatus);
    app.get('/customerview/:id',adminCategory.loggedIn, adminuser.customerview);

        
    /* userList and artist end*/

    /* profile update  and change password module start*/
    
    app.post('/admin_profile_update', adminCategory.loggedIn , adminHome.admin_profile_update);
    app.post('/admin_changepassword', adminCategory.loggedIn , adminHome.admin_changepassword);

    /* profile update  and change password module start*/



    /* Front module start*/

    app.get('/frontHome',login.profileCheck, frontHome.home);
    app.get('/login', login.login);
    app.get('/businessLogin', login.businesslogin);
    app.get('/businessRegister', login.businessRegister);
    app.post('/phoneVerification', login.phoneVerification, login.sendSmsdata);
    app.get('/register', login.register);
    app.get('/userProfile',frontHome.loggedIn,login.profileCheck, frontHome.userProfile);
    app.get('/myProfile',frontHome.loggedIn,login.profileCheck,frontHome.certificateCount, frontHome.myProfile);
    app.get('/my_certificate',frontHome.loggedIn,login.profileCheck, frontHome.certificateCount, frontHome.artist_my_certificate);
    app.get('/emailCheck',login.emailCheck);
    app.get('/userLogout', frontHome.userLogout);
    app.post('/profileUpdate',frontHome.loggedIn, frontHome.userprofileUpdate);
    app.post('/certificate_upload',frontHome.certificate_upload);
    app.get('/removecertificate',frontHome.removecertificate);
    
    app.post('/socialRegister',login.socialRegister);
    app.post('/userRegister',login.UserSignup);
    app.post('/businessRegister',login.businessSignup);
    app.post('/userLogin',login.userLogin);
    app.post('/forgotPassword',login.forgotPassword,login.sendMail);
    app.get('/businessHours',frontHome.loggedIn , User.businessHours);
    app.get('/subCategoryAdd',frontHome.loggedIn,User.serviceCount,User.categorydata, User.subCategoryAdd);
    app.get('/addsubservices',frontHome.loggedIn,User.subservicesList,User.addsubservices);
    app.get('/updatesubservices',frontHome.loggedIn,User.updatesubservices);
    app.post('/update_workingTime',User.update_workingTime);
    app.post('/servicesAdd',User.serviceCount,User.AddServices);
    app.get('/registerStep3',frontHome.loggedIn, User.registerStep3);
    app.post('/certificateAdd',User.certificate_upload);
    app.post('/addBackAccount',User.addBackAccount);
    app.get('/skipstep3',frontHome.loggedIn,User.skipstep3);

    
    app.get('/artistDashboard',frontHome.loggedIn,login.profileCheck,frontHome.artistdashboard);
    app.get('/explore',frontHome.loggedIn,login.profileCheck,explore.explore);
    app.get('/paymenthistory',frontHome.loggedIn,login.profileCheck,payment.paymenthistory);
    app.get('/bookinghistory',frontHome.loggedIn,login.profileCheck,staff.staff_List_data,staff.company_List_data,booking.bookinghistory);    
    app.post('/stripe',stripe.stripeaddAccount);
    app.get('/searchResult',booking.categoryGet,booking.searchResult);
    app.post('/search_artist',booking.search_artistdata,booking.search_artist);
    app.post('/get_sub_category',booking.get_sub_category);
    app.post('/home_search_artist',booking.home_search_artist,booking.home_search_artist_result);
    app.post('/get_sub_service',booking.get_sub_service);
    app.get('/booking_detial',frontHome.loggedInuserData,booking.locationGet,booking.userDetail,booking.Artistcategorydata,booking.booking_detial);
    app.get('/booking',frontHome.loggedInuserData,booking.loginBookingUpdate,booking.userDetail,booking.Artistcategorydata,booking.booking);
    app.get('/artistsubservices',booking.artistsubservicesList,booking.artistsubservices);
    app.get('/artistStaff',booking.artistStaff);
    app.get('/artistslot',booking.artistslot);
    app.get('/ArtistServiceDetail',booking.ArtistServiceDetail);
    app.get('/bookingServiceDetail',booking.bookingServiceDetail);
    app.post('/serviceBookingAdd',booking.serviceBookingAdd);
    app.post('/finalBooking',booking.finalBooking);
    app.post('/bookingUpdate',booking.bookingUpdate);
    app.get('/artistFreeSlot',booking.artistFreeSlot);
    app.post('/artistbookingHistory',booking.artistservicesList,booking.pendingBooking,booking.completeBooking,staff.staff_List_data,staff.company_List_data,staff.independArtistListData,booking.artistbookingHistory);    
    app.get('/artistmainsubservices',booking.Artistcategorydata,booking.artistmainsubservices);
    app.get('/bookingRemove',booking.bookingRemove);
    app.get('/bookingInfo',frontHome.loggedIn,booking.artistservicesList,booking.bookingInfoData,staff.staff_List_data,staff.independArtistListData,staff.company_List_data,booking.bookingInfo);   
    app.get('/staffManagement',frontHome.loggedIn,login.profileCheck,staff.staffManagement);    
    app.post('/staffArtistList',frontHome.loggedIn,staff.independArtistList,staff.staffArtistList);    
    app.get('/add_staff',frontHome.loggedIn,login.profileCheck,booking.userDetail,staff.artistCategoryData,staff.bussinessHoursGet,staff.staff_Info,staff.add_staff);
    app.get('/get_artistservices',staff.get_artistservices);    
    app.get('/get_artistsubservices',staff.get_artistsubservices);    
    app.post('/staffServiceAdd',staff.staffServiceAdd); 
    app.get('/ArtistStaffServiceDetail',staff.staffServiceDetail,staff.ArtistServiceDetail);
    app.get('/staffserviceList',booking.artistservicesList,staff.artistCategoryData,staff.staffServiceList);
    app.get('/removestaffservice',staff.removestaffservice);
    app.post('/staff_add',staff.staff_add);
    app.post('/staff_List',booking.artistservicesList,staff.staff_List_data,staff.company_List_data,staff.staff_List);
    app.get('/staffdetail',booking.staffdetail);
    app.post('/staffUpdate',booking.staffUpdate);
    app.post('/changstaff',staff.staff_List_data_service, staff.changstaff);
    app.get('/delete_staff',frontHome.loggedIn,staff.delete_staff);
    app.get('/profile',frontHome.certificateCount , frontHome.myProfile);
    app.get('/aboutUs',frontHome.certificateCount,frontHome.aboutUs);
    app.get('/following',frontHome.certificateCount,frontHome.following);
    app.get('/followers',frontHome.certificateCount,frontHome.followers);
    app.get('/following_list',frontHome.certificateCount,frontHome.followrsCheckData,frontHome.followingData,frontHome.following_list);
    app.get('/followers_list',frontHome.certificateCount,frontHome.followrsCheckData,frontHome.followersData,frontHome.following_list);
    app.post('/followUnfollow',frontHome.loggedIn,frontHome.followUnfollow);
    app.post('/artistFavorite',frontHome.loggedIn,frontHome.artistFavorite);
    app.post('/faveroite_list',booking.faveroite_list,booking.faveroite_list_result);
    app.get('/my_services',frontHome.certificateCount,frontService.servicesdata,frontService.serviceManagement);




/*    app.post('/userLogin', passport.authenticate('local-user-login', {
        successRedirect: '/myProfile', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages

    }));*/
    // process the login form
    /* Front module end*/


   /*  code start from sunil side*/
    app.post('/api/phonVerification',service.phonVerification);
    app.post('/api/artistRegistration',service.artistRegistration);
    app.post('/api/userRegistration',service.userRegistration);
    app.post('/api/forgotPassword',service.forgotPassword,service.sendMail);
    app.post('/api/userLogin',service.userLogin);
    app.get('/api/getBusinessProfile',authtokenCheck.checkaccessToken,artist.artistInfo);
    app.post('/api/addBusinessHour',authtokenCheck.checkaccessToken,artist.businessHours);
    app.post('/api/updateRange',authtokenCheck.checkaccessToken,artist.updateRange);
    app.post('/api/allService',authtokenCheck.checkaccessToken,artist.allCategory);
    app.post('/api/allCategory',authtokenCheck.checkaccessToken,appUser.allCategory);
    app.post('/api/subService',authtokenCheck.checkaccessToken,artist.subService);
    app.post('/api/addArtistService',authtokenCheck.checkaccessToken,artist.addArtistService);
    app.post('/api/addArtistCertificate',authtokenCheck.checkaccessToken,artist.addArtistCertificate);
    app.post('/api/addFeed',authtokenCheck.checkaccessToken,artist.addTag,artist.addFeed);
    app.post('/api/getAllFeeds',authtokenCheck.checkaccessToken,artist.followerFeed,artist.getAllFeeds,artist.finalFeed);
    app.post('/api/addMyStory',authtokenCheck.checkaccessToken,appUser.addMyStory);
    app.post('/api/myStory',authtokenCheck.checkaccessToken,appUser.getMyStory);
    app.post('/api/getMyStoryUser',authtokenCheck.checkaccessToken,appUser.deleteOldStory,appUser.getMyStoryUser);
    app.post('/api/test',service.test);
    app.post('/api/addFavorite',authtokenCheck.checkaccessToken,appUser.addFavorite);
    app.post('/api/artistSearch',authtokenCheck.checkaccessToken,appUser.artistSearch,appUser.finalData);
    app.post('/api/checkUser',service.checkUser);
    app.post('/api/showArtist',authtokenCheck.checkaccessToken,artist.showArtist);
    app.post('/api/getAllCertificate',authtokenCheck.checkaccessToken,artist.getAllCertificate);
    app.post('/api/deleteCertificate',authtokenCheck.checkaccessToken,artist.deleteCertificate);
    app.post('/api/addBankDetail',authtokenCheck.checkaccessToken,artist.stripeaddAccount);
    app.post('/api/updateRecord',authtokenCheck.checkaccessToken,appUser.updateRecord);
    app.post('/api/artistDetail',authtokenCheck.checkaccessToken,appUser.artistDetail,appUser.getArtistService);
   // app.post('/api/artistPost',authtokenCheck.checkaccessToken,appUser.artistPost);
   // app.post('/api/getArtistService',authtokenCheck.checkaccessToken,artist.getArtistService);
   /* app.get('/api/deleteRecord',artist.deleteRecord);*/
   // app.post('/api/artistTimeSlot',authtokenCheck.checkaccessToken,appUser.artistTimeSlot);
    app.post('/api/artistTimeSlot',authtokenCheck.checkaccessToken,appUser.getCurrentTime,appUser.bookingInfo,appUser.artistTimeSlot);
    app.post('/api/bookArtist',authtokenCheck.checkaccessToken,appUser.bookArtist);
    app.post('/api/confirmBooking',authtokenCheck.checkaccessToken,appUser.confirmBooking);
    app.post('/api/skipPage',authtokenCheck.checkaccessToken,artist.skipPage);
    app.post('/api/like',authtokenCheck.checkaccessToken,appUser.like);
    app.post('/api/commentLike',authtokenCheck.checkaccessToken,appUser.commentLike);
    app.post('/api/likeList',authtokenCheck.checkaccessToken,appUser.likeList,appUser.likeListFinal);
    app.post('/api/followFollowing',authtokenCheck.checkaccessToken,appUser.followFollowing);
    app.post('/api/followerList',authtokenCheck.checkaccessToken,appUser.followerList);
    app.post('/api/followingList',authtokenCheck.checkaccessToken,appUser.followingList);
    app.post('/api/commentList',authtokenCheck.checkaccessToken,appUser.commentList,appUser.finalCommentList);
    app.post('/api/addComment',authtokenCheck.checkaccessToken,appUser.addComment);
    app.post('/api/deleteBookService',authtokenCheck.checkaccessToken,appUser.deleteBookService);
    app.post('/api/deleteAllBookService',authtokenCheck.checkaccessToken,appUser.deleteAllBookService);
    app.post('/api/deleteUserBookService',authtokenCheck.checkaccessToken,appUser.deleteUserBookService);
    app.post('/api/addTag',authtokenCheck.checkaccessToken,appUser.addTag);
    app.post('/api/tagSearch',authtokenCheck.checkaccessToken,appUser.tagSearch);
    app.post('/api/artistFreeSlot',authtokenCheck.checkaccessToken,artist.artistBookingInfo,artist.getCurrentTime,artist.artistFreeSlot);
    app.post('/api/bookingAction',authtokenCheck.checkaccessToken,artist.bookingAction);
    app.post('/api/bookingDetails',authtokenCheck.checkaccessToken,artist.bookingDetails);
    app.post('/api/exploreSearch',authtokenCheck.checkaccessToken,appUser.exploreSearch,appUser.exploreSearchFinal);
    app.post('/api/userFeed',authtokenCheck.checkaccessToken,appUser.userFeedByTag,appUser.userFeed,appUser.finalUserFeed);
    app.post('/api/allArtist',authtokenCheck.checkaccessToken,artist.allArtist,artist.finalAllArtist);
    app.post('/api/addStaff',authtokenCheck.checkaccessToken,artist.addStaff);
    app.post('/api/addStaffService',authtokenCheck.checkaccessToken,artist.addStaffService);
    app.post('/api/artistStaff',authtokenCheck.checkaccessToken,artist.artistStaff);
    app.post('/api/feedDetails',authtokenCheck.checkaccessToken,appUser.feedDetails);
    app.post('/api/artistService',authtokenCheck.checkaccessToken,artist.artistService);
    app.post('/api/staffInformation',authtokenCheck.checkaccessToken,artist.staffInformation);
    app.post('/api/deleteStaffService',authtokenCheck.checkaccessToken,artist.deleteStaffService);
    /*code end form sunil side */


    /* Service  module start*/

/*   app.post('/api/phoneVerification', service.verification, service.sendSms);
   app.post('/api/userRegister', service.register);
   app.post('/api/userLogin', service.userLogin);
   app.get('/api/userInfo',authtokenCheck.checkaccessToken,user.userInfo);
   app.get('/api/sendSms',service.sendSms);
   app.get('/api/categorydata',authtokenCheck.checkaccessToken,user.categoryList);*/


    /* Service module end*/

}