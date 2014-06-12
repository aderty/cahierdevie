'use strict';

myApp.run(["$rootScope", "phonegapReady", "$timeout", "config", "navSvc", "LoginService", "EnfantService", "DropBoxService", function ($rootScope, phonegapReady, $timeout, config, navSvc, LoginService, EnfantService, DropBoxService) {
    phonegapReady(function () {
        console.log("phonegapReady");
        $rootScope.ready = true;
    });
    setTimeout(function () {
        config.init().then(function () {
            $rootScope.$emit('initialized');
        });
    }, 2000);

    $rootScope.slidePage = function (path, type) {
        navSvc.slidePage(path, type);
    };

    $timeout(function () {
        myApp.ready();
    }, 150);

    $rootScope.$on('$routeChangeStart', function (scope, next, current) {
        $(document.body).addClass('inTransition');
    });
    $rootScope.$on('$routeChangeSuccess', function (scope, next, current) {
        $(document.body).removeClass('inTransition');
    });

    var date = new Date();
    $rootScope.currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    $rootScope.isCurrentDate = function () {
        date = new Date();
        return ($rootScope.currentDate - new Date(date.getFullYear(), date.getMonth(), date.getDate())) == 0;
    }
    $rootScope.backDate = function () {
        $rootScope.currentDate = new Date(moment($rootScope.currentDate).add('days', -1).toDate().getTime());
    }
    $rootScope.nextDate = function () {
        $rootScope.currentDate = new Date(moment($rootScope.currentDate).add('days', 1).toDate().getTime());
    }
    $rootScope.$watch('currentDate', function () {
        console.log($rootScope.currentDate);
        $rootScope.$broadcast('loadCahier');
    });
    $rootScope.predefTitle = [
        {
            id: 0,
            libelle: 'Arrivée',
            img: 'img/event/start.png'
        },
        {
            id: 1,
            libelle: 'Départ',
            img: 'img/event/depart.png'
        },
        {
            id: 2,
            libelle: 'Activité',
            img: 'img/event/jeux.png'
        },
        {
            id: 3,
            libelle: 'Déjeuner',
            img: 'img/event/repas.png'
        },
        {
            id: 4,
            libelle: 'Sieste',
            img: 'img/event/sieste.png'
        },
        {
            id: 5,
            libelle: 'Gouter',
            img: 'img/event/repas.png'
        }
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

if (!myApp.isPhone) {
    myApp.run(["$rootScope", "EnfantService", "DropBoxService", function ($rootScope, EnfantService, DropBoxService) {
        var dropCredentials = /(.*)access_token=(.*)&token_type=(.*)&uid=(.*)&state=(.*)/.exec(location.hash);
        if (dropCredentials && dropCredentials.length && localStorage["authEnfant"]) {
            var credentials = {
                token: dropCredentials[2],
                uid: dropCredentials[4]
            }
            console.log(credentials);
            EnfantService.onLoad(function (enfants) {
                EnfantService.get(parseInt(localStorage["authEnfant"])).then(function (enfant) {
                    enfant.setCredentials(credentials);
                    console.log(enfant);
                });
                localStorage.removeItem("authEnfant");
            });
        }
    }]);
}

myApp.run(["$rootScope", "$timeout", "Device", function ($rootScope, $timeout, Device) {

    $rootScope.showMessage = false;

    $rootScope.$on('message', function (e, msg) {
        $rootScope.showMessage = true;
        $rootScope.titre = 'Information';
        $rootScope.message = msg;
        $timeout(function () {
            $rootScope.showMessage = false;
        }, 2000);
    });
    $rootScope.$on('erreur', function (e, msg) {
        $rootScope.titre = 'Erreur';
        $rootScope.showMessage = true;
        $rootScope.message = msg;
        $timeout(function () {
            $rootScope.showMessage = false;
        }, 2000);
    });

    // Synchro du compte lors des retours sur l'appli
    Device.onResume(function () {
        $rootScope.$emit('initialized');
    }, true);

}]);

myApp.run(["$rootScope", "phonegapReady", "$timeout", "config", "navSvc", "LoginService", "EnfantService", "CahierService", "DropBoxService", function ($rootScope, phonegapReady, $timeout, config, navSvc, LoginService, EnfantService, CahierService, DropBoxService) {
    $rootScope.isConnected = false;

    $rootScope.user = LoginService.load();
    if ($rootScope.user) {

        $rootScope.addPushId = function (id, type) {
            LoginService.addPushId(id, type);
        }
        $rootScope.viewCahier = function (enfant, date) {
            $rootScope.currentDate = new Date(date);
            CahierService.setCurrent(null);
            EnfantService.list().then(function (dbEnfants) {
                dbEnfants.forEach(function (enf) {
                    if (enf.id != enfant) return;
                    EnfantService.setCurrent(enf);
                    navSvc.slidePage('/viewCahier');
                });
            });
        }

        $rootScope.isConnected = true;
        $rootScope.$on('synced', function (e) {
            app.receivedEvent('deviceready');
        });

        $rootScope.$on('initialized', function (e) {
            if (!$rootScope.user) return;
            EnfantService.list().then(function (dbEnfants) {
                var i = 0, l = dbEnfants.length, enfants = {};
                for (; i < l; i++) {
                    // Si l'identifiant serveur existe -> Récupération du tick
                    if (dbEnfants[i]._id) {
                        enfants[dbEnfants[i].id] = {
                            tick: dbEnfants[i].tick
                        };
                    }
                    else {
                        // Sauvegarde pour effectuer la sauvegarde sur le serveur
                        EnfantService.save(dbEnfants[i]);
                    }
                }
                // Demande de synchro au serveur (enfants contient la liste des ticks)
                LoginService.sync({
                    user: $rootScope.user,
                    enfants: enfants
                }).then(function (data) {
                    i = 0, l = data.length;
                    var prenoms = [];
                    for (; i < l; i++) {
                        data[i].fromServer = true;
                        data[i].tick = new Date(data[i].tick);
                        EnfantService.save(data[i]);
                        prenoms.push(data[i].prenom);
                    }
                    if (data.length) {
                        $rootScope.$emit('message', "Les informations des cahiers de vie de " + prenoms.join(", ") + " ont étés mis à jour.");
                    }
                    $rootScope.$emit('synced');
                })
            });
        });
    }
}]);

/* Controllers */
