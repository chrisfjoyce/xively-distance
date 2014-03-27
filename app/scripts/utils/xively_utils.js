/*jshint sub:true*/
'use strict';

var _devicesByDatastream = null;
var _datastreams = null;
var _datastreamsGroups = null;
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
var _xivelyDataInitComplete = false;
var _datapointErrors = [];
var _devicesStatusByDatastream = null;
var _devicesStatusByLocation = null;

var _iterationsTotal = null;
var _iterationsFinished = null;

var INACTIVE_TIMEOUT_MILLIS = 1000 * 60 * 90;

var INTERVAL_VALUES = [
  {
    'index': 0,
    'interval': 0,
    'maximum': 6
  },
  {
    'index': 1,
    'interval': 30,
    'maximum': 12
  },
  {
    'index': 2,
    'interval': 60,
    'maximum': 24
  },
  {
    'index': 3,
    'interval': 300,
    'maximum': 120
  },
  {
    'index': 4,
    'interval': 900,
    'maximum': 336
  },
  {
    'index': 5,
    'interval': 1800,
    'maximum': 744
  },
  {
    'index': 6,
    'interval': 3600,
    'maximum': 744
  },
  {
    'index': 7,
    'interval': 10800,
    'maximum': 2160
  },
  {
    'index': 8,
    'interval': 21600,
    'maximum': 4320
  },
  {
    'index': 9,
    'interval': 43200,
    'maximum': 8640
  },
  {
    'index': 10,
    'interval': 86400,
    'maximum': 8640
  }
];
var INTERVAL_CURRENT_INDEX = 0;

var registerXivelyGetData = function(fn){
  if(_datastreams != null){
    fn();
  }
  _callbacks.push(fn);
};

var _toEuroFormat = function(isoStringDate){
  var lastReported = new Date(Date.parse(isoStringDate));
  var now = new Date();
  var lrDate = lastReported.getDate();
  if (lrDate < 10) {
    lrDate = '0' + lrDate;
  }
  var lrMonth = lastReported.getMonth() + 1;
  if (lrMonth < 10) {
    lrMonth = '0' + lrMonth;
  }
  var lrYear = lastReported.getFullYear();
  var lrHour = lastReported.getHours();
  if (lrHour < 10) {
    lrHour = '0' + lrHour;
  }
  var lrMinutes = lastReported.getMinutes();
  if (lrMinutes < 10) {
    lrMinutes = '0' + lrMinutes;
  }
  var lrSeconds = lastReported.getSeconds();
  if (lrSeconds < 10) {
    lrSeconds = '0' + lrSeconds;
  }
  return lrDate + '.' + lrMonth + '.' + lrYear + ' ' + lrHour + ':' + lrMinutes + ':' + lrSeconds;
};

