/*jshint sub:true*/
'use strict';

var BySchoolsCtrl = function ($scope,$modal,$location) {
  // var onXivelyReady = function(){
  //   //$scope.schools = _schools;
  //   $scope.schoolsByLetter = _schoolsByLetter;
  // };

  // registerXivelyGetData(function(){
  //   $scope.$apply(onXivelyReady);
  // });

  $scope.schoolsByLetter = _schoolsByLetter;

  $scope.selectedDatastreamsBySchool={};

  $scope.generateChart = function(){
    getDatapointHistory(
      $scope.selectedDatastreamsBySchool,
      function(){
        console.log(_seriesByDataSource);
        $location.path('/charts');
        $scope.$apply();
      });
  };

  $scope.open = function (school) {

    // if($scope.selectedDatastreamsBySchool[school] == null){
    //   $scope.selectedDatastreamsBySchool[school]={};
    // }

    for (var i = _datastreamsBySchool[school].length - 1; i >= 0; i--) {
      var datastream = _datastreamsBySchool[school][i];
      if($scope.selectedDatastreamsBySchool[datastream.name] == null){
        $scope.selectedDatastreamsBySchool[datastream.name] = {};
      }
    }

    $scope.ok = function() {
      console.log('ok');
      console.log($scope.selectedDatastreamsBySchool);
      $scope.modal.dismiss('ok');
    };
    $scope.cancel = function() {
      console.log('cancel');
      $scope.modal.dismiss('cancel');
    };

    var modalInstance = $modal.open({
      templateUrl: 'views/byDataStreamPopUp.html',
      scope: $scope,
      controller: 'ByDataStreamPopUpCtrl',
    });
    $scope.selectedSchool = school;
    modalInstance.result.then(function (school) {
      $scope.selectedSchool = school;
    }, function (type) {
      console.log('Modal dismissed at: ' + new Date());
      console.log('Caused by: ' + type);
    });
    $scope.modal = modalInstance;
  };
};

BySchoolsCtrl.$inject = ['$scope','$modal','$location'];
var app = angular.module('xivelyIostpApp');
app.controller('BySchoolsCtrl', BySchoolsCtrl);