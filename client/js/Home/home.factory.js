(function() {
  'use strict';
  
  angular.module('Anaximander.home')
  .factory('HomeService', HomeService);
  
  HomeService.$inject = ['$http', '$state', '$timeout'];
  
  function HomeService($http, $state, $timeout) {
    var APIURL = '/api/trips';

    return {
      loadShape: loadShape,
      getTrips: getTrips,
      saveShape: saveShape    
    };

    function getTrips(query) {
      query = {
        pageNumber: 1,
        limit: 20000,
        pickupTime: query.pickupTime,
        dropoffTime: query.dropoffTime,
        polygon: query.polygon
      };
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

    function loadShape(shapeName) {
      var query = {
        shapename: shapeName
      };
      return $http.get('/api/shape', {params: query})
        .then(loadShapeComplete)
        .catch(loadShapeFailed);

      function loadShapeComplete(response) {
        console.log(response);
        return response.data;
      }

      function loadShapeFailed(error) {
        console.log('XHR Failed for loadShape.' + error.data);
      }
    }

    function saveShape(shape) {
      var path = '/api/shape'
      return $http.post(path, shape)
        .then(saveShapeComplete)
        .catch(saveShapeFailed);

      function saveShapeComplete(response) {
        console.log(response);
        return response.data;
      }

      function saveShapeFailed(error) {
        console.log('XHR Failed for saveShape.' + error.data);
      }
    }
  }
  
}());