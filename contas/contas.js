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
  $scope.contas = Conta.query();
}])
.controller('ContaCtrl', ['$scope','$routeParams','Utils', 'Conta','Lancamento',
 function($scope, $routeParams, Utils, Conta, Lancamento) {
  
  $scope.utils = Utils;
  
  var contaId = $routeParams.contaId;
  
  $scope.conta = Conta.get({contaId:contaId});
  $scope.lancamentos = Lancamento.query({conta:contaId});

}]).controller('NovaContaCtrl', ['$scope','Conta',function($scope, Conta) {
  $scope.conta ={};
  $scope.adicionarConta = function(){
       Conta.save($scope.conta);
  };
  
}])
;


