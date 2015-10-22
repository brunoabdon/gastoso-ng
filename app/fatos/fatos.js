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

}]).controller('FatoCtrl', ['$scope','$routeParams','Utils','MsgService','Fato','Conta','Lancamento',
    function($scope, $routeParams, Utils, MsgService, Fato, Conta, Lancamento) {

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
    
    $scope.cancelarEdicaoLancamento = function(){
        terminarEdicacaoLancamento(false)
    }
        
    $scope.confirmarLancamento = function(){
        terminarEdicacaoLancamento(true);
    };
    
    var terminarEdicacaoLancamento = function(salvar){

        var lancamento = $scope.lancamento;

        if(salvar){
            var valor = parseFloat($scope.valor);
            if(isNaN(valor)){
                MsgService.addMessage('Valor inválido: ' + $scope.valor);
                return;
            }

            lancamento.valor = Math.round(valor * 100);
            lancamento.conta = $scope.conta;
            lancamento.alterado = true;
            lancamentosAlterados++;
        }

        $scope.lancamento = null;
        $scope.conta = null;
        $scope.valor = '';
        
        $scope.lancamentos.push(lancamento);
        $scope.contas.splice($scope.contas.indexOf(lancamento.conta),1);
    };

    $scope.editarLancamento = function (lancamento){
        if($scope.lancamento) return;
        
        var prepara = function(){
            $scope.lancamentos.splice($scope.lancamentos.indexOf(lancamento),1);
            $scope.lancamento = lancamento;
            $scope.contas.push(lancamento.conta);
            $scope.conta=lancamento.conta;
            $scope.valor=lancamento.valor/100;
            $scope.total-=lancamento.valor;
        }
        if(!$scope.contas){
            $scope.contas = Conta.query(prepara,MsgService.handleFail);
        } else {
            prepara();
        }
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
}]);