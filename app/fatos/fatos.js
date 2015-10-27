'use strict';

angular.module('gastosoApp.fatos', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  
  var exibirOuAlterarFato = {
    templateUrl: 'fatos/fato.html',
    controller: 'FatoCtrl'
  };
        
  $routeProvider.when('/fatos', {
    templateUrl: 'fatos/fatos.html',
    controller: 'FatosCtrl'
  }).when('/fatos/:id',exibirOuAlterarFato
   ).when('/novoFato', {
    templateUrl: 'fatos/fato.html',
    controller: 'FatoCtrl'
  });
}])

.controller('FatosCtrl', ['$scope','dateFilter','MsgService','Fato',function($scope, $dateFilter, MsgService, Fato) {
    Fato.query({dataMax:$dateFilter(new Date(),'yyyy-MM-dd')},
      function(fatos){
          
        $scope.fatosPorDia = {};
        for(var i = 0; i < fatos.length; i++){
            var fato = fatos[i];
            var fatosDoDia = $scope.fatosPorDia[fato.dia];
            if(!fatosDoDia ){
                fatosDoDia = new Array();
                
                $scope.fatosPorDia[fato.dia] = fatosDoDia;
                
                
            } 
            fatosDoDia.push(fato);
        }
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

}]).controller('FatoCtrl', 
    ['$scope','$routeParams','dateFilter','Utils','MsgService','Fato','Conta','Lancamento',
    function($scope, $routeParams, $dateFilter, Utils, MsgService, Fato, Conta, Lancamento) {

    $scope.utils = Utils;
    $scope.MsgService = MsgService;

    var ehCriacao = $routeParams.id === undefined;

    $scope.editarFato = function(){
        $scope.fatoOriginal = 
            {dia:$scope.fato.dia, descricao:$scope.fato.descricao};
        $scope.editandoFato = true;
    };
    
    $scope.confirmarFato = function(){
        $scope.fatoAlterado |= 
            $scope.fato.dia !== $scope.fatoOriginal.dia
            || $scope.fato.descricao !== $scope.fatoOriginal.descricao;
        $scope.editandoFato = false;
    };
    
    $scope.cancelarEdicaoFato = function(){
        $scope.fato.dia = $scope.fatoOriginal.dia;
        $scope.fato.descricao = $scope.fatoOriginal.descricao;
        $scope.editandoFato = false;
    };
        
    $scope.cancelarEdicaoLancamento = function(){
        terminarEdicacaoLancamento(false)
    };
        
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
            $scope.total += lancamento.valor;
        }

        $scope.lancamento = ehCriacao? {fato:$scope.fato} : null;
        $scope.conta = null;
        $scope.valor = '';
        
        $scope.lancamentos.push(lancamento);
        $scope.contas.splice($scope.contas.indexOf(lancamento.conta),1);
    };

    $scope.editarLancamento = function (lancamento){
        if($scope.lancamento) return;
        
        var prepara = function(){
            $scope.lancamento = lancamento;
            if(lancamento.id){
                $scope.lancamentos.splice($scope.lancamentos.indexOf(lancamento),1);
                $scope.contas.push(lancamento.conta);
                $scope.conta=lancamento.conta;
                $scope.valor=lancamento.valor/100;
                $scope.total-=lancamento.valor;
            }
        };
        
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
      return (!$scope.fato.id || $scope.fatoAlterado) 
              || lancamentosAlterados > 0
              || lancamentosExcluidos > 0;
    };
    
    $scope.alterando = function(){
      return ($scope.lancamento && $scope.lancamento.id) || $scope.editandoFato;  
        
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
        var fatoSalvo = function(){
            delete $scope.fatoOriginal;
            $scope.editandoFato = false;
            $scope.fatoAlterado = false;
            delete $scope.lancamento;
            salvarLancamentos();
      };
      $scope.fato.$save(fatoSalvo,MsgService.handleFail);
    };
    
    var lancamentosAlterados = 0;
    var lancamentosExcluidos = 0;

    $scope.total = 0;

    if(!ehCriacao){
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
        $scope.editarLancamento(new Lancamento({fato:$scope.fato}));
        $scope.lancamentos = new Array();
    }

}]);