'use strict';

myApp.run(["$rootScope", "phonegapReady", "config", function ($rootScope, phonegapReady, config) {
    phonegapReady(function () {
        console.log("phonegapReady");
        $rootScope.ready = true;
    });
    setTimeout(function () {
        config.init();
    }, 2000);

    var date = new Date(); 
    $rootScope.currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    $rootScope.isCurrentDate = function(){
        return ($rootScope.currentDate - new Date(date.getFullYear(), date.getMonth(), date.getDate())) == 0;
    }
    $rootScope.backDate = function(){
        $rootScope.currentDate.setDate($rootScope.currentDate.getDate()-1);
        $rootScope.currentDate = new Date($rootScope.currentDate.getTime());
    }
    $rootScope.nextDate = function(){
        $rootScope.currentDate.setDate($rootScope.currentDate.getDate()+1);
        $rootScope.currentDate = new Date($rootScope.currentDate.getTime());
    }
}]);

/* Controllers */
function HomeCtrl($scope, navSvc, $rootScope, EnfantService, CahierService) {
    $rootScope.showSettings = false;
    $scope.slidePage = function (path, type) {
        navSvc.slidePage(path,type);
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

    $scope.optsNavigation = {
        disable: 'right',
        touchToDrag: false
    };
}

function NavigationCtrl($scope, navSvc, $rootScope) {
    /*$scope.backDate = function(){
        $rootScope.currentDate.setDate($rootScope.currentDate.getDate()-1);
        $rootScope.currentDate = new Date($rootScope.currentDate.getTime());
    }
    $scope.nextDate = function(){
        $rootScope.currentDate.setDate($rootScope.currentDate.getDate()+1);
        $rootScope.currentDate = new Date($rootScope.currentDate.getTime());
    }*/
}

function EnfantOverlayCtrl($scope, $rootScope, navSvc, EnfantService, notification){
    $scope.closeOverlay = function () {
        $rootScope.showEnfantOverlay = false;
    };
    $scope.update = function(){
        $scope.closeOverlay();
        navSvc.slidePage('/viewNewCahier');
    }
    $scope.remove = function(){
        if(confirm("Etes-vous sur ?")){
            $scope.closeOverlay();
            EnfantService.remove(EnfantService.getCurrent()).then(function(){
                $scope.$emit("reload");
            });
        }
        /*if(notification.confirm("Etes-vous sur ?", function(){
            $scope.closeOverlay();
            EnfantService.remove(EnfantService.getCurrent());
        });*/
    }
}

function MainCtrl($scope, navSvc, $rootScope, $timeout, EnfantService, CahierService) {
    CahierService.setCurrent(null);
    $scope.slidePage = function (path, type) {
        navSvc.slidePage(path, type);
    };
    $scope.backDate = function(){
        $rootScope.currentDate.setDate($rootScope.currentDate.getDate()-1);
        $rootScope.currentDate = new Date($rootScope.currentDate.getTime());
    }
    $scope.nextDate = function(){
        $rootScope.currentDate.setDate($rootScope.currentDate.getDate()+1);
        $rootScope.currentDate = new Date($rootScope.currentDate.getTime());
    }

    $scope.update = function (enfant) {
        EnfantService.setCurrent(enfant);
        navSvc.slidePage('/viewNewCahier');
    }
    $scope.remove = function (enfant) {
        if (confirm("Etes-vous sur ?")) {
            EnfantService.remove(enfant).then(function () {
                $scope.$emit("reload");
            });
        }
        /*if(notification.confirm("Etes-vous sur ?", function(){
            $scope.closeOverlay();
            EnfantService.remove(EnfantService.getCurrent());
        });*/
    }
    
    $rootScope.showEnfantOverlay = false;
    
    $scope.showMenuEnfant = function (enfant) {
        EnfantService.setCurrent(enfant);
        $rootScope.showEnfantOverlay = true;
    };
    
    
    
    $scope.showCahier = function (enfant) {
        EnfantService.setCurrent(enfant);
        navSvc.slidePage('/viewCahier');  
    };
    
    $scope.newCahier = function () {
        EnfantService.setCurrent(null);
        navSvc.slidePage('/viewNewCahier');
    }
    $timeout(function () {
        loadEnfants();
    }, 250);
    
    /*EnfantService.onChange(loadCahier);
    
    $scope.$on('$destroy', function() {
          EnfantService.removeOnChange(loadCahier);
    });*/
    
    $rootScope.$watch('currentDate', loadCahier);
    
    $scope.$on("reload", function(){
        $timeout(function () {
            loadEnfants();
        });
        //$scope.$apply();
    });
    
    function loadEnfants(){
        EnfantService.list().then(function (enfants) {
            $scope.enfants = enfants;
            $timeout(function () {
                $scope.$emit("refresh-scroll");
            }, 150);
        });
    }
    
    function loadCahier(){
        if(!EnfantService.getCurrent()) return;
        CahierService.get(EnfantService.getCurrent().id, $rootScope.currentDate).then(function (cahier) {
            if (!cahier) {
                 cahier = CahierService.new(EnfantService.getCurrent().id, $rootScope.currentDate);
            }
            CahierService.setCurrent(cahier);
        });
    }
}

function CahierJourCtrl($scope, $rootScope, navSvc, EnfantService, CahierService, EventService, $filter) {
    function loadCahier(){
        if(!EnfantService.getCurrent()) return;
        CahierService.get(EnfantService.getCurrent().id, $rootScope.currentDate).then(function (cahier) {
            if (!cahier) {
                 cahier = CahierService.new(EnfantService.getCurrent().id, $rootScope.currentDate);
            }
            CahierService.setCurrent(cahier);
        });
    }

    function changeCahier(cahier) {
        $scope.currentCahier = cahier;
        $scope.currentEnfant = EnfantService.getCurrent();
    }

    $scope.currentCahier = CahierService.getCurrent();
    $scope.currentEnfant = EnfantService.getCurrent();
    //if (!$scope.currentCahier) {
        loadCahier();
    //}
    $scope.send = function () {
        $scope.sending = true;
        $scope.labelTransmi = "Envoi en cours...";
        CahierService.send(EnfantService.getCurrent().email).then(function () {
            $scope.sending = false;
            alert("Cahier envoyé !");
            $scope.currentCahier = CahierService.getCurrent();
            $scope.labelTransmi = "Envoyé !";
            $scope.$apply();
        }, function () {
            $scope.sending = false;
            alert("Problème lors de l'envoie du cahier...");
            $scope.$apply();
        }, function (progress) {
            $scope.progress = progress + ' %';
        });
    }
    
    EnfantService.onChange(loadCahier);
    
    $scope.$on('$destroy', function() {
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
        navSvc.slidePage("/viewEvent");
    }
    $scope.removeEvent = function (event, index) {
        if (!confirm("Etes-vous sûre de vouloir supprimer cet évènement ?")) return false;
        if(event.pictures && event.pictures.length){
            var i=0, l = event.pictures.length;
            for(;i<l;i++){
                deletePic(event.pictures[i]);
            }
        }
        $scope.currentCahier.events.splice(index, 1);
        CahierService.save($scope.currentCahier);
    }
    $scope.prevEnfant = function(){
        EnfantService.prev();
    }
    $scope.nextEnfant = function(){
        EnfantService.next();
    }
    $scope.modifierEnfant = function(){
        navSvc.slidePage('/viewNewCahier');
    }
    function setlabelTransmi() {
        if (!$scope.sending || $scope.progress == '99 %' || $scope.progress == '100 %') {
            $scope.labelTransmi = $scope.currentCahier && $scope.currentCahier.lastSync ? 'Transmi ' + $filter('dateortime')($scope.currentCahier.lastSync) : 'Transmettre';
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
    
    function deletePic(file) {
        window.resolveLocalFileSystemURI(file, deleteOnSuccess, resOnError);
    }

    function deleteOnSuccess(entry) {
        //new file name
        entry.remove(function (entry) {
            console.log("Removal succeeded");
        }, resOnError);
    }
}

function CahierCtrl($scope, navSvc, EnfantService, CahierService, EventService) {

    $scope.enfant = EnfantService.getCurrent();
    $scope.title = "Nouveau cahier";
    if (!$scope.enfant) {
        $scope.enfant = {
            id: new Date().getTime()
        }
    }
    else {
        $scope.title = "Modification de cahier";
    }

    $scope.add = function (enfant) {
        if(!enfant || !enfant.prenom || enfant.prenom == "") return;
        if (!enfant.id) {
            enfant.id = new Date().getTime();
        }
        EnfantService.save(enfant).then(function () {
            navSvc.back();
            $scope.$apply();
        });
    }
    $scope.remove = function (enfant) {
        if (confirm("Etes-vous sur ?")) {
            EnfantService.remove(enfant).then(function () {
                navSvc.back();
                $scope.$apply();
            });
        }
        /*if(notification.confirm("Etes-vous sur ?", function(){
            $scope.closeOverlay();
            EnfantService.remove(EnfantService.getCurrent());
        });*/
    }
    $scope.cancel = function () {
        navSvc.back();
    }
    $scope.takePic = function(){
        var options = {
            quality: 45,
            destinationType: Camera.DestinationType.DATA_URL, //Camera.DestinationType.DATA_URL,
            sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
            encodingType: 0,     // 0=JPG 1=PNG
            targetWidth: 1000,
            targetHeight: 1000
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
                offsetX = - Math.round((imageWidth - square) / 2);
            } else {
                imageHeight = Math.round(square * this.height / this.width);
                imageWidth = square;    
                offsetY = - Math.round((imageHeight - square) / 2);            
            }

            context.drawImage(this, offsetX, offsetY, imageWidth, imageHeight);
            var data = canvas.toDataURL('image/jpeg');
            
            $scope.$apply(function(){
                $scope.enfant.photo = data;
            });
            
        };
        image.src = "data:image/jpeg;base64," + imageData;
    };
    var onFail = function (e) {
        console.log("On fail " + e);
    };
}

function EventCtrl($scope, $rootScope, navSvc, EnfantService, CahierService, EventService) {
    $rootScope.showEnfantOverlay = false;
    $scope.event = EventService.getCurrent();
    if (!$scope.event) {
        $scope.event = {
            creation: true,
            time: new Date().getHours() + ":" + new Date().getMinutes(),
            pictures: []
        };
        EventService.setCurrent($scope.event);
    }
    if($scope.event.pictures.length){
        $scope.currentPhoto = $scope.event.pictures[0];
    }
    
    $scope.takePic = function () {
        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI, //Camera.DestinationType.DATA_URL,
            sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
            encodingType: 0,     // 0=JPG 1=PNG
            targetWidth: 250,
            targetHeight: 250
        }
        // Take picture using device camera and retrieve image as base64-encoded string
        navigator.camera.getPicture(onSuccess, onFail, options);
    }

    var onSuccess = function (imageData) {
        console.log("On Success! ");
        //$scope.picData = "data:image/jpeg;base64," + imageData;
        /*$scope.imgs.push(imageData);
        $scope.$apply();*/
        movePic(imageData);
    };
    var onFail = function (e) {
        console.log("On fail " + e);
    };

    $scope.add = function (event) {
        if(!event || !event.title || event.title == "") return;
        var cahier = CahierService.getCurrent();
        if (event.creation) {
            delete event.creation;
            cahier.events.push({
                time: event.time,
                title: event.title,
                desc: event.desc,
                pictures: event.pictures
            });
        }
        CahierService.save(cahier).then(function () {
            $scope.$apply();
        });
        navSvc.back();
    }
    $scope.cancel = function(){
        navSvc.back();
    }
    $scope.showPhotos = function(){
        navSvc.slidePage("/viewPhotos");
    }

    function movePic(file) {
        window.resolveLocalFileSystemURI(file, resolveOnSuccess, resOnError);
    }

    //Callback function when the file system uri has been resolved
    function resolveOnSuccess(entry) {
        var d = new Date();
        var n = d.getTime();
        //new file name
        var newFileName = n + entry.name.substring(entry.name.indexOf("."));
        var myFolderApp = "CahierDeVie";// + EnfantService.getCurrent().id;

        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSys) {
            //The folder is created if doesn't exist
            fileSys.root.getDirectory(myFolderApp,
                            { create: true, exclusive: false },
                            function (directoryRoot) {
                                directoryRoot.getDirectory(EnfantService.getCurrent().id + "_" + EnfantService.getCurrent().prenom,
                                        { create: true, exclusive: false },
                                        function (directory) {
                                            entry.moveTo(directory, newFileName, successMove, resOnError);
                                        },
                                resOnError);
                            },
                            resOnError);
        },
        resOnError);
    }

    //Callback function when the file has been moved successfully - inserting the complete path
    function successMove(entry) {
        //I do my insert with "entry.fullPath" as for the path
        $scope.event.pictures.push(entry.toURL());
        $scope.currentPhoto = $scope.event.pictures[$scope.event.pictures.length -1];
        $scope.$apply();
    }
    function resOnError(error) {
        alert(error.code);
    }
}

