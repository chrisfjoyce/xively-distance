/*jshint sub:true*/
'use strict';

xively.setKey('LZ8CcFmj2huPno20yShkEGlm3QQAiuiMYsLQOjHEQpWOSzDs');
var _devicesByDatastream = null;
var _datastreams = null;
var _callbacks = [];
var _seriesByDataSource = null;
var _retrievedDevicesCount = null;
var _schoolsBooleanMap = {};
var _schools = [];
var _schoolsByLetter = {};
var _datastreamsBySchool = {};
var _deviceInformation = {};
var _xivelyDataInit = false;

var registerXivelyGetData = function(fn){
  if(_datastreams != null){
    fn();
  }
  _callbacks.push(fn);
};

var getDatapointHistory = function(selectedDevicesByDatasource,callback){
  var formResponse = [];
  var selectedDevicesCount = 0;
  _retrievedDevicesCount = 0;
  for(var datasource in selectedDevicesByDatasource){
    var datasourceConf = {
      'datastream_name' : datasource,
      'devices' : []
    };
    for(var deviceId in selectedDevicesByDatasource[datasource]){
      if(selectedDevicesByDatasource[datasource][deviceId] == true){
        datasourceConf.devices.push({'id':deviceId});
        selectedDevicesCount++;
      }
    }
    if(datasourceConf.devices.length > 0){
      formResponse.push(datasourceConf);
    }
  }

  var startDateISO = '2014-01-01T13:35:07.437Z';
  var endDateISO   = '2014-01-14T13:35:07.437Z';
  _seriesByDataSource = {};

  for(var i = 0; i<formResponse.length;i++){
    var dataStreamGroup = formResponse[i];
    var datastreamId = dataStreamGroup.datastream_name;

    for(var j=0;j<dataStreamGroup.devices.length;j++){
      var device = dataStreamGroup.devices[j];

      var historyCallback = buildDataCallback(device,datastreamId,selectedDevicesCount,_seriesByDataSource,callback);

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



var buildDataCallback = function(device,datastreamId,selectedDevicesCount,seriesByDataSource,callback){
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

    if(points.length == 0){

    }else{
      if(seriesByDataSource[datastreamId] == null){
        seriesByDataSource[datastreamId] = {
          'series' : [],
          'min_value' : datastream_min_value,
          'max_value' : datastream_max_value,
          'label' : datastreamId.replace(/\_/g,' ')
        };//new serie
      }
      seriesByDataSource[datastreamId].min_value = Math.min(seriesByDataSource[datastreamId].min_value,datastream_min_value);
      seriesByDataSource[datastreamId].max_value = Math.max(seriesByDataSource[datastreamId].max_value,datastream_max_value);

      seriesByDataSource[datastreamId].series.push({
        name: _deviceInformation[device.id].schoolName,
        data: points,
        color: '#000000'
      });
    }

    _retrievedDevicesCount++;
    if(selectedDevicesCount == _retrievedDevicesCount){
      callback();
    }
    //console.log(device.id + ' : ' + datastreamId);
    //console.log(points);
  };
};

var loadChartTestData = function(callback){
  getDatapointHistory(
      {'Wind_Direction': {'1734847623':true,'1889266748':true}},
      callback);
};


//https://api.xively.com/v2/feeds?user=iostp&tag=L1V3&status=live
var initXivelyData = function(){
  if(_xivelyDataInit){
    return;
  }
  _xivelyDataInit = true;

  var startDevicesTimestamp = Date.now();
  xively.feed.list(
    {
      'user':'iostp',
      'tag' : 'L1V3'
    },
    function(data){
      console.log('Devices collected in: ms ' + (Date.now() - startDevicesTimestamp));
      // console.log(data);

      _schools = [];
      _schoolsByLetter = {};
      _datastreamsBySchool = {};
      _deviceInformation = {};

      var devices = data.results;
      var len = devices.length;

      var startTagsTimestamp = Date.now();
      var devicesByDatastream = {},datastreams=[];
      for(var i=0;i<len;i++){
        var device = devices[i];
        if(device.datastreams == null || device.location == null){
          continue;
        }

        var schoolName = device.location.name;
        var initialLetter = schoolName[0].toUpperCase();
        if(_schoolsBooleanMap[schoolName] == null){
          //List Of Schools
          _schoolsBooleanMap[schoolName] = true;
          _schools.push(schoolName);

          //Initial Letter
          if(_schoolsByLetter[initialLetter] == null){
            _schoolsByLetter[initialLetter] = [];
          }
          _schoolsByLetter[initialLetter].push({'schoolName':schoolName});

          //Preparing for DataStreams
          _datastreamsBySchool[schoolName] = [];
        }

        for(var j=device.datastreams.length - 1;j>=0;j--){
          var datastream = device.datastreams[j].id;

          //datastream = datastream.replace(/\_/g,' ');

          if(isNaN(parseInt(datastream))){
            if(devicesByDatastream[datastream] == null){
              devicesByDatastream[datastream] = [];
              datastreams.push({'id':datastream,'label':datastream});
            }
            _deviceInformation[device.id] = {'schoolName' : schoolName};
            devicesByDatastream[datastream].push(device);
            _datastreamsBySchool[schoolName].push({'label':datastream,'deviceId':device.id,'id':datastream});
          }
        }

        if(_datastreamsBySchool[schoolName].length == 0){
          delete _datastreamsBySchool[schoolName];
          delete _schoolsBooleanMap[schoolName];
          _schools.pop();
          _schoolsByLetter[initialLetter].pop();

          if(_schoolsByLetter[initialLetter].length == 0){
            delete _schoolsByLetter[initialLetter];
          }
        }
      }
      _datastreams = datastreams;
      _devicesByDatastream = devicesByDatastream;
      _schools = _schools.sort();
      for (var k = _callbacks.length - 1; k >= 0; k--) {
        _callbacks[k]();
      }


      //Xively Data ended
      //console.log('Tags collected in: ms ' + (Date.now() - startTagsTimestamp));
      //console.log(_schools)

      var rootScope = angular.element('#ngApp').scope();
      if(rootScope.route != null){
        var currentController = rootScope.route.current.$$route.controller;
        console.log(currentController);
        if(currentController == 'BySchoolsCtrl' || currentController == 'ByDataTypeCtrl'){
          rootScope.route.reload();
        }
      }
    }
  );
};