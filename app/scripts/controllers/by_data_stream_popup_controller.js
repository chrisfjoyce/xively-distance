/*jshint sub:true*/
'use strict';

var ByDataStreamPopUpCtrl = function ($scope) {
  $scope.dataStreams=_datastreamsBySchool[$scope.selectedSchool];
};

ByDataStreamPopUpCtrl.$inject = ['$scope'];
var app = angular.module('xivelyIostpApp');
app.controller('ByDataStreamPopUpCtrl', ByDataStreamPopUpCtrl);