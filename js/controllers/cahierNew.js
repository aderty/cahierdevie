function CahierCtrl($scope, navSvc, EnfantService, CahierService, EventService, DropBoxService, notification) {
    $scope.enfant = EnfantService.getCurrent();
    $scope.title = "Nouveau cahier";
    $scope.inCreation = false;
    if (!$scope.enfant) {
        $scope.enfant = {
            id: new Date().getTime(),
            creation: true,
            sexe: false,
            owner: true
        }
    }
    else {
        if (typeof $scope.enfant.share == "undefined") {
            $scope.enfant.share = true;
        }
        $scope.title = "Cahier de " + $scope.enfant.prenom;
        $scope.enfantSaved = angular.copy($scope.enfant);
    }

    $scope.isDirty = function () {
        return !$scope.inCreation && !angular.equals($scope.enfantSaved, $scope.enfant);
    }

    $scope.add = function (enfant) {
        if (!enfant) return;
        if (!enfant.prenom || enfant.prenom == "") {
            notification.alert("Veuillez saisir un prénom.", function () { }, "Cahier de vie", "Ok");
            return;
        }
        var creation = enfant.creation;
        if (!enfant.id) {
            enfant.id = new Date().getTime();
        }
        if (enfant.creation) {
            delete enfant.creation;
            enfant.share = false;
            enfant.sharing = false;
        }
        else {
            enfant.share = true;
        }
        if (enfant.users && enfant.users.length > 1 && enfant.credentials) {
            enfant.sharing = true;
        }
        enfant.tick = new Date();
        EnfantService.save(enfant).then(function () {
            if (creation) {
                $scope.inCreation = true;
                EnfantService.setCurrent(enfant);
            }
            else {
                navSvc.back();
            }
            $scope.$apply();
        });
    }
    $scope.remove = function (enfant) {
        notification.confirm('Etes-vous sur?', function (button) {
            // yes = 1, no = 2, later = 3
            if (button == '1') {    // Rate Now
                EnfantService.remove(enfant).then(function () {
                    navSvc.back();
                });
            }
        }, 'Cahier de vie', ['Supprimer', 'Annuler']);
    }
    $scope.cancel = function () {
        if (!$scope.enfant.creation) {
            angular.extend($scope.enfant, $scope.enfantSaved);
            $scope.enfantSaved = null;
        }
        navSvc.back();
    }
    $scope.takePic = function () {
        var options = {
            quality: 45,
            destinationType: Camera.DestinationType.DATA_URL, //Camera.DestinationType.DATA_URL,
            sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
            encodingType: 0,     // 0=JPG 1=PNG
            targetWidth: 1000,
            targetHeight: 1000,
            correctOrientation: true
        }
        // Take picture using device camera and retrieve image as base64-encoded string
        navigator.camera.getPicture(onSuccess, onFail, options);
    }

    var onSuccess = function (imageData) {
        var image = document.createElement("img");
        image.onload = function () {
            var square = 200;
            var canvas = document.createElement('canvas');

            canvas.width = square;
            canvas.height = square;

            var context = canvas.getContext('2d');
            context.clearRect(0, 0, square, square);
            var imageWidth;
            var imageHeight;
            var offsetX = 0;
            var offsetY = 0;

            if (this.width > this.height) {
                imageWidth = Math.round(square * this.width / this.height);
                imageHeight = square;
                offsetX = -Math.round((imageWidth - square) / 2);
            } else {
                imageHeight = Math.round(square * this.height / this.width);
                imageWidth = square;
                offsetY = -Math.round((imageHeight - square) / 2);
            }

            context.drawImage(this, offsetX, offsetY, imageWidth, imageHeight);
            var data = canvas.toDataURL('image/jpeg');

            $scope.$apply(function () {
                $scope.enfant.photo = data;
            });

        };
        image.src = "data:image/jpeg;base64," + imageData;
    };
    var onFail = function (e) {
        console.log("On fail " + e);
    };

    $scope.authenticate = function () {
        DropBoxService.init();
        localStorage["authEnfant"] = $scope.enfant.id;
        DropBoxService.authenticate(function (err, client) {
            if (err) {
                console.error(err);
                notification.alert('Authentification dropbox KO...', function (button) { }, 'Cahier de vie', 'Continuer');
                alert("Authentification dropbox KO...");
                alert(err);
                DropBoxService.reset();
                return;
            }
            notification.alert('Authentification dropbox réussie.', function (button) { }, 'Cahier de vie', 'Continuer');
            var credentials = client.credentials();
            if (client.authStep == 5 && credentials) {
                $scope.enfant.setCredentials(credentials);
                //$scope.$apply();
            }
            DropBoxService.reset();
        });
    }
}