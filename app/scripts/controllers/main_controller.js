/*jshint sub:true*/
'use strict';

var MainCtrl = function ($scope) {
  initXivelyData();
};

MainCtrl.$inject = ['$scope'];
var app = angular.module('xivelyIostpApp');
app.controller('MainCtrl', MainCtrl);