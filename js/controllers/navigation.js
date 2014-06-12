function NavigationCtrl($scope, navSvc, $rootScope, $timeout, LoginService, Device) {
    /*$scope.backDate = function(){
        $rootScope.currentDate.setDate($rootScope.currentDate.getDate()-1);
        $rootScope.currentDate = new Date($rootScope.currentDate.getTime());
    }
    $scope.nextDate = function(){
        $rootScope.currentDate.setDate($rootScope.currentDate.getDate()+1);
        $rootScope.currentDate = new Date($rootScope.currentDate.getTime());
    }*/
    $scope.connect = function (path, type) {
        navSvc.slidePage('/viewLogin');
    };
    /*$scope.disconnect = function (path, type) {
        LoginService.disconnect();
        navSvc.slidePage('/viewLogin'); 
    };*/
}