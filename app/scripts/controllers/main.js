'use strict';

/**
 * @ngdoc function
 * @name poitourApp.controller:MainCtrl
 * @description # Init. work for the application. Exposes appLoader service.
 */
angular.module('poitourApp').controller('MainCtrl', function($state, appLoader) {
    var self = this;
    
    self._init = function() {
        self._initScope();
    };
    
    self._initScope = function() {
        self.appLoader = appLoader;
    };

    self._init();
});
