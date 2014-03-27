/*jshint sub:true*/
'use strict';

var TWO_YEAR_SECONDS = 60 * 60 * 24 * 365;
var ChartsCtrl = function ($scope,$location) {
  $scope.alerts = [];

  $scope.addAlert = function(message) {
    $scope.alerts.push({type: 'danger', msg: message});
  };

  $scope.addAlertMessage = function(message) {
    $scope.alerts.push({type: 'info', msg: message});
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  $scope.getSerieStyle = function(serie){
    return {'color': serie.color};
  };

  $scope.xivelyDataInitComplete = true;

  console.log(_seriesByDataSource);

  $scope.loading = true;
  $scope.loadingMessage = 'Generating charts.';

  if(_seriesByDataSource == null){
    $location.path('/');
  } else {
    var seriesLength = 0;
    for (var serie in _seriesByDataSource) {
      seriesLength++;
      var serie2 = _seriesByDataSource[serie];
      for (var indexSerie = 0; indexSerie < serie2.series.length; indexSerie++) {
        var serieObject = serie2.series[indexSerie];
        console.log(serieObject);
        if (serieObject.data == null || serieObject.data.length == 0) {
          serieObject.noData = true;
          serieObject.data.push({x: new Date(serie2.startDate).getTime()/1000.0, y: parseFloat(0)});
          serieObject.data.push({x: new Date(serie2.endDate).getTime()/1000.0, y: parseFloat(0)});
        }
      }
    }
  }

  var absUrl = $location.absUrl();
  $scope.baseUrl = absUrl.substring(0, absUrl.indexOf('#'));

  $scope.isOpened = {
    'start' : [],
    'end' : []
  };

  $scope.maxDate = new Date();

  $scope.isPreview = true;

  $scope.totalWeatherTypes = function(){
    var sum = 0;
    for(var datastreamLabel in _seriesByDataSource){
      sum++;
    }
    return sum;
  };

  $scope.export = function(){
    var jsonObject = {};
    for (var datastreamFixedLabel in _seriesByDataSource) {
      var datastreamLabel = _seriesByDataSource[datastreamFixedLabel].label;
      jsonObject[datastreamLabel] = {};
      jsonObject[datastreamLabel]['start_date'] = _seriesByDataSource[datastreamFixedLabel].startDate;
      jsonObject[datastreamLabel]['end_date'] = _seriesByDataSource[datastreamFixedLabel].endDate;
      jsonObject[datastreamLabel]['devices'] = [];
      for (var i = 0; i < _seriesByDataSource[datastreamFixedLabel].series.length; i++) {
        var serie = _seriesByDataSource[datastreamFixedLabel].series[i];
        jsonObject[datastreamLabel]['devices'][i] = {};
        jsonObject[datastreamLabel]['devices'][i]['id'] = serie.deviceId;
        jsonObject[datastreamLabel]['devices'][i]['schoolName'] = serie.name;
        jsonObject[datastreamLabel]['devices'][i]['datastreamId'] = serie.datastreamId;
      }
    }
    var jsonData = JSON.stringify(jsonObject);
    console.log(_seriesByDataSource);
    console.log(jsonObject);
    console.log(jsonData);
    $scope.addAlertMessage('This process may take some time, please be patient.');
    $('#ta').html(jsonData);
    $('#fa').submit();
  };

  $scope.chartDatastreams = _seriesByDataSource;
  for (var datastreamId in _seriesByDataSource){
    _seriesByDataSource[datastreamId].id = datastreamId;
  }
  var buildChartToApply = function() {
    buildChart(_seriesByDataSource);
    $scope.loading = false;
  };
  var applyCharts = function() {
    $scope.$apply(buildChartToApply);
  };
  var waitForApplyCharts = function() {
    console.log(_iterationsTotal + '-' + _iterationsFinished);
    if (_iterationsTotal == _iterationsFinished) {
      setTimeout(applyCharts, 2000);
    } else {
      setTimeout(waitForApplyCharts, 1000);
    }
  };
  setTimeout(applyCharts, 1000);

  $scope.enableDisable = function(datastream, serie) {
    if(serie.disabled == null) {
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
      serie.borderColor = '#ed9c28';
      // serie.borderWidth = '2px';
      serie.borderWidth = '1px';
      datastream.graph.update();
    }
  };

  $scope.leave = function(datastream, serie) {
    if (datastream.graph != null) {
      for (var i = 0; i < datastream.series.length; i++) {
        datastream.series[i].color = datastream.series[i].enabledColor;
      }
      serie.borderColor = '#9b9b9b';
      serie.borderWidth = '1px';
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
    var startDate = new Date(Date.parse(datastream.startDate)).toISOString();
    var endDate = new Date(Date.parse(datastream.endDate)).toISOString();
    var startDateObject = new Date(Date.parse(datastream.startDate));
    var endDateObject = new Date(Date.parse(datastream.endDate));
    var todayObject = new Date();
    selectedDevicesByDatasourceAndDatastream[datastream.label].start_date = startDate;
    selectedDevicesByDatasourceAndDatastream[datastream.label].end_date = endDate;
    getDatapointHistory(
    selectedDevicesByDatasourceAndDatastream,
    function(seriesByDatasource){
      var cnt = 0;
      for(var key in seriesByDatasource){
        cnt++;
      }

      $location.path('/charts');

      for (var datastreamId in _seriesByDataSource) {
        if (seriesByDatasource[datastreamId] != null) {
          seriesByDatasource[datastreamId].graph = _seriesByDataSource[datastreamId].graph;
        }
      }
      updateChart(seriesByDatasource, datastream);
      console.log(seriesByDatasource[datastream.id]);
      _seriesByDataSource[datastream.id] = seriesByDatasource[datastream.id];
      $scope.chartDatastreams = _seriesByDataSource;
      console.log(datastream);
      $scope.$apply();
    }
    );
  };

  $scope.open = function($event, datastreamId, type) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.isOpened[type][datastreamId] = true;
  };

  $scope.generateFinalChart = function() {
    console.log(_seriesByDataSource);
    var jsonObject = {};
    for (var datastreamId in _seriesByDataSource) {
      var datastreamLabel = _seriesByDataSource[datastreamId].label;
      jsonObject[datastreamLabel] = {};
      jsonObject[datastreamLabel]['start_date'] = _seriesByDataSource[datastreamId].startDate;
      jsonObject[datastreamLabel]['end_date'] = _seriesByDataSource[datastreamId].endDate;
      for (var i = 0; i < _seriesByDataSource[datastreamId].series.length; i++) {
        var serie = _seriesByDataSource[datastreamId].series[i];
        jsonObject[datastreamLabel][serie.deviceId] = true;
      }
    }
    var jsonData = JSON.stringify(jsonObject);
    $.post(
      './services/create_permalink.php',
      {
        'json_obskit': jsonData
      },
      function(data) {
        console.log(data);
        $scope.permalink = data.code;
        $scope.isPreview = false;
        $scope.$apply();
      }
    );
  };

  $scope.sendEmail = function() {
    var link = 'mailto:?' +
             '&subject=' + escape('Check my observation kit!') +
             '&body=' + escape($scope.baseUrl + '#/permalink/' + $scope.permalink);
    window.open(link, '_blank');
  };

};

ChartsCtrl.$inject = ['$scope','$location'];
var app = angular.module('xivelyIostpApp');
app.controller('ChartsCtrl', ChartsCtrl);