function MainCtrl($scope, navSvc, $rootScope, $timeout, EnfantService, CahierService, notification) {
    $scope.loaded = false;
    $scope.slidePage = function (path, type) {
        navSvc.slidePage(path, type);
    };


    $scope.update = function (enfant) {
        if (!enfant.isEnable()) return;
        EnfantService.setCurrent(enfant);
        navSvc.slidePage('/viewNewCahier');
    }
    $scope.set = function (enfant) {
        EnfantService.setCurrent(enfant);
    }
    $scope.remove = function (enfant) {
        notification.confirm('Etes-vous sur ?', function (button) {
            // yes = 1, no = 2, later = 3
            if (button != '1') return;

            EnfantService.remove(enfant).then(function () {
                $scope.$emit("reload");
            });
        }, 'Cahier de vie', ['Supprimer', 'Annuler']);
    }

    $rootScope.showEnfantOverlay = false;

    $scope.showMenuEnfant = function (enfant) {
        EnfantService.setCurrent(enfant);
        $rootScope.showEnfantOverlay = true;
    };



    $scope.showCahier = function (enfant) {
        if (enfant != EnfantService.getCurrent()) {
            CahierService.setCurrent(null);
            EnfantService.setCurrent(enfant);
        }
        navSvc.slidePage('/viewCahier');
    };

    $scope.newCahier = function () {
        EnfantService.setCurrent(null);
        navSvc.slidePage('/viewNewCahier');
    }
    /*$timeout(function () {
        
    }, 250);*/
    loadEnfants();

    /*EnfantService.onChange(loadCahier);
    
    $scope.$on('$destroy', function() {
          EnfantService.removeOnChange(loadCahier);
    });*/

    //$rootScope.$watch('currentDate', loadCahier);

    $scope.$on("reload", function () {
        $timeout(function () {
            loadEnfants();
        });
        //$scope.$apply();
    });

    function loadEnfants() {
        EnfantService.list().then(function (enfants) {
            $scope.enfants = enfants;
            $scope.loaded = true;
            $timeout(function () {
                $scope.$broadcast("refresh-scroll");
            }, 150);
        });
    }

    function loadCahier() {
        if (!EnfantService.getCurrent()) return;
        CahierService.get(EnfantService.getCurrent(), $rootScope.currentDate).then(function (cahier) {
            if (!cahier) {
                cahier = CahierService.new(EnfantService.getCurrent(), $rootScope.currentDate);
            }
            CahierService.setCurrent(cahier);
        });
    }
}