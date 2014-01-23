/*jshint sub:true*/
'use strict';

var BySchoolPopupCtrl = function ($scope) {
  $scope.devices=_devicesByDatastream[$scope.selectedDS.id];
  $scope.active = 0;
  $scope.inactive = 0;
  //TODO garivera remove simulation of active/inactive
  //simulate active/inactive
  for (var i = 0; i < $scope.devices.length; i++) {
    if (i % 3 == 0) {
      $scope.devices[i].active = true;
      $scope.active++;
    } else {
      $scope.devices[i].active = false;
      $scope.inactive++;
    }
  }
  //end simulate active/inactive
  $scope.setSelected = function($event) {
    var checkbox = $event.target;
    if (checkbox.checked) {
      $scope.dataStreamsSelected++;
    } else {
      $scope.dataStreamsSelected--;
    }
  };
};

BySchoolPopupCtrl.$inject = ['$scope'];
var app = angular.module('xivelyIostpApp');
app.controller('BySchoolPopupCtrl', BySchoolPopupCtrl);