'use strict';

// Declare app level module which depends on views, and components
angular.module('gastosoApp', [
  'ngRoute',
  'ngResource',
  'xeditable',
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
       return $currencyFilter(valor/100,'R$ ');
    }
}])


;

var serverdomain = 'localhost:5000';
//var serverdomain = 'gastoso.herokuapp.com';

var appBaseUrl = 'http://' + serverdomain;

var gastosoApp = angular.module('gastosoApp');

gastosoApp.factory('Conta', ['$resource',
  function($resource){
    return $resource(appBaseUrl + '/contas/:id', {id:'@id'}, {});
}]);

gastosoApp.factory('Fato', ['$resource',
  function($resource){
    return $resource(appBaseUrl + '/fatos/:id', {id:'@id'}, {});
}]);

gastosoApp.factory('Lancamento', ['$resource',
  function($resource){
    return $resource(appBaseUrl + '/lancamentos/:id', {id:'@id'}, {});
}]);

gastosoApp.factory('Utils',[function(){
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

gastosoApp.factory('MsgService',function(){
    var MsgService = new function(){
        this.message = "";
        this.addMessage = function(newMessage){
            MsgService.message = newMessage;
        };
        this.hasMessage = function(){
            return MsgService.message !== "";
        };
        this.clearMessage=function(){
            MsgService.message = "";
        };
        
        this.handleFail = function(obj){
            MsgService.message = obj.data;
            MsgService.status = obj.status; //fazer alguma coisa com isso...
        };
    };
    return MsgService;
});


//function currency(N){N=parseFloat(N);if(!isNaN(N))N=N.toFixed(2);else N='0.00';return N;}
