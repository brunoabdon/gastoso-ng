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

.controller('ContasCtrl', ['$scope','MsgService','Conta',function($scope, MsgService, Conta) {
   var contas = Conta.query(
	function(){
            $scope.contas = contas;
        },MsgService.handleFail);

   $scope.removerConta = function(conta){

        console.log('removendo ' + conta);

        conta.$remove(
        function(){
           $scope.contas.splice($scope.contas.indexOf(conta),1);
        },MsgService.handleFail);
        
   };

}])
.controller('ContaCtrl', ['$scope','$routeParams','Utils', 'Conta','Lancamento',
 function($scope, $routeParams, Utils, Conta, Lancamento) {
  
  $scope.utils = Utils;
  
  var contaId = $routeParams.id;
  
  var salvaNomeOriginal = function(){$scope.nomeOriginal = $scope.conta.nome};

  $scope.conta = Conta.get({id:contaId},salvaNomeOriginal);
  
  $scope.lancamentos = Lancamento.query({conta:contaId});

  $scope.alterarConta = function(){
      $scope.conta.$save(salvaNomeOriginal);
  }

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


