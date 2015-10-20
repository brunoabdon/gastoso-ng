'use strict';

angular.module('gastosoApp.fatos', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/fatos', {
    templateUrl: 'fatos/fatos.html',
    controller: 'FatosCtrl'
  }).when('/fatos/:id',{
    templateUrl: 'fatos/fato.html',
    controller: 'FatoCtrl'
  }).when('/novoFato', {
    templateUrl: 'fatos/novoFato.html',
    controller: 'NovaFatoCtrl'
  });
}])

.controller('FatosCtrl', ['$scope','MsgService','Fato',function($scope, MsgService, Fato) {
    var fatos = Fato.query(
      function(){
        $scope.fatos = fatos;
      }
  );

  $scope.removerFato = function(fato){

        console.log('removendo fato');
       fato.$remove(
          function(){
             $scope.fatos.splice($scope.fatos.indexOf(fato),1);
          },
          MsgService.handleFail
        );
  };

}]).controller('FatoCtrl', ['$scope','$routeParams','Utils','MsgService','Fato','Lancamento',
    function($scope, $routeParams, Utils, MsgService, Fato, Lancamento) {

  $scope.utils = Utils;
  $scope.MsgService = MsgService;
  $scope.total = 0;  

  var idFato = $routeParams.id;

  var fato = Fato.get({id:idFato},function(){
	$scope.fato = fato;
  });

  var lancamentos = Lancamento.query({fato:idFato},function(){
        $scope.lancamentos = lancamentos;

        lancamentos.forEach(function(lancamento) {
            $scope.total+=lancamento.valor;
        });        
  });

  $scope.removerLancamento = function(lancamento){
       console.log('removendo lancamento');
       lancamento.$remove(
          function(){
             $scope.lancamentos.splice($scope.lancamentos.indexOf(lancamento),1);
             $scope.total-=lancamento.valor;
          },MsgService.handleFail);

  };


}]).controller('NovaFatoCtrl', ['$scope','dateFilter','Utils','MsgService','Fato','Conta','Lancamento',
   function($scope, $dateFilter, Utils, MsgService, Fato, Conta,Lancamento) {

  var resetar = function(){
    $scope.lancamentos = new Array();
    $scope.fato = new Fato({dia: $dateFilter(new Date(),'yyyy-MM-dd')});
    resetarNovoLancamento();
  };
  var resetarNovoLancamento = function(){
    $scope.lancamento = new Lancamento({fato:$scope.fato});
    $scope.valor = "";
  };


  $scope.utils = Utils;
  $scope.MsgService = MsgService;
  $scope.contas = 
        Conta.query(
            angular.noop,
            MsgService.addMessage("Erro ao carregar contas"));

  $scope.fatos = new Array();
  $scope.total = 0;
  resetar();


  $scope.adicionarLancamento = function(){
	  
      var valor = parseFloat($scope.valor);
      if(isNaN(valor)){
            MsgService.addMessage('Valor inválido: ' + $scope.valor);
            return;
      }
      $scope.lancamento.valor = Math.round(valor * 100);
      $scope.lancamentos.push($scope.lancamento);
      $scope.contas.splice($scope.contas.indexOf($scope.lancamento.conta),1);
      $scope.total += $scope.lancamento.valor;
      resetarNovoLancamento();
};
  
    $scope.editarLancamento = function(lancamento){
	   $scope.contas.push(lancamento.conta);
	   $scope.lancamento = lancamento;
           $scope.valor = lancamento.valor/100;
           $scope.total -= lancamento.valor;
	   $scope.lancamentos.splice($scope.lancamentos.indexOf(lancamento),1);
  };

    $scope.salvarLancamentos = function(fato) {
        $scope.fatos.push(fato);

        for (var i = 0; i < $scope.lancamentos.length; i++){
          var lancamento = $scope.lancamentos[i];
          console.log($scope.fato == fato);
          lancamento.$save(function(l){console.log("salvou " + l.id);},MsgService.handleFail);
        }
	 
        resetar();
    };
}])
;