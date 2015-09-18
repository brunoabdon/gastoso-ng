'use strict';

angular.module('gastosoApp.contas', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/contas', {
    templateUrl: 'contas/contas.html',
    controller: 'ContasCtrl'
  }).when('/contas/:contaId',{
    templateUrl: 'contas/conta.html',
    controller: 'ContaCtrl'
  }).when('/novaConta', {
    templateUrl: 'contas/novaConta.html',
    controller: 'NovaContaCtrl'
  });
}])

.controller('ContasCtrl', ['$scope','Conta','$routeParams',function($scope, Conta,$routeParams) {
   $scope.contas = Conta.query(function(obj){},function(obj){ 
         $scope.mensagem = {txt: obj.data, status: obj.status};
      });

}])
.controller('ContaCtrl', ['$scope','$routeParams','Utils', 'Conta','Lancamento',
 function($scope, $routeParams, Utils, Conta, Lancamento) {
  
  $scope.utils = Utils;
  
  var contaId = $routeParams.contaId;
  
  $scope.conta = Conta.get({contaId:contaId});
  $scope.lancamentos = Lancamento.query({conta:contaId});

}]).controller('NovaContaCtrl', ['$scope','Conta',function($scope, Conta) {
  $scope.conta = new Conta();
  $scope.adicionarConta = function(){
       $scope.conta.$save(function(conta,responseHeaders){
         $scope.mensagem = {txt: conta.nome + " criada.", status: responseHeaders.status};
         console.log($scope.mensagem);
         $scope.conta = new Conta();
       });
  };
  
}])
;


