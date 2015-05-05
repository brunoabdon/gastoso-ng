'use strict';

angular.module('gastosoApp.contas', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/contas', {
    templateUrl: 'contas/contas.html',
    controller: 'ContasCtrl'
  }).when('/contas/:contaId',{
    templateUrl: 'contas/conta.html',
    controller: 'ContaCtrl'
  });
}])

.controller('ContasCtrl', ['$scope','Conta',function($scope, Conta) {
  $scope.contas = Conta.query();
}]).controller('ContaCtrl', ['$scope','$routeParams','Conta',function($scope, $routeParams, Conta) {
  $scope.conta = Conta.get({contaId:$routeParams.contaId});
  
}])
;


