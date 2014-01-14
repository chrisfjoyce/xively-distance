/*jshint sub:true*/
'use strict';

var XivelyCtrl = function ($scope) {
  xively.setKey( 'fk9R1zsvjvb9m4d65JmRl80sahGH13OPAui3T04YA9f7D3Da');
  $scope.devices = null;
  $scope.deviceTags = null;

  $scope.devicesCollapsed = true;
  $scope.dataSourcesCollapsed = false;

  $scope.urls = [];

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
  $scope.open = function() {
    var formResponse = [
        {
          'datastream_name'  : 'Wind_Speed',
          'datastream_label' : 'Wind Speed',
          'devices' : [{'id':1889266748},{'id':2047541477}]
        },
        {

          'datastream_name'  : 'Wind_Direction',
          'datastream_label' : 'Wind Direction',
          'devices' : [{'id':2047541477},{'id':434722442}]
        }
      ];
    for (var i = 0; i < formResponse.length; i++) {
      for (var j = 0; j < formResponse[i].devices.length; j++) {
        $scope.urls[$scope.urls.length] = 'https://api.xively.com/v2/feeds/' + formResponse[i].devices[j].id + '/datastreams/' + formResponse[i].datastream_name + '.png?t=' + formResponse[i].datastream_label + '&b=true';
      }
    }
    console.log($scope.urls);
  };
};