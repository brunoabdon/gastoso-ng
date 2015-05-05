'use strict';

// Declare app level module which depends on views, and components
angular.module('gastosoApp', [
  'ngRoute',
  'ngResource',
  'gastosoServices',
  'gastosoApp.contas'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/contas'});
}]);


var gastosoService = angular.module('gastosoServices', ['ngResource']);

gastosoService.factory('Conta', ['$resource',
  function($resource){
//      return $resource('http://localhost:5000/contas/');

    return $resource('http://localhost:5000/contas/:contaId', {}, {
      query: {method:'GET', params: {contaId:'@id'} ,isArray:true}
    });

/*
  var res = new Object();
  res.query = function(){return [{"id":1,"nome":"Carteira"},{"id":2,"nome":"Santander"},{"id":3,"nome":"Banco do Brasil"},{"id":4,"nome":"Cartão de Crédito"}];};

return res
*/

  }]);
