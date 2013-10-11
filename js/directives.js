'use strict';

/* Directives */
angular.module('myApp.directives', [])
    .directive('appVersion', ['version', function(version) {
        return function(scope, elm, attrs) {
            elm.text(version);
        }
    } ])
    .directive('timepicker', ['$compile', function($compile) {
        return {
            restrict: 'A',
            scope: {
                model: '=ngModel'
            },
            replace: false,
            require: 'ngModel',
            link: function(scope, elm, attr, ngModel) {
                var first = true;
                elm.scroller({
                    preset: 'time',
                    theme: 'default',
                    mode: 'scroller',
                    lang: 'fr',
                    display: 'bottom',
                    animate: 'none'
                });


                elm.change(function(e) {
                    ngModel.$setViewValue(e.target.value);
                    if (first) {
                        first = false;
                        return;
                    }
                    scope.$apply(function() {
                        scope.model = e.target.value;
                    });
                });

                elm.scroller('setValue', scope.model, true);

                scope.$on('destroy', function() {
                    elm.scroller('destroy');
                });
            }
        };
    } ])
    .directive('datepicker', ['$compile', function($compile) {
        return {
            restrict: 'A',
            scope: {
                model: '=ngModel'
            },
            replace: false,
            require: 'ngModel',
            link: function(scope, elm, attr, ngModel) {
                var first = true;
                elm.scroller({
                    preset: 'date',
                    theme: 'default',
                    mode: 'scroller',
                    lang: 'fr',
                    display: 'bottom',
                    animate: 'none'
                });

                elm.change(function(e) {
                    ngModel.$setViewValue(elm.scroller('getDate'));
                    if (first) {
                        first = false;
                        return;
                    }
                    scope.$apply(function() {
                        scope.model = elm.scroller('getDate');
                    });
                });
                if (scope.model) {
                    elm.scroller('setValue', scope.model.toLocaleDateString('fr-FR'), true);
                }
                else {
                    first = false;
                }
                scope.$on('destroy', function() {
                    elm.scroller('destroy');
                });
            }
        };
    } ])
.directive('datemodelpicker', ['$compile', '$timeout', function($compile, $timeout) {
    return {
        restrict: 'E',
        scope: {
            model: '=ngModel'
        },
        replace: true,
        transclude: true,
        template: '<a ng-click="show();$event.stopPropagation();"><input type="text" style="width: 0;height: 0;margin-left: -9999px;position: absolute;" /><span ng-transclude></span></a>',
        require: 'ngModel',
        link: function(scope, elm, attr, ngModel) {
            var first = true;
            var scroller = elm.find('input');
            scroller.scroller({
                preset: 'date',
                theme: 'default',
                mode: 'scroller',
                lang: 'fr',
                display: 'bottom',
                animate: 'none'
            });
            scope.show = function(e) {
                scroller.scroller('show');
            }

            scroller.change(function(e) {
                if (first) {
                    first = false;
                    return;
                }
                scope.$apply(function() {
                    scope.$root[attr.ngModel] = scroller.scroller('getDate');
                    $timeout(function() {
                        scroller.scroller('hide');
                    });
                });
            });

            scroller.scroller('setValue', scope.model, true);

            scope.$on('destroy', function() {
                scroller.scroller('destroy');
            });
        }
    };
} ])
    .directive('scroll', [function() {
        return {
            restrict: 'A',
            replace: false,
            link: function(scope, elm, attr) {
                var timer = null; 
                var valid = true;
                var DELTA = 10; 
                var TIMEOUT = 800; 

                setTimeout(function() {
                    var myScroll = new iScroll(document.getElementById(elm[0].id), { 
                        scrollbars: true, 
                        mouseWheel: true, 
                        interactiveScrollbars: true,
                        onBeforeScrollStart: function (e) {
                            valid = false;
                            var target = e.target; 
                            while (target.nodeType != 1) target = target.parentNode; 
                            if (target.tagName.toLowerCase() != 'select' && target.tagName.toLowerCase() != 'input' && target.tagName.toLowerCase() != 'textarea') {

                            }
                            else {
                                if (target.canFocus) {
                                    target.canFocus = false;
                                    return;
                                }
                                //timer = new Date().getTime();
                                setTimeout((function (input) {
                                    return function () {
                                        if (valid) {
                                            input.canFocus = true;
                                            input.focus();
                                            input.click();
                                        }
                                    }
                                })(target), 250);
                            }
                            e.preventDefault();
                        },
                        onScrollEnd: function (e) {
                            //if (!timer) return;
                            if (this.distY < DELTA && this.distY > -DELTA){// && (new Date().getTime() - timer) < TIMEOUT) {
                                valid = true;
                            }
                            //timer = null;
                        }
                    });
                    elm.data('scroll', myScroll);
                    myScroll.hasVerticalScroll = true;
                    function refresh() {
                        myScroll.refresh();
                    }
                    scope.$root.$on('refresh-scroll', refresh);
                    scope.$on('destroy', function() {
                        myScroll.destroy();
                    });
                }, 500);
            }
        };
    } ])
    .directive('focusscroll', [function() {
        return {
            restrict: 'A',
            replace: false,
            link: function(scope, elm, attr) {
                elm.bind("focus", function() {
                    var me = $(this);
                    //me.closest("[scroll]")[0].scrollTop = me.position().top;
                    me.closest("[scroll]").data('scroll').scrollToElement(me[0]);
                });
            }
        };
    } ]);
