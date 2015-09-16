'use strict';

angular.module('gastosoApp.fatos', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/fatos', {
    templateUrl: 'fatos/fatos.html',
    controller: 'FatosCtrl'
  }).when('/fatos/:fatoId',{
    templateUrl: 'fatos/fato.html',
    controller: 'FatoCtrl'
  }).when('/novaFato', {
    templateUrl: 'fatos/novaFato.html',
    controller: 'NovaFatoCtrl'
  });
}])

.controller('FatosCtrl', ['$scope','Fato',function($scope, Fato) {
  $scope.fatos = Fato.query();

}]).controller('FatoCtrl', ['$scope','$routeParams','Utils','Fato','Lancamento',
    function($scope, $routeParams, Utils, Fato, Lancamento) {

  $scope.utils = Utils;
  
  var idFato = $routeParams.fatoId;
  $scope.fato = Fato.get({fatoId:idFato});
  $scope.lancamentos = Lancamento.query({fato:idFato});

}]).controller('NovaFatoCtrl', ['$scope','dateFilter','Utils','Fato','Conta','Lancamento',
   function($scope, $dateFilter, Utils, Fato,Conta,Lancamento) {

  $scope.utils = Utils;

  $scope.contas = Conta.query();

  var resetar = function(){
    $scope.fato = {
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
             //fato:$scope.fato,
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
  
  $scope.adicionarFato = function(){
      var sucesso = function(fato) {
         resetar();
         $scope.fatos.push(fato);
         $scope.fato=fato;
         
         for (var i = 0; i < $scope.lancamentos.length; i++){
      	      var lancamento = $scope.lancamentos[i];
        	  lancamento.fato = fato;
		      Lancamento.save(lancamento,function(l){lancamento.id=l.id}); //nao funciona. lancamento nao é passado por referencia. só o ultimo cara do array eh ticado.
	     }
      }

      var fail = function(obj){ 
         $scope.mensagem = {txt: obj.data.message, status: obj.status};
      }
      
      Fato.save($scope.fato,sucesso,fail);


  };
  $scope.contas = Conta.query();
  $scope.fatos = new Array();
  $scope.lancamentos = new Array();
  $scope.total = 0;
  resetar();
}])
;


