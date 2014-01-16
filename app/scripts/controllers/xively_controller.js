/*jshint sub:true*/
'use strict';

var XivelyCtrl = function ($scope) {
  xively.setKey( 'fk9R1zsvjvb9m4d65JmRl80sahGH13OPAui3T04YA9f7D3Da');
  $scope.devices = null;
  $scope.datasources = null;
  $scope.devicesByDatasource = null;

  $scope.devicesCollapsed = true;
  $scope.dataSourcesCollapsed = false;

  $scope.chartDatastreams = [];

  $scope.selectedDataSourcesMap = {};
  $scope.selectedDataSources = [];
  $scope.selectedDevicesByDatasource = {};

  $scope.selectDatasources = function(){
    var selectedDatasources=[];
    $scope.selectedDevicesByDatasource = {};
    for(var datasource in $scope.selectedDataSourcesMap){
      if($scope.selectedDataSourcesMap[datasource] == true){
        selectedDatasources.push(datasource);
        $scope.selectedDevicesByDatasource[datasource] ={};
      }
    }
    $scope.devicesCollapsed = false;
    $scope.dataSourcesCollapsed = true;
    $scope.selectedDataSources = selectedDatasources;
  };


  $scope.showSelectedDevices = function(){
    var formResponse = [];
    $scope.selectedDevicesCount = 0;
    $scope.retrievedDevicesCount = 0;
    for(var datasource in $scope.selectedDevicesByDatasource){
      var datasourceConf = {
        'datastream_name' : datasource,
        'devices' : []
      };
      for(var deviceId in $scope.selectedDevicesByDatasource[datasource]){
        if($scope.selectedDevicesByDatasource[datasource][deviceId] == true){
          datasourceConf.devices.push({'id':deviceId});
          $scope.selectedDevicesCount++;
        }
      }
      formResponse.push(datasourceConf);
    }

    var startDateISO = '2014-01-01T13:35:07.437Z';
    var endDateISO   = '2014-01-14T13:35:07.437Z';

    for(var i = 0; i<formResponse.length;i++){
      var dataStreamGroup = formResponse[i];
      var datastreamId = dataStreamGroup.datastream_name;

      for(var j=0;j<dataStreamGroup.devices.length;j++){
        var device = dataStreamGroup.devices[j];

        var historyCallback = $scope.buildDataCallback(device,datastreamId);

        xively.datapoint.history(
          device.id,
          datastreamId,
          {
            //'duration' : '180days',
            'interval' : 21600,
            'start'    : '2014-01-01T13:35:07.437Z',
            'end'      : '2014-01-14T13:35:07.437Z',
            'interval_type':'discrete'
          },
          historyCallback
        );
      }
    }
  };

  $scope.seriesByDataSource = {};
  $scope.buildDataCallback = function(device,datastreamId){
    return function(data){
      var points = [];
      var datastream_min_value=0,datastream_max_value=0;
      if(data != null){
        var len = data.length;
        datastream_min_value = datastream_max_value = data[0].value;
        for (var i = 0; i < len; i++) {
          var datapoint = data[i];
          points.push({x: new Date(datapoint.at).getTime()/1000.0, y: parseFloat(datapoint.value)});
          datastream_min_value = Math.min(datastream_min_value,datapoint.value);
          datastream_max_value = Math.max(datastream_max_value,datapoint.value);
        }
      }

      if($scope.seriesByDataSource[datastreamId] == null){
        $scope.seriesByDataSource[datastreamId] = {
          'series' : [],
          'min_value' : datastream_min_value,
          'max_value' : datastream_max_value,
          'label' : datastreamId.replace(/\_/g,' ')
        };//new serie
      }
      $scope.seriesByDataSource[datastreamId].min_value = Math.min($scope.seriesByDataSource[datastreamId].min_value,datastream_min_value);
      $scope.seriesByDataSource[datastreamId].max_value = Math.max($scope.seriesByDataSource[datastreamId].max_value,datastream_max_value);

      $scope.seriesByDataSource[datastreamId].series.push({
        name: device.id,
        data: points,
        color: '#000000'
      });

      $scope.retrievedDevicesCount++;
      if($scope.selectedDevicesCount == $scope.retrievedDevicesCount){
        $scope.devicesCollapsed = true;
        buildChart($scope);
      }


      //console.log(device.id + ' : ' + datastreamId);
      //console.log(points);
      console.log($scope.seriesByDataSource);
    };
  };

  //https://api.xively.com/v2/feeds?user=iostp&tag=L1V3&status=live
  var startDevicesTimestamp = Date.now();
  xively.feed.list(
    {
      'user':'iostp',
      'tag' : 'L1V3'
    },
    function(data){
      console.log('Devices collected in: ms ' + (Date.now() - startDevicesTimestamp));
      //console.log(data);

      $scope.$apply(function(){
        var devices = data.results;
        $scope.devices = devices;
        var len = devices.length;

        var startTagsTimestamp = Date.now();
        var devicesByDatasource = {},datasources=[];
        for(var i=0;i<len;i++){
          var device = devices[i];
          if(device.datastreams == null){
            continue;
          }
          for(var j=device.datastreams.length - 1;j>=0;j--){
            var datastream = device.datastreams[j].id;

            //datastream = datastream.replace(/\_/g,' ');

            if(isNaN(parseInt(datastream))){
              if(devicesByDatasource[datastream] == null){
                devicesByDatasource[datastream] = [];
                datasources.push(datastream);
              }
              devicesByDatasource[datastream].push(device);
            }
          }
        }
        //console.log('Tags collected in: ms ' + (Date.now() - startTagsTimestamp));

        $scope.datasources = datasources;
        $scope.devicesByDatasource = devicesByDatasource;
      });
    }
  );

};

XivelyCtrl.$inject = ['$scope'];
var app = angular.module('xivelyIostpApp');
app.controller('XivelyCtrl', XivelyCtrl);
