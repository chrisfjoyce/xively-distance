/*jshint sub:true*/
'use strict';

var XivelyCtrl = function ($scope) {
  xively.setKey( 'fk9R1zsvjvb9m4d65JmRl80sahGH13OPAui3T04YA9f7D3Da');
  $scope.devices = null;
  $scope.deviceTags = null;

  $scope.devicesCollapsed = true;
  $scope.dataSourcesCollapsed = false;

  //https://api.xively.com/v2/feeds?user=iostp&tag=L1V3&status=live
  var startDevicesTimestamp = Date.now();
  xively.feed.list(
    {
      'user':'iostp',
      'tag' : 'L1V3'
    },
    function(data){
      console.log('Devices collected in: ms ' + (Date.now() - startDevicesTimestamp));
      console.log(data);

      $scope.$apply(function(){
        var devices = data.results;
        $scope.devices = devices;
        var len = devices.length;

        var startTagsTimestamp = Date.now();
        var deviceTagsSet = {},deviceTags=[];
        for(var i=0;i<len;i++){
          var device = devices[i];
          if(device.datastreams == null){
            continue;
          }
          for(var j=device.datastreams.length - 1;j>=0;j--){
            var datastream = device.datastreams[j].id;

            datastream = datastream.replace(/\_/g,' ');

            if(isNaN(parseInt(datastream))){
              if(deviceTagsSet[datastream] == null){
                deviceTagsSet[datastream] = [];
                deviceTags.push(datastream);
              }
              deviceTagsSet[datastream].push(device);
            }
          }
        }
        console.log('Tags collected in: ms ' + (Date.now() - startTagsTimestamp));

        $scope.deviceTags = deviceTags;
      });
    }
  );
};