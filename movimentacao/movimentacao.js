angular.module('gastosoApp.movimentacao', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {
 $routeProvider.when('/gasto', {
    templateUrl: 'movimentacao/gasto.html',
    controller: 'GastoCtrl'
  }).when('/transferencia', {
    templateUrl: 'movimentacao/transferencia.html',
    controller: 'TransferenciaCtrl'
  });
}]).controller('GastoCtrl',['$scope','dateFilter','realFilter','MsgService','Utils','Conta', 'Fato', 'Lancamento',
function($scope, $dateFilter,realFilter,MsgService,Utils,Conta,Fato,Lancamento){
    
    $scope.MsgService = MsgService;
    $scope.utils = Utils;
    $scope.contas = Conta.query(angular.noop,MsgService.handleFail);

    var setaTitulo = function(){
        var titulo;
        if(!$scope.descricao) {
            titulo = "Gasto";
        } else {
            titulo = $scope.descricao;
            if($scope.dia){
                titulo = $dateFilter($scope.dia,"MMMM dd, yyyy") + ' - ' + titulo;
            }
            var valor = parseFloat($scope.valor);
            if(valor){
                valor = Math.round(Math.abs(valor) * 100);
                titulo += " (" + realFilter(valor) + ")";
            }
        }
        
        Utils.setTitle(titulo);
    };
    
    Utils.setTitle("Gasto");
    $scope.$watch("dia",setaTitulo);
    $scope.$watch("descricao",setaTitulo);
    $scope.$watch("valor",setaTitulo);
                
    
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
                var dia = $dateFilter($scope.dia,'yyyy-MM-dd')
                var fato = new Fato({dia:dia,descricao:$scope.descricao});
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
    
    wiz.zerar = function(){
        $scope.dia = new Date();
        delete $scope.descricao;
        delete $scope.valor;
        delete $scope.conta;
        this.tela = 1;
    };
    
    wiz.zerar();
    $scope.wiz = wiz; 

    

}])
.controller('TransferenciaCtrl',['$scope','dateFilter','realFilter','MsgService','Utils','Conta', 'Fato', 'Lancamento',
function($scope, $dateFilter,realFilter,MsgService,Utils,Conta,Fato,Lancamento){
    
    $scope.MsgService = MsgService;
    $scope.utils = Utils;
    $scope.contas = Conta.query(angular.noop,MsgService.handleFail);

    var setaTitulo = function(){
        var titulo;
        if(!$scope.descricao) {
            titulo = "Transferência";
        } else {
            titulo = $scope.descricao;
            if($scope.dia){
                titulo = $dateFilter($scope.dia,"MMMM dd, yyyy") + ' - ' + titulo;
            }
            var valor = parseFloat($scope.valor);
            if(valor){
                valor = Math.round(Math.abs(valor) * 100);
                titulo += " (" + realFilter(valor) + ")";
            }
        }
        
        Utils.setTitle(titulo);
    };
    
    Utils.setTitle("Transferência");
    $scope.$watch("dia",setaTitulo);
    $scope.$watch("descricao",setaTitulo);
    $scope.$watch("valor",setaTitulo);
    
    
    $scope.criarTransferencia = function(){
        if(!$scope.dia){
            MsgService.addMessage('Quando?');
        } else if(!$scope.descricao){
            MsgService.addMessage('Foi o que?');
        } else {
            var valor = parseFloat($scope.valor);
            if(isNaN(valor)){
                MsgService.addMessage('Quanto foi?');
            } else if (!$scope.contaOrigem){
                MsgService.addMessage('De onde?');
            } else if (!$scope.contaDestino){
                MsgService.addMessage('Pra onde?');
            } else {
                var dia = $dateFilter($scope.dia,'yyyy-MM-dd');
                var fato = new Fato({dia:dia,descricao:$scope.descricao});
                valor = Math.round(valor * 100);
                fato.$save(function(){
                    var lancamentoDebito = new Lancamento({fato:fato,conta:$scope.contaOrigem,valor:-valor});
                    var lancamentoCredito = new Lancamento({fato:fato,conta:$scope.contaDestino,valor:valor});
                    lancamentoDebito.$save(function(){
                        lancamentoCredito.$save(function(){
                            $scope.zerar();
                            console.log("ok");
                        },MsgService.handleFail);
                    },MsgService.handleFail);
                },MsgService.handleFail);
            }
        }
    };
    
    $scope.zerar = function(){
        $scope.dia = new Date();
        delete $scope.descricao;
        delete $scope.valor;
        delete $scope.contaOrigem;
        delete $scope.contaDestino;
    };
    
    $scope.zerar();
}]);
