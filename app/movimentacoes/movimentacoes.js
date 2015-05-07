'use strict';

angular.module('gastosoApp.movimentacoes', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/movimentacoes', {
    templateUrl: 'movimentacoes/movimentacoes.html',
    controller: 'MovimentacoesCtrl'
  }).when('/movimentacoes/:movimentacaoId',{
    templateUrl: 'movimentacoes/movimentacao.html',
    controller: 'MovimentacaoCtrl'
  }).when('/novaMovimentacao', {
    templateUrl: 'movimentacoes/novaMovimentacao.html',
    controller: 'NovaMovimentacaoCtrl'
  });
}])

.controller('MovimentacoesCtrl', ['$scope','Movimentacao',function($scope, Movimentacao) {
  $scope.movimentacoes = Movimentacao.query();
}]).controller('MovimentacaoCtrl', ['$scope','$routeParams','Movimentacao',function($scope, $routeParams, Movimentacao) {
  $scope.movimentacao = Movimentacao.get({movimentacaoId:$routeParams.movimentacaoId});


}]).controller('NovaMovimentacaoCtrl', ['$scope','Movimentacao',function($scope, Movimentacao) {
  $scope.movimentacao ={dia:new Date()};
  $scope.adicionarMovimentacao = function(){
       Movimentacao.save($scope.movimentacao);
  };
  
}])
;


