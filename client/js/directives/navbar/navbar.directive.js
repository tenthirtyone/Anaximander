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