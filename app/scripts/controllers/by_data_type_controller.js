/*jshint sub:true*/
'use strict';

var ByDataTypeCtrl = function ($scope) {
  initXivelyData();
  registerXivelyGetData(function(){
    $scope.$apply(
      function(){
        $scope.datastreams = _datastreams;
      }
    );
  });

  $scope.selectedDatastream = {};  
};

ByDataTypeCtrl.$inject = ['$scope'];
var app = angular.module('xivelyIostpApp');
app.controller('ByDataTypeCtrl', ByDataTypeCtrl);