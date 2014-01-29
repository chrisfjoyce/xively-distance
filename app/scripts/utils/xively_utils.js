/*jshint sub:true*/
'use strict';


var _devicesByDatastream = null;
var _datastreams = null;
var _callbacks = [];
var _retrievedDevicesCount = null;
var _schoolsBooleanMap = {};
var _schools = [];
var _schoolsMap = {};
var _schoolsByLetter = {};
var _datastreamsBySchool = {};
var _deviceInformation = {};
var _xivelyDataInit = false;
var _startDevicesTimestamp=null;
var _datastreamByDeviceIdDatastreamLabel={};
var _seriesByDataSource = null;

var INACTIVE_TIMEOUT_MILLIS = 1000 * 60 * 90;

var registerXivelyGetData = function(fn){
  if(_datastreams != null){
    fn();
  }
  _callbacks.push(fn);
};

var getDatapointHistory = function(selectedDevicesByDatastream,callback,startDateISO,endDateISO){
  var formResponse = [];
  var selectedDevicesCount = 0;
  _retrievedDevicesCount = 0;
  for(var datastreamLabel in selectedDevicesByDatastream){
    var datasourceConf = {
      'datastream_name' : datastreamLabel,
      'devices' : []
    };
    for(var deviceId in selectedDevicesByDatastream[datastreamLabel]){
      if(selectedDevicesByDatastream[datastreamLabel][deviceId] == true){
        var datastreamid = _datastreamByDeviceIdDatastreamLabel[datastreamLabel+deviceId];
        datasourceConf.devices.push({'id':deviceId,'datastreamId':datastreamid});
        selectedDevicesCount++;
      }
    }
    if(datasourceConf.devices.length > 0){
      formResponse.push(datasourceConf);
    }
  }

  var seriesByDataSource = {};

  for(var i = 0; i<formResponse.length;i++){
    var dataStreamGroup = formResponse[i];
    datastreamLabel = dataStreamGroup.datastream_name;

    for(var j=0;j<dataStreamGroup.devices.length;j++){
      var device = dataStreamGroup.devices[j];

      var historyCallback = buildDataCallback(device,datastreamLabel,selectedDevicesCount,seriesByDataSource,callback,startDateISO,endDateISO);

      /*
      xively.datapoint.history(
        device.id,
        device.datastreamId,
        {
          //'duration' : '180days',
          'interval' : 21600,
          'start'    : startDateISO,
          'end'      : endDateISO,
          'interval_type':'discrete'
        },
        historyCallback
      );
      */
      var url = 'http://api.xively.com/v2/feeds/' + device.id + '/datastreams/' + device.datastreamId + '?interval=21600&start=' + startDateISO + '&end=' + endDateISO + '&interval_type=discrete';
      $.get(
        url,
        {'x-apikey': XIVELY_API_KEY},
        historyCallback
      );
    }
  }
};

var buildDataCallback = function(device,datastreamLabel,selectedDevicesCount,seriesByDataSource,callback,startDateISO,endDateISO){
  var filteredDatastreamLabel = datastreamLabel.replace(/ /g,'_');
  return function(resp){
    var data = resp.datapoints;
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
      if(seriesByDataSource[filteredDatastreamLabel] == null){
        seriesByDataSource[filteredDatastreamLabel] = {
          'series' : [],
          'min_value' : datastream_min_value,
          'max_value' : datastream_max_value,
          'label' : datastreamLabel,
          'startDate' : startDateISO,
          'endDate' : endDateISO
        };//new serie
      }
      seriesByDataSource[filteredDatastreamLabel].min_value = Math.min(seriesByDataSource[filteredDatastreamLabel].min_value,datastream_min_value);
      seriesByDataSource[filteredDatastreamLabel].max_value = Math.max(seriesByDataSource[filteredDatastreamLabel].max_value,datastream_max_value);

      seriesByDataSource[filteredDatastreamLabel].series.push({
        name: _deviceInformation[device.id].schoolName,
        deviceId: device.id,
        data: points,
        active: _deviceInformation[device.id].active,
        at: _deviceInformation[device.id].at,
        color: '#000000'
      });
    }

    _retrievedDevicesCount++;
    if(selectedDevicesCount == _retrievedDevicesCount){
      callback(seriesByDataSource);
    }
    //console.log(device.id + ' : ' + datastreamId);
    //console.log(points);
  };
};

