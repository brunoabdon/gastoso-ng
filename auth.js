'use strict';
angular.module('gastosoApp').factory('Login',['$rootScope' ,'$localStorage','$http','Utils',
    function($rootScope, $localStorage,$http,Utils){

        function login(password){
            if(!$rootScope.isLoggedIn){

                $http
                    .post(Utils.appBaseUrl + '/login', password)
                    .then(function(response){
                        $localStorage.authKey = angular.fromJson(response.data);
                        $rootScope.isLoggedIn = true;
                        $http.defaults.headers.common['X-Abd-auth_token'] = $localStorage.authKey.token;
                    }, function(response){
                        console.log('deu ruim no login');
                    });
            }
        };

        function logout (){
            delete $localStorage.authKey;
            $rootScope.isLoggedIn = false;
            $http.defaults.headers.common['X-Abd-auth_token'] = null;
        };
        
        return {login:login, logout: logout};
    }
]);

