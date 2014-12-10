'use strict';

/**
 * @ngdoc service
 * @name poitourApp.nominatim
 * @description # Nominatim lookup service
 */
angular.module('poitourApp').factory('nominatim', function($http, $q, $interpolate, appConfig) {

    return {
        search: function(query) {
            var deferred = $q.defer();
            appConfig(function() {
                var url = $interpolate(appConfig.NOMINATIM_URL)({query: encodeURIComponent(query)});
                $http.get(url).success(function (data) {
                   deferred.resolve(data); 
                });
            });
            return deferred.promise;
        }
    };
});
