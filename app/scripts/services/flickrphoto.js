'use strict';

/**
 * @ngdoc service
 * @name poitourApp.FlickrPhoto
 * @description # FlickrPhoto Factory in the poitourApp.
 */
angular.module('poitourApp').factory('FlickrPhoto', function($q, $http, $resource, appConfig) {
    // doc: https://www.flickr.com/services/api/flickr.photos.search.html

    var FlickrPhoto = $resource('https://api.flickr.com/services/rest/', {
        jsoncallback: 'JSON_CALLBACK',
        api_key: 'set in config.ini',
        format: 'json'
    }, {
        _getByLocation: {
            method: 'JSONP',
            isArray: true,
            // cache: true,
            params: {
                method: 'flickr.photos.search',
                extras: 'geo,url_m,owner_name',
                content_type: 1, // photos only
                radius: 0.02, // 20m
                radius_units: 'km',
            // experiments
            // sort: 'interestingness-desc'
            // sort: 'relevance'
            },
            transformResponse: $http.defaults.transformResponse.concat(function(data) {
                return data.photos.photo;
            })
        }
    });

    FlickrPhoto.getByLocation = function(lon, lat, params) {
        params = params || {};
        angular.extend(params, { api_key: appConfig.FLICKR_API_KEY });
        params.lon = lon;
        params.lat = lat;

        return FlickrPhoto._getByLocation(params).$promise;
    };

    return FlickrPhoto;
});
