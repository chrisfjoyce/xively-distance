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
        controller: 'XivelyCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
