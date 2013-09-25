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
        $routeProvider.otherwise({redirectTo: '/'});
  }]);
myApp.initialize = function () {
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
