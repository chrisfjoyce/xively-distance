/*jshint sub:true*/
'use strict';


var XivelyCtrl = function ($scope) {
  xively.setKey( 'fk9R1zsvjvb9m4d65JmRl80sahGH13OPAui3T04YA9f7D3Da');
  var feedID        = 61916;          // Feed ID
  var datastreamID  = 'sine60';       // Datastream ID

  feedID = '515995927';
  datastreamID = 'channel_cuack';

  $scope.currentValue = 'not_loaded';
  console.log($scope);

  xively.datastream.get (feedID, datastreamID, function ( datastream ) {
    // WARNING: This code is only executed when we get a response back from Xively,
    // it will likely execute after the rest your script
    //
    // NOTE: The variable 'datastream' will contain all the Datastream information
    // as an object. The structure of Datastream objects can be found at:
    // https://xively.com/dev/docs/api/quick_reference/api_resource_attributes/#datastream

    // Display the current value from the datastream
    //$(selector).html( datastream['current_value'] );
    $scope.$apply(function () {
      $scope.currentValue = datastream['current_value'];
    });

    // Getting realtime!
    // The function associated with the subscribe method will be executed
    // every time there is an update to the datastream
    xively.datastream.subscribe( feedID, datastreamID, function ( event , datastreamUpdated ) {
      // Display the current value from the updated datastream
      //$(selector).html( datastream_updated['current_value'] );
      $scope.$apply(function () {
        $scope.currentValue = datastreamUpdated['current_value'];
      });
    });
  });
};