// var selectedElementsCounter = function(selectedDevicesByDatasource,callback){
//   var formResponse = [];
//   var selectedDevicesCount = 0;
//   _retrievedDevicesCount = 0;
//   for(var datasource in selectedDevicesByDatasource){
//     var datasourceConf = {
//       'datastream_name' : datasource,
//       'devices' : []
//     };
//     for(var deviceId in selectedDevicesByDatasource[datasource]){
//       if(selectedDevicesByDatasource[datasource][deviceId] == true){
//         datasourceConf.devices.push({'id':deviceId});
//         selectedDevicesCount++;
//       }
//     }
//     if(datasourceConf.devices.length > 0){
//       formResponse.push(datasourceConf);
//     }
//   }
//   console.log(selectedDevicesCount);
// };

var loadChartTestData = function(callback){
  getDatapointHistory(
      {'Wind_Direction': {'1734847623':true,'1889266748':true}},
      callback);
};

var processXivelyFeedData = function(data){
  console.log('Devices collected in: ms ' + (Date.now() - _startDevicesTimestamp));
  // console.log(data);

  _schools = [];
  _schoolsByLetter = {};
  _datastreamsBySchool = {};
  _deviceInformation = {};
  _datastreamByDeviceIdDatastreamLabel={};

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
      _schoolsMap[schoolName]={'datastreams':{}};

      //Initial Letter
      if(_schoolsByLetter[initialLetter] == null){
        _schoolsByLetter[initialLetter] = [];
      }
      _schoolsByLetter[initialLetter].push({'schoolName':schoolName});

      //Preparing for DataStreams
      _datastreamsBySchool[schoolName] = [];
    }

    var nowMillis = Date.now();
    for(var j=device.datastreams.length - 1;j>=0;j--){
      var datastream = device.datastreams[j];
      var datastreamId = datastream.id;

      if(datastream.tags == null || datastream.tags.length == 0){
        continue;
      }

      //datastreamId = datastreamId.replace(/\_/g,' ');
      //Extracting data stream label
      var datastreamLabel = datastreamId;
      var index = 0;
      if(datastream.tags[index] == 'Average'){
        if(datastream.tags.length <= 1){
          index = -1;
        }else{
          index++;
        }
      }
      if(index != -1){
        datastreamLabel = datastream.tags[index];
      }

      var diffMillis = nowMillis - Date.parse(datastream.at);
      var activeDevice = diffMillis <= INACTIVE_TIMEOUT_MILLIS;
      _schoolsMap[schoolName].datastreams[datastreamLabel] = {'at':datastream.at,'active':activeDevice,'elapsedTime':Math.round(diffMillis/(1000 * 60))+' minutes'};

      if(isNaN(parseInt(datastreamId))){
        //console.log(datastreamId + ',' + datastreamLabel + ',' + device.id);
        if(devicesByDatastream[datastreamLabel] == null){
          devicesByDatastream[datastreamLabel] = [];
          datastreams.push(datastreamLabel);
        }

        _deviceInformation[device.id] = {'schoolName' : schoolName,'label':datastreamLabel,'active':activeDevice,'at':datastream.at};
        devicesByDatastream[datastreamLabel].push({'id':device.id,'datastreamId':datastreamId,'active':activeDevice,'at':datastream.at,'location':{'name':device.location.name}});
        _datastreamsBySchool[schoolName].push({'label':datastreamLabel,'deviceId':device.id,'active':activeDevice,'at':datastream.at,'id':datastreamId});
        _datastreamByDeviceIdDatastreamLabel[datastreamLabel+device.id]=datastreamId;
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
  _datastreams = datastreams.sort();
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
};


//https://api.xively.com/v2/feeds?user=iostp&tag=L1V3&status=live
var XIVELY_API_KEY = 'LZ8CcFmj2huPno20yShkEGlm3QQAiuiMYsLQOjHEQpWOSzDs';
var initXivelyData = function(){
  if(_xivelyDataInit){
    return;
  }
  _xivelyDataInit = true;
  _startDevicesTimestamp = Date.now();

  // xively.feed.list(
  //   {
  //     'user':'iostp',
  //     'tag' : 'L1V3'
  //   },
  //   processXivelyFeedData
  // );

  $.get(
    'http://api.xively.com/v2/feeds?user=iostp&tag=L1V3',
    {'x-apikey': XIVELY_API_KEY},
    processXivelyFeedData
  );
};

var getDefaultDates = function() {
  var result = {};
  var currentDate = new Date();
  result.endDate = currentDate;
  result.startDate = new Date(new Date(currentDate).setMonth(currentDate.getMonth() - 1));
  return result;
};
