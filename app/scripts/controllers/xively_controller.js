/*jshint sub:true*/
'use strict';

var defaultKey    = '', // Unique master Xively API key to be used as a default
  defaultFeeds  = [], // Comma separated array of Xively Feed ID numbers
  applicationName = '', // Replaces Xively logo in the header
  dataDuration  = '', // Default duration of data to be displayed // ref: https://xively.com/dev/docs/api/data/read/historical_data/
  dataInterval  = 0, // Default interval for data to be displayed (in seconds)
  dataColor   = '000000', // CSS HEX value of color to represent data (omit leading #)
  hideForm    = 0; // To hide input form use value of 1, otherwise set to 0

// Parse Xively ISO Date Format to Date Object
Date.prototype.parseISO = function(iso){
  var stamp= Date.parse(iso);
  if(!stamp) throw iso +' Unknown date format';
  return new Date(stamp);
}


var XivelyCtrl = function ($scope) {
  xively.setKey( 'fk9R1zsvjvb9m4d65JmRl80sahGH13OPAui3T04YA9f7D3Da');
  $scope.devices = null;
  $scope.deviceTags = null;

  $scope.devicesCollapsed = true;
  $scope.dataSourcesCollapsed = false;

  $scope.urls = [];

  $scope.datastreams = [];

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


  $scope.testFeeds = function(feedId) {
    updateFeeds(feedId, 'Wind_Speed', '6hours', 30);
  }

  $scope.setFeeds = function(feeds) {
    feeds.forEach(function(id) {

      var thisFeedId, thisFeedDatastreams;
      if(id.indexOf('!') > 0) {
        thisFeedId = id.substring(0, id.indexOf('!'));
        thisFeedDatastreams = id.substring(id.indexOf('!')+1).split('!');
      } else {
        thisFeedId = id;
      }
      id = thisFeedId;

      xively.feed.history(id, {  duration: "6hours", interval: 30 }, function (data) {
        //TODO this must send the duration
        // updateFeeds(data.id, thisFeedDatastreams, '6hours', 30);
        // updateFeeds(data.id, thisFeedDatastreams, '1day', 60);
        // updateFeeds(data.id, thisFeedDatastreams, '1week', 900);
        // updateFeeds(data.id, thisFeedDatastreams, '1month', 1800);
        // updateFeeds(data.id, thisFeedDatastreams, '90days', 10800);
        // Handle Datastreams
        if(dataDuration != '' && dataInterval != 0) {
          updateFeeds(data.id, thisFeedDatastreams, dataDuration, dataInterval);
        } else {
          updateFeeds(data.id, thisFeedDatastreams, '6hours', 30);
        }
      });
    });
  };

var updateFeeds = function(feedId, datastreamIds, duration, interval) {
  xively.feed.get(feedId, function(feedData) {
    if(feedData.datastreams) {
      if(datastreamIds == '' || !datastreamIds) {
        feedData.datastreams.forEach(function(datastream) {
          datastreamIds += datastream.id + " ";
        });
      }
      feedData.datastreams.forEach(function(datastream) {
        var now = new Date();
        var then = new Date();
        var updated = new Date;
        updated = updated.parseISO(datastream.at);
        var diff = null;
        if(duration == '6hours') diff = 21600000;
        if(duration == '1day') diff = 86400000;
        if(duration == '1week') diff = 604800000;
        if(duration == '1month') diff = 2628000000;
        if(duration == '90days') diff = 7884000000;
        then.setTime(now.getTime() - diff);
        if(updated.getTime() > then.getTime()) {
          if(datastreamIds && datastreamIds != '' && datastreamIds.indexOf(datastream.id) >= 0) {
            xively.datastream.history(feedId, datastream.id, {duration: duration, interval: interval, limit: 1000}, function(datastreamData) {

              var series = [];
              var points = [];

              // Historical Datapoints
              if(datastreamData.datapoints) {

                // Add Each Datapoint to Array
                datastreamData.datapoints.forEach(function(datapoint) {
                  points.push({x: new Date(datapoint.at).getTime()/1000.0, y: parseFloat(datapoint.value)});
                });

                // Add Datapoints Array to Graph Series Array
                series.push({
                  name: datastream.id,
                  data: points,
                  color: '#' + dataColor
                });

                $scope.$apply(function () {
                  $scope.datastreams[$scope.datastreams.length] = feedId + '-' + datastream.id;
                });

                // Build Graph
                var graph = new Rickshaw.Graph( {
                  element: document.querySelector('#graph-' + feedId + '-' + datastream.id),
                  width: 600,
                  height: 200,
                  renderer: 'line',
                  min: parseFloat(datastream.min_value) - .25*(parseFloat(datastream.max_value) - parseFloat(datastream.min_value)),
                  max: parseFloat(datastream.max_value) + .25*(parseFloat(datastream.max_value) - parseFloat(datastream.min_value)),
                  padding: {
                    top: 0.02,
                    right: 0.02,
                    bottom: 0.02,
                    left: 0.02
                  },
                  series: series
                });

                graph.render();

                var ticksTreatment = 'glow';

                // Define and Render X Axis (Time Values)
                var xAxis = new Rickshaw.Graph.Axis.Time( {
                  graph: graph,
                  ticksTreatment: ticksTreatment
                });
                xAxis.render();

                // Define and Render Y Axis (Datastream Values)
                var yAxis = new Rickshaw.Graph.Axis.Y( {
                  graph: graph,
                  tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
                  ticksTreatment: ticksTreatment
                });
                yAxis.render();

                // Enable Datapoint Hover Values
                var hoverDetail = new Rickshaw.Graph.HoverDetail({
                  graph: graph,
                  formatter: function(series, x, y) {
                    var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + ' padding: 4px;"></span>';
                    var content = swatch + "&nbsp;&nbsp;" + parseFloat(y) + '&nbsp;&nbsp;<br>';
                    return content;
                  }
                });

                var slider = new Rickshaw.Graph.RangeSlider({
                  graph: graph,
                  element: document.querySelector('#slider-' + feedId + '-' + datastream.id)
                });
                document.querySelector('#slider-' + feedId + '-' + datastream.id).style
              }
            });
          } else {
            console.log('Datastream not requested! (' + datastream.id + ')');
          }
        }
      });
    }
  });
};

};

XivelyCtrl.$inject = ['$scope'];
var app = angular.module('xivelyIostpApp');
app.controller('XivelyCtrl', XivelyCtrl);
