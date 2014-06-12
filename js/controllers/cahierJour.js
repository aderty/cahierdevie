function CahierJourCtrl($scope, $rootScope, navSvc, LoginService, EnfantService, CahierService, EventService, $timeout, $filter, notification, Device) {
    $scope.loaded = true;
    $scope.sending = false;
    $scope.showSmiley = false;

    var currentUser = LoginService.load();

    function loadCahier() {
        if (!EnfantService.getCurrent()) return;
        $scope.loaded = false;
        CahierService.get(EnfantService.getCurrent(), $rootScope.currentDate).then(function (cahier) {
            if (!cahier) {
                cahier = CahierService.new(EnfantService.getCurrent(), $rootScope.currentDate);
            }
            $scope.loaded = true;
            CahierService.setCurrent(cahier);
            /*$timeout(function () {
                $scope.$broadcast("refresh-scroll");
            }, 150);*/
        });
    }

    function changeCahier(cahier) {
        $timeout(function () {
            $scope.currentCahier = cahier;
            $scope.currentEnfant = EnfantService.getCurrent();

            $scope.$broadcast("refresh-scroll");
        }, 150);
    }

    $scope.currentCahier = CahierService.getCurrent();
    $scope.currentEnfant = EnfantService.getCurrent();
    if (!$scope.currentCahier) {
        loadCahier();
    }
    $scope.$on('loadCahier', function () {
        loadCahier();
    });
    $scope.send = function () {
        if (!confirm("Etes-vous sûre de vouloir envoyer le cahier de vie ?")) return false;
        if (!EnfantService.getCurrent().email) {
            return alert("Aucune adresse email définie pour l'enfant.");
        }
        $scope.sending = true;
        $scope.labelTransmi = "Envoi...";
        CahierService.send(EnfantService.getCurrent()).then(function () {
            $scope.sending = false;
            $scope.currentCahier = CahierService.getCurrent();
            $scope.labelTransmi = "Envoyé !";
            alert("Cahier envoyé !");
            $scope.$apply();
        }, function (err) {
            $scope.sending = false;
            $scope.labelTransmi = "Réessayer";
            //alert("Problème lors de l'envoie du cahier...");
            alert(err);
            $scope.$apply();
        }, function (progress) {
            $scope.progress = progress + ' %';
        });
    }
    $scope.showHumeur = function () {
        $scope.showSmiley = !$scope.showSmiley;
    }
    $scope.setHumeur = function (smiley) {
        $scope.currentCahier.humeur = smiley;
        $scope.showSmiley = false;
        CahierService.save(EnfantService.getCurrent(), $scope.currentCahier);
    }

    EnfantService.onChange(loadCahier);
    Device.onResume(loadCahier);

    $scope.$on('$destroy', function () {
        EnfantService.removeOnChange(loadCahier);
        CahierService.removeOnChange(changeCahier);
    });

    CahierService.onChange(changeCahier);

    $scope.newEvent = function () {
        EventService.setCurrent(null);
        navSvc.slidePage("/viewEvent");
    }
    $scope.editEvent = function (event) {
        EventService.setCurrent(event);
        navSvc.slidePage("/viewEventDetails");
    }
    $scope.removeEvent = function (event, index) {
        if (event.creator.id != currentUser._id) return;
        notification.confirm("Etes-vous sûre de vouloir supprimer cet évènement ?", function (confirm) {
            if (confirm != 1) return false;
            CahierService.removeEvent(EnfantService.getCurrent(), $scope.currentCahier, event).then(function () {
                $scope.$broadcast("refresh-scroll");
            });
        }, "Cahier de vie", ["Oui", "Non"]);
        return false;
    }
    $scope.prevEnfant = function () {
        EnfantService.prev();
    }
    $scope.nextEnfant = function () {
        EnfantService.next();
    }
    $scope.modifierEnfant = function () {
        navSvc.slidePage('/viewNewCahier');
    }
    function setlabelTransmi() {
        if (!$scope.sending) {
            $scope.labelTransmi = $scope.currentCahier && $scope.currentCahier.lastSync ? 'Transmi ' + $filter('dateortime')($scope.currentCahier.lastSync) : 'Envoyer';
        }
        else {
            $scope.labelTransmi = $scope.progress;
        }
    }
    $scope.$watch('currentCahier.lastSync', function () {
        setlabelTransmi();
    });
    $scope.$watch('progress', function () {
        setlabelTransmi();
    });
    setlabelTransmi();

    $scope.cancel = function () {
        navSvc.back();
    }
}