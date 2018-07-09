
var stripe 			= require('stripe')('sk_test_8yF1axC0w9jPs6rlmAK3LQh1');
var booking 		= require('../../models/front/booking.js');
var paymentDetail 		= require('../../models/front/paymentDetail.js');
var User            = require('../../models/front/home.js');
var Cryptr = require('cryptr'),
cryptr = new Cryptr('1234567890');

exports.bookingInfoData = function(req, res, next) {



	var id = cryptr.decrypt(req.query.id);

	var query = booking.aggregate([

			 			{
			                $match: {
			                    '_id': Number(id),
			                }
			            },
			          
			            {
			                "$lookup": {
			                    "from": "bookingservices",
			                    "localField": "_id",
			                    "foreignField": "bookingId",
			                    "as": "bookingData"
			                }
			            },
			            {
			                "$lookup": {
			                    "from": "users",
			                    "localField": "userId",
			                    "foreignField": "_id",
			                    "as": "userDetail"
			                }
			            },
			            {
			                "$lookup": {
			                    "from": "users",
			                    "localField": "artistId",
			                    "foreignField": "_id",
			                    "as": "artistDetail"
			                }
			            },

			            

			        ]);

			query.exec(function(err, data) {



			  	if(data){
			        for (i = 0 ; i < data.length ; i++) {



			            if(data[i].userDetail[0].profileImage){ 

			                data[i].userDetail[0].profileImage = "/uploads/profile/"+data[i].userDetail[0].profileImage;

			            }else{

				            data[i].userDetail[0].profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

				        }

				        if(data[i].artistDetail[0].profileImage){ 

			                data[i].artistDetail[0].profileImage = "/uploads/profile/"+data[i].artistDetail[0].profileImage;

			            }else{

				            data[i].artistDetail[0].profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

				        }
				       

			        }

			        bookingData = data;
			    	next();

			    }else{
			    	
			    	redirect('/');

			    }

    });

}

exports.bookingInfoData12 = function(req, res, next) {



	var id = req.query.id

	var query = booking.aggregate([

			 			{
			                $match: {
			                    '_id': Number(id),
			                }
			            },
			          
			            {
			                "$lookup": {
			                    "from": "bookingservices",
			                    "localField": "_id",
			                    "foreignField": "bookingId",
			                    "as": "bookingData"
			                }
			            },
			            {
			                "$lookup": {
			                    "from": "users",
			                    "localField": "userId",
			                    "foreignField": "_id",
			                    "as": "userDetail"
			                }
			            },
			            {
			                "$lookup": {
			                    "from": "users",
			                    "localField": "artistId",
			                    "foreignField": "_id",
			                    "as": "artistDetail"
			                }
			            },

			            

			        ]);

			query.exec(function(err, data) {



			  	if(data){
			        for (i = 0 ; i < data.length ; i++) {



			            if(data[i].userDetail[0].profileImage){ 

			                data[i].userDetail[0].profileImage = "/uploads/profile/"+data[i].userDetail[0].profileImage;

			            }else{

				            data[i].userDetail[0].profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

				        }

				        if(data[i].artistDetail[0].profileImage){ 

			                data[i].artistDetail[0].profileImage = "/uploads/profile/"+data[i].artistDetail[0].profileImage;

			            }else{

				            data[i].artistDetail[0].profileImage = 'http://www.cubaselecttravel.com/Content/images/default_user.png';

				        }
				       

			        }

			        bookingData = data;
			    	next();

			    }else{
			    	
			    	redirect('/');

			    }

    });

}

exports.bookingArtistInfo = function(req, res, next){


			   User.aggregate([

				    {  
				    	$lookup:{
					            from: "bankdetails", 
					            localField: "_id", 
					            foreignField: "artistId",
					            as: "bankDetail"
					    }
				     
				    },
				   	{ 
				   		"$project": {
					        "_id": 1,
					        "userName": 1,
					        "firstName": 1,
					        "lastName": 1,
					        "businessName": 1,
					        "address": 1,
					        "profileImage":1,
					        "reviewCount":1,
					        "ratingCount":1,
					        "isDocument":1,
							"serviceType":1,
					        "status":1,
					        "distance":1,
					        "email":1,
					        "businessType":1,
					        "contactNo":1,
					        "latitude":1,
					        "latitude":1,
					        "followersCount":1,
					        "followingCount":1,
					        "serviceCount":1,
					        "inCallpreprationTime":1,
					        "outCallpreprationTime":1,
					        "radius":1,
					        "postCount":1,
					        "bankStatus":1,
					        "certificateCount":1,
					        "userType":1,
					        "bio":1,
					        "bankStatus":1,
					        "bankDetail.accountId":1,

				         }
					},
					{
				     $match: {_id:bookingData[0].artistId},
				    },

			 ],function(err, userData) {

			 	aData = userData[0];
				next();

			});


		

}

