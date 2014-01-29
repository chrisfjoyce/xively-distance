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
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/bySchool', {
        templateUrl: 'views/bySchools.html',
        controller: 'BySchoolsCtrl'
      })
      .when('/byDataType', {
        templateUrl: 'views/byDataType.html',
        controller: 'ByDataTypeCtrl'
      })
      .when('/charts', {
        templateUrl: 'views/charts.html',
        controller: 'ChartsCtrl'
      })
      .when('/permalink/:code/', {
        templateUrl: 'views/charts.html',
        controller: 'PermalinkCtrl'
      })
      .otherwise({
        redirectTo: '/byDataType'
      });
  });
