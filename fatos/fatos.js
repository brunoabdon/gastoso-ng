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

.controller('FatosCtrl', ['$scope','$routeParams', 'Utils','MsgService','MesNav','Fato',
    function($scope, $routeParams, Utils, MsgService, MesNav, Fato) {

    Utils.setTitle("Fatos");
        
    $scope.utils = Utils;

    $scope.totaisDia = {};
        
    $scope.mesNav = new MesNav($routeParams.mes?$routeParams.mes:new Date());
    
    $scope.$watch('mesNav.mesStr',function(){

        $scope.fatos = {};

        Fato.lista({mes:$scope.mesNav.mesStr},
          function(fatosDetalhados){
            $scope.totalEntrada = 0;
            $scope.totalSaida = 0;

            var fatos = fatosDetalhados.fatos;

            $scope.fatos = fatos;

            var dia = null;

            for(var i = 0; i < fatos.length; i++){
                var fato = fatos[i];
                fato.total=0;
                
                if(!fato.lancamentos){
                    fato.total = fato.valor;
                } else {
                    fato.lancamentos.forEach(function(lancamento) {
                        fato.total+=lancamento.valor;
                    });        
                }

                if(fato.total === 0 && fato.lancamentos.length === 2){
                    fato.resumo = Math.abs(fato.lancamentos[0].valor);
                }
                
                if(dia == fato.dia){
                    $scope.totaisDia[fato.dia] += fato.total;
                } else {
                  $scope.totaisDia[fato.dia] = fato.total;
                  dia = fato.dia;
                }

                if(fato.total > 0){
                    $scope.totalEntrada+=fato.total;
                } else {
                    $scope.totalSaida+=fato.total;
                }
                
            }
          }
        );
    });

    $scope.removerFato = function(fato){

        var fatos = $scope.fatos;
        if(confirm('Deletar ' + fato.desc + '?')){
        console.log('removendo fato');
            Fato.remove({id:fato.id},
                function(){
                    fatos.splice(fatos.indexOf(fato),1);
                },
                MsgService.handleFail
            );
        }
    };

}]).controller('FatoCtrl', ['$scope','$routeParams','dateFilter','Utils','DateUtils','MsgService', 'Depends',  'Fato','Conta','Lancamento',
    function($scope, $routeParams, $dateFilter, Utils, DateUtils, MsgService, Depends, Fato, Conta, Lancamento) {

    $scope.utils = Utils;
    $scope.MsgService = MsgService;

    var ehCriacao = $routeParams.id === undefined;

    $scope.editarFato = function(){
        $scope.fatoOriginal = 
            {dia:$scope.fato.dia, descricao:$scope.fato.descricao};
        $scope.dia = DateUtils.parseLocalDate($scope.fato.dia);
        $scope.editandoFato = true;
    };
    
    $scope.confirmarFato = function(){
        $scope.fatoAlterado |= 
            $dateFilter($scope.dia,'yyyy-MM-dd') !== $scope.diaOriginal
            || $scope.fato.descricao !== $scope.fatoOriginal.descricao;
        $scope.editandoFato = false;
    };
    
    $scope.cancelarEdicaoFato = function(){
        $scope.dia = DateUtils.parseLocalDate($scope.fatoOriginal.dia);
        $scope.fato.descricao = $scope.fatoOriginal.descricao;
        $scope.editandoFato = false;
    };
        
    $scope.cancelarEdicaoLancamento = function(){
        terminarEdicacaoLancamento(false);
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

        $scope.lancamento = 
            ehCriacao
                ? new Lancamento({fato:$scope.fato}) 
                : null;
                
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
            MsgService
            .addMessage(
                "O fato " + $scope.fato.descricao + " foi salvo com sucesso.");
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
        $scope.fato.dia=$dateFilter($scope.dia,'yyyy-MM-dd');
        $scope.fato.$save(fatoSalvo,MsgService.handleFail);
    };
    
    var lancamentosAlterados = 0;
    var lancamentosExcluidos = 0;

    if(!ehCriacao){
        $scope.fato = Fato.get({id:$routeParams.id},
            function(fato){
                Utils.setTitle(
                    $scope.fato.descricao
                    + " (" 
                    +  $dateFilter($scope.fato.dia,'yyyy-MM-dd')
                    + ")");
                Depends.carregaLancamentos(fato,
                    function(lancamentos){
                        $scope.lancamentos = lancamentos;
                        $scope.total = fato.$total;
                    },MsgService.handleFail);
            }
            ,MsgService.handleFail);
            
    } else {
        Utils.setTitle("Novo Fato");
        $scope.fato = 
            new Fato({dia: '', descricao:''});
        $scope.dia = new Date();
        $scope.editarLancamento(new Lancamento({fato:$scope.fato}));
        $scope.lancamentos = new Array();
        $scope.total = 0;

        $scope.$watch('fato.descricao',function(novo,velho){
            Utils.setTitle(novo || 'Novo Fato');
        });
    }
}]);
