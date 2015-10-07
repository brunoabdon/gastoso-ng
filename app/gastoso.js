'use strict';

// Declare app level module which depends on views, and components
angular.module('gastosoApp', [
  'ngRoute',
  'ngResource',
  'gastosoServices',
  'gastosoApp.contas',
  'gastosoApp.fatos'
])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/contas'});
}])
.filter('data', ['dateFilter',function($dateFilter) {    
    return function(theDate) {
       return $dateFilter(theDate, 'MMMM dd, yyyy');
    }
}])
.filter('real',['currencyFilter',function($currencyFilter) {
    return function(valor) {
       return $currencyFilter(valor,'R$ ');
    }
}])


;

var serverdomain = 'localhost:5000';
//var serverdomain = 'gastoso.herokuapp.com';

var appBaseUrl = 'http://' + serverdomain;

var gastosoService = angular.module('gastosoServices', ['ngResource']);

gastosoService.factory('Conta', ['$resource',
  function($resource){
    return $resource(appBaseUrl + '/contas/:id', {id:'@id'}, {});
}]);

gastosoService.factory('Fato', ['$resource',
  function($resource){
    return $resource(appBaseUrl + '/fatos/:id', {id:'@id'}, {});
}]);

gastosoService.factory('Lancamento', ['$resource',
  function($resource){
    return $resource(appBaseUrl + '/lancamentos/:id', {id:'@id'}, {});
}]);

gastosoService.factory('Utils',[function(){
     var util = {};
     util.classDinheiro = function (valor) { 
        var klass = 'dinheiro';
	if(valor != null && valor != '-' && isNaN(valor)) {
	   klass += ' errado';
	} else if(valor > 0){
	    klass += ' positivo';
	} else if(valor < 0){
	    klass += ' negativo';
	}
        return klass;
     };

     return util;
}]);

//function currency(N){N=parseFloat(N);if(!isNaN(N))N=N.toFixed(2);else N='0.00';return N;}
