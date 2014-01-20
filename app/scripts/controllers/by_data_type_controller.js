/*jshint sub:true*/
'use strict';

var ByDataTypeCtrl = function ($scope,$modal) {
  initXivelyData();
  registerXivelyGetData(function(){
    $scope.$apply(
      function(){
        $scope.datastreams = _datastreams;
      }
    );
  });

  $scope.selectedDatastream = {};

  $scope.open = function (datastream) {
    var modalInstance = $modal.open({
      templateUrl: 'views/bySchool.html',
      scope: $scope,
    });
    console.log(datastream);
    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
    $scope.modal = modalInstance;
  };
};



ByDataTypeCtrl.$inject = ['$scope','$modal'];
var app = angular.module('xivelyIostpApp');
app.controller('ByDataTypeCtrl', ByDataTypeCtrl);