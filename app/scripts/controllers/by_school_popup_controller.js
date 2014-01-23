/*jshint sub:true*/
'use strict';

var BySchoolPopupCtrl = function ($scope) {
  $scope.devices=_devicesByDatastream[$scope.selectedDS.id];
};

BySchoolPopupCtrl.$inject = ['$scope'];
var app = angular.module('xivelyIostpApp');
app.controller('BySchoolPopupCtrl', BySchoolPopupCtrl);