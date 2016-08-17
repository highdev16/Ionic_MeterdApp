angular.module('starter.controllers', [])

.controller("AppCtrl", function($scope, $q, Auth, $state, $firebaseObject, $ionicHistory) {

  var ref = new Firebase("https://meterd.firebaseio.com");
  var userRef = ref.child('users');

  $scope.appState = {
    user: undefined,
  };

  $scope.refreshAuthData = function() {
    var dfd = $q.defer();
    var authData = ref.getAuth();

    if (authData) {
      var loggedInUserRef = new Firebase(ref + "/users/" + authData.uid);
      var user = $firebaseObject(loggedInUserRef);
      $scope.appState.user = user;
      dfd.resolve(user);
    } else {
      dfd.reject();
      $state.go('app.login');
    }

    return dfd.promise
  }
  $scope.refreshAuthData();

  $scope.logout = function (data) {
    Auth.logout(data);
    console.log('User has been logged out');
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    ref.unauth();

    $scope.appState.user = undefined;
    $state.go('app.login');
  };
})

.controller("LoginCtrl", function($scope, Auth, $state, $ionicHistory) {
  // Initially set no user to be logged in
  $ionicHistory.clearCache();
  $ionicHistory.clearHistory();

  var ref = new Firebase("https://meterd.firebaseio.com");
  var userRef = ref.child('users');

  // Logs a user in with Facebook
  // Calls $authWithOAuthPopup on $firebaseAuth
  // This will be processed by the InAppBrowser plugin on mobile
  // We can add the user to $scope here or in the $onAuth fn
  $scope.login = function () {
    var ref = new Firebase("https://meterd.firebaseio.com");
    ref.authWithOAuthPopup("facebook", function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);
        $scope.refreshAuthData().then(function() {
          $state.go('app.search');
        });
      }
    });
  };

  $scope.signupEmail = function(){
    var ref = new Firebase("https://meterd.firebaseio.com");
    var userRef = ref.child('users');

    ref.createUser({
      email    : $scope.data.email,
      password : $scope.data.password,
      firstname: $scope.data.firstname,
      lastname: $scope.data.lastname
      // firstname: $scope.data.firstname,
      // lastname: $scope.data.lastname

    }, function(error, userData, profile) {
      if (error) {
        console.log("Error creating user:", error);
      } else {
        console.log("Successfully created user account with uid:", userData.uid);
        userRef.child(userData.uid).set({
          email: $scope.data.email,
          password: $scope.data.password,
          firstname: $scope.data.firstname,
          lastname: $scope.data.lastname
        });
        $scope.refreshAuthData().then(function() {
          $state.go('app.search');
        });
      }
    });
  };

  $scope.loginEmail = function(data){
    var ref = new Firebase("https://meterd.firebaseio.com");
    console.log(data);
    ref.authWithPassword({
      email    : data.email,
      password : data.password
    }, function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);
        $scope.refreshAuthData().then(function() {
          $state.go('app.search');
        });
      }
    });
  };


///   TAKE OUT FOR NOW -- CHANGES DATA OF USER UPON LOGIN////
  ref.onAuth(function(authData) {
    var userRef = ref.child('users');
    if (authData) {
      console.log(authData);
      // save the user's profile into the database so we can list users,
      // use them in Security and Firebase Rules, and show profiles
      userRef.child(authData.uid).set({
        provider: authData.provider,
        name: getName(authData)
      });
    }
  });

  // // find a suitable name based on the meta info given by each provider
  ///THIS IS TO OBTAIN DISPLAYNAME FROM FACEBOOK
  function getName(authData) {
    switch(authData.provider) {
       case 'password':
         return authData.password.email.replace(/@.*/, '');
       case 'facebook':
         return authData.facebook.displayName;
    }
  }
  //}
  // Logs a user out

  // $scope.logout = Auth.logout;

  // detect changes in authentication state
  // when a user logs in, set them to $scope
  Auth.onAuth(function(authData) {
    $scope.user = authData;
  });

})


