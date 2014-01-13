'use strict';

var app = angular.module('xivelyIostpApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });

app.controller('AccordionDemoCtrl', function ($scope) {
    $scope.oneAtATime = true;

    $scope.groups = [
      {
        title:   'Dynamic Group Header - 1',
        content: 'Dynamic Group Body - 1'
      },
      {
        title: 'Dynamic Group Header - 2',
        content: 'Dynamic Group Body - 2'
      }
    ];

    $scope.items = ['Item 1', 'Item 2', 'Item 3'];
  });