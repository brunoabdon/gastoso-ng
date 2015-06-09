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

}]).controller('MovimentacaoCtrl', ['$scope','$routeParams','Movimentacao','Lancamento',function($scope, $routeParams, Movimentacao, Lancamento) {
  
  var idMovimentacao = $routeParams.movimentacaoId;
  $scope.movimentacao = Movimentacao.get({movimentacaoId:idMovimentacao});
  $scope.lancamentos = Lancamento.query({movimentacao:idMovimentacao});

  $scope.classDinheiro = 
	function (valor) { 
           var classeValor = valor >= 0 ?'positivo' :'negativo'
           return 'dinheiro ' + classeValor;
         };

}]).controller('NovaMovimentacaoCtrl', ['$scope','dateFilter','Movimentacao','Conta',
   function($scope, $dateFilter, Movimentacao,Conta) {

  var resetar = function(){
    $scope.dia = $dateFilter(new Date(),'yyyy-MM-dd');
    $scope.descricao = null;
  }
  
  $scope.adicionarMovimentacao = function(){
      var sucesso = function(mov) {
         resetar();
         $scope.movimentacoes.push(mov);
      }

      var fail = function(obj){
          console.log(obj);
      }
    
      Movimentacao.save({dia:$scope.dia, descricao:$scope.descricao},sucesso,fail);
  };
  $scope.contas = Conta.query();
  $scope.movimentacoes = new Array();
  resetar();
}])
;


