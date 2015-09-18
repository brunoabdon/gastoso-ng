'use strict';

angular.module('gastosoApp.fatos', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/fatos', {
    templateUrl: 'fatos/fatos.html',
    controller: 'FatosCtrl'
  }).when('/fatos/:fatoId',{
    templateUrl: 'fatos/fato.html',
    controller: 'FatoCtrl'
  }).when('/novoFato', {
    templateUrl: 'fatos/novoFato.html',
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

  $scope.fatos = new Array();
  $scope.lancamentos = new Array();
  $scope.total = 0;
  $scope.fato = new Fato({dia: $dateFilter(new Date(),'yyyy-MM-dd')});
  $scope.lancamento = new Lancamento({fato:$scope.fato});



  var resetar = function(){
    $scope.fato = new Fato({dia: $dateFilter(new Date(),'yyyy-MM-dd')});
    $scope.lancamento = new Lancamento({fato:$scope.fato});

  }

  $scope.adicionarLancamento = function(){
	  
      var valor = parseFloat($scope.lancamento.valor);
      if(isNaN(valor)){
	     $scope.mensagem = {txt: 'Valor inválido: ' + $scope.valor};
	     return;
      }
	  
      $scope.lancamentos.push($scope.lancamento);
      $scope.contas.splice($scope.contas.indexOf($scope.lancamento.conta),1);
      $scope.total += valor;
      $scope.lancamento = new Lancamento({fato:$scope.fato});

  }
  
  $scope.editarLancamento = function(lancamento){
	   $scope.contas.push(lancamento.conta);
	   $scope.lancamento = lancamento;
	   $scope.lancamentos.splice($scope.lancamentos.indexOf(lancamento),1);
	   
  }
  
  $scope.adicionarFato = function(){

      var fail = function(obj){ 
         $scope.mensagem = {txt: obj.data.message, status: obj.status};
      }
      
      //Fato.save($scope.fato,sucesso,fail);
      $scope.fato = $scope.fato.$save(
         function(fato,responseHeaders) {
 
             $scope.fatos.push(fato);
		 
             for (var i = 0; i < $scope.lancamentos.length; i++){
	      	  var lancamento = $scope.lancamentos[i];
                  lancamento.$save(function(l,resonse){console.log("salvou " + l.id)},fail);
             }
             $scope.lancamentos = new Array();

             resetar();
          }
       );
  };
}])
;


