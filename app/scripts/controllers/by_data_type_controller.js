/*jshint sub:true*/
'use strict';

var ByDataTypeCtrl = function ($scope,$modal,$location) {
  // registerXivelyGetData(function(){
  //   var readGlobals = function(){
  //     $scope.weatherTypes = _datastreams;
  //     $scope.devicesByDatastream = _devicesByDatastream;
  //   };
  //   $scope.$apply(readGlobals);
  // });
  $scope.weatherTypes = _datastreams;
  $scope.devicesByDatastream = _devicesByDatastream;

  $scope.selectedDatastream = {};

  $scope.selectedDevicesByDatasource={};

  $scope.generateChart = function(){
    //getDatapointHistory({'Wind_Direction':{'450493179':true,'948107654':true}});
    getDatapointHistory(
      $scope.selectedDevicesByDatasource,
      function(){
        console.log(_seriesByDataSource);
        $location.path('/charts');
        $scope.$apply();
      });
  };

  $scope.open = function (datastream) {
    if($scope.selectedDevicesByDatasource[datastream] == null){
      $scope.selectedDevicesByDatasource[datastream]={};
    }

    $scope.ok = function() {
      console.log('ok');
      $scope.modal.dismiss('ok');
    };
    $scope.cancel = function() {
      console.log('cancel');
      $scope.modal.dismiss('cancel');
    };

    var modalInstance = $modal.open({
      templateUrl: 'views/bySchool.html',
      scope: $scope,
      controller: 'BySchoolCtrl',
    });
    $scope.selectedDS = datastream;
    modalInstance.result.then(function (datastream) {
      $scope.selectedDatastream = datastream;
    }, function (type) {
      console.log('Modal dismissed at: ' + new Date());
      console.log('Caused by: ' + type);
    });
    $scope.modal = modalInstance;
  };
};



ByDataTypeCtrl.$inject = ['$scope','$modal','$location'];
var app = angular.module('xivelyIostpApp');
app.controller('ByDataTypeCtrl', ByDataTypeCtrl);