/*jshint sub:true*/
'use strict';

var ChartsCtrl = function ($scope) {
  console.log(_seriesByDataSource);
  $scope.chartDatastreams = [];
  for (var datastreamId in _seriesByDataSource){
    $scope.chartDatastreams.push(
      {
        'id': datastreamId,
        'label': _seriesByDataSource[datastreamId].label
      }
    );
  }
  setTimeout(function() {
    console.log("aaa");
    buildChart(_seriesByDataSource)
    console.log("bbb");
  }, 1000
  );

  $scope.buildChart = function() {
    buildChart(_seriesByDataSource);
  }
};

ChartsCtrl.$inject = ['$scope'];
var app = angular.module('xivelyIostpApp');
app.controller('ChartsCtrl', ChartsCtrl);