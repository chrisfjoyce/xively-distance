/*jshint sub:true*/
'use strict';

var ChartsCtrl = function ($scope,$location) {
  console.log(_seriesByDataSource);
  if(_seriesByDataSource == null){
    $location.path('/');
  }

  $scope.isOpened = {
    'start' : [],
    'end' : []
  };

  $scope.export = function(){
    var jsonData = JSON.stringify({
      'Wind Direction': {
        'start_date': '2014-01-01T13:35:07.437Z',
        'end_date': '2014-01-21T13:35:07.437Z',
        'devices': [
          {
            'id': 491325353,
            'schoolName':'School1',
            'datastreamId': 'Wind_Direction'
          },
          {
            'id': 491325353,
            'schoolName':'School2',
            'datastreamId': 'Wind_Direction'
          }
        ]
      },
      'Wind Direction2': {
        'start_date': '2014-01-01T13:35:07.437Z',
        'end_date': '2014-01-21T13:35:07.437Z',
        'devices': [
          {
            'id': 491325353,
            'schoolName':'School1',
            'datastreamId': 'Wind_Direction'
          },
          {
            'id': 491325353,
            'schoolName':'School2',
            'datastreamId': 'Wind_Direction'
          }
        ]
      }
    });
    $('#ta').html(jsonData);
    $('#fa').submit();
  };

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
    if(serie.disabled != null) {
      serie.disabled = !serie.disabled;
    } else {
      serie.disabled = false;
    }
    var countEnabled = 0;
    for (var i = 0; i < datastream.series.length; i++) {
      if (!datastream.series[i].disabled) {
        countEnabled++;
      }
    }
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
    if (datastream.graph != null) {
      for (var i = 0; i < datastream.series.length; i++) {
        datastream.series[i].color = datastream.series[i].disabledColor;
      }
      serie.color = serie.enabledColor;
      datastream.graph.update();
    }
  };

  $scope.leave = function(datastream, serie) {
    if (datastream.graph != null) {
      for (var i = 0; i < datastream.series.length; i++) {
        datastream.series[i].color = datastream.series[i].enabledColor;
      }
      datastream.graph.update();
    }
  };

  $scope.back = function() {
    if (_backLocation != null && _backLocation != '') {
      console.log(_backLocation);
      $location.path(_backLocation);
      _backLocation = '';
      _isBack = true;
    }
  };

  $scope.refresh = function(datastream) {
    var selectedDevicesByDatasourceAndDatastream = {};
    selectedDevicesByDatasourceAndDatastream[datastream.label] = _selectedDevicesByDatasource[datastream.label];
    var startDate = datastream.startDate;
    var endDate = datastream.endDate;
    getDatapointHistory(
    selectedDevicesByDatasourceAndDatastream,
    function(seriesByDatasource){
      $location.path('/charts');
      _backLocation = '/bySchool';

      for (var datastreamId in _seriesByDataSource) {
        if (seriesByDatasource[datastreamId] != null) {
          seriesByDatasource[datastreamId].graph = _seriesByDataSource[datastreamId].graph;
        }
      }
      updateChart(seriesByDatasource);
      _seriesByDataSource[datastream.id] = seriesByDatasource[datastream.id];
      $scope.chartDatastreams = _seriesByDataSource;
      _selectedDatastreamsBySchool=$scope.selectedDatastreamsBySchool;
      _dataStreamsSelected = $scope.dataStreamsSelected;
      $scope.$apply();
    },
    startDate,
    endDate
    );
  };

  $scope.generateChart = function(){
    getDatapointHistory(
    $scope.selectedDatastreamsBySchool,
    function(seriesByDatasource){
      $location.path('/charts');
      _backLocation = '/bySchool';

      _seriesByDataSource = seriesByDatasource;
      _selectedDatastreamsBySchool=$scope.selectedDatastreamsBySchool;
      _dataStreamsSelected = $scope.dataStreamsSelected;
      $scope.$apply();
    },
    '2014-01-01T13:35:07.437Z',
    '2014-01-14T13:35:07.437Z'
    );
  };

  $scope.open = function($event, datastreamId, type) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.isOpened[type][datastreamId] = true;
  };

};

ChartsCtrl.$inject = ['$scope','$location'];
var app = angular.module('xivelyIostpApp');
app.controller('ChartsCtrl', ChartsCtrl);