'use strict';

/* Filters */
angular.module('myApp.filters', [])
    .filter('interpolate', ['version', function (version) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        }
    }])
.filter('datesimple', function () {
    return function (date) {
        if (!date) return "";
        var month = (date.getMonth() + 1);
        if (month < 10) {
            month = '0' + month;
        }
        return date.getDate() + '/' + month + '/' + date.getFullYear();
    }
});
