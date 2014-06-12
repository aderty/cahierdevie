function LoginCtrl($scope, navSvc, $rootScope, $timeout, LoginService, EnfantService, notification) {
    $scope.title = "Mon compte";
    $scope.mode = 6;
    $scope.user = LoginService.load();
    if (!$scope.user) {
        $scope.title = "Login";
        $scope.mode = 0;
        $scope.user = {};
    }
    else {
        $scope.user.pwd = "";
    }
    $scope.backLogin = function () {
        if ($scope.mode == 6) return navSvc.back();
        $scope.mode = 0;
    }
    $scope.setMode = function (mode) {
        $scope.mode = mode;
    }
    $scope.create = function (user) {
        delete user.confirm_pwd;
        $scope.mode = 4;
        LoginService.create(user).then(function (current) {
            navSvc.back();
            $rootScope.isConnected = true;
        }, function (current) {
            $scope.mode = 1;
            $scope.user = {};
        });
    }
    $scope.update = function (user) {
        delete user.confirm_pwd;
        $scope.mode = 7;
        LoginService.update(user).then(function (current) {
            navSvc.back();
        }, function (current) {
            $scope.mode = 6;
            $scope.user = LoginService.load();
            $scope.user.pwd = "";
        });
    }
    $scope.connect = function (user) {
        $scope.mode = 3;
        LoginService.connect(user).then(function (current) {
            $rootScope.isConnected = true;
            $rootScope.user = current;
            LoginService.sync({
                user: current,
                enfants: {}
            }).then(function (data) {
                var i = 0, l = data.length;
                var prenoms = [];
                for (; i < l; i++) {
                    data[i].fromServer = true;
                    data[i].tick = new Date(data[i].tick);
                    EnfantService.save(data[i]);
                    prenoms.push(data[i].prenom);
                }
                if (data.length) {
                    $rootScope.$emit('message', "Les informations des cahiers de vie de " + prenoms.join(", ") + " ont étés mis à jour.");
                }
                navSvc.back();
                //$scope.$apply();
            })
        }, function (current) {
            $scope.mode = 2;
            $scope.user = {};
        });
    }
    $scope.disconnect = function (path, type) {
        LoginService.disconnect();
        $rootScope.isConnected = false;
        $scope.mode = 0;
    };
    $scope.raz = function (path, type) {
        notification.confirm('Etes-vous sur de vouloir supprimer toutes les données des cahiers de vie ?', function (button) {
            // yes = 1, no = 2, later = 3
            if (button != '1') return;
            myApp.deleteDB();
            $scope.mode = 0;
            location.reload();
        }, 'Cahier de vie', ['Supprimer', 'Annuler']);
    };

}