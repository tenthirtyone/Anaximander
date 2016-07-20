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