exports.payment = function(req, res){

	res.render('front/payment.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session,
			cryptr : cryptr
	 	});
}

exports.cardPayment = function(req, res){

	if(aData.bankStatus!=1){

		res.json({'status':'fail','message': 'Artist bank account detail invalid'});
		return;

	}

	data = {
		"number": req.query.number,
        "exp_month": req.query.exp_month,
        "exp_year": req.query.exp_year,
        "cvc": req.query.cvv
	};
	stripe.tokens.create({card: data }, function(err, token) {

	      if(err){

	        res.json({'status':'fail','message': err.message});
	        return;

	      }
	      if(token){  
	      	var p = bookingData[0].totalPrice*100;
	      	price = Number(p).toFixed(0);
	         stripe.charges.create({
		        amount: price,
		        currency: "usd",
		        card: token.id, // obtained with Stripe.js
		        description: "Charge for service booking"
		      }, function(err, charge) {

		        if(err){

		         	res.json({'status':'fail','message': err.message});
		         	return;
		        }

		        if(charge){

		          	tranId = charge.balance_transaction;
		          	booking.updateMany({'_id':bookingData[0]._id},{$set: {transjectionId:tranId,paymentStatus:1}}, function(err, docs){  });
						var p = bookingData[0].totalPrice;
				      	price1 = Number(p).toFixed(0);
		          	  stripe.transfers.create({
		  			  amount: price1,
				      currency: "usd",
				      destination: aData.bankDetail[0].accountId,
				      transfer_group: "Amount Transfer By Admin"
				    }, function(err, transfer) {

				    	console.log(err);

				    	if(err){

				         		req.flash('success', 'Payment completed successfully');
				        		res.json({'status':'success','message': 'Payment completed successfully'});
				        		senderId =  bookingData[0].userId;
								reciverId =  bookingData[0].artistId;	
						        notify.notificationUser(senderId,reciverId,'8',bookingData[0]._id,'booking'); 
				         		return;
				        }

				        if(transfer){

				        		paymentDetail.findOne().sort([['_id', 'descending']]).limit(1).exec(function(err,userdata) { 

				        			var id = userdata ? userdata._id+1 : 1;
									jsArr = {
							                _id: id,
							                firstAdminPay: charge,
                        					firstUserPay: transfer,
							                bookingId: bookingData[0]._id
							        	};
							       
							        senderId =  bookingData[0].userId;
									reciverId =  bookingData[0].artistId;	
							        notify.notificationUser(senderId,reciverId,'8',bookingData[0]._id,'booking'); 

				        			paymentDetail.insertMany(jsArr,function(err,my) {});
				        			req.flash('success', 'Payment completed successfully');
				        			res.json({'status':'success','message': 'Payment completed successfully'});
				        			return;

				        		});	

				        
				        }

				    });



		        }

		        // asynchronously called
		      });
	      }
    });

}

