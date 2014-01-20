/*jshint sub:true*/
'use strict';

var BySchoolCtrl = function ($scope) {
  $scope.devices=_devicesByDatastream[$scope.selectedDS];
};

BySchoolCtrl.$inject = ['$scope'];
var app = angular.module('xivelyIostpApp');
app.controller('BySchoolCtrl', BySchoolCtrl);