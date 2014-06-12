function EventCtrl($scope, $rootScope, navSvc, LoginService, EnfantService, CahierService, EventService, $timeout, db, notification, Device) {
    $rootScope.showEnfantOverlay = false;
    $scope.event = EventService.getCurrent();
    $scope.showPhotoMenu = false;
    $scope.popTitle = false;
    $scope.inputTitle = false;

    if (!$scope.event) {
        $scope.popTitle = true;
        var heure = new Date().getHours();
        if (heure < 10) {
            heure = '0' + heure;
        }
        var minutes = new Date().getMinutes();
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        var currentUser = LoginService.load();
        $scope.event = {
            creation: true,
            time: heure + ":" + minutes,
            type: 2,
            title: "",
            pictures: []
        };
        EventService.setCurrent($scope.event);
    }
    else {
        $scope.event.type = $scope.event.type.toString();
        $scope.eventSaved = angular.copy($scope.event);
    }
    $scope.$broadcast("refresh-scroll");
    /*var lastTitle;
    $scope.showTitle = function(){
        //$scope.popTitle = true;
        $scope.inputTitle = true;
        lastTitle = $scope.event.title;
        if(lastTitle == "Titre") $scope.event.title = "";
        $(document.getElementById("inputTitle")).click().focus();
    }
    $scope.hideTitle = function(){
        $scope.inputTitle = false;
    }
    $scope.resetTitle = function(){
        $scope.inputTitle = false;
        $scope.event.title = lastTitle;
    }*/
    $scope.isDirty = function () {
        if ($scope.event && $scope.event.$$hashKey && $scope.eventSaved) $scope.eventSaved.$$hashKey = $scope.event.$$hashKey;
        return !angular.equals($scope.eventSaved, $scope.event);
    }

    $scope.showDesc = function () {
        $(document.getElementById("descriptionInput")).focus();
    }
    $scope.showHour = function () {
        $(document.getElementById("hourInput")).focus();
    }

    /*$scope.$watch("event.type", function (type) {
        $scope.event.title = type;
    });*/

    /*$scope.indexPhoto = 0;
    var validSwipe = true;
    $scope.prevPhoto = function () {
        if (!$scope.event.pictures.length) return;
        $scope.indexPhoto = ($scope.indexPhoto + 1) % $scope.event.pictures.length;

        $scope.currentPhoto = $scope.event.pictures[$scope.indexPhoto];
        validSwipe = false;
        setTimeout(function(){
            validSwipe = true;
        },200);
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
        validSwipe = false;
        setTimeout(function(){
            validSwipe = true;
        },200);
    }
    $scope.goTo = function (index) {
        $scope.indexPhoto = index;
    }*/

    $scope.takePic = function (type) {
        if (type === undefined) {
            $scope.showPhotoMenu = !$scope.showPhotoMenu;
            return;
        }
        $scope.showPhotoMenu = false;
        var options = {
            quality: 85,
            destinationType: Camera.DestinationType.FILE_URI, //Camera.DestinationType.DATA_URL,
            sourceType: type,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
            encodingType: 0,     // 0=JPG 1=PNG
            targetWidth: 1600,
            targetHeight: 1600,
            correctOrientation: true
        }
        if (myApp.isPhone) {
            // Take picture using device camera and retrieve image as base64-encoded string
            navigator.camera.getPicture(onSuccess, onFail, options);
        }
        else {
            initFallBack();
        }
    }

    function initFallBack() {
        function handleFileSelect(evt) {
            var files = evt.target.files; // FileList object

            // Loop through the FileList and render image files as thumbnails.
            for (var i = 0, f; f = files[i]; i++) {
                if (i == 3) return;
                // Only process image files.
                if (!f.type.match('image.*')) {
                    continue;
                }

                var reader = new FileReader();

                // Closure to capture the file information.
                reader.onload = (function (theFile) {
                    return function (e) {
                        setTimeout((function (url) {
                            return function () {
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
    var byteString, mimeString, ab, ia, blobData;
    function dataURItoBlob(dataURI, callback) {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs
        byteString = atob(dataURI.split(',')[1]);

        // separate out the mime component
        mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

        // write the bytes of the string to an ArrayBuffer
        ab = new ArrayBuffer(byteString.length);
        ia = new Uint8Array(ab);
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
                /*if (imageWidth > maxWidth) {
                  imageHeight *= maxWidth / imageWidth;
                  imageWidth = maxWidth;
                }*/
            }
            /*else {
              if (imageHeight > maxHeight) {
                imageWidth *= maxHeight / imageHeight;
                imageHeight = maxHeight;
              }
            }*/
            if (myApp.isPhone) {
                window.resolveLocalFileSystemURI(imageData, function (fileEntry) {
                    resolveOnSuccess(fileEntry, portrait ? "portrait" : "paysage");
                }, resOnError);
                return;
            }

            var canvas = document.createElement('canvas');
            canvas.width = maxWidth;
            canvas.height = maxHeight;

            console.log("width : " + this.width);
            console.log("height : " + this.height);

            var context = canvas.getContext('2d');
            context.clearRect(0, 0, maxWidth, maxHeight);

            this.width = imageWidth;
            this.height = imageHeight;

            if (this.width > maxWidth) {
                startX = (this.width - maxWidth) / 2;
            }
            else {
                offsetX = -Math.round((this.width - maxWidth) / 2);
            }
            if (this.height > maxHeight) {
                startY = (this.height - maxHeight) / 2;
            }
            else {
                offsetY = -Math.round((this.height - maxHeight) / 2);
            }

            context.drawImage(this, startX, startY, imageWidth > maxWidth ? maxWidth : imageWidth, imageHeight > maxHeight ? maxHeight : imageHeight, offsetX, offsetY, this.width, this.height);

            //var data = canvas.toDataURL('image/jpeg');
            var data = imageData;

            db.getPicturesDir(EnfantService.getCurrent()).then(function (directory) {
                var name = new Date().getTime() + ".jpeg";
                if (name == lastName) {
                    name = name.substring(0, name.indexOf(".")) + "_" + ".jpeg";
                }
                lastName = name;
                console.log(name);
                directory.getFile(name, { create: true, exclusive: false }, function (fileEntry) {
                    fileEntry.createWriter(function (writer) {
                        writer.onwrite = function (evt) {
                            successMove(fileEntry, portrait ? "portrait" : "paysage");
                        };

                        blobData = dataURItoBlob(data);
                        try {
                            writer.write(blobData);
                        }
                        catch (e) {
                            writer.write(new Blob([blobData], { type: 'image/jpeg' }));//new Blob([dataURItoBlob(data)], {type: 'application/octet-binary'}));
                        }
                        //writer.abort();
                    }, resOnError);
                }, resOnError);
            });
        };

        image.src = imageData;
        //movePic(imageData);
    };
    var onFail = function (e) {
        console.log("On fail " + e);
    };

    $scope.add = function (event, skipBack) {
        if (!event) return;
        /*if(!event.title || event.title == ""){
            return alert("Veuillez saisir un titre.");
        }*/
        var currentUser = LoginService.load();
        var enfant = EnfantService.getCurrent();
        var cahier = CahierService.getCurrent();
        if (!cahier) {
            cahier = CahierService.new(enfant, $rootScope.currentDate);
        }
        if (event.creation) {
            delete event.creation;
            cahier.events.push({
                id: new Date().getTime(),
                time: event.time,
                creator: {
                    id: currentUser._id,
                    pseudo: currentUser.pseudo
                },
                last_update: {
                    id: currentUser._id,
                    pseudo: currentUser.pseudo
                },
                title: event.title,
                desc: event.desc,
                pictures: event.pictures,
                etat: 1,
                type: event.type,
                tick: new Date()
            });
        }
        else {
            if ($scope.event.creator.id != currentUser._id) return;
            $scope.event.tick = new Date;
            $scope.event.last_update = {
                id: currentUser._id,
                pseudo: currentUser.pseudo
            }
        }
        CahierService.save(enfant, cahier).then(function () {
            //$scope.$apply();
        });
        if (!skipBack) {
            navSvc.back();
        }
    }

    Device.onBackbutton(function (e) {
        /*notification.confirm("Voullez-vous sauvegarder l'évènement avant de quitter ?", function (confirm) {
            if (confirm != 1) return;
            $scope.add($scope.event, true);
        }, "Cahier de vie", ["Sauvergarder", "Ignorer"]);*/
        $scope.add($scope.event, true);
        if ($scope.inShowPhotosMode) {
            Code.PhotoSwipe.Current.hide();
        }
    });

    $scope.cancel = function () {
        if (!$scope.event.creation) {
            angular.extend($scope.event, $scope.eventSaved);
            $scope.eventSaved = null;
        }
        navSvc.back();
    }
    $scope.inShowPhotosMode = false;
    $scope.showPhotos = function () {
        //if(!validSwipe || !$scope.event.pictures) return;
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
        // Affichage si le bouton avez été masqué.
        angular.element("i.delete-icon.white").show();
        // Au click sur le bouton de suppression -> Confirmation et suppression si nécessaire
        angular.element("i.delete-icon.white").bind("click", function () {
            console.log(Code.PhotoSwipe.Current.currentIndex);
            notification.confirm("Etes-vous sûre de vouloir supprimer la photo ?", function (confirm) {
                if (confirm != 1) return false;
                Code.PhotoSwipe.Current.hide();
                $scope.event.pictures.splice(Code.PhotoSwipe.Current.currentIndex, 1);
                CahierService.save(EnfantService.getCurrent(), CahierService.getCurrent());
            }, "Cahier de vie", ["Oui", "Non"]);
        });

        // A la fermeture on se désabonnedu click
        Code.PhotoSwipe.Current.addEventListener(Code.PhotoSwipe.EventTypes.onBeforeHide, function () {
            angular.element("i.delete-icon.white").unbind("click");
            $scope.inShowPhotosMode = false;
            Code.PhotoSwipe.Current.removeEventListener(Code.PhotoSwipe.EventTypes.onBeforeHide);
        });

        //navSvc.slidePage("/viewPhotos");
    }

    function movePic(file) {
        window.resolveLocalFileSystemURI(file, resolveOnSuccess, resOnError);
    }

    //Callback function when the file system uri has been resolved
    function resolveOnSuccess(entry, direction) {
        var d = new Date();
        var n = d.getTime();
        //new file name
        var newFileName = n + entry.name.substring(entry.name.indexOf("."));

        db.getPicturesDir(EnfantService.getCurrent()).then(function (directory) {
            entry.moveTo(directory, newFileName, function (newEntry) { successMove(newEntry, direction); }, resOnError);
        });
    }

    //Callback function when the file has been moved successfully - inserting the complete path
    function successMove(entry, direction) {
        //I do my insert with "entry.fullPath" as for the path
        //console.log(entry.toURL());
        //console.log("direction : " + direction);
        $scope.event.pictures.push({
            name: entry.name,
            url: entry.toURL(),
            path: entry.fullPath,
            dir: direction,
            sync: false
        });
        $timeout(function () {
            $scope.$broadcast("refresh-scroll");
        });
    }
    function resOnError(error) {
        alert(error.code);
    }
}