function PhotosEventCtrl($scope, $rootScope, navSvc, EnfantService, CahierService, EventService) {
    $scope.indexPhoto = 0;
    $scope.currentPhoto = "";
    $scope.event = EventService.getCurrent();
    
    if($scope.event && $scope.event.pictures.length){
        $scope.currentPhoto = $scope.event.pictures[0];
    }
    
    $scope.cancel = function(){
        navSvc.back();
    }
    
    $scope.prevPhoto = function(){
        if(!$scope.event.pictures.length) return;
        $scope.indexPhoto = ($scope.indexPhoto + 1) % $scope.event.pictures.length;
        $scope.currentPhoto = $scope.event.pictures[$scope.indexPhoto];
    }
    $scope.nextPhoto = function(){
        if(!$scope.event.pictures.length) return;
        if($scope.indexPhoto == 0){
            $scope.indexPhoto = $scope.event.pictures.length - 1;
        }
        else{
            $scope.indexPhoto = $scope.indexPhoto - 1;
        }
        $scope.currentPhoto = $scope.event.pictures[$scope.indexPhoto];
    }

    $scope.deleteImg = function (index) {
        deletePic($scope.event.pictures[index]);
        $scope.event.pictures.splice(index, 1);
        if($scope.event.pictures.length){
            $scope.currentPhoto = $scope.event.pictures[0];
        }
        else{
            $scope.cancel();
        }
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

                     
