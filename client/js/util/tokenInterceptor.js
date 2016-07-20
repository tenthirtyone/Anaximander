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