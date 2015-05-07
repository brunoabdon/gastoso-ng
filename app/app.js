'use strict';

// Declare app level module which depends on views, and components
angular.module('gastosoApp', [
  'ngRoute',
  'ngResource',
  'gastosoServices',
  'gastosoApp.contas',
  'gastosoApp.movimentacoes'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/contas'});
}]);


var gastosoService = angular.module('gastosoServices', ['ngResource']);

gastosoService.factory('Conta', ['$resource',
  function($resource){
//      return $resource('http://gastoso.herokuapp.com/contas/');
    return $resource('http://localhost:5000/contas/:contaId', {}, {});
}]);


gastosoService.factory('Movimentacao', ['$resource',
  function($resource){
//      return $resource('http://gastoso.herokuapp.com/contas/');
    return $resource('http://localhost:5000/movimentacoes/:movimentacaoId', {}, {});
}]);

