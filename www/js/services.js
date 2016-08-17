angular.module('starter.services', [] )
  // .factory('Auth', function($firebaseAuth) {
  //   var usersRef = new Firebase('https://meterd.firebaseapp.com');
  //   return $firebaseAuth(usersRef);
  // });

  // create a custom Auth factory to handle $firebaseAuth
  .factory('Camera', ['$q', function($q) {

  return {
    getPicture: function(options) {
      var q = $q.defer();

      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);

      return q.promise;
    }
  };
}])
.factory('Auth', function($firebaseAuth, Root, $timeout){
  var auth = $firebaseAuth(Root);


  return {

    // helper method to login with multiple providers
    loginWithProvider: function loginWithProvider(provider) {
      return auth.$authWithOAuthPopup(provider);
    },
    // convenience method for logging in with Facebook
    loginWithFacebook: function login() {
      return this.loginWithProvider("facebook");
    },
    // wrapping the unauth function
    logout: function logout() {
      auth.$unauth();
    },
    // wrap the $onAuth function with $timeout so it processes
    // in the digest loop.
    onAuth: function onLoggedIn(callback) {
      auth.$onAuth(function(authData) {
        $timeout(function() {
          callback(authData);
        });
      });
    }
  };
})

/// USERS///
.factory('Users', function($firebaseArray, $firebaseObject, FirebaseUrl){
//   var usersRef = new Firebase(FirebaseUrl+'users');
   var usersRef = new Firebase("https://meterd.firebaseio.com +'users'");
   var users = $firebaseArray(usersRef);

   var Users = {
     getProfile: function(uid){
        return $firebaseObject(usersRef.child(uid));
      },
      getEmail: function(uid){
        return users.$getRecord(uid).email;
      },

      getGravatar: function(uid){
        return '//www.gravatar.com/avatar/' + users.$getRecord(uid).emailHash;
      },

      all: users

   };

   return Users;
 })




///GEOLOCATION SERVICE///

.factory('geoLocationService', ['$q', '$http', function($q, $http){

        var getLocation = function() {

            var defer = $q.defer();

            // If supported and have permission for location...
            if (navigator.geolocation) {

                //
                navigator.geolocation.getCurrentPosition(function(position){

                    var result = {latitude : position.coords.latitude , longitude : position.coords.longitude}

                    var mapOptions = {
                           center: result,
                           zoom: 15,
                           mapTypeId: google.maps.MapTypeId.ROADMAP
                         };



                    // Adding randomization since we are all in the same location...
                    // result.latitude += (Math.random() >0.5? -Math.random()/100 : Math.random()/100  ) ;
                    // result.longitude += (Math.random() >0.5? -Math.random()/100 : Math.random()/100  ) ;

                    getNearbyCity(result.latitude, result.longitude).then(function(data){
                        result.address = data.data.results[1].formatted_address;
                        defer.resolve(result);
                    });


                }, function(error){

                    defer.reject({message: error.message, code:error.code});

                }, {
                  timeout: 120 * 1000,
                  maximumAge: 10 * 60 * 1000,
                  enableHighAccuracy: false,
                });
            }
            else {
                defer.reject({error: 'Geolocation not supported'});
            }

            return defer.promise;
        }

        var getNearbyCity = function (latitude, longitude){

            var defer = $q.defer();
            var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude +',' + longitude +'&sensor=true';

            $http({method: 'GET', url: url}).
                success(function(data, status, headers, config) {

                     defer.resolve({data : data});
                }).
                error(function(data, status, headers, config) {
                  defer.reject({error: 'City not found'});
                });

            return defer.promise;
        }

        var service = {
            getLocation : getLocation,
            getNearbyCity: getNearbyCity
        };

        return service;
    }])


/// FIREBASE SERVICE///
.factory('dataService', ['$firebase','$q', '$firebaseArray', '$firebaseObject', function($firebase,$q, $firebaseArray, $firebaseObject){

        // var firebaseRef= new Firebase("https://popping-torch-4767.firebaseio.com/");
      var firebaseRef= new Firebase("https://meterd.firebaseio.com");
      var geoFire = new GeoFire(firebaseRef.child("_geofire"));


        // var getUserInfo = function(key) {
        //     console.log(key);
        //
        //   var ref = new Firebase("https://meterd.firebaseio.com");
        //    var userRef = new Firebase(ref + "/users/" + key);
        //    return userRef;
        //
        //
        // }


        var getFirebaseRoot = function(){
            return firebaseRef;
        };

        var getGeoFireNode = function(){
            return geoFire;
        }

        var getParkSpaceNode = function(key){
            var path = "Locations/";
            if (key) {
              path = path + key;
            }
            return getFirebaseRoot().child(path);
        }

        var addData = function(data, locationData){
            // persist our data to firebase
            var ref = getParkSpaceNode();

            return  $firebase(ref).$push(data).then(function(childRef){
                   addGeofireData({key: childRef.name(), latitude: locationData.latitude, longitude: locationData.longitude});
            });
        };

        var addGeofireData = function(data){
            var defer = $q.defer();

            geoFire.set(data.key, [data.latitude, data.longitude]).then(function() {
                defer.resolve();
              }).catch(function(error) {
                defer.reject(error);
            });

            return defer.promise;
        };

        var getParkSpaces = function(){
            var ref = getParkSpaceNode();
            // return $firebase(ref).$asArray();
            return $firebaseArray(ref);
        }

        var getParkSpace = function(key){
            var ref = getParkSpaceNode(key);
            return $firebaseObject(ref);
        }


        var service = {
            addData : addData,
            getParkSpace: getParkSpace,
            getParkSpaces: getParkSpaces,
            getFirebaseRoot: getFirebaseRoot,
            getGeoFireNode : getGeoFireNode
        };

        return service;

    }])
