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
      buildChart(_seriesByDataSource);
    },
    1000
  );

};

ChartsCtrl.$inject = ['$scope'];
var app = angular.module('xivelyIostpApp');
app.controller('ChartsCtrl', ChartsCtrl);