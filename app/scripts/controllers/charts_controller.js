/*jshint sub:true*/
'use strict';

var ChartsCtrl = function ($scope) {
  console.log(_seriesByDataSource);
  $scope.chartDatastreams = _seriesByDataSource;
  for (var datastreamId in _seriesByDataSource){
    _seriesByDataSource[datastreamId].id = datastreamId;
  }
  setTimeout(function() {
      $scope.$apply( function() {
        buildChart(_seriesByDataSource);
      });
    },
    1000
  );

  $scope.enableDisable = function(datastream, serie) {
    if (serie.disabled) {
      serie.disabled = false;
    } else {
      serie.disabled = true;
    }
    datastream.graph.update();
  };

  $scope.over = function(datastream, serie) {
    for (var i = 0; i < datastream.series.length; i++) {
      datastream.series[i].color = datastream.series[i].disabledColor;
    }
    serie.color = serie.enabledColor;
    datastream.graph.update();
  };

  $scope.leave = function(datastream, serie) {
    for (var i = 0; i < datastream.series.length; i++) {
      datastream.series[i].color = datastream.series[i].enabledColor;
    }
    datastream.graph.update();
  }

};

ChartsCtrl.$inject = ['$scope'];
var app = angular.module('xivelyIostpApp');
app.controller('ChartsCtrl', ChartsCtrl);