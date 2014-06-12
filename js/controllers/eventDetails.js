function EventDetailsCtrl($scope, $rootScope, navSvc, LoginService, EnfantService, CahierService, EventService, $timeout, notification, Device) {
    $scope.currentEnfant = EnfantService.getCurrent();
    $scope.currentCahier = CahierService.getCurrent();
    $scope.event = EventService.getCurrent();

    $scope.backEvent = function () {
        EventService.backEvent().then(function (event) {
            $scope.event = event;
            $scope.currentCahier = CahierService.getCurrent();
            $timeout(function () {
                $scope.$broadcast("refresh-scroll");
            }, 0);
        });
    }
    $scope.nextEvent = function () {
        EventService.nextEvent().then(function (event) {
            $scope.event = event;
            $scope.currentCahier = CahierService.getCurrent();
            $timeout(function () {
                $scope.$broadcast("refresh-scroll");
            }, 0);
        });
    }

    $scope.newEvent = function () {
        EventService.setCurrent(null);
        navSvc.slidePage("/viewEvent");
    }

    Device.onBackbutton(function (e) {
        if ($scope.inShowPhotosMode) {
            Code.PhotoSwipe.Current.hide();
        }
    });

    $scope.inShowPhotosMode = false;
    $scope.showPhotos = function () {
        if (!$scope.event.pictures) return;
        Code.PhotoSwipe.Current.setOptions({
            backButtonHideEnabled: false,
            getImageSource: function (e) {
                return e.url;
            },
            getImageCaption: function (e) {
                return "";
            }
        });
        Code.PhotoSwipe.Current.setImages($scope.event.pictures);
        // Start PhotoSwipe
        Code.PhotoSwipe.Current.show(0);
        $scope.inShowPhotosMode = true;
        // Suppression du bouton de suppresion
        angular.element("i.delete-icon.white").hide();

        //navSvc.slidePage("/viewPhotos");
        // A la fermeture on se désabonnedu click
        Code.PhotoSwipe.Current.addEventListener(Code.PhotoSwipe.EventTypes.onBeforeHide, function () {
            $scope.inShowPhotosMode = false;
            Code.PhotoSwipe.Current.removeEventListener(Code.PhotoSwipe.EventTypes.onBeforeHide);
        });
    }

    $scope.canEdit = function () {
        return $scope.currentCahier.owner || $scope.event && $scope.event.creator.id == $rootScope.user._id;
    }

    $scope.editEvent = function () {
        if (!$scope.canEdit()) return;
        $rootScope.slidePage('/viewEvent', 'modal');
    }
}