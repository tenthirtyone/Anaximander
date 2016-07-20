(function() {
	'use strict';

	angular.module('Anaximander.about', []);

}());
(function() {
	'use strict';

	angular.module('Anaximander.home', []);

}());
(function() {
'use strict';

angular.module('Anaximander.directives', []);

}());
(function() {
  'use strict';
    
  angular.module('Anaximander', [
    'Anaximander.directives',
    'Anaximander.home',
    'Anaximander.about',
    'ui.map',
    'ngStorage',
    'ui.router'    
  ]);
      
}());
(function() {
  'use strict';

  angular.module('Anaximander.home')
    .controller('AboutController', AboutController);

  

  function AboutController() {
    var vm = this;
   

    return vm;
  }
}());
(function() {
  'use strict';
  angular.module('Anaximander.about')
    .run(appRun);

  appRun.$inject = ['routerHelper'];

  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [
      {
        state: 'about',
        config: {
          url: '/about',
          templateUrl: 'views/about.template.html',
          controller: 'AboutController',
          controllerAs: 'about'  
        }
      }
    ];
  }
}());
(function() {
  'use strict';

  angular.module('Anaximander.home')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['HomeService', '$scope', '$timeout', 'socket'];

  function HomeController(HomeService, $scope, $timeout, socket) {
    // Controller-Map Mappings for the... Map
    var vm = this;
    vm.map = {};
    vm.mapMode = 'Marker';
    vm.drawMapMode = drawMapMode;
    vm.clearMap = clearMap;
    vm.drawingPoly = false;
    vm.mapOptions = {
      center: new google.maps.LatLng(40.39011437783109, -76.06624023437502),
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      scrollwheel: true,
      disableDoubleClickZoom: true
    };

    // Trip data
    vm.trips = [];
    vm.tripStart = new Date(2014, 3, 1, 0, 0, 0, 0);
    vm.tripEnd = new Date(2014, 3, 3, 0, 0, 0, 0);
    vm.filterTrips = filterTrips;
    // Socket trips
    vm.totalTrips = 0;
    vm.drawingMap = false;

    // User-drawn Shape
    vm.polygon = null;
    vm.polygonVisible = true;
    var polyMarkers = [];

    // Markers / Cluster (Top Pickup) / Heatmap
    var markers = [];
    var markerCluster;
    // Blue Markers
    var polyMarkerIcon = {
      url: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|0082cc'
    };
    // Green Markers
    var pickupMarkerIcon = {
      url: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|00cc3e'
    };
    // Red Markers
    var dropoffMarkerIcon = {
      url: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|cc0000'
    };
    vm.drawTripMarkers = drawTripMarkers;
    vm.drawTripCluster = drawTripCluster;
    vm.showAllMarkers = showAllMarkers;
    vm.showDropoffMarkers = true;
    vm.showPickupMarkers = true;

    // Geofence
    vm.removePolygon = removePolygon;
    vm.togglePolygon = togglePolygon;
    vm.undoPolygon = undoPolygon;

    // Heatmap
    var heatmap = null;
    vm.drawHeatmap = drawHeatmap;

    // UI
    vm.showStatistics = true;
    vm.showFilters = true;
    vm.showQuery = false;
    vm.showControls = true;
    vm.showProgress = false;

    // Socket
    vm.testSocket = testSocket;
    vm.getSocketTrips = getSocketTrips;

    init();

    function init() {
      //I disagree with the ui-routers implementation of the map. At least, 
      //in how they retrieve the map from the scope. They bundle ui router
      //as a directive. I think it should be a separate module and its own
      //angular service. Instead of bootstrapping the map in the DOM, do it 
      //in memory. This is to circumvent an expensive listener.
      $timeout(function() {
        vm.map = $scope.myMap;
        markerCluster = new MarkerClusterer(vm.map, markers);
        addMapListeners();
      }, 1);

      // Defaults are defined, start with some results
      filterTrips();
    }

    function addMapListeners() {
      google.maps.event.addListener(vm.map, "click", function(event) {

        if (vm.drawingPoly) {
          var tempMarker = new google.maps.Marker({
            map: vm.map,
            draggable: true,
            animation: google.maps.Animation.DROP,
            icon: polyMarkerIcon,
            position: {
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            }
          });

          google.maps.event.addListener(tempMarker, 'dragend', function() {
            
            drawPolygon();
          });

          polyMarkers.push(tempMarker);

          drawPolygon();
        }

      });
      /*
            google.maps.event.addListener(vm.map, "mousemove", function(event) {

            });

            google.maps.event.addListener(vm.map, "drag", function() {

            });

            google.maps.event.addListener(vm.map, "dragstart", function() {

            });
      */
    }

    function changeMapCenter(lat, lng) {
      vm.map.setCenter(new google.maps.LatLng(lat, lng));
    }

    function clearMap() {
      removeHeatmap();
      removeCluster();
      removeMarkers();
    }

    function drawMapMode() {
      vm.drawingMap = true;
      switch(vm.mapMode) {
        case 'Marker':
          drawTripMarkers();
          break;
        case 'Cluster':
          drawTripCluster();
          break;
        case 'Heat':
          drawHeatmap();
          break;  
      }
      vm.drawingMap = false;
    }

    function drawPolygon() {
      vm.polygon ? vm.polygon.setMap(null) : console.log(false);

      if (polyMarkers.length === 0) {
        return;
      }

      var polyCoords = [];

      for (var i = 0; i < polyMarkers.length; i++) {
        polyCoords.push({
          lat: polyMarkers[i].position.lat(),
          lng: polyMarkers[i].position.lng()
        });
      }

      vm.polygon = new google.maps.Polygon({
        paths: polyCoords,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35
      });
      vm.polygon.setMap(vm.map);
    }

    function drawHeatmap() {
      vm.mapMode = 'Heat';

      heatmap ? heatmap.setMap(null) : console.log(false);

      clearMap();

      if (vm.trips.length === 0 || vm.trips === null) { return; }

      var tempPoints = [];    

      changeMapCenter(vm.trips[0].pickup.coordinates[1], vm.trips[0].pickup.coordinates[0]);
      for (var i = 0; i < vm.trips.length; i++) {
        if (vm.showPickupMarkers){
          tempPoints.push(new google.maps.LatLng(vm.trips[i].pickup.coordinates[1], vm.trips[i].pickup.coordinates[0]));
        }

        if (vm.showDropoffMarkers){
          tempPoints.push(new google.maps.LatLng(vm.trips[i].dropoff.coordinates[1], vm.trips[i].dropoff.coordinates[0]));
        }
       } 
      
      heatmap = new google.maps.visualization.HeatmapLayer({
        data: tempPoints,
        map: vm.map
      });
      
    }

    function drawTripCluster() {
      vm.mapMode = 'Cluster';
      clearMap();

      if (vm.trips.length === 0 || vm.trips === null) { return; }

      changeMapCenter(vm.trips[0].pickup.coordinates[1], vm.trips[0].pickup.coordinates[0]);
      for (var i = 0; i < vm.trips.length; i++) {
        if (vm.showPickupMarkers){
          var tempPickupMarker = new google.maps.Marker({
            position: {
              lat: vm.trips[i].pickup.coordinates[1],
              lng: vm.trips[i].pickup.coordinates[0]
            },
            map: null,
            icon: pickupMarkerIcon
          });
          markers.push(tempPickupMarker);
        }

        if (vm.showDropoffMarkers) {
        var tempDropoffMarker = new google.maps.Marker({
          position: {
            lat: vm.trips[i].pickup.coordinates[1],
            lng: vm.trips[i].pickup.coordinates[0]
          },
          map: null,
          icon: pickupMarkerIcon
        });
        markers.push(tempDropoffMarker);
       } 
      }
      markerCluster.addMarkers(markers);
    }

    function drawTripMarkers() {
      vm.mapMode = 'Marker';
      // Seems odd but this is good user feedback
      clearMap();
      
      if (vm.trips.length === 0 || vm.trips === null) { return; }

      changeMapCenter(vm.trips[0].pickup.coordinates[1], vm.trips[0].pickup.coordinates[0]);

      for (var i = 0; i < vm.trips.length; i++) {
        if (vm.showPickupMarkers){
          var tempPickupMarker = new google.maps.Marker({
            position: {
              lat: vm.trips[i].pickup.coordinates[1],
              lng: vm.trips[i].pickup.coordinates[0]
            },
            map: vm.map,
            icon: pickupMarkerIcon
          });
          markers.push(tempPickupMarker);
        }
        if (vm.showDropoffMarkers) {
          var tempDropoffMarker = new google.maps.Marker({
            position: {
              lat: vm.trips[i].dropoff.coordinates[1],
              lng: vm.trips[i].dropoff.coordinates[0]
            },
            map: vm.map,
            icon: dropoffMarkerIcon
          });
          markers.push(tempDropoffMarker);
        }
      }
    }

    function filterTrips() {      
      var mongoPoly;
      if (polyMarkers.length>0) {
        mongoPoly = JSON.stringify(getMongoPoly());
      } else {
        mongoPoly = JSON.stringify([[-75,42],[-73,42],[-73,40],[-75,40]]);
      }

      var query = {
        pickupTime: vm.tripStart,
        dropoffTime: vm.tripEnd,
        polygon: mongoPoly
      };
      getTrips(query);
    }

    function getMongoPoly() {
      var polyCoords = [];

      for (var i = 0; i < polyMarkers.length; i++) {
        polyCoords.push([polyMarkers[i].position.lng(), polyMarkers[i].position.lat()]);
      } 
      return polyCoords;
    }

    function getTrips(query) {
      return HomeService.getTrips(query)
        .then(function(res) {
          vm.trips = res;
          drawMapMode();
          //drawTripCluster();
        });
    }

    function toggleDropoffMarkers() {
      vm.showDropoffMarkers = !vm.showDropoffMarkers;
    }

    function hideMarkers() {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
      }
    }

    function removeCluster() {
      removeMarkers();
      markerCluster.clearMarkers();
    }

    function removeHeatmap() {
      if(heatmap) { heatmap.setMap(null); }
      heatmap = null;
    }

    function removeMarkers() {
      hideMarkers();
      markers = [];
    }

    function removePolygon() {
      for (var i = 0; i < polyMarkers.length; i++) {
        polyMarkers[i].setMap(null);
      }
      polyMarkers = [];

      if (vm.polygon) { vm.polygon.setMap(null); }
    }

    function showAllMarkers() {
      vm.showPickupMarkers = true;
      vm.showDropoffMarkers = true;
    }

    function togglePolygon() {
      vm.drawingPoly = !vm.drawingPoly;
      if (vm.drawingPoly) {
        vm.map.setOptions({
          draggableCursor: 'crosshair'
        });
      } else {
        vm.map.setOptions({
          draggableCursor: ''
        });
      }
    }

    function togglePickupMarkers() {
      vm.showPickupMarkers = !vm.showPickupMarkers;
    }

    function undoPolygon() {
      if (polyMarkers.length > 0) {
        var tempMarker = polyMarkers.pop();
        tempMarker.setMap(null);
        drawPolygon();
      }
    }

    // Socket
    socket.on('message', function(data) {
      console.log(data.message);
    })

    socket.on('trip:data', function(data) {
      vm.trips.push(data)
    })

    socket.on('trip:data:begin', function(data) {
      vm.totalTrips = data;
    })

    socket.on('trip:data:finish', function() {
      vm.drawingMap = true;
      $timeout(function() {
        drawMapMode();
      }, 1);
    })

    // Test functions
    function testSocket() {
      console.log('test')
      socket.emit('send:message', {
        message: 'test'
      });
    }

    function getSocketTrips() {
      vm.showProgress = true;
      clearMap();
      vm.trips = [];

      drawTripCluster();
      
      var mongoPoly;
      if (polyMarkers.length>0) {
        mongoPoly = JSON.stringify(getMongoPoly());
      } else {
        mongoPoly = JSON.stringify([[-75,42],[-73,42],[-73,40],[-75,40]]);
      }

      var query = {
        pickupTime: vm.tripStart,
        dropoffTime: vm.tripEnd,
        polygon: mongoPoly
      };

      socket.emit('get:trips', {
        query
      });
      vm.showProgress = false;
    }


      // Show me the default polygon boundaries
    vm.drawRectangle = function(lat, lng) {
      if (vm.rectangle) {
        delete vm.rectangle;
      }

      //[-75,42],[-73,42],[-73,40],[-75,40]

      var bounds = {
        north: 42,
        south: 40,
        east: -73,
        west: -75
      };

      vm.rectangle = new google.maps.Rectangle({
        bounds: bounds
      });

      vm.rectangle.setMap(vm.map);

    };


    return vm;
  }
}());
(function() {
  'use strict';
  
  angular.module('Anaximander.home')
  .factory('HomeService', HomeService);
  
  HomeService.$inject = ['$http', '$state', '$timeout'];
  
  function HomeService($http, $state, $timeout) {
    var APIURL = '/api/trips';

    return {
      getTrips: getTrips    
    };

    function getTrips(query) {
      query = {
        pageNumber: 1,
        pickupTime: query.pickupTime,
        dropoffTime: query.dropoffTime,
        polygon: query.polygon
      };
      console.log(query)
      console.log(JSON.stringify(query))
      return $http.get(APIURL, {params: query})
        .then(getTripsComplete)
        .catch(getTripsFailed);

      function getTripsComplete(response) {
        console.log(response);
        return response.data;
      }

      function getTripsFailed(error) {
        console.log('XHR Failed for getTrips.' + error.data);
      }
    }
  }
  
}());
(function() {
  'use strict';
  angular.module('Anaximander.home')
    .run(appRun);

  appRun.$inject = ['routerHelper'];

  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [
      {
        state: 'home',
        config: {
          url: '/',
          templateUrl: 'views/home.template.html',
          controller: 'HomeController',
          controllerAs: 'home'  
        }
      }
    ];
  }
}());
(function() {
  "use strict";
  
  // Response Headers
  angular.module('Anaximander')
  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };     
  }]); 
}());
(function() {
  // Modified version of John Papa's Router Helper
  // https://github.com/johnpapa/angular-styleguide
  
  angular
    .module('Anaximander')
    .provider('routerHelper', routerHelperProvider);

  routerHelperProvider.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider'];

  function routerHelperProvider($locationProvider, $stateProvider, $urlRouterProvider) {

      this.$get = RouterHelper;

      $locationProvider.html5Mode(false);

      RouterHelper.$inject = ['$state'];

      function RouterHelper($state) {
          var service = {
            configureStates: configureStates,
            getStates: getStates
          };

          return service;

          function configureStates(states, otherwisePath) {
            states.forEach(function(state) {
                $stateProvider.state(state.state, state.config);
            });
            $urlRouterProvider.otherwise("/");
          }

          function getStates() { return $state.get(); }
      }
  }
}());
(function() {
'use strict';

angular.module('Anaximander')
.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});
}());
(function() {
  //Monitor response headers for a json web token. Automatically
  //saves any auth tokens to local storage. Not used in this app
  "use strict";
  
  angular.module('Anaximander')
    .factory('tokenInterceptor', tokenInterceptor);
       
    tokenInterceptor.$inject = ['$localStorage'];
  
    function tokenInterceptor($localStorage) {  
      return {
          request: function(config) {
              if (!config.headers.Authorization){
                config.headers.Authorization = $localStorage.token || '';
              }
              return config;
          },
          response: function(response) {
            if(response.headers('Authorization')) {
              $localStorage.token = response.headers('Authorization');
            }
            return response;
          }
      };
  }
  
  angular.module('Anaximander')
    .config(['$httpProvider', function($httpProvider) {  
      $httpProvider.interceptors.push('tokenInterceptor');
  }]);
}());
(function() {
  'use strict';
  
  angular
    .module('Anaximander.directives')
    .directive('footer', footer);

  function footer() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'views/footer.template.html',
      scope: {
          footerdata: '='
      },
      controller: DirectiveController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  function DirectiveController() {
    var vm = this;
    
  }
  
}());
(function() {
  'use strict';
  
  angular
    .module('Anaximander.directives')
    .directive('header', header);

  function header() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'views/header.template.html',
      scope: {
          headerdata: '='
      },
      controller: DirectiveController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  function DirectiveController() {
    var vm = this;
    
  }
  
}());
(function() {
  'use strict';
  
  angular
    .module('Anaximander.directives')
    .directive('navbar', navbar);

  function navbar() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'views/navbar.template.html',
      scope: {
          navbardata: '='
      },
      controller: DirectiveController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  function DirectiveController() {
    var vm = this;
    
  }
  
}());