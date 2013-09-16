'use strict';

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

    EffecktOffScreenNav.bindUIActions();
}

function MainCtrl($scope, navSvc, $rootScope, EnfantService, CahierService) {
    $scope.slidePage = function (path, type) {
        navSvc.slidePage(path, type);
    };
    $scope.showCahier = function (enfant) {
        EnfantService.setCurrent(enfant);
        CahierService.list(enfant.id).then(function (cahiers) {
            if (cahiers && cahiers.length) {
                CahierService.setCurrent(cahiers[0]);
            }
            navSvc.slidePage('/viewCahier');
        });
       
    };
    EnfantService.list().then(function (enfants) {
        if (enfants && enfants.length) {
            $scope.enfants = enfants;
        }
    });
    

}

function CahierJourCtrl($scope, navSvc, CahierService, EventService) {

    $scope.currentCahier = CahierService.getCurrent();

    $scope.newEvent = function () {
        EventService.setCurrent(null);
        navSvc.slidePage("/viewEvent");
    }
    $scope.editEvent = function (event) {
        EventService.setCurrent(event);
        navSvc.slidePage("/viewEvent");
    }
    CahierService.onCurrentChange(function (cahier) {
    });
}

function EventCtrl($scope, navSvc, EnfantService, CahierService, EventService) {
    var creation = true;
    $scope.event = EventService.getCurrent();
    if ($scope.event) {
        creation = false;
    }
    else {
        $scope.event = {
            pictures: []
        };
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
        var cahier = CahierService.getCurrent();
        if (creation) {
            cahier.events.push({
                date: new Date(),
                title: event.title,
                desc: event.desc,
                pictures: event.pictures
            });
        }
        CahierService.save(cahier).then(function () {
            navSvc.back();
            $scope.$apply();
        });
    }

    $scope.deleteImg = function (index) {
        deletePic(event.pictures[index]);
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



                     
