'use strict';
angular.module('gastosoApp').factory('Login',['$rootScope' ,'$localStorage','$http','Utils',
    function($rootScope, $localStorage,$http,Utils){

        function login(password,successHandler,errorHandler){
            if(!$rootScope.isLoggedIn){

                $http
                    .post(Utils.appBaseUrl + '/login', password)
                    .then(function(response){
                        $localStorage.authKey = angular.fromJson(response.data);
                        $rootScope.isLoggedIn = true;
                        $http.defaults.headers.common['X-Abd-auth_token'] = 
                            $localStorage.authKey.token;
                    
                        if(successHandler) successHandler(response);
                    }, function(response){
                        if(errorHandler) errorHandler(response);
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

