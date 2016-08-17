app.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, $location, $ionicLoading, $compile, $timeout, googleDirections, dataService, geoLocationService, $firebaseObject, $window, $ionicHistory, $templateRequest) {

  var self = this;
  var geocoder;

  var vm = $scope.vm = {
    includeLocation: true,
    location: {
      latitude:  0,
      longitude: 0,
      address:   '',
    },
  };


  /*
   * Internal functions.
   */

  vm.save = function () {
    dataService.addData({
      name: vm.name|| '',
      text: vm.text || '',
      address: vm.location.address || ''
    }, {
      latitude: vm.location.latitude,
      longitude: vm.location.longitude
    });
  }

  self.createMap = function( element ) {
      self.$element = element;
      console.log(element);
      geocoder = new google.maps.Geocoder();
      geoLocationService.getLocation().then(function(result){
          vm.location = result;

          console.log(result);
          initializeMap();
      });
  };

  function initializeMap(){
    console.log("intializeMap function");
      // if ($scope.vm.location.latitude ==undefined)
      //     return;
      self.map = new google.maps.Map(self.$element[0], {
          // center:new google.maps.LatLng($scope.vm.location.latitude ,$scope.vm.location.longitude),
            center:new google.maps.LatLng(vm.location.latitude ,vm.location.longitude),
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMAP
      });

    var geoQuery = dataService.getGeoFireNode().query({
      center: [vm.location.latitude, vm.location.longitude],
      radius: 50
    });

    geoQuery.on("key_entered", function(key, location) {
      var item = {key:key, location:location};
      console.log('key entered on directive controller ' + key);
      self.setMarker(item);
      //  console.log(item);
    });
  };

  $templateRequest("templates/infowindow.html").then(function(html){
    self.infoWindowTemplate = $compile(html);
    self.infoWindow = new google.maps.InfoWindow({
      content: ''
    });
  });

  self.openInfoWindow = function(marker) {
    var infoScope = $scope.$new(true);
    var pos = marker.getPosition();
    var lat = pos.lat();
    var lng = pos.lng();

    var latlng = {lat: lat, lng: lng};

    infoScope.src = vm.location.latitude + "," + vm.location.longitude;
    infoScope.dst = lat + "," + lng

    self.infoWindow.setContent(self.infoWindowTemplate(infoScope)[0]);
    self.infoWindow.open(self.map, marker);
    self.map.setCenter(pos);

    geocoder.geocode({'location': latlng}, function(results, status) {
      if (!results) {
        return;
      }

      var formAddress = (results[0].formatted_address);

      infoScope.address = formAddress;
      infoScope.$apply();
    });

    return infoScope;
  };

  self.setMarker = function(markerLocation){
    var location = markerLocation.location;
    var key = markerLocation.key;
    var content = markerLocation.g;
    var address = markerLocation.address;
    var text = markerLocation.text;

    console.log(markerLocation);

    if (location.length==0) {
      return;
    }

    var marker = new google.maps.Marker({
      icon: './img/meterdMarker.svg',
      position: new google.maps.LatLng(location[0],location[1]),
      optimized: true,
      map: self.map
    //  map: $scope.$parent.map
    });

    marker.key = key;

    if (key == $scope.appState.user.selectedParkSpace) {
      $timeout(function() {
        self.openInfoWindow(marker);
      }, 10);
    }

    // Display our info window when the marker is clicked
    google.maps.event.addListener(marker, 'click', function() {
      infoScope = self.openInfoWindow(marker);

      var lat = marker.getPosition().lat();
      var lng = marker.getPosition().lng();

      var latlng = {lat: lat, lng: lng};

      geocoder.geocode({'location': latlng}, function(results, status) {
        var formAddress = (results[0].formatted_address);

        console.log(results[0].formatted_address);
        console.log(formAddress);

        $scope.appState.user.$ref().update({
          markAddress: formAddress,
          selectedParkSpace: key,
        });

        $scope.selectedParkSpace = dataService.getParkSpace(key);
        $scope.selectedParkSpace.$loaded().then(function(space) {
          $scope.appState.user.$ref().update({
             Price: space.price
          });
        });
      });
    });
  }

  google.maps.event.addDomListener(window, 'click');


  /*
   * Functions used from templates.
   */

  $scope.onParkClicked = function() {
    $state.go('app.park');
  };

  $scope.setUserTime = function() {
    var inputTime = document.getElementById('timeInput').value;
    console.log('helo from set time this is inputTime', inputTime);
    $scope.appState.user.$ref().update({
      Time: inputTime
    });
  }

})
