'use strict';

function jsonp_callback(data) {
    // returning from async callbacks is (generally) meaningless
    console.log(data.found);
}


// Declare app level module which depends on filters, and services
var myApp = angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'ajoslin.mobile-navigate', 'ngRoute', 'ngTouch', 'ngTouch.hold', 'snap'])
    .config(function ($compileProvider){
        //$compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
    })
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/', { templateUrl: 'partials/homeView.html', controller: 'MainCtrl' });
        $routeProvider.when('/viewCahier', { templateUrl: 'partials/cahierJourView.html', controller: 'CahierJourCtrl' });
        $routeProvider.when('/viewEvent', { templateUrl: 'partials/newEventView.html', controller: 'EventCtrl' });
        $routeProvider.when('/viewPhotos', { templateUrl: 'partials/photoView.html', controller: 'PhotosEventCtrl' });
        $routeProvider.when('/viewNewCahier', { templateUrl: 'partials/newCahier.html', controller: 'CahierCtrl' });
        $routeProvider.when('/viewAbout', { templateUrl: 'partials/aboutView.html' });
        $routeProvider.otherwise({redirectTo: '/'});
    }]);

function createModal() {
    var modal = document.createElement("div");

    var btnDone = "<button class='topcoat-button-bar__button full valid'><i class='topcoat-icon checkmark-icon'></i></button>";
    var btnCancel = "<button class='topcoat-button-bar__button full btn-cancel cancel'><i class='topcoat-icon error-icon'></i></button>";
    var tmpl = "<div id='zonearea'><div class='modal'></div><div class='saisiearea'><div class='textarea'><textarea id='saisiearea' rows='6' cols='36' placeholder=\"" + attr.placeholder + "\"/></div><div class='action'>" + btnDone + btnCancel + "</div></div></div>";

    modal.innerHTML = tmpl; //"<span>Chargement...<span><input />";
    modal.classList.add("loading-modal");
    return modal;
}

myApp.initialize = function () {
    myApp.modal = createModal();
    document.body.appendChild(myApp.modal);
    window.setTimeout(function () {
        myApp.initDB();
    }, 150);
}
myApp.initDB = function () {
    $.indexedDB("cahierdevie", {
        "schema": {
            "1": function (versionTransaction) {
                /*var catalog = versionTransaction.createObjectStore("enfants", {
                    "autoIncrement": true,
                    "keyPath": "id"
                });
                catalog.createIndex("prenom", {
                    "unique": false, // Uniqueness of Index, defaults to false
                    "multiEntry": false // see explanation below
                }, "prenom");
                var cart = versionTransaction.createObjectStore("cahier", {
                    "autoIncrement": true,
                    "keyPath": "id"
                });
                cart.createIndex("idEnfant", {
                    "unique": false, // Uniqueness of Index, defaults to false
                    "multiEntry": true // see explanation below
                }, "idEnfant");*/
            },
            // This was added in the next version of the site
            "2": function (versionTransaction) {
                var catalog = versionTransaction.createObjectStore("enfants", {
                    "autoIncrement": false,
                    "keyPath": "id"
                });
                catalog.createIndex("prenom");
                var cart = versionTransaction.createObjectStore("cahier", {
                    "autoIncrement": false,
                    "keyPath": "id"
                });
                cart.createIndex("idEnfant", {
                    "unique": false, // Uniqueness of Index, defaults to false
                    "multiEntry": true // see explanation below
                }, "idEnfant");
            }
        }
    }).then(function () {
        // Once the DB is opened with the object stores set up, show data from all tables
        window.setTimeout(function () {
            //loadFromDB("cart");
            //loadFromDB("wishlist");
            //downloadCatalog();
            $("html").addClass("ready");
            document.body.removeChild(myApp.modal);
        }, 200);
        window.onerror = function (e, f, l) {
            alert(e.stack + " \n file : " + f + " \n ligne :" + l);
        }
    }, function () {
        alert("Looks like an error occured " + JSON.stringify(arguments))
    });
}

myApp.deleteDB = function(){
    // Delete the database 
    $.indexedDB("cahierdevie").deleteDatabase();
}


/*
if (settings.core.rate_app_counter === 10) {
     navigator.notification.confirm(
                'If you enjoy using domainsicle, whould you mind taking a moment to rate it? It won\'t take more than a minute. Thanks for your support!',
                function(button) {
                    // yes = 1, no = 2, later = 3
                    if (button == '1') {    // Rate Now
                        if (device_ios) {
                            window.open('itms-apps://itunes.apple.com/us/app/domainsicle-domain-name-search/id511364723?ls=1&mt=8'); // or itms://
                        } else if (device_android) {
                            window.open('market://details?id=<package_name>');
                        } else if (device_bb) {
                            window.open('http://appworld.blackberry.com/webstore/content/<applicationid>');
                        }
                        this.core.rate_app = false;
                    } else if (button == '2') { // Later
                        this.core.rate_app_counter = 0;
                    } else if (button == '3') { // No
                        this.core.rate_app = false;
                    }
                },
           'Rate domainsicle',
           'Rate domainsicle,Remind me later, No Thanks'
   );
}
*/
