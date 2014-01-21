/*jshint sub:true*/
'use strict';

var BySchoolsCtrl = function ($scope,$modal) {
  initXivelyData();
  registerXivelyGetData(function(){
    $scope.$apply(
      function(){
        $scope.schools = _schools;
      }
    );
  });

  $scope.selectedDatastreamsBySchool={};

  $scope.open = function (school) {
    if($scope.selectedDatastreamsBySchool[school] == null){
      $scope.selectedDatastreamsBySchool[school]={};
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

BySchoolsCtrl.$inject = ['$scope','$modal'];
var app = angular.module('xivelyIostpApp');
app.controller('BySchoolsCtrl', BySchoolsCtrl);