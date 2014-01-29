/*jshint sub:true*/
'use strict';

var BySchoolsCtrl = function ($scope,$modal,$location,$route,$rootScope) {
  // var onXivelyReady = function(){
  //   //$scope.schools = _schools;
  //   $scope.schoolsByLetter = _schoolsByLetter;
  // };

  // registerXivelyGetData(function(){
  //   $scope.$apply(onXivelyReady);
  // });
  $rootScope.route = $route;

  $scope.schoolsByLetter = _schoolsByLetter;

  // $scope.selectedDatastreamsBySchool={};

  // $scope.dataStreamsSelected = {};

  $scope.datastreamsBySchool = _datastreamsBySchool;

  if (_isBack) {
    _isBack = false;
    $scope.dataStreamsSelected = _dataStreamsSelected;
    $scope.selectedDatastreamsBySchool = _selectedDatastreamsBySchool;
  } else {
    $scope.dataStreamsSelected = {};
    $scope.selectedDatastreamsBySchool = {};
  }

  $scope.totalSchoolsSelected = function(){
    var sum = 0;

    for(var schoolName in $scope.dataStreamsSelected){
      if($scope.dataStreamsSelected[schoolName] > 0){
        sum ++;
      }
    }

    return sum;
  };

  $scope.generateChart = function(){
    var defaultDates = getDefaultDates();

    for(var datastreamLabel in $scope.selectedDatastreamsBySchool){
      $scope.selectedDatastreamsBySchool[datastreamLabel].startDate = defaultDates.startDate.toISOString();
      $scope.selectedDatastreamsBySchool[datastreamLabel].endDate = defaultDates.endDate.toISOString();
    }
    getDatapointHistory(
      $scope.selectedDatastreamsBySchool,
      function(seriesByDatasource){
        $location.path('/charts');
        _backLocation = '/bySchool';

        _seriesByDataSource = seriesByDatasource;
        _selectedDatastreamsBySchool=$scope.selectedDatastreamsBySchool;
        _dataStreamsSelected = $scope.dataStreamsSelected;
        $scope.$apply();
      }
    );
  };

  $scope.open = function (school) {

    // if($scope.selectedDatastreamsBySchool[school] == null){
    //   $scope.selectedDatastreamsBySchool[school]={};
    // }

    for (var i = _datastreamsBySchool[school].length - 1; i >= 0; i--) {
      var datastream = _datastreamsBySchool[school][i];
      if($scope.selectedDatastreamsBySchool[datastream.label] == null){
        $scope.selectedDatastreamsBySchool[datastream.label] = {};
      }
    }

    $scope.ok = function() {
      console.log('ok');
      // selectedElementsCounter($scope.selectedDatastreamsBySchool);
      $scope.modal.dismiss('ok');
    };
    $scope.cancel = function() {
      console.log('cancel');
      $scope.modal.dismiss('cancel');
    };

    var modalInstance = $modal.open(
      {
        templateUrl: 'views/byDataStreamPopUp.html',
        scope: $scope,
        controller: 'ByDataStreamPopUpCtrl',
        backdrop: 'static'
      }
    );
    $scope.selectedSchool = school;
    modalInstance.result.then(function (school) {
      $scope.selectedSchool = school;
    }, function (type) {
      console.log('Modal dismissed at: ' + new Date());
      console.log('Caused by: ' + type);
      //console.log($scope.dataStreamsSelected);
    });
    $scope.modal = modalInstance;
  };
};

BySchoolsCtrl.$inject = ['$scope','$modal','$location','$route','$rootScope'];
var app = angular.module('xivelyIostpApp');
app.controller('BySchoolsCtrl', BySchoolsCtrl);