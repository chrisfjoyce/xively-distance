/*jshint sub:true*/
'use strict';

var ByDataTypeCtrl = function ($scope,$modal,$location,$route,$rootScope) {
  $rootScope.route = $route;
  $scope.datastreams = _datastreamsGroups;


  $scope.devicesByDatastream = _devicesByDatastream;

  $scope.selectedDatastream = {};

  $scope.devicesStatusByDatastream = _devicesStatusByDatastream;

  // console.log(_devicesStatusByDatastream);

  if (_isBack) {
    _isBack = false;
    $scope.devicesSelected = _devicesSelected;
    $scope.selectedDevicesByDatasource = _selectedDevicesByDatasource;
  } else {
    $scope.devicesSelected = {};
    $scope.selectedDevicesByDatasource = {};
  }

  $scope.totalSelected = function(){
    var sum = 0;
    for(var datastream in $scope.devicesSelected){
      sum += $scope.devicesSelected[datastream];
    }
    return sum;
  };

  $scope.generateChart = function(){
    $scope.loading = true;
    $scope.loadingMessage = 'Generating charts.';
    var defaultDates = getDefaultDates();
    for(var datastreamLabel in $scope.selectedDevicesByDatasource){
      $scope.selectedDevicesByDatasource[datastreamLabel].start_date = defaultDates.startDate.toISOString();
      $scope.selectedDevicesByDatasource[datastreamLabel].end_date   = defaultDates.endDate.toISOString();
    }

    getDatapointHistory(
      $scope.selectedDevicesByDatasource,
      function(seriesByDatasource){
        $location.path('/charts');
        _backLocation = '/byDataType';
        _seriesByDataSource = seriesByDatasource;
        _selectedDevicesByDatasource = $scope.selectedDevicesByDatasource;
        _devicesSelected = $scope.devicesSelected;
        $scope.$apply();
      }
    );
  };

  $scope.open = function (datastream) {
    if($scope.selectedDevicesByDatasource[datastream] == null){
      $scope.selectedDevicesByDatasource[datastream]={};
    }

    $scope.preModalState = {
      devicesSelected         : jQuery.extend(true, {}, $scope.devicesSelected),
      selectedDevicesByDatasource : jQuery.extend(true, {}, $scope.selectedDevicesByDatasource)
    };

    $scope.ok = function() {
      // console.log('ok');
      $scope.modal.dismiss('ok');
      // console.log($scope.devicesSelected);
    };
    $scope.cancel = function() {
      // console.log('cancel');
      $scope.modal.dismiss('cancel');

      $scope.devicesSelected             = _devicesSelected             = $scope.preModalState.devicesSelected;
      $scope.selectedDevicesByDatasource = _selectedDevicesByDatasource = $scope.preModalState.selectedDevicesByDatasource;
    };

    var modalInstance = $modal.open(
      {
        templateUrl: 'views/bySchoolPopup.html',
        scope: $scope,
        controller: 'BySchoolPopupCtrl',
        backdrop: 'static'
      }
    );
    $scope.selectedDS = datastream;
    modalInstance.result.then(function (datastream) {
      $scope.selectedDatastream = datastream;
    }, function (type) {
      // console.log('Modal dismissed at: ' + new Date());
      // console.log('Caused by: ' + type);
    });
    $scope.modal = modalInstance;
  };

  if(_xivelyDataInitComplete) {
    $scope.loading = false;
  } else {
    $scope.loading = true;
    $scope.loadingMessage = 'Loading Data Types';
  }

};



ByDataTypeCtrl.$inject = ['$scope','$modal','$location','$route','$rootScope'];
var app = angular.module('xivelyIostpApp');
app.controller('ByDataTypeCtrl', ByDataTypeCtrl);