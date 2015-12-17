'use strict';

angular.module('gastosoApp', [
  'ngRoute',
  'ngResource',
  'xeditable',
  'ngStorage',
  'ngAnimate',
  'ngMaterial',
  'gastosoApp.contas',
  'gastosoApp.fatos',
  'gastosoApp.gasto'
])

.config(['$routeProvider','$mdThemingProvider',function($routeProvider,$mdThemingProvider) {
    $routeProvider.otherwise({redirectTo: '/fatos'});
    
    $mdThemingProvider.theme('default')
        .primaryPalette('grey')
        .accentPalette('red');
    
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

.directive('abdLink', ['$location', function ($location) {
  return{
    restrict: 'A',
    link: function (scope, element, attr) {
      element.attr('style', 'cursor:pointer');
      element.on('click', function(){
        $location.path("/" + attr.abdLink);
        scope.$apply();
      });
    }
  };
}])
.directive("fmtLocalDate", ['DateUtils',function(DateUtils){
  return {
   require: 'ngModel',
    link: function(scope, elem, attr, modelCtrl) {
      modelCtrl.$formatters.push(function(modelValue){
        return DateUtils.parseLocalDate(modelValue);
      });
    }
  };
}])

.run(['$rootScope','$localStorage','$http','$location','$resource','Utils','Login',
    function($rootScope,$localStorage,$http,$location,$resource,Utils,Login){
        $rootScope.isLoggedIn = false || $localStorage.authKey;
        if(!$rootScope.isLoggedIn){
           $location.path("/login"); 
        } else {
            $http.defaults.headers.common['X-Abd-auth_token'] = 
                $localStorage.authKey.token;
            $http.head(Utils.appBaseUrl + "/ping").then(
                function(){
                    if($location.path() === "/login"){
                        $location.path("/fatos"); 
                    }
                }, function (res){
                if(res.status === 401){
                    delete $http.defaults.headers.common['X-Abd-auth_token'];
                    $rootScope.isLoggedIn = false;
                    $location.path("/login");
                } else {
                    $location.path("/panic"); 
                }
            });
        }
        $rootScope.logout = Login.logout;
}]);

var gastosoApp = angular.module('gastosoApp');

gastosoApp.factory('Conta', ['$resource','Utils',
  function($resource,Utils){
    return $resource(Utils.appBaseUrl + '/contas/:id', {id:'@id'}, {
        lista:{method:"GET",url:Utils.appBaseUrl + '/contasDetalhadas',isArray:true,cache:true,withCredentials:true},
        extrato:{method:"GET",url:Utils.appBaseUrl + '/extrato',isArray:false,cache:true,withCredentials:true}
    });
}]);

gastosoApp.factory('Fato', ['$resource','Utils', function($resource,Utils){
    return $resource(Utils.appBaseUrl + '/fatos/:id', {id:'@id'}, {
        lista:{method:"GET",url:Utils.appBaseUrl + '/fatosDetalhados',isArray:false,cache:true,withCredentials:true}
    });
}]);

gastosoApp.factory('Lancamento', ['$resource','Utils', function($resource,Utils){
    return $resource(Utils.appBaseUrl + '/lancamentos/:id', {id:'@id'}, {});
  }]);

gastosoApp.factory('DateUtils', function(){
    return {
        parseLocalDate: function(dataStr){
            var data = null;
            if (typeof dataStr === 'string'){
                var re = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;

                var res = re.exec(dataStr);
                if(res){
                    var dia = parseInt(res[3]);
                    var mes = parseInt(res[2]);
                    var ano = parseInt(res[1]);

                    if((mes >= 1 && mes <= 12) && (dia >= 1 && dia <= 31)){
                        data = new Date(ano,mes-1,dia);
                    }
                }
            }
            
            if(data===null){
                throw ("Unparsable: " + dataStr);
            }
            return data;
        }
    };
});


gastosoApp.factory('Depends',['Conta','Fato','Lancamento',
    function(Conta,Fato,Lancamento){
        
        var Depends = {};

        var carregaConta = function(lancamentos,idx,mapContas,successCB,errorCB){
            if(lancamentos.length > idx){
                var lancamento = lancamentos[idx];
                var contaId = lancamento.contaId;
                var conta = mapContas[contaId];
                if(!conta){
                    Conta.get({id:contaId},function(conta){
                        mapContas[conta.id] = conta;
                        lancamento.conta = conta;
                        carregaConta(lancamentos,++idx,mapContas,successCB,errorCB);
                    },errorCB);
                } else {
                    lancamento.conta = conta;
                    carregaConta(lancamentos,++idx,mapContas,successCB,errorCB);
                }
            } else {
                (successCB||angular.noop)(lancamentos);
            }
        };

        var lancamentosDoFato = function(fato,successCallback,errorCallback,cacheContas){
            Lancamento.query({fato:fato.id},
            function(lancamentos){
                carregaConta(lancamentos,0,(cacheContas||{}),successCallback,errorCallback);
            }
            ,errorCallback);
        };  

        Depends.carregaLancamentos = function(fato,success,fail,cacheContas){
        lancamentosDoFato(fato,
             function(lancamentos){
                 fato.$lancamentos = lancamentos;
                 (success||angular.noop)(lancamentos);
                 fato.$total = 0;
                 lancamentos.forEach(function(lancamento) {
                     fato.$total+=lancamento.valor;
                 });        
        }
        ,fail,cacheContas);        
     };

        return Depends;    
        
}]);

gastosoApp.factory('Utils',['$rootScope',function($rootScope){
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
     
    util.appBaseUrl = 
        window.location.host === "localhost:8000"
            ? "http://localhost:5000"
            : window.location.host === "192.168.0.20:8000" 
                ? "http://192.168.0.20:5000" 
                : "https://gastoso.herokuapp.com";

    util.setTitle = function(title){
        $rootScope.title=title;
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
