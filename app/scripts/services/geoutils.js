'use strict';

/**
 * @ngdoc service
 * @name poitourApp.geoUtils
 * @description # Misc. geo. utils
 */
angular.module('poitourApp').factory('geoUtils', function(appConfig) {

    return {
        /**
         * Takes a leaflet latLng pair and formats it as string
         */
        formatLatLng: function(coord, precision) {
            precision = precision || appConfig.LATLNG_DECIMAL_PRECISION;
            return coord.lat.toFixed(precision) + ',' + coord.lng.toFixed(precision);
        },
        
        // http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
        distance: function(lon1, lat1, lon2, lat2) {
            var R = 6371; // Radius of the earth in km
            var dLat = this.deg2rad(lat2 - lat1); // deg2rad below
            var dLon = this.deg2rad(lon2 - lon1);
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c; // Distance in km
            return d;
        },

        deg2rad: function(deg) {
            return deg * (Math.PI / 180);
        }
        
    };
});
