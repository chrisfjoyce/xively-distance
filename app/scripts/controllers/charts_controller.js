/*jshint sub:true*/
'use strict';

var ChartsCtrl = function ($scope,$location) {
  console.log(_seriesByDataSource);
  if(_seriesByDataSource == null){
    $location.path('/');
  }

  $scope.chartDatastreams = _seriesByDataSource;
  for (var datastreamId in _seriesByDataSource){
    _seriesByDataSource[datastreamId].id = datastreamId;
  }
  setTimeout(function() {
      var buildChartToApply = function() {
        buildChart(_seriesByDataSource);
      };
      $scope.$apply(buildChartToApply);
    },
    1000
  );

  $scope.enableDisable = function(datastream, serie) {
    var countEnabled = 0;
    for (var i = 0; i < datastream.series.length; i++) {
      if (!datastream.series[i].disabled) {
        countEnabled++;
      }
    }
    console.log(countEnabled);
    if (serie.disabled) {
      serie.disabled = false;
    } else {
      if (countEnabled <= 1) {
        serie.disabled = false;
      } else {
        serie.disabled = true;
      }
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
  };

};

ChartsCtrl.$inject = ['$scope','$location'];
var app = angular.module('xivelyIostpApp');
app.controller('ChartsCtrl', ChartsCtrl);