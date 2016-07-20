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