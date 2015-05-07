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


//var serverdomain = 'localhost:5000';
var serverdomain = 'gastoso.herokuapp.com';

var appBaseUrl = 'http://' + serverdomain;

var gastosoService = angular.module('gastosoServices', ['ngResource']);

gastosoService.factory('Conta', ['$resource',
  function($resource){
    return $resource(appBaseUrl + '/contas/:contaId', {}, {});
}]);


gastosoService.factory('Movimentacao', ['$resource',
  function($resource){
    return $resource(appBaseUrl + '/movimentacoes/:movimentacaoId', {}, {});
}]);

