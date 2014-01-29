/*jshint sub:true*/
'use strict';
var PermalinkCtrl = function ($scope,$location,$routeParams) {
  console.log(_seriesByDataSource);
  console.log($routeParams.code);

  var absUrl = $location.absUrl();
  $scope.baseUrl = absUrl.substring(0, absUrl.indexOf('#'));

  $scope.permalink = $routeParams.code;

  $scope.isPreview = false;
  $scope.xivelyDataInitComplete = false;

  $scope.isOpened = {
    'start' : [],
    'end' : []
  };

  $scope.alerts = [];

  $scope.addAlert = function(message) {
    $scope.alerts.push({type: 'danger', msg: message});
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  var permalinkGeneration = function() {
    if (!_xivelyDataInitComplete) {
      setTimeout(permalinkGeneration, 500);
      return;
    }
    $scope.xivelyDataInitComplete = true;
    var getDataFromPermalink = function(code, callback) {
      $.get(
        'http://xively-iostp-test.tierconnect.com/services/get_permalink.php?code=' + code,
        function(data){
          console.log('Data Received:');
          console.log(data);
          if (data.error != null) {
            $scope.addAlert('Permalink code error: ' + data.error.replace(/\_/g,' ') + '. You will be redirected to Create New Observation Kit in 5 seconds.');
            $scope.xivelyDataInitComplete = false;
            setTimeout(function() {
              $location.path('/');
              $scope.$apply();
            }, 5000);
            $scope.$apply();
          } else {
            callback(data);
          }
        }
      );
    };
    getDataFromPermalink($routeParams.code, drawFromReceivedData);
  };

  var drawFromReceivedData = function(jsonObject) {
    console.log(jsonObject);
    getDatapointHistory(
      jsonObject,
      function(seriesByDatasource){

        if (_datapointErrors != null) {
          if (_datapointErrors.length > 0) {
            $scope.xivelyDataInitComplete = false;
            $scope.addAlert("Sorry!  The data in this Observation Kit has been removed, or no longer exists. You will be redirected to Create New Observation Kit in 5 seconds.");
            setTimeout(function() {
              if ($scope.alerts.length > 0) {
                $location.path('/');
                $scope.$apply();
              }
            }, 5000);
          }
        }

        _backLocation = '/';
        _seriesByDataSource = seriesByDatasource;
        _selectedDevicesByDatasource = $scope.selectedDevicesByDatasource;
        _devicesSelected = $scope.devicesSelected;
        $scope.isPreview = false;
        $scope.chartDatastreams = _seriesByDataSource;
        for (var datastreamId in _seriesByDataSource){
          _seriesByDataSource[datastreamId].id = datastreamId;
        }
        $scope.$apply();
        setTimeout(function() {
            var buildChartToApplyPermalink = function() {
              buildChart(_seriesByDataSource);
            };
            $scope.$apply(buildChartToApplyPermalink);
          },
          1000
        );
      }
    );
  };

  if(_seriesByDataSource == null){
    var isReceived = true;
    if (isReceived) {
      permalinkGeneration();
    } else {
      $location.path('/');
    }
  }

  $scope.isPreview = true;

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

  $scope.sendEmail = function() {
    var link = "mailto:?"
             + "&subject=" + escape("Check my observation kit!!!")
             + "&body=" + escape($scope.baseUrl + '#/permalink/' + $scope.permalink);
    window.location.href = link;
  }

};

PermalinkCtrl.$inject = ['$scope','$location','$routeParams'];
var app = angular.module('xivelyIostpApp');
app.controller('PermalinkCtrl', PermalinkCtrl);