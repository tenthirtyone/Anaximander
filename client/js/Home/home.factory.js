(function() {
  'use strict';
  
  angular.module('Anaximander.home')
  .factory('HomeService', HomeService);
  
  HomeService.$inject = ['$http', '$state', '$timeout'];
  
  function HomeService($http, $state, $timeout) {
    var APIURL = '/api/trips';

    return {
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