var getDatapointHistory = function(selectedDevicesByDatastream,callback){
  var formResponse = [];
  var selectedDevicesCount = 0;
  _retrievedDevicesCount = 0;
  _iterationsTotal = 0;
  _iterationsFinished = 0;

  for(var datastreamLabel in selectedDevicesByDatastream){
    var datasourceConf = {
      'datastream_name' : datastreamLabel,
      'start_date': selectedDevicesByDatastream[datastreamLabel].start_date,
      'end_date'  : selectedDevicesByDatastream[datastreamLabel].end_date,
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
  _datapointErrors = [];

  for(var i = 0; i<formResponse.length;i++){
    var dataStreamGroup = formResponse[i];
    datastreamLabel = dataStreamGroup.datastream_name;

    var startDateISO = dataStreamGroup.start_date;
    var endDateISO   = dataStreamGroup.end_date;

    for(var j=0;j<dataStreamGroup.devices.length;j++){
      var device = dataStreamGroup.devices[j];

      var startDateNotISO = new Date(startDateISO);
      var endDateNotISO = new Date(endDateISO);
      var millisecondsDifference = Math.abs(startDateNotISO.getTime() - endDateNotISO.getTime());
      _iterationsTotal += Math.ceil(millisecondsDifference / ((1000 * 3600 * INTERVAL_VALUES[INTERVAL_CURRENT_INDEX].maximum)));
      var timeToAdd = (1000 * 3600 * INTERVAL_VALUES[INTERVAL_CURRENT_INDEX].maximum);
      var newEndDate = new Date(startDateNotISO);
      newEndDate.setTime(newEndDate.getTime() + timeToAdd);
      for (var newStartDate = startDateNotISO; newStartDate < endDateNotISO;) {
        var newStartDateISO = newStartDate.toISOString();
        var newEndDateISO = newEndDate.toISOString();
        var historyCallback = buildDataCallback(device,datastreamLabel,selectedDevicesCount,seriesByDataSource,callback,newStartDateISO,newEndDateISO, startDateISO, endDateISO);

        var url = 'http://api.xively.com/v2/feeds/' + device.id + '/datastreams/' + device.datastreamId + '?interval=' + INTERVAL_VALUES[INTERVAL_CURRENT_INDEX].interval + '&start=' + newStartDateISO + '&end=' + newEndDateISO + '&limit=1000&find_previous=';
        $.get(
          url,
          {'x-apikey': XIVELY_API_KEY},
          historyCallback
        ).fail(function( data ) {
          _datapointErrors.push(_deviceInformation[device.id].schoolName + ' - ' + datastreamLabel + 'does not exists anymore.');
        });

        //Generate the new interval of dates
        newEndDate.setTime(newEndDate.getTime() + timeToAdd);
        newStartDate.setTime(newStartDate.getTime() + timeToAdd);
        if (newEndDate > endDateNotISO) {
          newEndDate = new Date(endDateNotISO);
        }
      }
    }
  }
};

var buildDataCallback = function(device,datastreamLabel,selectedDevicesCount,seriesByDataSource,callback,startDateISO,endDateISO, globalStartDateISO, globalEndDateISO){
  var filteredDatastreamLabel = datastreamLabel.replace(/ /g,'_');
  return function(resp){
    var data = resp.datapoints;
    var points = [];
    var datastream_min_value=0,datastream_max_value=0;
    var unit = resp.unit.symbol;
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

    if(seriesByDataSource[filteredDatastreamLabel] == null){
      seriesByDataSource[filteredDatastreamLabel] = {
        'series' : [],
        'min_value' : datastream_min_value,
        'max_value' : datastream_max_value,
        'label' : datastreamLabel,
        'startDate' : globalStartDateISO,
        'endDate' : globalEndDateISO,
        'unit' : unit,
      };//new serie
    }
    seriesByDataSource[filteredDatastreamLabel].min_value = Math.min(seriesByDataSource[filteredDatastreamLabel].min_value,datastream_min_value);
    seriesByDataSource[filteredDatastreamLabel].max_value = Math.max(seriesByDataSource[filteredDatastreamLabel].max_value,datastream_max_value);

    var serieIndex = -1;
    for (var ii = 0; ii < seriesByDataSource[filteredDatastreamLabel].series.length; ii++) {
      if (seriesByDataSource[filteredDatastreamLabel].series[ii].name == _deviceInformation[device.id].schoolName) {
        serieIndex = ii;
      }
    }
    if (serieIndex == -1) {
      seriesByDataSource[filteredDatastreamLabel].series.push({
        name: _deviceInformation[device.id].schoolName,
        deviceId: device.id,
        datastreamId:device.datastreamId,
        data: points,
        active: _deviceInformation[device.id].active,
        at: _deviceInformation[device.id].at,
        color: '#000000'
      });
    } else {
      for (var jj = 0; jj < points.length; jj++) {
        seriesByDataSource[filteredDatastreamLabel].series[serieIndex].data.push(points[jj]);
      }
      seriesByDataSource[filteredDatastreamLabel].min_value = Math.min(seriesByDataSource[filteredDatastreamLabel].min_value, datastream_min_value);
      seriesByDataSource[filteredDatastreamLabel].max_value = Math.max(seriesByDataSource[filteredDatastreamLabel].max_value, datastream_max_value);
    }

    _retrievedDevicesCount++;
    _iterationsFinished++;
    if(_iterationsTotal == _iterationsFinished){
      callback(seriesByDataSource);
    }
  };
};

var loadChartTestData = function(callback){
  getDatapointHistory(
      {'Wind_Direction': {'1734847623':true,'1889266748':true}},
      callback);
};

var processXivelyFeedData = function(data){
  // console.log('Devices collected in: ms ' + (Date.now() - _startDevicesTimestamp));
  _xivelyDataInitComplete = true;

  _schools = [];
  _schoolsByLetter = {};
  _datastreamsBySchool = {};
  _deviceInformation = {};
  _datastreamByDeviceIdDatastreamLabel={};
  _devicesStatusByDatastream = {};
  _devicesStatusByLocation = {};

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
      //List Of Locations
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

      //Prepare Device Status
      _devicesStatusByLocation[schoolName] = {active: 0, inactive: 0};

    }

    var nowMillis = Date.now();
    for(var j=device.datastreams.length - 1;j>=0;j--){
      var datastream = device.datastreams[j];
      var datastreamId = datastream.id;

      if(datastream.tags == null || datastream.tags.length == 0){
        continue;
      }

      //Extracting data stream label
      var datastreamLabel = datastreamId;
      var newDatastreamLabel = '';
      var firstTag = '';
      var secondTag = '';
      for (var index = 0; index < datastream.tags.length; index++) {
        if(datastream.tags[index] == 'Minimum' || datastream.tags[index] == 'Maximum' || datastream.tags[index] == 'Average' || datastream.tags[index].indexOf('lbv') == 0 || datastream.tags[index].indexOf('skv') == 0 || datastream.tags[index] == '') {
          secondTag = secondTag + '-' + datastream.tags[index];
        } else {
          if (firstTag == '') {
            firstTag = datastream.tags[index];
          } else {
            firstTag = datastream.tags[index] + ' ' + firstTag;
          }
          newDatastreamLabel = datastream.tags[index] + ' ' + newDatastreamLabel;
          while (newDatastreamLabel.lastIndexOf(' ') == newDatastreamLabel.length - 1) {
            newDatastreamLabel = newDatastreamLabel.substring(0, newDatastreamLabel.length - 1);
          }
        }
      }
      if (newDatastreamLabel != '') {
        while (newDatastreamLabel.lastIndexOf(' ') == newDatastreamLabel.length - 1) {
          newDatastreamLabel = newDatastreamLabel.substring(0, newDatastreamLabel.length - 1);
        }
        datastreamLabel = newDatastreamLabel;
      }
      if (secondTag.indexOf('-') != secondTag.lastIndexOf('-')) {
        continue;
      }
      if (secondTag != '') {
        datastreamLabel = datastreamLabel + secondTag;
        secondTag = ' ' + secondTag.replace('-', '(') + ')';
      }

      var diffMillis = nowMillis - Date.parse(datastream.at);
      var activeDevice = diffMillis <= INACTIVE_TIMEOUT_MILLIS;
      _schoolsMap[schoolName].datastreams[datastreamLabel] = {'at':datastream.at,'active':activeDevice,'elapsedTime':Math.round(diffMillis/(1000 * 60))+' minutes'};

      if(devicesByDatastream[datastreamLabel] == null){
        devicesByDatastream[datastreamLabel] = [];
        datastreams.push(datastreamLabel);
      }
      if (_devicesStatusByDatastream[firstTag] == null) {
        _devicesStatusByDatastream[firstTag] = {active: 0, inactive: 0};
      }

      var secondTagAbbreviation = secondTag;
      secondTagAbbreviation = secondTagAbbreviation.replace('Average', 'Avg');
      secondTagAbbreviation = secondTagAbbreviation.replace('Maximum', 'Max');
      secondTagAbbreviation = secondTagAbbreviation.replace('Minimum', 'Min');

      _deviceInformation[device.id] = {'schoolName' : schoolName,'label':datastreamLabel,'active':activeDevice,'at':datastream.at};
      devicesByDatastream[datastreamLabel].push({'id':device.id,'datastreamId':datastreamId,'active':activeDevice,'at':datastream.at,'datastreamLabel':datastreamLabel,'location':{'name':device.location.name + secondTagAbbreviation}});
      _datastreamsBySchool[schoolName].push({'label':datastreamLabel,'deviceId':device.id,'active':activeDevice,'at':datastream.at,'id':datastreamId});
      _datastreamByDeviceIdDatastreamLabel[datastreamLabel+device.id]=datastreamId;
      if(activeDevice) {
        _devicesStatusByDatastream[firstTag].active++;
        _devicesStatusByLocation[schoolName].active++;
      } else {
        _devicesStatusByDatastream[firstTag].inactive++;
        _devicesStatusByLocation[schoolName].inactive++;
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

  _datastreamsGroups = {};
  for (var ii = 0; ii < datastreams.length; ii++) {
    var arrDatastream = datastreams[ii].split('-');
    if (arrDatastream.length > 0) {
      if (_datastreamsGroups[arrDatastream[0]] == null) {
        _datastreamsGroups[arrDatastream[0]] = {
          label: arrDatastream[0],
          datastreams: []
        };
      }
      _datastreamsGroups[arrDatastream[0]].datastreams.push(datastreams[ii]);
    }
  }
  // console.log(_datastreamsGroups);

  for (var k = _callbacks.length - 1; k >= 0; k--) {
    _callbacks[k]();
  }

  var rootScope = angular.element('#ngApp').scope();
  if(rootScope != null && rootScope.route != null){
    var currentController = rootScope.route.current.$$route.controller;
    // console.log(currentController);
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

  $.get(
    'http://api.xively.com/v2/feeds?user=iostp&tag=L1V3',
    {'x-apikey': XIVELY_API_KEY},
    processXivelyFeedData
  ).fail(function(data) {
    // console.log('fail');
    // console.log(JSON.stringify(data));
  });
};

var getDefaultDates = function() {
  var result = {};
  var currentDate = new Date();
  result.endDate = currentDate;
  result.startDate = new Date(new Date(currentDate).setDate(currentDate.getDate() - 7));
  return result;
};
