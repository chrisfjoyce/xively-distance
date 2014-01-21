/*jshint sub:true*/
'use strict';

var ChartsCtrl = function ($scope) {
  console.log(_seriesByDataSource);
  $scope.chartDatastreams = _seriesByDataSource;
  for (var datastreamId in _seriesByDataSource){
    _seriesByDataSource[datastreamId].id = datastreamId;
  }
  console.log($scope.chartSeriesByDatastream);
  setTimeout(function() {
      $scope.$apply( function() {
        buildChart(_seriesByDataSource);
      });
    },
    1000
  );

  $scope.enableDisable = function(datastream, serie) {
    console.log(serie);
    if (serie.disabled) {
      serie.disabled = false;
    } else {
      serie.disabled = true;
    }
    datastream.graph.update();
  };

  $scope.over = function(datastream, serie) {
    serie.color = serie.disabledColor;
    console.log(serie.color);
    datastream.graph.update();
  };

  $scope.leave = function(datastream, serie) {
    serie.color = serie.enabledColor;
    console.log(serie.color);
    datastream.graph.update();
  }

};

ChartsCtrl.$inject = ['$scope'];
var app = angular.module('xivelyIostpApp');
app.controller('ChartsCtrl', ChartsCtrl);