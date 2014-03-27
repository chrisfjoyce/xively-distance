/*jshint sub:true*/
'use strict';

var BySchoolsCtrl = function ($scope,$modal,$location,$route,$rootScope,$anchorScroll,$window) {
  $rootScope.route = $route;

  $scope.totalSchools = _schools.length;
  $scope.schoolsByLetter = _schoolsByLetter;

  $scope.datastreamsBySchool = _datastreamsBySchool;

  $scope.devicesStatusByLocation = _devicesStatusByLocation;

  if (_isBack) {
    _isBack = false;
    $scope.dataStreamsSelected = _dataStreamsSelected;
    $scope.selectedDatastreamsBySchool = _selectedDevicesByDatasource;
    // console.log(_dataStreamsSelected);
    // console.log(_selectedDevicesByDatasource);
  } else {
    $scope.dataStreamsSelected = {};
    $scope.selectedDatastreamsBySchool = {};
  }

  $scope.preModalState = {};

  $scope.totalSchoolsSelected = function(){
    var sum = 0;

    for(var schoolName in $scope.dataStreamsSelected){
      if($scope.dataStreamsSelected[schoolName] > 0){
        sum ++;
      }
    }

    return sum;
  };

  $scope.generateChart = function(){
    $scope.loading = true;
    $scope.loadingMessage = 'Generating charts.';
    var defaultDates = getDefaultDates();

    for(var datastreamLabel in $scope.selectedDatastreamsBySchool){
      $scope.selectedDatastreamsBySchool[datastreamLabel].start_date = defaultDates.startDate.toISOString();
      $scope.selectedDatastreamsBySchool[datastreamLabel].end_date = defaultDates.endDate.toISOString();
    }

    // console.log($scope.selectedDatastreamsBySchool);
    getDatapointHistory(
      $scope.selectedDatastreamsBySchool,
      function(seriesByDatasource){
        $location.path('/charts');
        _backLocation = '/bySchool';

        _seriesByDataSource = seriesByDatasource;
        _selectedDevicesByDatasource=$scope.selectedDatastreamsBySchool;
        _dataStreamsSelected = $scope.dataStreamsSelected;
        $scope.$apply();
      }
    );
  };

  $scope.open = function (school) {
    $scope.dataStreamsSelected = _dataStreamsSelected;
    $scope.selectedDatastreamsBySchool = _selectedDevicesByDatasource;

    $scope.preModalState = {
      dataStreamsSelected         : jQuery.extend(true, {}, $scope.dataStreamsSelected),
      selectedDatastreamsBySchool : jQuery.extend(true, {}, $scope.selectedDatastreamsBySchool)
    };

    for (var i = _datastreamsBySchool[school].length - 1; i >= 0; i--) {
      var datastream = _datastreamsBySchool[school][i];
      if($scope.selectedDatastreamsBySchool[datastream.label] == null){
        $scope.selectedDatastreamsBySchool[datastream.label] = {};
      }
    }

    $scope.ok = function() {
      // console.log('ok');
      $scope.modal.dismiss('ok');
    };
    $scope.cancel = function() {
      // console.log('cancel');

      $scope.modal.dismiss('cancel');

      $scope.dataStreamsSelected         = _dataStreamsSelected         = $scope.preModalState.dataStreamsSelected;
      $scope.selectedDatastreamsBySchool = _selectedDevicesByDatasource = $scope.preModalState.selectedDatastreamsBySchool;
    };

    var modalInstance = $modal.open(
      {
        templateUrl: 'views/byDataStreamPopUp.html',
        scope: $scope,
        controller: 'ByDataStreamPopUpCtrl',
        backdrop: 'static'
      }
    );
    $scope.selectedSchool = school;

    modalInstance.result.then(function (school) {
      $scope.selectedSchool = school;
    }, function (type) {
      // console.log('Modal dismissed at: ' + new Date());
      // console.log('Caused by: ' + type);
    });
    $scope.modal = modalInstance;
  };

  if(_xivelyDataInitComplete) {
    $scope.loading = false;
  } else {
    $scope.loading = true;
    $scope.loadingMessage = 'Loading locations.';
  }

  $scope.selectedLetter = {};
  var first = true;
  for (var letter in _schoolsByLetter) {
    if (first) {
      $scope.selectedLetter[letter] = true;
      first = false;
    } else {
      $scope.selectedLetter[letter] = false;
    }
  }

  $scope.scroll = function(letter) {
    var old = $location.hash();
    $location.hash(letter + '-anchor');
    $anchorScroll();
    $location.hash(old);
    $scope.verifySelectedLetter();
  };

  $scope.verifySelectedLetter = function() {
    for (var letter in _schoolsByLetter) {
      $scope.selectedLetter[letter] = false;
    }
    var minOffset = 999999;
    var minLetter = '';
    for (letter in _schoolsByLetter) {
      var selector = $('#' + letter);
      if (selector == null) {
        return false;
      } else {
        var element = selector.get(0);
        if (element == null) {
          return false;
        } else {
          var offset = element.getBoundingClientRect();
          if (offset.top < minOffset && offset.top >= 130) {
            minOffset = offset.top;
            minLetter = letter;
          }
        }
      }
    }
    if (minLetter != '') {
      $scope.selectedLetter[minLetter] = true;
    }
    return true;
  };

  angular.element($window).bind('scroll', function(e) {
    $scope.verifySelectedLetter();
    $scope.$apply();
  });

  $('body').scrollspy({ target: '#navbar-letters' });

  var verifiedFirst = true;
  var setSelectedLetter = function() {
    verifiedFirst = $scope.verifySelectedLetter();
    if (verifiedFirst) {
      $scope.$apply();
    } else {
      setTimeout(setSelectedLetter, 2000);
    }
  };

  var setSelectedLetterInit = function() {
    if (_xivelyDataInitComplete) {
      setSelectedLetter();
    } else {
      setTimeout(setSelectedLetterInit, 1000);
    }
  };

  setSelectedLetterInit();

};

BySchoolsCtrl.$inject = ['$scope','$modal','$location','$route','$rootScope', '$anchorScroll', '$window'];
var app = angular.module('xivelyIostpApp');
app.controller('BySchoolsCtrl', BySchoolsCtrl);