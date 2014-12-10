'use strict';

/**
 * @ngdoc service
 * @name poitourApp.appConfig
 * @description # Loads configuration and initial data from the server and resolves when available.
 */
angular.module('poitourApp').factory('appConfig', function($http, $q) {
    var deferred = $q.defer();

    var appConfig = function() {
        deferred.promise.then.apply(deferred.promise, arguments);
    };

    angular.extend(appConfig, {
        data: {},
        promise: deferred.promise,
    });

    $http.get('/config').success(function(data) {
        angular.extend(appConfig, data.config);
        delete data.config;
        angular.extend(appConfig.data, data);
        deferred.resolve(appConfig);
    }).catch(deferred.reject);

    return appConfig;
});
