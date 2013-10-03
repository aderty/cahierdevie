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
    .directive('scroll', [function() {
        return {
            restrict: 'A',
            replace: false,
            link: function(scope, elm, attr) {
                setTimeout(function() {
                    var myScroll = new IScroll(document.getElementById(elm[0].id), { scrollbars: true, mouseWheel: true, interactiveScrollbars: true });
                    elm.data('scroll', myScroll);
                    myScroll.hasVerticalScroll = true;

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
