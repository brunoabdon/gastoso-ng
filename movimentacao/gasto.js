angular.module('gastosoApp.gasto', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {
 $routeProvider.when('/gasto', {
    templateUrl: 'movimentacao/gasto.html',
    controller: 'GastoCtrl'
  });
}]).controller('GastoCtrl',['$scope','dateFilter','MsgService','Utils','Conta', 'Fato', 'Lancamento',
function($scope,$dateFilter,MsgService,Utils,Conta,Fato,Lancamento){
    
    $scope.MsgService = MsgService;
    $scope.utils = Utils;
    
    var wiz = {tela:1};
    
    wiz.next = function(){this.tela++;};
    wiz.prev = function(){this.tela--;};
    
    wiz.fim = function(){
        if(!$scope.dia){
            this.tela = 1;
            MsgService.addMessage('Quando?');
        } else if(!$scope.descricao){
            this.tela = 2;
            MsgService.addMessage('Foi o que?');
        } else {
            var valor = parseFloat($scope.valor);
            if(isNaN(valor)){
                this.tela = 3;
                MsgService.addMessage('Quanto foi?');
            } else if (!$scope.conta){
                this.tela = 4;
                MsgService.addMessage('Pagou como?');
            } else {
                var fato = new Fato({dia:$scope.dia,descricao:$scope.descricao});
                fato.$save(function(){
                    $scope.valorFinal = Math.round(Math.abs(valor) * -100);
                    var lancamento = new Lancamento({fato:fato,conta:$scope.conta,valor:$scope.valorFinal});
                    lancamento.$save(function(){
                        wiz.tela = -1;
                    },MsgService.handleFail);
                },MsgService.handleFail);
            }
            
        }
    };
    
    
    wiz.isUltimaTela = function (){
        return this.tela === 4;
    };
    $scope.dia = $dateFilter(new Date(),'yyyy-MM-dd');
    $scope.contas = Conta.query(angular.noop,MsgService.handleFail);
    
    $scope.wiz = wiz; 

}]);
