'use strict';
angular.module('gastosoApp')
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'login.html',
    controller: 'LoginCtrl'
  });
}]).controller(
    'LoginCtrl',['Login' ,'$scope','$timeout','$location',
    function(Login, $scope,$timeout,$location){
        
        $scope.password = '';
        
        $scope.login = function(){
            $scope.loginMsg = 'Logando...';
            Login.login($scope.password,
                function(){
                    $scope.loginMsg = 'Login Ok! Aguarde...';
                    $location.path("/");
                    $timeout(function(){
                        delete $scope.loginMsg;
                    },3000);                
                    
                },
                function(res){
                delete $scope.loginMsg;
                $scope.password = '';
                $scope.loginErrorMsg = res.statusText;
                $timeout(function(){
                    delete $scope.loginErrorMsg;
                },3000);                
            });
        };
        
        $scope.logout = Login.logout;
    }
]).factory('Login',['$rootScope' ,'$localStorage','$http','$location','Utils',
    function($rootScope, $localStorage,$http,$location,Utils){

        function login(password,successHandler,errorHandler){
            $http
            .post(Utils.appBaseUrl + '/login', password)
            .then(function(response){
                $localStorage.authKey = angular.fromJson(response.data);
                $rootScope.isLoggedIn = true;
                $http.defaults.headers.common['X-Abd-auth_token'] = 
                    $localStorage.authKey.token;

                if(successHandler) successHandler(response);
            }, (errorHandler||angular.noop));
        };

        function logout (){
            console.log('logout');
            delete $localStorage.authKey;
            $rootScope.isLoggedIn = false;
            $http.defaults.headers.common['X-Abd-auth_token'] = null;
            $location.path('/login');
        };
        
        return {login:login, logout: logout};
    }
]);