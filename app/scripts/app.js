'use strict';

angular.module('xivelyIostpApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap'
])
  .config(function ($routeProvider) {
    $routeProvider
      // .when('/', {
      //   templateUrl: 'views/main.html',
      //   controller: 'MainCtrl'
      // })
      .when('/bySchool', {
        templateUrl: 'views/bySchool.html',
        controller: 'BySchoolCtrl'
      })
      .when('/byDataType', {
        templateUrl: 'views/byDataType.html',
        controller: 'ByDataTypeCtrl'
      })
      .when('/charts', {
        templateUrl: 'views/charts.html',
        controller: 'ChartsCtrl'
      })
      .otherwise({
        redirectTo: '/byDataType'
      });
  });
