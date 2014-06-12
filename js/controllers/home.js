function HomeCtrl($scope, navSvc, $rootScope, $timeout, EnfantService, CahierService) {
    $rootScope.showSettings = false;
    $scope.slidePage = function (path, type) {
        navSvc.slidePage(path, type);
    };
    $rootScope.date = new Date();
    $scope.back = function () {
        navSvc.back();
    };
    $scope.changeSettings = function () {
        $rootScope.showSettings = true;
    };
    $scope.closeOverlay = function () {
        $rootScope.showSettings = false;
    };
    if (!$rootScope.isConnected) {
        $timeout(function () {
            navSvc.slidePage('/viewLogin');
        }, 250);
    }

    $scope.optsNavigation = {
        disable: 'right',
        touchToDrag: false
    };
}