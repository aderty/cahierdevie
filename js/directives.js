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
                elm.scroller({
                    preset: 'time',
                    theme: 'default',
                    mode: 'scroller',
                    lang: 'fr',
                    display: 'inline',
                    animate: 'none'
                });

                elm.scroller('setValue', scope.model);

                elm.change(function(e) {
                    ngModel.$setViewValue(e.target.value);
                    scope.$apply(function() {
                        scope.model = e.target.value;
                    });
                });

                scope.$on('destroy', function() {
                    elm.scroller('destroy');
                });
            }
        };
    } ]);
