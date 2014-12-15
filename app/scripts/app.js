'use strict';

/**
 * @ngdoc overview
 * @name poitourApp
 * @description Main / Application setup
 */
angular.module('poitourApp', [
    'ngAnimate',
    //'ngCookies',
    //'ngRoute',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap',
    'ui.select',
    'ui.utils',
    'ui.router',
    'leaflet-directive',
    'ngToast',
    'angular-carousel'
]).config(function($tooltipProvider, $stateProvider, $urlRouterProvider, ngToastProvider) {
    
    // bug: https://github.com/angular-ui/bootstrap/issues/2828
    $tooltipProvider.options({
        animation: false
    });
    
    // Toast config
    ngToastProvider.configure({
        horizontalPosition: 'center',
    });

    // helper for debugging with services in console
    window.svc = function(service) {
        return angular.element(document.body).injector().get(service);
    };

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('main', {
            url: '/',
        })
        .state('main.tour', {
            url: 'tour?start&end&{hours:int}&{minutes:int}&categories&{stay-time:int}&weights&photos',
        })
        .state('main.about', {
            url: 'about',
            onEnter: function($modal, $state) {
                $modal.open({
                    templateUrl: 'views/about.html',
                    backdropClass: 'modal',
                    size: 'lg',
                }).result.finally(function () {
                    $state.go('main');
                });
            }
        });
});