exports.bankPayment = function(req, res){

	if(aData.bankStatus!=1){

		res.json({'status':'fail','message': 'Artist bank account detail invalid'});
		return;

	}

	data = {
		"country": 'Us',
		"currency": 'usd',
		"account_holder_name": req.query.holderName,
        "account_holder_type": 'individual',
        "account_number": req.query.accountNo,
        "routing_number": req.query.routingnumber
	};

	stripe.tokens.create({bank_account: data}, function(err, token) {

	      if(err){

	        res.json({'status':'fail','message': err.message});
	        return;

	      }
	      if(token){  

	      	   stripe.customers.create({ description: 'for verification', source: token.id }, function(err, customer) {

		        	 if(err){

				        res.json({'status':'fail','message': err.message});
				        return;

				     }

		          		cus_retrieve = customer.id;
		                so_retrieve = customer.default_source;
		                stripe.customers.verifySource(cus_retrieve,so_retrieve, {amounts: [32, 45] },function(err, bankAccount) {

				            	if(err){

							        res.json({'status':'fail','message': err.message});
							        return;

							    }
							   var p = bookingData[0].totalPrice*100;
	      						price = Number(p).toFixed(0);
				            	stripe.charges.create({amount: price, currency: "usd",customer: bankAccount.customer, description: "Charge for service booking"}, function(err, charge) {

									      	if(err){

									         	res.json({'status':'fail','message': err.message});
									         	return;
									        }
									        if(charge){

									          	tranId = charge.balance_transaction;
									          	booking.updateMany({'_id':bookingData[0]._id},{$set: {transjectionId:tranId,paymentStatus:1}}, function(err, docs){  });
									          
									          	var p = bookingData[0].totalPrice;
				      							price1 = Number(p).toFixed(0);
									          	stripe.transfers.create({amount: price1,currency: "usd",destination: aData.bankDetail[0].accountId,transfer_group: "Amount Transfer By Admin" }, function(err, transfer) {

											    	if(err){

											         	req.flash('success', 'Payment completed successfully');
										        		res.json({'status':'success','message': 'Payment completed successfully'});
										        		senderId =  bookingData[0].userId;
														reciverId =  bookingData[0].artistId;	
												        notify.notificationUser(senderId,reciverId,'8',bookingData[0]._id,'booking'); 
										         		return;
											        }

											        if(transfer){

											        		paymentDetail.findOne().sort([['_id', 'descending']]).limit(1).exec(function(err,userdata) { 

											        			var id = userdata ? userdata._id+1 : 1;
																jsArr = {
														                _id: id,
														                firstAdminPay: charge,
							                        					firstUserPay: transfer,
														                bookingId: bookingData[0]._id
														        	};
											        			paymentDetail.insertMany(jsArr,function(err,my) {});
											        			senderId =  bookingData[0].userId;
																reciverId =  bookingData[0].artistId;	
														        notify.notificationUser(senderId,reciverId,'8',bookingData[0]._id,'booking'); 

											        			req.flash('success', 'Payment completed successfully');
											        			res.json({'status':'success','message': 'Payment completed successfully'});
											        			return;

											        		});	

											        
											        }

											    });



									        }

							     });
				            	    // asynchronously called

				        });
		        });
	      }
    });



}


exports.stripeaddAccount = function(req, res) {


	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var country = req.body.country;
	var currency = req.body.currency;
	var sort_code = req.body.routingNumber;
	var accountNo = req.body.accountNo;
	var accountHolderType = req.body.accountHolderType;

/*	var country = 'GB';
    var currency = 'gbp';
    var firstName ='Elijah'
	var lastName = 'Wilson';
    accountHolderType = 'individual';
    sort_code = '108800';
    accountNo = '00012345';*/

    console.log(req.body);

	stripe.accounts.create({
		  country : country,
          type : 'custom',
		  external_account: {
		  	object:'bank_account',
		    country: country,
		    currency: currency,
		    sort_code: sort_code,
		    account_number: accountNo
		  },
		  legal_entity:{
		  	first_name :firstName,
		  	last_name : lastName,
		  	type : accountHolderType

		  },
          tos_acceptance:{

            date:Math.floor(Date.now() /1000),
            ip: req.connection.remoteAddress

           },
		}, function(err, token) {

			if(err){

				switch (err.type) {
					  case 'StripeCardError':

					  res.json({'status':'fail','message': err.message});
					    // A declined card error
					    // => e.g. "Your card's expiration year is invalid."
					    break;
					  case 'RateLimitError':

					  res.json({'status':'fail','message': err.message});
					    // Too many requests made to the API too quickly
					    break;
					  case 'StripeInvalidRequestError':

					  res.json({'status':'fail','message': err.message});

					    // Invalid parameters were supplied to Stripe's API
					    break;
					  case 'StripeAPIError':

					  res.json({'status':'fail','message': err.message});

					    // An error occurred internally with Stripe's API
					    break;
					  case 'StripeConnectionError':

					  res.json({'status':'fail','message': err.message});
					    // Some kind of error occurred during the HTTPS communication
					    break;
					  case 'StripeAuthenticationError':

					  res.json({'status':'fail','message': err.message});
					    // You probably used an incorrect API key
					    break;
					  default:

					  res.json({'status':'fail','message': err.message});
					    // Handle any other types of unexpected errors
					    break;
					}
				}
					if(token){

						res.json({'status':'sucess','message': token.id});

						
					}
	
	});


}
