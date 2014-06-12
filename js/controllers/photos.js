function PhotosEventCtrl($scope, $rootScope, navSvc, EnfantService, CahierService, EventService, notification) {
    $scope.indexPhoto = 0;
    $scope.currentPhoto = "";
    $scope.event = EventService.getCurrent();

    if ($scope.event && $scope.event.pictures.length) {
        $scope.currentPhoto = $scope.event.pictures[0];
    }

    $scope.cancel = function () {
        navSvc.back();
    }

    $scope.prevPhoto = function () {
        if (!$scope.event.pictures.length) return;
        $scope.indexPhoto = ($scope.indexPhoto + 1) % $scope.event.pictures.length;
        $scope.currentPhoto = $scope.event.pictures[$scope.indexPhoto];
    }
    $scope.nextPhoto = function () {
        if (!$scope.event.pictures.length) return;
        if ($scope.indexPhoto == 0) {
            $scope.indexPhoto = $scope.event.pictures.length - 1;
        }
        else {
            $scope.indexPhoto = $scope.indexPhoto - 1;
        }
        $scope.currentPhoto = $scope.event.pictures[$scope.indexPhoto];
    }

    $scope.deleteImg = function (index) {
        notification.confirm('Etes-vous sûre de vouloir supprimer cette photo ?', function (button) {
            // yes = 1, no = 2, later = 3
            if (button != '1') return;

            deletePic($scope.event.pictures[index].url);
            $scope.event.pictures.splice(index, 1);
            if ($scope.event.pictures.length) {
                $scope.currentPhoto = $scope.event.pictures[0];
            }
            else {
                $scope.cancel();
            }
        }, 'Cahier de vie', ['Supprimer', 'Annuler']);
        return false;
    }

    function deletePic(file) {
        window.resolveLocalFileSystemURI(file, deleteOnSuccess, resOnError);
    }
    function deleteOnSuccess(entry) {
        //new file name
        entry.remove(function (entry) {
            console.log("Removal succeeded");
        }, resOnError);
    }

    function resOnError(error) {
        alert(error.code);
    }
}