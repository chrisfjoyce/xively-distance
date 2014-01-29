/*jshint sub:true*/
'use strict';

var ByDataStreamPopUpCtrl = function ($scope) {
  $scope.dataStreams=_datastreamsBySchool[$scope.selectedSchool];
  $scope.active = 0;
  $scope.inactive = 0;
  $scope.toEuroFormat = _toEuroFormat;
  //TODO garivera remove simulation of active/inactive
  //simulate active/inactive
  for (var i = 0; i < $scope.dataStreams.length; i++) {
    if ($scope.dataStreams[i].active) {
      $scope.active++;
    } else {
      $scope.inactive++;
    }
  }
  //end simulate active/inactive
  if ($scope.dataStreamsSelected == null) {
    $scope.dataStreamsSelected = [];
  }
  $scope.dataStreamsSelected[$scope.selectedSchool] = 0;

  for (var dataStreamLabel in $scope.selectedDatastreamsBySchool) {
    for (var deviceId in $scope.selectedDatastreamsBySchool[dataStreamLabel]) {
      if($scope.selectedDatastreamsBySchool[dataStreamLabel][deviceId]==true){
        var schoolName = _deviceInformation[deviceId].schoolName;
        if(schoolName == $scope.selectedSchool){
          $scope.dataStreamsSelected[$scope.selectedSchool]++;
        }
      }
    }
  }

  $scope.checkSchool = function (label,deviceId){
    if($scope.selectedDatastreamsBySchool[label]==null){
      $scope.selectedDatastreamsBySchool[label]={};
    }

    var checked = $scope.selectedDatastreamsBySchool[label][deviceId];

    checked = checked == null ? true : !$scope.selectedDatastreamsBySchool[label][deviceId];
    console.log(checked);
    $scope.selectedDatastreamsBySchool[label][deviceId]=checked;
    if (checked) {
      $scope.dataStreamsSelected[$scope.selectedSchool]++;
    } else {
      $scope.dataStreamsSelected[$scope.selectedSchool]--;
    }

  };
};

ByDataStreamPopUpCtrl.$inject = ['$scope'];
var app = angular.module('xivelyIostpApp');
app.controller('ByDataStreamPopUpCtrl', ByDataStreamPopUpCtrl);