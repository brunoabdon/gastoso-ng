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
  
  var lancamentosAlterados = 0;
  var lancamentosExcluidos = 0;
  
  $scope.total = 0;
  
    if($routeParams.id){
        $scope.fato = Fato.get({id:$routeParams.id},
            function(){
                $scope.lancamentos = 
                    Lancamento.query({fato:$routeParams.id},
                        function(){
                            $scope.lancamentos.forEach(function(lancamento) {
                                $scope.total+=lancamento.valor;
                            });        
                        },MsgService.handleFail);
                MsgService.clearMessage();
            },MsgService.handleFail);
    } else {
        var hojeStr = $dateFilter(new Date(),'yyyy-MM-dd');
        $scope.fato = 
            new Fato({dia: hojeStr, descricao:""});
        $scope.lancamentos = new Array();
        $scope.total = 0;
    }
    
    $scope.confirmarLancamento = function(){
        
        var valor = parseFloat($scope.valor);
        if(isNaN(valor)){
            MsgService.addMessage('Valor inválido: ' + $scope.valor);
            return;
        }
        var lancamento = $scope.lancamento;
        $scope.lancamento = null;

        $scope.lancamentos.push(lancamento);

        $scope.contas.splice($scope.contas.indexOf(lancamento.conta),1);
        $scope.conta = null;
        $scope.valor = '';

        lancamento.valor = Math.round(valor * 100);
        lancamento.conta = $scope.conta;
    };
    
    $scope.editarLancamento = function (lancamento){
        $scope.lancamentos.splice($scope.lancamentos.indexOf(lancamento),1);
        $scope.lancamento = lancamento;
        $scope.push(lancamento.conta);
        $scope.conta=lancamento.conta;
        $scope.valor=lancamento.valor/100;
        lancamento.alterado = true;
        lancamentosAlterados++;
    };
    
    $scope.toggleExcluirLancamento = function(lancamento){
      lancamento.excluido = !lancamento.excluido;
      var i = (lancamento.excluido?1:-1);
      lancamentosExcluidos += i;
      $scope.total -= i * lancamento.valor;
    };

    $scope.alterado = function(){
      return (!$scope.fato.id) 
              || lancamentosAlterados > 0
              || lancamentosExcluidos > 0;
    };
    
    var salvarLancamentos = function(){
        salvarLancamento($scope.lancamentos,0);
    };
    
    var salvarLancamento = function(lancamentos,i){
        
        if(i < lancamentos.length) {
            console.log('salvando lancamento ' + i);

            var lancamento = lancamentos[i];
            if(lancamento.excluido){
                if(lancamento.id === null){
                    lancamentos.splice(lancamentos.indexOf(lancamento),1);
                    salvarLancamento(lancamentos,i+1);
                } else {
                    delete lancamento.alterado;
                    delete lancamento.excluido;
                    lancamento.$remove(function(){
                        lancamentos.splice(lancamentos.indexOf(lancamento),1);
                        salvarLancamento(lancamentos,i+1);
                    },MsgService.handleFail);
                }
            } else if(lancamento.alterado){
                delete lancamento.alterado;
                delete lancamento.excluido;
                lancamento.$save(function(){
                    salvarLancamento(lancamentos,i+1);
                });
            } else {
                salvarLancamento(lancamentos,i+1);
            }
        } else {
            lancamentosAlterados = 0;
            lancamentosExcluidos = 0;
            MsgService.addMessage("O fato " + $scope.fato.descricao + " foi salvo com sucesso.");
        }
    };

    $scope.salvarFato = function(){
      console.log('salvando: ' + $scope.fato);
      $scope.fato.$save(salvarLancamentos,MsgService.handleFail);
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
            function(){MsgService.addMessage("Erro ao carregar contas");});

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