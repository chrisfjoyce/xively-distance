/*jshint sub:true*/
'use strict';

xively.setKey('LZ8CcFmj2huPno20yShkEGlm3QQAiuiMYsLQOjHEQpWOSzDs');
var _devicesByDatastream = null;
var _datastreams = null;
var _callbacks = [];

var registerXivelyGetData = function(fn){
  console.log(fn);
  _callbacks.push(fn);
};

//https://api.xively.com/v2/feeds?user=iostp&tag=L1V3&status=live
var initXivelyData = function(){
  var startDevicesTimestamp = Date.now();
  xively.feed.list(
    {
      'user':'iostp',
      'tag' : 'L1V3'
    },
    function(data){
      console.log('Devices collected in: ms ' + (Date.now() - startDevicesTimestamp));
      console.log(data);

      var devices = data.results;
      var len = devices.length;

      var startTagsTimestamp = Date.now();
      var devicesByDatastream = {},datastreams=[];
      for(var i=0;i<len;i++){
        var device = devices[i];
        if(device.datastreams == null){
          continue;
        }
        for(var j=device.datastreams.length - 1;j>=0;j--){
          var datastream = device.datastreams[j].id;

          //datastream = datastream.replace(/\_/g,' ');

          if(isNaN(parseInt(datastream))){
            if(devicesByDatastream[datastream] == null){
              devicesByDatastream[datastream] = [];
              datastreams.push(datastream);
            }
            devicesByDatastream[datastream].push(device);
          }
        }
      }
      _datastreams = datastreams;
      _devicesByDatastream = devicesByDatastream;

      for (var k = _callbacks.length - 1; k >= 0; k--) {
        _callbacks[k]();
      };

      //console.log('Tags collected in: ms ' + (Date.now() - startTagsTimestamp));
    }
  );
};