document.addEventListener("deviceready", init, false);

function init() {
	document.querySelector("#pickContact").addEventListener("touchend", doContactPicker, false);
}
function doContactPicker() {
	navigator.contacts.pickContact(function(contact){
		console.log('The following contact has been selected:' + JSON.stringify(contact));
		//Build a simple string to display the Contact - would be better in Handlebars
		var s = "";
		s += "<h2>"+getName(contact)+"</h2>";

		if(contact.emails && contact.emails.length) {
			s+= "Email: "+contact.emails[0].value+"<br/>";
		}

		if(contact.phoneNumbers && contact.phoneNumbers.length) {
			s+= "Phone: "+contact.phoneNumbers[0].value+"<br/>";
		}

		if(contact.photos && contact.photos.length) {
			s+= "<p><img src='"+contact.photos[0].value+"'></p>";
		}

		document.querySelector("#selectedContact").innerHTML=s;
	},function(err){
		console.log('Error: ' + err);
	});
}

/*
Handles iOS not returning displayName or returning null/""
*/
function getName(c) {
	var name = c.displayName;
	if(!name || name === "") {
		if(c.name.formatted) return c.name.formatted;
		if(c.name.givenName && c.name.familyName) return c.name.givenName +" "+c.name.familyName;
		return "Nameless";
	}
	return name;
}

// Stripe.setPublishableKey('pk_test_aBbG5076Ber90unb3BXBko72');

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var app = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngMap', 'firebase', 'ionicShop','ngCordova', 'dbaq.google.directions','mm.foundation', 'ngAnimate', 'angularSpinner']);


app.run(function($ionicPlatform, $http) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
	// stripeCheckout.setStripeKey('pk_test_aBbG5076Ber90unb3BXBko72');
	//
  //  stripeCheckout.setStripeTokenCallback = function(status, response, products) {
  //    console.log(status, response, products);
  //    $http.post('/stripe/pay', {
  //     stripeToken : response.id,
  //     products: products
  //    })
  //    .success(function(data){
  //     console.log(data);
  //    });
  //  };




});

app.constant('FBURL', 'https://meterdpractice.firebaseio.com');


app.service('Root', ['FBURL', Firebase]);




app.config(function($stateProvider, $urlRouterProvider) {

	 Stripe.setPublishableKey('pk_test_3XRcbuhJG1R1ykdm1ZEKtcGX');

  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

//  .state('app.park', {
//    url: '/park',
//    abstract: true,
//    controller: 'ParkBaseCtrl'
//  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html',
        controller:'MapCtrl'
      }
    }
  })

  .state('app.park', {
    url: '/finish',
      views: {
        'menuContent': {
          templateUrl: 'templates/park.html',
          controller: 'ParkCtrl'
        }
      }
  })

  .state('app.countDown', {
    url: '/countDown',
      views: {
      'menuContent': {
        templateUrl: 'templates/countDown.html',
        controller: 'countDownCtrl'
      }
    }
  })

		.state('app.login', {
				url: '/login',

				views: {
					'menuContent': {
						templateUrl: 'templates/login.html',
						controller: 'LoginCtrl',
					}
				}
			})

			// .state('app.profile', {
			//   url: '/profile',
			// 	views: {
			//       'menuContent': {
			//           templateUrl: 'templates/profile.html',
			// 					controller: 'ProfileCtrl as profileCtrl',
			//         }
			//      },
		  // resolve: {
			//     // auth: function($state, Users, Auth){
			//     //   return Auth.$requireAuth().catch(function(){
			//     //     $state.go('home');
			//     //   });
			//     // },
			//   //   profile: function(Auth){
			//   //     return Auth.$requireAuth().then(function(auth){
			//   //       return Users.getProfile(auth.uid).$loaded();
			//   //     });
			//   //   }
			//   // }
			// })
			//


  .state('app.profile', {
      url: '/profile',
      views: {
        'menuContent': {
          templateUrl: 'templates/profile.html',
          controller: 'ProfileCtrl'
        }
      }
    })

  .state('app.payment', {
      url: '/payment',
      views: {
        'menuContent': {
          templateUrl: 'templates/payment.html',
          controller: 'payCtrl'
        }
      }
    })
    .state('app.support', {
        url: '/support',
        views: {
          'menuContent': {
            templateUrl: 'templates/support.html'
          }
        }
      })
//			.state('app.reserve', {
//					url: '/reserve',
//					views: {
//						'menuContent': {
//							templateUrl: 'templates/park.html',
//								controller: 'MapCtrl'
//						}
//					}
//				})

    .state('app.signUp', {
      url: '/signup',
      views: {
        'menuContent': {
          templateUrl: 'templates/signup.html',
          controller: 'LoginCtrl'
        }
      }
    })


  ;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/search');
});
