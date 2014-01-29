/*jshint sub:true*/
'use strict';

var ChartsCtrl = function ($scope,$location) {
  $scope.alerts = [];

  $scope.addAlert = function(message) {
    $scope.alerts.push({type: 'danger', msg: message});
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  $scope.xivelyDataInitComplete = true;

  console.log(_seriesByDataSource);
  if(_seriesByDataSource == null){
    $location.path('/');
  } else {
    var seriesLength = 0;
    for (var serie in _seriesByDataSource) {
      seriesLength++;
    }
    if (seriesLength == 0) {
      $scope.xivelyDataInitComplete = false;
      $scope.addAlert("None of the Schools contains data to be displayed. You will be redirected to Edit the Observation Kit in 5 seconds.");
      setTimeout(function() {
        if ($scope.alerts.length > 0) {
          $scope.back();
          $scope.$apply();
        }
      }, 5000);
    }
  }

  var absUrl = $location.absUrl();
  $scope.baseUrl = absUrl.substring(0, absUrl.indexOf('#'));

  $scope.isOpened = {
    'start' : [],
    'end' : []
  };

  $scope.isPreview = true;

  // if (_datapointErrors != null) {
  //   if (_datapointErrors.length > 0) {
  //     $scope.xivelyDataInitComplete = false;
  //     $scope.addAlert("Sorry!  The data in this Observation Kit has been removed, or no longer exists. You will be redirected to Create New Observation Kit in 5 seconds.");
  //     setTimeout(function() {
  //       if ($scope.alerts.length > 0) {
  //         $location.path('/');
  //         $scope.$apply();
  //       }
  //     }, 5000);
  //   }
  // }

  $scope.totalWeatherTypes = function(){
    var sum = 0;
    for(var datastreamLabel in _seriesByDataSource){
      sum++;
    }
    return sum;
  };

  $scope.export = function(){
    // var jsonData = JSON.stringify({
    //   'Wind Direction': {
    //     'start_date': '2014-01-01T13:35:07.437Z',
    //     'end_date': '2014-01-21T13:35:07.437Z',
    //     'devices': [
    //       {
    //         'id': 491325353,
    //         'schoolName':'School1',
    //         'datastreamId': 'Wind_Direction'
    //       },
    //       {
    //         'id': 491325353,
    //         'schoolName':'School2',
    //         'datastreamId': 'Wind_Direction'
    //       }
    //     ]
    //   },
    //   'Wind Direction2': {
    //     'start_date': '2014-01-01T13:35:07.437Z',
    //     'end_date': '2014-01-21T13:35:07.437Z',
    //     'devices': [
    //       {
    //         'id': 491325353,
    //         'schoolName':'School1',
    //         'datastreamId': 'Wind_Direction'
    //       },
    //       {
    //         'id': 491325353,
    //         'schoolName':'School2',
    //         'datastreamId': 'Wind_Direction'
    //       }
    //     ]
    //   }
    // });
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
    if (startDateObject.getTime() - endDateObject.getTime() > 0) {
      $scope.addAlert("The end date should be before the start date.");
      setTimeout(function() {
        if ($scope.alerts.length > 0) {
          $scope.alerts.splice(0, 1);
          $scope.$apply();
        }
      }, 5000);
      return;
    }
    selectedDevicesByDatasourceAndDatastream[datastream.label].start_date = startDate;
    selectedDevicesByDatasourceAndDatastream[datastream.label].end_date = endDate;
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
      console.log(seriesByDatasource[datastream.id]);
      _seriesByDataSource[datastream.id] = seriesByDatasource[datastream.id];
      $scope.chartDatastreams = _seriesByDataSource;
      _selectedDatastreamsBySchool=$scope.selectedDatastreamsBySchool;
      _dataStreamsSelected = $scope.dataStreamsSelected;
      console.log(datastream);
      $scope.$apply();
    }
    );
  };

  $scope.generateChart = function(){
    var defaultDates = getDefaultDates();
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
    defaultDates.startDate.toISOString(),
    defaultDates.endDate.toISOString()
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
      'http://xively-iostp-test.tierconnect.com/services/create_permalink.php',
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

};

ChartsCtrl.$inject = ['$scope','$location'];
var app = angular.module('xivelyIostpApp');
app.controller('ChartsCtrl', ChartsCtrl);