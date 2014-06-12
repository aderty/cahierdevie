function CahierUsersCtrl($scope, navSvc, EnfantService, LoginService, notification) {

    $scope.enfant = EnfantService.getCurrent();
    $scope.title = "Mes amis";

    $scope.add = function (email, form) {
        if (!email) {
            notification.alert('Veuillez saisir un email.', function (button) { }, 'Cahier de vie', 'Ok');
            return;
        }
        form.email = "";
        LoginService.addUser($scope.enfant, email).then(function (data) {
            if (data.user) {
                $scope.enfant.users.push(data.user);
            }
            $scope.enfant.tick = data.tick;
            $scope.enfant.fromServer = true;
            EnfantService.save($scope.enfant);
            //$scope.$apply();
        });
    }
    $scope.remove = function (user) {
        notification.confirm('Etes-vous sur?', function (button) {
            // yes = 1, no = 2, later = 3
            if (button == '1') {    // Rate Now
                LoginService.removeUser($scope.enfant, user).then(function (data) {
                    var index = $scope.enfant.users.indexOf(user);
                    //$scope.enfant.users.splice(index, 1);
                    $scope.enfant.users[index].state = 0;
                    $scope.enfant.tick = data.tick;
                    $scope.enfant.fromServer = true;
                    EnfantService.save($scope.enfant);
                    //$scope.$apply();
                });
            }
        }, 'Cahier de vie', ['Supprimer', 'Annuler']);
    }
}