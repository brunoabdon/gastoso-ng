'use strict';

// Declare app level module which depends on views, and components
angular.module('gastosoApp', [
  'ngRoute',
  'ngResource',
  'xeditable',
  'ngStorage',
  'gastosoApp.contas',
  'gastosoApp.fatos'
])
.config(['$routeProvider',function($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/contas'});   
}])
.filter('data', ['dateFilter',function($dateFilter) {    
    return function(theDate) {
       return $dateFilter(theDate, 'MMMM dd, yyyy');
    };
}])
.filter('real',['currencyFilter',function($currencyFilter) {
    return function(valor) {
       return $currencyFilter(valor/100,'R$ ');
    };
}])
.controller('LoginCtrl',['$rootScope' ,'$scope','$localStorage','$http','$timeout','Utils',
    function($rootScope, $scope, $localStorage,$http,$timeout,Utils){
        
        $scope.password = '';
        
        $scope.login = function(){
            if(!$rootScope.isLoggedIn){

                console.log($scope.password);

                $http
                    .post(Utils.appBaseUrl + '/login', $scope.password)
                    .then(function(response){
                        $localStorage.authKey = angular.fromJson(response.data);
                        $rootScope.isLoggedIn = true;
                        console.log($localStorage.authKey);
                        $http.defaults.headers.common['X-Abd-auth_token'] = $localStorage.authKey.token;
                    }, function(response){
                        $scope.loginErrorMsg = response.statusText;
                        $timeout(function(){
                            delete $scope.loginErrorMsg;
                        },3000);
                    });
            }
        };

        $scope.logout = function(){
            delete $localStorage.authKey;
            $rootScope.isLoggedIn = false;
            $http.defaults.headers.common['X-Abd-auth_token'] = null;
        };
    }
])
.run(['$rootScope','$localStorage','$http',function($rootScope,$localStorage,$http){
        $rootScope.isLoggedIn = false || $localStorage.authKey;
        if($rootScope.isLoggedIn){
            $http.defaults.headers.common['X-Abd-auth_token'] 
                = $localStorage.authKey.token;
        }
}]);

var gastosoApp = angular.module('gastosoApp');

gastosoApp.factory('Conta', ['$resource','Utils',
  function($resource,Utils){
    return $resource(Utils.appBaseUrl + '/contas/:id', {id:'@id'}, {});
}]);

gastosoApp.factory('Fato', ['$resource','Utils',
  function($resource,Utils){
    return $resource(Utils.appBaseUrl + '/fatos/:id', {id:'@id'}, {});
}]);

gastosoApp.factory('Lancamento', ['$resource','Utils',
  function($resource,Utils){
    return $resource(Utils.appBaseUrl + '/lancamentos/:id', {id:'@id'}, {});
}]);

gastosoApp.factory('Utils',[function(){
     var util = {};
     util.classDinheiro = function (valor) { 
        var klass = 'dinheiro';
	if(valor !== null && valor !== '-' && isNaN(valor)) {
	   klass += ' errado';
	} else if(valor > 0){
	    klass += ' positivo';
	} else if(valor < 0){
	    klass += ' negativo';
	}
        return klass;
     };
     
    var serverDomain = 
        window.location.host === "localhost:8000"
            ? "localhost:5000"
            : "gastoso.herokuapp.com";
            
    util.appBaseUrl = 'http://' + serverDomain;
   
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

gastosoApp.factory('MesNav',function(){
    
    return function(data){
        this.saveStrFormats = function(){
            this.mesStr = 
                this.ano
                + '-'
                + (this.mes >= 10 ? '' : '0')
                + this.mes;
            this.dateStr = this.mesStr + '-01';
        };
        
        
        if(data instanceof Date){
            this.mes = data.getMonth() + 1;
            this.ano = data.getFullYear();
            this.saveStrFormats();
        } else if (typeof data === 'string' && data.length === 7){
            
            var re = /^([0-9]{4})-([0-9]{2})$/;
            
            var res = re.exec(data);
            if(res){

                var mes = parseInt(res[2]);
                var ano = parseInt(res[1]);
                
                if(mes >= 1 && mes <= 12){
                    this.mes = mes;
                    this.ano = ano;
                    this.saveStrFormats();
                }
            }
        }
        
        this.incrementaMes = function(){
            var mes = this.mes+1;
            if(mes === 13){
                this.mes = 1;
                this.ano++;
            } else {
                this.mes = mes;
            }
            this.saveStrFormats();
        };
        
        this.decrementaMes = function(){
          var mes = this.mes-1;
          if(mes === 0){
              this.mes = 12;
              this.ano--;
          } else {
              this.mes = mes;
          }
          this.saveStrFormats();
        };
    };
});

//function currency(N){N=parseFloat(N);if(!isNaN(N))N=N.toFixed(2);else N='0.00';return N;}
