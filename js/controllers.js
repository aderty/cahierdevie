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
    $rootScope.predefTitle = [
        'Arrivée',
        'Départ',
        'Activité',
        'Déjeuner',
        'Sieste',
        'Gouter'
    ];
    $rootScope.smileys = [
        {
            id: 0,
            name: 'heureux',
            img: 'img/humeur/heureux.svg'
        },
        {
            id: 1,
            name: 'colere',
            img: 'img/humeur/colere.svg'
        },
        {
            id: 2,
            name: 'triste',
            img: 'img/humeur/triste.svg'
        },
        {
            id: 3,
            name: 'malade',
            img: 'img/humeur/malade.svg'
        }
    ];
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
    $scope.loaded = false;
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
            $scope.loaded = true;
            $timeout(function () {
                $scope.$broadcast("refresh-scroll");
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

function CahierJourCtrl($scope, $rootScope, navSvc, EnfantService, CahierService, EventService, $timeout, $filter) {
    $scope.loaded = false;
    $scope.sending = false;
    $scope.showSmiley = false;
    function loadCahier(){
        if (!EnfantService.getCurrent()) return;
        $scope.loaded = false;
        CahierService.get(EnfantService.getCurrent().id, $rootScope.currentDate).then(function (cahier) {
            if (!cahier) {
                 cahier = CahierService.new(EnfantService.getCurrent().id, $rootScope.currentDate);
            }
            $scope.loaded = true;
            CahierService.setCurrent(cahier);
            $timeout(function () {
                $scope.$broadcast("refresh-scroll");
            }, 150);
        });
    }

    function changeCahier(cahier) {
        $scope.currentCahier = cahier;
        $scope.currentEnfant = EnfantService.getCurrent();
        $timeout(function () {
            $scope.$broadcast("refresh-scroll");
        }, 150);
    }

    $scope.currentCahier = CahierService.getCurrent();
    $scope.currentEnfant = EnfantService.getCurrent();
    //if (!$scope.currentCahier) {
        loadCahier();
    //}
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
        CahierService.save($scope.currentCahier);
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
        CahierService.removeEvent($scope.currentCahier, index).then(function () {
            $scope.$broadcast("refresh-scroll");
        });
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
}

function CahierCtrl($scope, navSvc, EnfantService, CahierService, EventService) {

    $scope.enfant = EnfantService.getCurrent();
    $scope.title = "Nouveau cahier";
    
    if (!$scope.enfant) {
        $scope.enfant = {
            id: new Date().getTime(),
            creation: true
        }
    }
    else {
        $scope.title = "Modification de cahier";
        $scope.enfantSaved = angular.copy($scope.enfant);
    }

    $scope.add = function (enfant) {
        if(!enfant) return;
        if(!enfant.prenom || enfant.prenom == ""){
            return alert("Veuillez saisir un prénom.");
        }
        if (!enfant.id) {
            enfant.id = new Date().getTime();
        }
        if (enfant.creation) {
            delete enfant.creation;
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
            });
        }
    }
    $scope.cancel = function () {
        if(!$scope.enfant.creation){
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

function EventCtrl($scope, $rootScope, navSvc, EnfantService, CahierService, EventService, $timeout, db) {
    $rootScope.showEnfantOverlay = false;
    $scope.event = EventService.getCurrent();
    $scope.showPhotoMenu = false;

    if (!$scope.event) {
        var heure = new Date().getHours();
        if(heure < 10){
            heure = '0' + heure;
        }
        var minutes = new Date().getMinutes();
        if(minutes < 10){
            minutes = '0' + minutes;
        }
        $scope.event = {
            creation: true,
            time: heure  + ":" + minutes,
            pictures: []
        };
        EventService.setCurrent($scope.event);
    }
    else{
        $scope.eventSaved = angular.copy($scope.event);
    }
    $scope.$broadcast("refresh-scroll");
    
    $scope.takePic = function (type) {
        if (type === undefined) {
            $scope.showPhotoMenu = !$scope.showPhotoMenu;
            return;
        }
        $scope.showPhotoMenu = false;
        var options = {
            quality: 60,
            destinationType: Camera.DestinationType.FILE_URI, //Camera.DestinationType.DATA_URL,
            sourceType: type,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
            encodingType: 0,     // 0=JPG 1=PNG
            targetWidth: 1000,
            targetHeight: 1000,
            correctOrientation: true
        }
        // Take picture using device camera and retrieve image as base64-encoded string
        navigator.camera.getPicture(onSuccess, onFail, options);
        //initFallBack();
    }
    
    function initFallBack(){
        function handleFileSelect(evt) {
            var files = evt.target.files; // FileList object

            // Loop through the FileList and render image files as thumbnails.
            for (var i = 0, f; f = files[i]; i++) {
               if(i == 3) return;
              // Only process image files.
              if (!f.type.match('image.*')) {
                continue;
              }

              var reader = new FileReader();

              // Closure to capture the file information.
              reader.onload = (function(theFile) {
                return function(e) {
                  setTimeout((function(url){
                      return function(){
                        onSuccess(url);
                      }
                  })(e.target.result), 50);
                };
              })(f);

              // Read in the image file as a data URL.
              reader.readAsDataURL(f);
            }
      }

      //document.getElementById('filesEvent').addEventListener('change', handleFileSelect, false);
      $(document.getElementById('filesEvent')).one('change', handleFileSelect).click();
  }
  
 /*var dataURLToBlob = function(dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
      var parts = dataURL.split(',');
      var contentType = parts[0].split(':')[1];
      var raw = parts[1];

      return new Blob([raw], {type: contentType});
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
};*/
    
    function dataURItoBlob(dataURI, callback) {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs
        var byteString = atob(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return ia;
        // write the ArrayBuffer to a blob, and you're done
        /*var bb = new BlobBuilder();
        bb.append(ab);
        return bb.getBlob(mimeString);*/
    };
    
    var lastName = "";
    var onSuccess = function (imageData) {
        console.log("On Success! ");
        //$scope.picData = "data:image/jpeg;base64," + imageData;
        /*$scope.imgs.push(imageData);
        $scope.$apply();*/
        var image = document.createElement("img");
        image.onload = function () {
            var maxWidth = 600,
            maxHeight = 900,
            imageWidth = this.width,
            imageHeight = this.height,
            portrait = true,
            offsetX = 0,
            offsetY = 0,
            startX = 0,
            startY = 0;

            if (imageWidth > imageHeight) {
                // On inverse
                maxWidth = 900;
                maxHeight = 600;
                portrait = false;
              if (imageWidth > maxWidth) {
                imageHeight *= maxWidth / imageWidth;
                imageWidth = maxWidth;
              }
            }
            else {
              if (imageHeight > maxHeight) {
                imageWidth *= maxHeight / imageHeight;
                imageHeight = maxHeight;
              }
            }
            
            var canvas = document.createElement('canvas');
            canvas.width = maxWidth;
            canvas.height = maxHeight;
            
            console.log("width : " + this.width);
            console.log("height : " + this.height);

            var context = canvas.getContext('2d');          
            
            this.width = imageWidth;
            this.height = imageHeight;

            if(this.width > maxWidth){
                startX = (this.width - maxWidth) / 2;
            }
            else{
                offsetX = - Math.round((this.width - maxWidth) / 2);
            }
            if(this.height > maxHeight){
                startY = (this.height - maxHeight) / 2;
            }
            else{
                offsetY = - Math.round((this.height - maxHeight) / 2);
            }
            
            context.drawImage(this, startX, startY, imageWidth > maxWidth ? maxWidth: imageWidth, imageHeight > maxHeight ? maxHeight: imageHeight, offsetX, offsetY, this.width, this.height);
            
            var data = canvas.toDataURL('image/jpeg');
            
            //Canvas2Image.saveAsJPEG(canvas);return;
            //data = data.replace("data:image/jpeg;", "");
            var myFolderApp = "CahierDeVie";
            
            db.getFileSystem().then(function (fileSys) {
                        fileSys.root.getDirectory(myFolderApp,
                            { create: true, exclusive: false },
                            function (directoryRoot) {
                                directoryRoot.getDirectory(EnfantService.getCurrent().prenom + "_" + EnfantService.getCurrent().id,
                                        { create: true, exclusive: false },
                                        function (directory) {
                                            var name = new Date().getTime() + ".jpeg";
                                            if(name == lastName){
                                                name = name.substring(0, name.indexOf(".")) + "_" + ".jpeg";
                                            }
                                            lastName = name;
                                            console.log(name);
                                            directory.getFile(name,
                                                    { create: true , exclusive: false},
                                                    function (fileEntry) {
                                                        fileEntry.createWriter(function (writer) {
                                                            writer.onwrite = function (evt) {
                                                                alert("success");
                                                                successMove(fileEntry, portrait ? "portrait" : "paysage");
                                                          };
                                                          var blobData = dataURItoBlob(data);
                                                          try{
                                                              writer.write(new Blob([blobData], {type: 'application/octet-binary'}));
                                                          }
                                                          catch(e){
                                                              writer.write(new Blob([blobData], { type: 'image/jpeg' }));//new Blob([dataURItoBlob(data)], {type: 'application/octet-binary'}));
                                                          }
                                                          //writer.abort();
                                                      }, function (error) {
                                                             alert("create writer " + error.code);
                                                      });
                                                    },
                                            resOnError);
                                        },
                                resOnError);
                            },
                            resOnError);
                        
            });
        };
        //image.src = imageData;
        
        
        
        movePic(imageData);
    };
    var onFail = function (e) {
        console.log("On fail " + e);
    };

    $scope.add = function (event) {
        if(!event) return;
        if(!event.title || event.title == ""){
            return alert("Veuillez saisir un titre.");
        }
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
        if(!$scope.event.creation){
            angular.extend($scope.event, $scope.eventSaved);
            $scope.eventSaved = null;
        }
        navSvc.back();
    }
    $scope.showPhotos = function(){
        navSvc.slidePage("/viewPhotos");
    }
    document.getElementById("selectTitle").addEventListener("change", function (e) {
        if (e.target.value != "") {
            $scope.event.title = e.target.value;
            e.target.value = "";
        }
        e.preventDefault();
        $scope.$apply();
    }, false);

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
                                directoryRoot.getDirectory(EnfantService.getCurrent().prenom + "_" + EnfantService.getCurrent().id,
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
    function successMove(entry, direction) {
        //I do my insert with "entry.fullPath" as for the path
        console.log(entry.toURL());
        console.log("direction : " + direction);
        $scope.event.pictures.push({
            url: entry.toURL(),
            dir: direction 
        });
        $timeout(function () {
            $scope.$broadcast("refresh-scroll");
        });
        //$scope.$apply();
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
        if (!confirm("Etes-vous sûre de vouloir supprimer cette photo ?")) return false;
        deletePic($scope.event.pictures[index].url);
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

                     
