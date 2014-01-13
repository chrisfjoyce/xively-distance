/*jshint sub:true*/
'use strict';

var XivelyCtrl = function ($scope) {
  xively.setKey( 'fk9R1zsvjvb9m4d65JmRl80sahGH13OPAui3T04YA9f7D3Da');
  $scope.devices = null;
  $scope.devicesCollapsed = true;
/*
  var feedID = '515995927';
  var datastreamID = 'channel_cuack';

  $scope.currentValue = 'not_loaded';
  xively.datastream.get (feedID, datastreamID, function ( datastream ) {
    $scope.$apply(function () {
      console.log(datastream);
      $scope.currentValue = datastream['current_value'] + datastream['unit']['label'];
    });
  });
*/

  //https://api.xively.com/v2/feeds?user=iostp&tag=L1V3&status=live
  xively.feed.list(
    {
      'user':'iostp',
      'tag' : 'L1V3'
    },
    function(data){
      console.log(data);
      $scope.$apply(function(){
        $scope.devices = data.results;
      });
    }
  );
};