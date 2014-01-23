/*jshint sub:true*/
'use strict';

var ByDataStreamPopUpCtrl = function ($scope) {
  $scope.dataStreams=_datastreamsBySchool[$scope.selectedSchool];
  $scope.active = 0;
  $scope.inactive = 0;
  //TODO garivera remove simulation of active/inactive
  //simulate active/inactive
  for (var i = 0; i < $scope.dataStreams.length; i++) {
    if (i % 3 == 0) {
      $scope.dataStreams[i].active = true;
      $scope.active++;
    } else {
      $scope.dataStreams[i].active = false;
      $scope.inactive++;
    }
  }
  //end simulate active/inactive

  $scope.dataStreamsSelected[$scope.selectedSchool] = 0;
  for (var selectedDataStream in $scope.selectedDatastreamsBySchool) {
    for (i = 0; i < $scope.dataStreams.length; i++) {
      if (selectedDataStream == $scope.dataStreams[i].id && $scope.selectedDatastreamsBySchool[selectedDataStream][$scope.dataStreams[i].deviceId]) {
        $scope.dataStreamsSelected[$scope.selectedSchool]++;
      }
    }
  }

  $scope.setSelected = function($event) {
    var checkbox = $event.target;
    if (checkbox.checked) {
      $scope.dataStreamsSelected[$scope.selectedSchool]++;
    } else {
      $scope.dataStreamsSelected[$scope.selectedSchool]--;
    }
  };
};

ByDataStreamPopUpCtrl.$inject = ['$scope'];
var app = angular.module('xivelyIostpApp');
app.controller('ByDataStreamPopUpCtrl', ByDataStreamPopUpCtrl);