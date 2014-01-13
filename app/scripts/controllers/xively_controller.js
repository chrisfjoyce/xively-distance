/*jshint sub:true*/
'use strict';

var XivelyCtrl = function ($scope) {
  xively.setKey( 'fk9R1zsvjvb9m4d65JmRl80sahGH13OPAui3T04YA9f7D3Da');
  var feedID = '515995927';
  var datastreamID = 'channel_cuack';

  $scope.currentValue = 'not_loaded';

  xively.datastream.get (feedID, datastreamID, function ( datastream ) {
    $scope.$apply(function () {
      console.log(datastream);
      $scope.currentValue = datastream['current_value'] + datastream['unit']['label'];
    });
  });
};