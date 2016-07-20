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