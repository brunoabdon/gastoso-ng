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

.controller('ContasCtrl', ['$scope','Conta','$routeParams',function($scope, Conta,$routeParams) {
   var contas = Conta.query(
	function(obj){
            $scope.contas = contas;
        },
        function(obj){ 
         $scope.mensagem = {txt: obj.data, status: obj.status}; //criar Utils.mostraerro
      });

   $scope.removerConta = function(conta){

        console.log('removendo ' + conta);

        conta.$remove(
        function(){
           $scope.contas.splice($scope.contas.indexOf(conta),1);
        },
        function(obj){
         $scope.mensagem = {txt: obj.data, status: obj.status}; //criar Utils.mostraerro
        });
        
   };

}])
.controller('ContaCtrl', ['$scope','$routeParams','Utils', 'Conta','Lancamento',
 function($scope, $routeParams, Utils, Conta, Lancamento) {
  
  $scope.utils = Utils;
  
  var contaId = $routeParams.id;
  
  $scope.conta = Conta.get({id:contaId});
  $scope.lancamentos = Lancamento.query({conta:contaId});

}]).controller('NovaContaCtrl', ['$scope','Conta',function($scope, Conta) {
  $scope.conta = new Conta();
  $scope.adicionarConta = function(){
       $scope.conta.$save(function(conta,responseHeaders){
         $scope.mensagem = {txt: conta.nome + " criada.", status: responseHeaders.status};
         console.log($scope.mensagem);
         $scope.conta = new Conta();
       });
  };
  
}])
;