.controller('ProfileCtrl', function($scope, $firebaseObject, $cordovaCamera){
  var ref = new Firebase("https://meterd.firebaseio.com");

      // var usersRef = new Firebase("https://meterd.firebaseio.com/users");

       $scope.choose = function() {
             var options = {
                 quality : 75,
                 destinationType : Camera.DestinationType.DATA_URL,
                 sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
                 allowEdit : true,
                 encodingType: Camera.EncodingType.JPEG,
                 popoverOptions: CameraPopoverOptions,
                 targetWidth: 500,
                 targetHeight: 500

             };
             $cordovaCamera.getPicture(options).then(function(imageData) {

               ref.child('users').child(authData.uid).update({
                 "image": imageData
               });

               $scope.image = imageData;

             }, function(error) {
                 console.error(error);
             });
           };
           $scope.upload = function() {
             var options = {
                 quality : 75,
                 destinationType : Camera.DestinationType.DATA_URL,
                 sourceType : Camera.PictureSourceType.CAMERA,
                 allowEdit : true,
                 encodingType: Camera.EncodingType.JPEG,
                 popoverOptions: CameraPopoverOptions,
                 targetWidth: 500,
                 targetHeight: 500,
                 saveToPhotoAlbum: false
             };
             $cordovaCamera.getPicture(options).then(function(imageData) {

               ref.child('users').child(authData.uid).update({
                 "image": imageData
               });

               $scope.image = imageData;

             }, function(error) {
                 console.error(error);
             });
           };

           $scope.update = function(newUser, user){
             console.log('hi guys');
            var emailInput = document.querySelector("#emailInput").value;
            var firstnameInput = document.querySelector("#firstnameInput").value;
            var lastnameInput = document.querySelector("#lastnameInput").value;

            if (emailInput){
              console.log('hello from existing email input');
              if(emailInput !== user.email){
              console.log('hello from update');
               loggedInUserRef.update({
                 email    : newUser.email
               });
             }
           }
           if(firstnameInput){
             console.log('hello from existing firstnae input');
             if (firstnameInput !== user.firstname){
               console.log('hello from update');
                loggedInUserRef.update({
                 firstname: newUser.firstname

               });
             }
           }
           if(lastnameInput){
             console.log('hello from existing lastname input');
             if (lastnameInput !== user.lastname){
               console.log('hello from update');
                loggedInUserRef.update({
                  lastname: newUser.lastname
                });
              }
           }
           location.reload();
           };
           $scope.editEmail = function(userData){

           var ref = new Firebase("https://meterd.firebaseio.com");
           var userRef = ref.child('users');

           ref.updateUser({
             email    : $scope.data.email,
             password : $scope.data.password,
             firstname: $scope.data.firstname,
             lastname: $scope.data.lastname

             // firstname: $scope.data.firstname,
             // lastname: $scope.data.lastname

           }, function(error, userData, profile) {
             if (error) {
               console.log("Error updating user:", error);
             } else {
               console.log("Successfully updated user account with uid:", userData.uid);
               userRef.child(userData.uid).update({
                 email: $scope.data.email,
                 password: $scope.data.password,
                 firstname: $scope.data.firstname,
                 lastname: $scope.data.lastname
              });



             }
             location.reload();
           });

         };

})


 //  var ref = new Firebase("https://meterd.firebaseio.com");
 //  var authData = ref.getAuth();
 // console.log(authData);
 // var userRef = new Firebase(ref + "/users/" + authData.uid);
 // userRef.once("value", function(snapshot){
 //   var data = snapshot.exportVal();
 //   console.log(data);
 // })

