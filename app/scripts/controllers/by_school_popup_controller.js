/*jshint sub:true*/
'use strict';

var BySchoolPopupCtrl = function ($scope) {
  console.log($scope.selectedDS);
  $scope.devices = [];
  for (var i = 0; i < $scope.selectedDS.datastreams.length; i++) {
    $scope.devices = $scope.devices.concat(_devicesByDatastream[$scope.selectedDS.datastreams[i]]);
  }
  $scope.active = 0;
  $scope.inactive = 0;
  $scope.toEuroFormat = _toEuroFormat;
  for (i = 0; i < $scope.devices.length; i++) {
    if ($scope.devices[i].active) {
      $scope.active++;
    } else {
      $scope.inactive++;
    }
  }
  if ($scope.devicesSelected == null) {
    $scope.devicesSelected = [];
  }
  $scope.devicesSelected[$scope.selectedDS.label] = 0;

  for (i = 0; i < $scope.selectedDS.datastreams.length; i++) {
    for (var selectedDevice in $scope.selectedDevicesByDatasource[$scope.selectedDS.datastreams[i]]) {
      if ($scope.selectedDevicesByDatasource[$scope.selectedDS.datastreams[i]][selectedDevice] == true) {
        $scope.devicesSelected[$scope.selectedDS.label]++;
      }
    }
  }

  $scope.setSelected = function($event, deviceId, datastreamLabel, value) {
    console.log(deviceId);
    console.log(datastreamLabel);
    console.log(value);
    if ($scope.selectedDevicesByDatasource[datastreamLabel] == null) {
      $scope.selectedDevicesByDatasource[datastreamLabel] = {};
    }
    $scope.selectedDevicesByDatasource[datastreamLabel][deviceId] = !($scope.selectedDevicesByDatasource[datastreamLabel][deviceId] || false);
    if (value) {
      $scope.devicesSelected[$scope.selectedDS.label]++;
    } else {
      $scope.devicesSelected[$scope.selectedDS.label]--;
    }
  };
};

BySchoolPopupCtrl.$inject = ['$scope'];
var app = angular.module('xivelyIostpApp');
app.controller('BySchoolPopupCtrl', BySchoolPopupCtrl);