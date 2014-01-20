/*jshint sub:true*/
'use strict';

var ByDataTypeCtrl = function ($scope,$modal,$location) {
  initXivelyData();
  registerXivelyGetData(function(){
    $scope.$apply(
      function(){
        $scope.weatherTypes = _datastreams;
      }
    );
  });

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
    $scope.datasource=datastream;
    if($scope.selectedDevicesByDatasource[datastream] == null){
      $scope.selectedDevicesByDatasource[datastream]={};
    }
    var modalInstance = $modal.open({
      templateUrl: 'views/bySchool.html',
      scope: $scope,
      controller: 'BySchoolCtrl',
    });
    $scope.selectedDS = datastream;
    modalInstance.result.then(function (datastream) {
      $scope.selectedDatastream = datastream;
    }, function () {
      // console.log($scope.selectedDevicesByDatasource);
      // $log.info('Modal dismissed at: ' + new Date());
    });
    $scope.modal = modalInstance;
  };
};



ByDataTypeCtrl.$inject = ['$scope','$modal','$location'];
var app = angular.module('xivelyIostpApp');
app.controller('ByDataTypeCtrl', ByDataTypeCtrl);