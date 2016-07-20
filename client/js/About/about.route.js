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