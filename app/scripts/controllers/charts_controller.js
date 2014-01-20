/*jshint sub:true*/
'use strict';

var ChartsCtrl = function ($scope) {
  console.log(_seriesByDataSource);
};

ChartsCtrl.$inject = ['$scope'];
var app = angular.module('xivelyIostpApp');
app.controller('ChartsCtrl', ChartsCtrl);