'use strict';

/* Services */

// Simple value service.
angular.module('myApp.services', []).
  value('version', '0.1');

// phonegap ready service - listens to deviceready
myApp.factory('phonegapReady', function() {
    return function (fn) {
        var queue = [];
        var impl = function () {
        queue.push(Array.prototype.slice.call(arguments));
    };
              
    document.addEventListener('deviceready', function () {
        queue.forEach(function (args) {
            fn.apply(this, args);
        });
        impl = fn;
    }, false);
              
    return function () {
        return impl.apply(this, arguments);
        };
    };
});

myApp.factory('geolocation', function ($rootScope, phonegapReady) {
  return {
    getCurrentPosition: function (onSuccess, onError, options) {
        navigator.geolocation.getCurrentPosition(function () {
               var that = this,
               args = arguments;

               if (onSuccess) {
                   $rootScope.$apply(function () {
                        onSuccess.apply(that, args);
                   });
                   }
               }, function () {
                    var that = this,
                    args = arguments;

                   if (onError) {
                        $rootScope.$apply(function () {
                            onError.apply(that, args);
                        });
                   }
               },
            options);
        }
    };
});

myApp.factory('accelerometer', function ($rootScope, phonegapReady) {
    return {
        getCurrentAcceleration: phonegapReady(function (onSuccess, onError) {
            navigator.accelerometer.getCurrentAcceleration(function () {
                var that = this,
                    args = arguments;

                if (onSuccess) {
                    $rootScope.$apply(function () {
                        onSuccess.apply(that, args);
                    });
                }
            }, function () {
                var that = this,
                args = arguments;

                if (onError) {
                    $rootScope.$apply(function () {
                        onError.apply(that, args);
                    });
                }
            });
        })
    };
});

myApp.factory('notification', function ($rootScope, phonegapReady) {
    return {
        alert: phonegapReady(function (message, alertCallback, title, buttonName) {
            navigator.notification.alert(message, function () {
                var that = this,
                    args = arguments;

                $rootScope.$apply(function () {
                    alertCallback.apply(that, args);
                });
            }, title, buttonName);
        }),
        confirm: phonegapReady(function (message, confirmCallback, title, buttonLabels) {
            navigator.notification.confirm(message, function () {
                var that = this,
                    args = arguments;

                $rootScope.$apply(function () {
                    confirmCallback.apply(that, args);
                });
            }, title, buttonLabels);
        }),
        beep: function (times) {
            navigator.notification.beep(times);
        },
        vibrate: function (milliseconds) {
            navigator.notification.vibrate(milliseconds);
        }
    };
});

myApp.factory('navSvc', function($navigate) {
    return {
        slidePage: function (path,type) {
            $navigate.go(path,type);
        },
        back: function () {
            $navigate.back();
        }
    }
});

myApp.factory('compass', function ($rootScope, phonegapReady) {
    return {
        getCurrentHeading: phonegapReady(function (onSuccess, onError) {
            navigator.compass.getCurrentHeading(function () {
                var that = this,
                    args = arguments;

                if (onSuccess) {
                    $rootScope.$apply(function () {
                        onSuccess.apply(that, args);
                    });
                }
            }, function () {
                var that = this,
                    args = arguments;

                if (onError) {
                    $rootScope.$apply(function () {
                        onError.apply(that, args);
                    });
                }
            });
        })
    };
});

myApp.factory('contacts', function ($rootScope, phonegapReady) {
    return {
        findContacts: phonegapReady(function (onSuccess, onError) {
            var options = new ContactFindOptions();
            options.filter="";
            options.multiple=true;
            var fields = ["displayName", "name"];
            navigator.contacts.find(fields, function(r){console.log("Success" +r.length);var that = this,
                args = arguments;
                if (onSuccess) {
                    $rootScope.$apply(function () {
                        onSuccess.apply(that, args);
                    });
                }
            }, function () {
                var that = this,
                    args = arguments;

                if (onError) {
                    $rootScope.$apply(function () {
                        onError.apply(that, args);
                    });
                }
            }, options)
        })
    }
});

myApp.factory('db', function () {
    return $.indexedDB("cahierdevie");
});

myApp.factory('EnfantService', function ($q, db, $timeout) {
    var current = {
        id: 1,
        prenom: "paul",
        email:"test@test.com"
    };
    return {
        list: function (idEnfant) {
            var defered = $q.defer();
            var enfants = [];
            enfants.push(current);
            $timeout(function () {
                defered.resolve(enfants);
            });
            return defered.promise;
        },
        add: function (cahier) {
            var defered = $q.defer();
            db.objectStore("cachier").add(cahier).done(function () {
                defered.resolve(true);
            })
            return defered.promise;
        },
        getCurrent: function () {
            return current;
        },
        setCurrent: function (_enfant) {
            current = _enfant;
        }
    };
});

myApp.factory('CahierService', function ($q, db, $timeout) {
    var d = new Date();
    var current = {
        id: 3,
        idEnfant: 1,
        prenom: "paul",
        date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        events: []
    };
    return {
        list: function (idEnfant) {
            var defered = $q.defer();
            var cahiers = [];
            db.objectStore("cahier").index("idEnfant").each(function (elem) {
                if (idEnfant == elem.value.idEnfant) {
                    cahiers.push(elem.value);
                }
            }, idEnfant).done(function () {
                $timeout(function () {
                    defered.resolve(cahiers);
                });
            }).fail(function () {
                defered.resolve(null);
            });
            return defered.promise;
        },
        save: function (cahier) {
            var defered = $q.defer();
            return db.objectStore("cahier").put(cahier).done(function () {
                $timeout(function () {
                    defered.resolve(true);
                });
            }).fail(function (e, l, f) {
                alert(e + " \n file : " + f + " \n ligne :" + l);
            });
            return defered.promise;
        },
        getCurrent: function () {
            return current;
        },
        setCurrent: function (_event) {
            current = _event;
        },
        onCurrentChange: function (callback) {
        }
    };
});

myApp.factory('EventService', function ($q, db) {
    var d = new Date();
    var current = null;
    return {
        getCurrent: function () {
            return current;
        },
        setCurrent: function (_event) {
            current = _event;
        }
    };
});



