'use strict';
angular.module('gastosoApp.contas', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/contas', {
    templateUrl: 'contas/contas.html',
    controller: 'ContasCtrl'
  }).when('/contas/:id',{
    templateUrl: 'contas/conta.html',
    controller: 'ContaCtrl'
  }).when('/novaConta', {
    templateUrl: 'contas/novaConta.html',
    controller: 'NovaContaCtrl'
  });
}])

.controller('ContasCtrl', ['$scope','MsgService','Utils','Conta',
function($scope, MsgService, Utils, Conta) {
    
    $scope.utils = Utils;
    
    var contas = Conta.lista(
        function(){
            $scope.contas = contas;
        },MsgService.handleFail);
    
    $scope.classe = function(conta){
        return conta.saldo === 0 ? 'irrelevante':'';
    };


   $scope.removerConta = function(conta){

        console.log('removendo ' + conta);

        conta.$remove(
        function(){
           $scope.contas.splice($scope.contas.indexOf(conta),1);
        },MsgService.handleFail);
        
   };

}])
.controller('ContaCtrl', ['$scope','$routeParams','MsgService','MesNav','Utils', 'Conta','Lancamento',
    function($scope, $routeParams, MsgService, MesNav, Utils, Conta, Lancamento) {
  
    $scope.utils = Utils;
  
    var contaId = $routeParams.id;
  
    var salvaNomeOriginal = function(){$scope.nomeOriginal = $scope.conta.nome;};

    $scope.conta = Conta.get({id:contaId},salvaNomeOriginal);
    
    var paramsExtrato = {conta:contaId};
    
    var mes = $routeParams.mes;
    if(mes){
        paramsExtrato.mes = mes;
    } else {
        var hoje = new Date();
        var month = hoje.getMonth()+1;
        var prefix = month >= 10 ? '' : '0';
        
        paramsExtrato.dataMax = 
            hoje.getFullYear() 
            + '-' + prefix + month 
            + '-' + hoje.getDate();
        
    }

    Conta.extrato(paramsExtrato,function(extrato){
        
        extrato.fatos.forEach(fato => {
            fato.total = (fato.lancamentos ? 0 : fato.valor);
            fato.saldo = 0;
        });
        
        $scope.extrato = extrato;
        
        var saldoAteEntao = extrato.saldoIncial;

        extrato.fatos.forEach(fato => {
            if(fato.lancamentos){
                fato.lancamentos.forEach(lancamento=>{
                    fato.total += lancamento.valor;
                    if(lancamento.contaId == contaId){
                        fato.valor = lancamento.valor;
                    }
                });
            }
            fato.saldo = saldoAteEntao + fato.valor;
            saldoAteEntao = fato.saldo;
        });
    },MsgService.handleFail);
    
    
    

//    $scope.mesNav = new MesNav($routeParams.mes?$routeParams.mes:new Date());

//    $scope.$watch('mesNav.mesStr',function(){
//        $scope.conta = Conta.get({id:contaId},salvaNomeOriginal);
//        $scope.lancamentos = Lancamento.query({conta:contaId,mes:$scope.mesNav.mesStr});
//    });

    $scope.alterarConta = function(){
        $scope.conta.$save(salvaNomeOriginal);
    };

}]).controller('NovaContaCtrl', ['$scope','MsgService','Conta',function($scope, MsgService, Conta) {
  
    $scope.MsgService = MsgService;
    $scope.conta = new Conta();
    $scope.adicionarConta = function(){
        $scope.conta.$save(
            function(conta){
                MsgService.addMessage(conta.nome + " criada.");
                $scope.conta = new Conta();
       },MsgService.handleFail);
  };
}])
;