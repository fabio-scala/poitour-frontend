'use strict';

/**
 * @ngdoc service
 * @name poitourApp.appLoader
 * @description # Handles blocking/unblocking of the page. Works like a semaphore and unblocks if counter is zero (nothing pending).
 */
angular.module('poitourApp').factory('appLoader', function() {

    return {
        pending : 0,
        isLoaded: false,

        acquire: function() {
            this.pending++;
            this.isLoaded = this.pending <= 0;
        },

        release: function() {
            this.pending--;
            this.isLoaded = this.pending <= 0;
        },
    };
});