// console.log(key);
//
// userRef.set({
//                     id: key,
//                     email: authData.password.email
//                   });


 .controller('ParkCtrl', function($scope, $state, $ionicPopup, $firebaseObject, $http, stripeCheckout, $window){

   $scope.hr = 0;
   $scope.min = 0;
   $scope.consoleHr = function() {
     console.log($scope.hr);
   };
   $scope.minusHour = function() {
     $scope.hr > 0 ? $scope.hr  = $scope.hr  - 1 : $scope.hr  = 0;
   }
   $scope.addHour = function() {
     $scope.hr = $scope.hr + 1;
   }
   $scope.minusMin = function() {
     $scope.min > 15 ? $scope.min  = $scope.min  - 15 : $scope.min  = 0;
   }
   $scope.addMin = function() {
     $scope.min = $scope.min + 15;
     if ($scope.min >= 60) {
       $scope.min = 0;
       $scope.hr = $scope.hr + 1;
     }
   }



  //  var ref = new Firebase("https://meterd.firebaseio.com");
  //    var authData = ref.getAuth();
  // console.log(authData);


  $scope.reserveSpace = function(i) {
    newHr = $scope.hr;
    newMin = $scope.min;
    var minAsHour = newMin / 60;
    var totalTimeAsHr = minAsHour + newHr;
    var formattedTime = parseFloat(totalTimeAsHr);

    var finishDate = Date.now() + (newMin * (60*1000)) + (newHr * (60*60*1000));

    var price = $scope.appState.user.Price;
    var cost = $scope.cost = formattedTime * price;
    var amount = (cost * 100);
    $scope.total = amount;

    console.log("reserve");
    console.log(formattedTime);

    $scope.appState.user.$ref().update({
      Cost: cost,
      amount: amount,
      spaceNum: i.space,
      finishDate: finishDate,
      Time: formattedTime
    });

    var confirmPopup = $ionicPopup.confirm({
      // $scope.data = {user.cost}
      title: 'Confirmation of Payment',
      templateUrl: 'templates/confirmTemplate.html',
      scope: $scope,
    });

    confirmPopup.then(function(res) {
      if(res) {
        console.log('You are sure');
        handler.open({
          amount: amount
        });
      } else {
          console.log('You are not sure');
      }
      return false;
    });

    var handler = StripeCheckout.configure({
      key: 'pk_test_3XRcbuhJG1R1ykdm1ZEKtcGX',
      image: '',
      panelLabel: "Charge Card",
      token: function(stripeToken, args) {
        // Use the token to create the charge with a server-side script.
        // You can access the token ID with `token.id`

        $http({
          url: 'http://localhost:3000/stripe/charge',
        //  url: ' https://api.stripe.com',
          method: "POST",
        //  data: {stripeToken: token.id}
      //    data: "id="+stripeToken.id+"&uid="+ref.getAuth().uid+"&email="+stripeToken.email,
          data:
           "id="+stripeToken.id+"&uid="+$scope.appState.user.$id+"&email="+stripeToken.email+"&amount="+$scope.total,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (data, status, headers, config) {
            console.log("success"); // assign  $scope.persons here as promise is resolved here
            console.log(stripeToken);
            getTimestamp();
            $state.go('app.countDown');

        }).error(function (data, status, headers, config) {
            console.log("failure");
        });
      }
    });
  }; // reserveSpace()

  getTimestamp = function () {
    var timestamp = Math.floor(Date.now() / 1000);

    console.log("timestamp");
    console.log(timestamp);

    $scope.appState.user.$ref().update({
      initTimeStamp: timestamp
    });
  };

})



.controller('countDownCtrl', function($scope, $firebaseObject, $interval, $ionicPopup, $http, $window, $state, Auth, $ionicHistory, $stateParams){

  $scope.counter = 0;

  $scope.counter = Math.max(parseInt(($scope.appState.user.finishDate - Date.now()) / 1000), 0);
  $scope.stopped = false;
  $scope.buttonText='Stop';

  $scope.onTimeout = function(){
    var counter = Math.max(parseInt(($scope.appState.user.finishDate - Date.now()) / 1000), 0);

    if(counter <= 0) {
      $scope.counter = 0;
    } else {
      $scope.counter = counter;
    }
  };

  var mytimeout = $interval($scope.onTimeout,1000);

  $scope.hr = 0;
  $scope.min = 0;
  $scope.consoleHr = function() {
    console.log($scope.hr);
  };
  $scope.minusHour = function() {
    $scope.hr > 0 ? $scope.hr  = $scope.hr  - 1 : $scope.hr  = 0;
  }
  $scope.addHour = function() {
    $scope.hr = $scope.hr + 1;
  }
  $scope.minusMin = function() {
    $scope.min > 15 ? $scope.min  = $scope.min  - 15 : $scope.min  = 0;
  }
  $scope.addMin = function() {
    $scope.min = $scope.min + 15;
    if ($scope.min >= 60) {
      $scope.min = 0;
      $scope.hr = $scope.hr + 1;
    }
  }


  $scope.addTime = function() {
    console.log('hr', $scope.hr);
    console.log('min', $scope.min);
    newHr = $scope.hr;
    newMin = $scope.min;
    var minAsHour = newMin / 60;
    var totalTimeAsHr = minAsHour + newHr;
    var formattedTime = parseFloat(totalTimeAsHr);
    console.log(formattedTime);

    var price = $scope.appState.user.Price;
    var cost = $scope.cost = formattedTime * price;
    var amount = (cost * 100);
    $scope.total = amount;

    $scope.addCost = cost;

    console.log("addTime");


    var confirmPopup = $ionicPopup.confirm({
      title: 'Confirmation of Payment',
      templateUrl: 'templates/confirmTemplate2.html',
      scope: $scope,
    });

    confirmPopup.then(function(res) {
      if(res) {
        console.log('You are sure');
        //////STRIPE TO CHARGE CARD HERE/////
        handler.open({
          amount: amount
        });
      } else {
        console.log('You are not sure');
      }
      return false;
    });

    var handler = StripeCheckout.configure({
      key: 'pk_test_3XRcbuhJG1R1ykdm1ZEKtcGX',
      image: '',
      panelLabel: "Charge Card",
      token: function(stripeToken, args) {
        // Use the token to create the charge with a server-side script.
        // You can access the token ID with `token.id`
        $http({
          url: 'http://localhost:3000/stripe/charge',
        //url: ' https://api.stripe.com',
          method: "POST",
        //data: {stripeToken: token.id}
        //data: "id="+stripeToken.id+"&uid="+ref.getAuth().uid+"&email="+stripeToken.email,
          data:
           "id="+stripeToken.id+"&uid="+$scope.appState.user.$id+"&email="+stripeToken.email+"&amount="+$scope.total,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (data, status, headers, config) {
            console.log("success");
            console.log(stripeToken);

            var finishDate = Math.max($scope.appState.user.finishDate, Date.now()) + (newMin * (60*1000)) + (newHr * (60*60*1000));
            $scope.appState.user.$ref().update({
              finishDate: finishDate,
              Cost: cost,
            });

        }).error(function (data, status, headers, config) {
            console.log("failure");
        });
      }
    });
  };

  $scope.leave = function () {
    console.log("leave");

    var confirmPopup = $ionicPopup.confirm({
      title: 'Leaving your spot?',
      templateUrl: 'templates/confirmTemplate3.html',
      scope: $scope,
    });

    confirmPopup.then(function(res) {
      if(res) {
        console.log('You are sure');

        var totalTime = 0;
        $scope.appState.user.$ref().update({
          Time: 0,
          finishDate: 0,
          Cost: 0,
          moreTime: 0,
          spaceNum: 0,
          amount: 0
        });

        $scope.counter = 0;
        $scope.stopped = true;
        $state.go('app.search');
      } else {
        console.log("You are not leaving");
      }
    });
  };

})

 .filter('formatTimer', function() {
   return function(input)
     {
         function z(n) {return (n<10? '0' : '') + n;}
        var seconds = input % 60;
         var minutes = Math.floor(input / 60);
        // var minConv = Math.floor(minutes/ 60)
         var hours = Math.floor(minutes / 60);
    //  return (z(hours) +':'+z(minutes)+':'+z(seconds));
        // return (z(hours) +':'+z(minutes));
      //  return(z(minutes));
      return (z(minutes)+':'+z(seconds));
     };
 })


.controller('payCtrl', function($scope, $ionicScrollDelegate){
    $scope.scrollTo = function (payInfo) {
    $ionScrollDelegate.anchorScroll(payInfo);
  };
})
.controller('CheckoutCtrl', function ($scope, totalAmount) {

   $scope.totalAmount = totalAmount;
//  $scope.totalAmount = 10;

  $scope.onSubmit = function () {
    console.log("place order button pressed.");
    $scope.processing = true;
  };

  $scope.stripeCallback = function (code, result) {
    $scope.processing = false;
    $scope.hideAlerts();
    if (result.error) {
      $scope.stripeError = result.error.message;
    } else {
      $scope.stripeToken = result.id;
    }
  };

  $scope.hideAlerts = function () {
    $scope.stripeError = null;
    $scope.stripeToken = null;
  };
})





// .controller('AppCtrl', function($scope, $ionicModal, $timeout) {
//
//   // With the new view caching in Ionic, Controllers are only called
//   // when they are recreated or on app start, instead of every page change.
//   // To listen for when this page is active (for example, to refresh data),
//   // listen for the $ionicView.enter event:
//   //$scope.$on('$ionicView.enter', function(e) {
//   //});
//
//   // Form data for the login modal
//   $scope.loginData = {};
//
//   // Create the login modal that we will use later
//   $ionicModal.fromTemplateUrl('templates/login.html', {
//     scope: $scope
//   }).then(function(modal) {
//     $scope.modal = modal;
//   });
//
//   // Triggered in the login modal to close it
//   $scope.closeLogin = function() {
//     $scope.modal.hide();
//   };
//
//   // Open the login modal
//   $scope.login = function() {
//     $scope.modal.show();
//   };
//
//   // Perform the login action when the user submits the login form
//   $scope.doLogin = function() {
//     console.log('Doing login', $scope.loginData);
//
//     // Simulate a login delay. Remove this and replace with your login
//     // code if using a login system
//     $timeout(function() {
//       $scope.closeLogin();
//     }, 1000);
//   };
// })


.controller('SignUpCtrl', function($scope, $stateParams) {
})

;
