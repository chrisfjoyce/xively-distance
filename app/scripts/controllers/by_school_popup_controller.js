/*jshint sub:true*/
'use strict';

var BySchoolPopupCtrl = function ($scope) {
  $scope.devices=_devicesByDatastream[$scope.selectedDS];
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
  if ($scope.devicesSelected == null) {
    $scope.devicesSelected = [];
  }
  $scope.devicesSelected[$scope.selectedDS] = 0;

  for (var selectedDevice in $scope.selectedDevicesByDatasource[$scope.selectedDS]) {
    if ($scope.selectedDevicesByDatasource[$scope.selectedDS][selectedDevice] == true) {
      $scope.devicesSelected[$scope.selectedDS]++;
    }
  }

  $scope.setSelected = function($event, deviceId,value) {
    $scope.selectedDevicesByDatasource[$scope.selectedDS][deviceId] = !($scope.selectedDevicesByDatasource[$scope.selectedDS][deviceId] || false)
    if (value) {
      $scope.devicesSelected[$scope.selectedDS]++;
    } else {
      $scope.devicesSelected[$scope.selectedDS]--;
    }
  };
};

BySchoolPopupCtrl.$inject = ['$scope'];
var app = angular.module('xivelyIostpApp');
app.controller('BySchoolPopupCtrl', BySchoolPopupCtrl);