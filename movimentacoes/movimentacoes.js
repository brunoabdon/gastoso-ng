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

}]).controller('MovimentacaoCtrl', ['$scope','$routeParams','Utils','Movimentacao','Lancamento',
    function($scope, $routeParams, Utils, Movimentacao, Lancamento) {

  $scope.utils = Utils;
  
  var idMovimentacao = $routeParams.movimentacaoId;
  $scope.movimentacao = Movimentacao.get({movimentacaoId:idMovimentacao});
  $scope.lancamentos = Lancamento.query({movimentacao:idMovimentacao});

}]).controller('NovaMovimentacaoCtrl', ['$scope','dateFilter','Utils','Movimentacao','Conta','Lancamento',
   function($scope, $dateFilter, Utils, Movimentacao,Conta,Lancamento) {

  $scope.utils = Utils;

  $scope.contas = Conta.query();

  var resetar = function(){
    $scope.movimentacao = {
	   dia: $dateFilter(new Date(),'yyyy-MM-dd')
	};
  }

  $scope.adicionarLancamento = function(){
	  
	  var valor = parseFloat($scope.valor);
	  if(isNaN(valor)){
	     $scope.mensagem = {txt: 'Valor inválido: ' + $scope.valor};
	     return;
	  }
	  
	  var lancamento = {
             //movimentacao:$scope.movimentacao,
             conta: $scope.conta,
             valor: valor
      }													 
      $scope.lancamentos.push(lancamento);
      $scope.contas.splice($scope.contas.indexOf(lancamento.conta),1);
      $scope.total += valor;
      delete $scope.valor;
      delete $scope.conta;

  }
  
  $scope.editarLancamento = function(lancamento){
	   $scope.contas.push(lancamento.conta);
	   $scope.conta = lancamento.conta;
	   $scope.valor = lancamento.valor;
	   $scope.lancamentos.splice($scope.lancamentos.indexOf(lancamento),1);
	   
  }
  
  $scope.adicionarMovimentacao = function(){
      var sucesso = function(mov) {
         resetar();
         $scope.movimentacoes.push(mov);
         $scope.movimentacao=mov;
         
         for (var i = 0; i < $scope.lancamentos.length; i++){
      	      var lancamento = $scope.lancamentos[i];
        	  lancamento.movimentacao = mov;
		      Lancamento.save(lancamento,function(l){lancamento.id=l.id}); //nao funciona. lancamento nao é passado por referencia. só o ultimo cara do array eh ticado.
	     }
      }

      var fail = function(obj){ 
         $scope.mensagem = {txt: obj.data.message, status: obj.status};
      }
      
      Movimentacao.save($scope.movimentacao,sucesso,fail);


  };
  $scope.contas = Conta.query();
  $scope.movimentacoes = new Array();
  $scope.lancamentos = new Array();
  $scope.total = 0;
  resetar();
}])
;


