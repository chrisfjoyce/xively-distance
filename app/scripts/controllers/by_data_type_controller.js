/*jshint sub:true*/
'use strict';

var ByDataTypeCtrl = function ($scope,$modal,$location,$route,$rootScope) {
  // registerXivelyGetData(function(){
  //   var readGlobals = function(){
  //     $scope.weatherTypes = _datastreams;
  //     $scope.devicesByDatastream = _devicesByDatastream;
  //   };
  //   $scope.$apply(readGlobals);
  // });
  $rootScope.route = $route;
  $scope.datastreams = _datastreams;


  $scope.devicesByDatastream = _devicesByDatastream;

  $scope.selectedDatastream = {};

  if (_isBack) {
    _isBack = false;
    $scope.devicesSelected = _devicesSelected;
    $scope.selectedDevicesByDatasource = _selectedDevicesByDatasource;
  } else {
    $scope.devicesSelected = {};
    $scope.selectedDevicesByDatasource = {};
  }

  $scope.generateChart = function(){
    getDatapointHistory(
      $scope.selectedDevicesByDatasource,
      function(){
        //console.log(_seriesByDataSource);
        $location.path('/charts');
        _backLocation = '/byDataType';
        _selectedDevicesByDatasource = $scope.selectedDevicesByDatasource;
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
      console.log($scope.devicesSelected);
    };
    $scope.cancel = function() {
      console.log('cancel');
      $scope.modal.dismiss('cancel');
    };

    var modalInstance = $modal.open({
      templateUrl: 'views/bySchoolPopup.html',
      scope: $scope,
      controller: 'BySchoolPopupCtrl',
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



ByDataTypeCtrl.$inject = ['$scope','$modal','$location','$route','$rootScope'];
var app = angular.module('xivelyIostpApp');
app.controller('ByDataTypeCtrl', ByDataTypeCtrl);