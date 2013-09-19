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
    return {
      getInstance: function(){
          return $.indexedDB("cahierdevie");
      }
    };
});

myApp.factory('EnfantService', function ($q, db, $timeout, CahierService) {
    var current, enfants = [];
    var enfantChangeCb = [];
    
    return {
        list: function (idEnfant) {
            var defered = $q.defer();
            enfants = [];
            db.getInstance().objectStore("enfants").each(function (data) {
                enfants.push(data.value);
            }).done(function (data) {
                $timeout(function () {
                    defered.resolve(enfants);
                });
            }).fail(function () {
                defered.reject(null);
            });
            return defered.promise;
        },
        next: function () {
            var i= 0, l= enfants.length;
            for(;i<l;i++){
                if(enfants[i].id == current.id){
                    this.setCurrent(enfants[ i < l-1 ? i + 1 : 0]);
                    break;
                }
            }
            
        },
        prev: function () {
            var i= 0, l= enfants.length;
            for(;i<l;i++){
                if(enfants[i].id == current.id){
                    this.setCurrent(enfants[ i > 0 ? i - 1 : l - 1]);
                    break;
                }
            }
        },
        get: function (id) {
            var defered = $q.defer();
            db.getInstance().objectStore("enfants").get(id).done(function (data) {
                $timeout(function () {
                    defered.resolve(data);
                });
            }).fail(function () {
                defered.reject(null);
            });
            return defered.promise;
        },
        save: function (enfant) {
            var defered = $q.defer();
            return db.getInstance().objectStore("enfants").put(enfant).done(function () {
                $timeout(function () {
                    defered.resolve(true);
                });
            }).fail(function (e, l, f) {
                alert(e.stack + " \n file : " + f + " \n ligne :" + l);
            });
            return defered.promise;
        },
        remove: function(enfant) {
            var defered = $q.defer();
            CahierService.removeAll(enfant.id).then(function(){
                db.getInstance().objectStore("enfants").delete(enfant.id).done(function() {
                    $timeout(function() {
                        defered.resolve(true);
                    });
                }).fail(function(e, l, f) {
                    alert(e.stack + " \n file : " + f + " \n ligne :" + l);
                });
            });
            return defered.promise;
        },
        getCurrent: function () {
            return current;
        },
        setCurrent: function (_enfant) {
            current = _enfant;
            var i=0, l = enfantChangeCb.length;
            for(;i<l; i++){
                enfantChangeCb[i].call(this, current);
            }
        },
        onChange: function (callback) {
            enfantChangeCb.push(callback);
        },
        removeOnChange: function(callback){
            var i=0, l = enfantChangeCb.length;
            for(;i<l; i++){
                if(callback == enfantChangeCb[i]){
                    enfantChangeCb.splice(i, 1);
                }
            }
        }
    };
});

myApp.factory('CahierService', function ($q, db, $timeout) {
    
    var cahierChangeCb = [];
    
    var d = new Date();
    var current = {
        id: 3,
        idEnfant: 1,
        prenom: "paul",
        date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        events: []
    };
    
    function genKey(id, date){
        return id + "_" + date.getFullYear() + (date.getMonth() < 9 || date.getMonth() > 11  ? '0' : '') +  (date.getMonth() + 1) + date.getDate();
    }
    
    return {
        "new": function (idEnfant, date) {
            return {
                id: genKey(idEnfant, date),
                idEnfant: idEnfant,
                date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                events: []
            }
        },
        list: function (idEnfant) {
            var defered = $q.defer();
            var cahiers = [];
            db.getInstance().objectStore("cahier").index("idEnfant").each(function (elem) {
                if (idEnfant == elem.value.idEnfant) {
                    cahiers.push(elem.value);
                }
            }, idEnfant).done(function () {
                $timeout(function () {
                    defered.resolve(cahiers);
                });
            }).fail(function () {
                defered.reject(arguments);
            });
            return defered.promise;
        },
        removeAll: function(idEnfant){
            var defered = $q.defer();
            db.getInstance().objectStore("cahier").index("idEnfant").each(function (elem) {
                // Suppression des images des évènements
                if(elem.value.events && elem.value.events.length){
                    var i=0, l = elem.value.events.length;
                    for(;i<l;i++){
                        deleteEvent(elem.value.events[i]);
                    }
                }
                elem.delete();
            }, idEnfant).done(function () {
                $timeout(function () {
                    defered.resolve(true);
                });
            }).fail(function () {
                defered.reject(arguments);
            });
            return defered.promise;
        },
        get: function (idEnfant, date) {
            var defered = $q.defer();
            var cahiers = [];
            var key = genKey(idEnfant, date);
            db.getInstance().objectStore("cahier").get(key).done(function (data) {
                $timeout(function () {
                    defered.resolve(data);
                });
            }).fail(function () {
                defered.reject(null);
            });
            return defered.promise;
        },
        save: function (cahier) {
            var defered = $q.defer();
            return db.getInstance().objectStore("cahier").put(cahier).done(function () {
                $timeout(function () {
                    defered.resolve(true);
                });
            }).fail(function (e, l, f) {
                alert(e.stack + " \n file : " + f + " \n ligne :" + l);
            });
            return defered.promise;
        },
        getCurrent: function () {
            return current;
        },
        setCurrent: function (_event) {
            current = _event;
            var i=0, l = cahierChangeCb.length;
            for(;i<l; i++){
                cahierChangeCb[i].call(this, current);
            }
        },
        onChange: function (callback) {
            cahierChangeCb.push(callback);
        }
    };
    
    function deleteEvent(event){
        // Suppression des images des évènements
        if(event.pictures && event.pictures.length){
             var i=0, l = event.pictures.length;
             for(;i<l;i++){
                  deletePic(event.pictures[i]);
             }
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



