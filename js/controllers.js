'use strict';

myApp.run(["$rootScope", function ($rootScope) {
    var date = new Date(); 
    $rootScope.currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
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
    $scope.backDate = function(){
        $rootScope.currentDate.setDate($rootScope.currentDate.getDate()-1);
        $rootScope.currentDate = new Date($rootScope.currentDate.getTime());
    }
    $scope.nextDate = function(){
        $rootScope.currentDate.setDate($rootScope.currentDate.getDate()+1);
        $rootScope.currentDate = new Date($rootScope.currentDate.getTime());
    }
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

function CahierJourCtrl($scope, $rootScope, navSvc, EnfantService, CahierService, EventService) {
    function loadCahier(){
        if(!EnfantService.getCurrent()) return;
        CahierService.get(EnfantService.getCurrent().id, $rootScope.currentDate).then(function (cahier) {
            if (!cahier) {
                 cahier = CahierService.new(EnfantService.getCurrent().id, $rootScope.currentDate);
            }
            CahierService.setCurrent(cahier);
        });
    }
    $scope.currentCahier = CahierService.getCurrent();
    $scope.currentEnfant = EnfantService.getCurrent();
    
    EnfantService.onChange(loadCahier);
    
    $scope.$on('$destroy', function() {
          EnfantService.removeOnChange(loadCahier);
    });
    
    CahierService.onChange(function(cahier){
        $scope.currentCahier = cahier;
        $scope.currentEnfant = EnfantService.getCurrent();
    });
    $scope.newEvent = function () {
        EventService.setCurrent(null);
        navSvc.slidePage("/viewEvent");
    }
    $scope.editEvent = function (event) {
        EventService.setCurrent(event);
        navSvc.slidePage("/viewEvent");
    }
    $scope.removeEvent = function (event, index) {
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
    var creation = true;

    $scope.enfant = EnfantService.getCurrent();
    if ($scope.enfant) {
        creation = false;
    }
    else {
        $scope.enfant = {
            id: new Date().getTime()
        }
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
}

function EventCtrl($scope, $rootScope, navSvc, EnfantService, CahierService, EventService) {
    $rootScope.showEnfantOverlay = false;
    var creation = true;
    $scope.event = EventService.getCurrent();
    if ($scope.event) {
        creation = false;
    }
    else {
        $scope.event = {
            time: new Date().getHours() + ":" + new Date().getMinutes(),
            pictures: []
        };
    }
    if($scope.event.pictures.length){
        $scope.currentPhoto = $scope.event.pictures[0];
    }
    
    $scope.takePic = function () {
        var options = {
            quality: 75,
            destinationType: Camera.DestinationType.FILE_URI, //Camera.DestinationType.DATA_URL,
            sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
            encodingType: 0//,     // 0=JPG 1=PNG
            /*targetWidth: 250,
            targetHeight: 250*/
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
        if (creation) {
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
    $scope.indexPhoto = 0;
    $scope.currentPhoto = "";
    $scope.prevPhoto = function(){
        if(!$scope.event.pictures.length) return;
        $scope.indexPhoto = ($scope.indexPhoto + 1) % $scope.event.pictures.length;
        $scope.currentPhoto = $scope.event.pictures[$scope.indexPhoto];
    }
    $scope.nextPhoto = function(){
        if(!$scope.event.pictures.length) return;
        $scope.indexPhoto = ($scope.indexPhoto - 1) % $scope.event.pictures.length;
        $scope.currentPhoto = $scope.event.pictures[$scope.indexPhoto];
    }

    $scope.deleteImg = function (index) {
        deletePic($scope.event.pictures[index]);
        $scope.event.pictures.splice(index, 1);
    }

    function movePic(file) {
        window.resolveLocalFileSystemURI(file, resolveOnSuccess, resOnError);
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
        $scope.event.pictures.push(entry.toURI());
        $scope.currentPhoto = $scope.event.pictures[$scope.event.pictures.length -1];
        $scope.$apply();
    }
    function resOnError(error) {
        alert(error.code);
    }
}

function NotificationCtrl($scope) {
    $scope.alertNotify = function() {
        navigator.notification.alert("Sample Alert",function() {console.log("Alert success")},"My Alert","Close");
    };
    
    $scope.beepNotify = function() {
        navigator.notification.beep(1);
    };
    
    $scope.vibrateNotify = function() {
        navigator.notification.vibrate(3000);
    };
    
    $scope.confirmNotify = function() {
        navigator.notification.confirm("My Confirmation",function(){console.log("Confirm Success")},"Are you sure?",["Ok","Cancel"]);
    };
}

function GeolocationCtrl($scope,navSvc,$rootScope) {
    navigator.geolocation.getCurrentPosition(function(position) {
        $scope.position=position;
        $scope.$apply();
        },function(e) { console.log("Error retrieving position " + e.code + " " + e.message) });

    $scope.back = function () {
        navSvc.back();
    };
}

function AccelerCtrl($scope) {
    navigator.accelerometer.getCurrentAcceleration(function (acceleration) {
        $scope.acceleration  = acceleration;
        },function(e) { console.log("Error finding acceleration " + e) });
}

function DeviceCtrl($scope) {
    $scope.device = device;
}

function CompassCtrl($scope) {
    navigator.compass.getCurrentHeading(function (heading) {
        $scope.heading  = heading;
        $scope.$apply();
    },function(e) { console.log("Error finding compass " + e.code) });
}

function HackerNewsCtrl($scope, $rootScope) {

    // load in data from hacker news unless we already have
    if (!$rootScope.items) {     

        jx.load('http://api.ihackernews.com/page',function(data){
            console.log(JSON.stringify(data));
            $rootScope.items = data.items;
            $scope.$apply();
        },'json');

    } else {
        console.log('data already loaded');
    }

    $scope.loadItem = function(item) {
        navigator.notification.alert(item.url,function() {console.log("Alert success")},"My Alert","Close");
    };
}


function ContactsCtrl($scope) {
    $scope.find = function() {
        $scope.contacts = [];
        var options = new ContactFindOptions();
        //options.filter=""; //returns all results
        options.filter=$scope.searchTxt;
        options.multiple=true;
        var fields = ["displayName", "name", "phoneNumbers"];
        navigator.contacts.find(fields,function(contacts) {
            $scope.contacts=contacts;
            $scope.$apply();
        },function(e){console.log("Error finding contacts " + e.code)},options);
    }
}

function CameraCtrl($scope) {
    $scope.takePic = function() {
        var options =   {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
            encodingType: 0     // 0=JPG 1=PNG
        }
        // Take picture using device camera and retrieve image as base64-encoded string
        navigator.camera.getPicture(onSuccess,onFail,options);
    }
    var onSuccess = function(imageData) {
        console.log("On Success! ");
        $scope.picData = "data:image/jpeg;base64," +imageData;
        $scope.$apply();
    };
    var onFail = function(e) {
        console.log("On fail " + e);
    };
}



                     
