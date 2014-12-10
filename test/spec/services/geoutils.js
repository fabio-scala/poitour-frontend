'use strict';

describe('Service: geoUtils', function() {

    // load the service's module
    beforeEach(module('poitourApp'));

    // instantiate service
    var geoUtils, appConfig;
    beforeEach(inject(function(_geoUtils_, _appConfig_) {
        geoUtils = _geoUtils_;
        appConfig = _appConfig_;
    }));

    it('to distance() calculate the distance between twoe lat,lon pairs', function() {
        // from my place (Uetlibergstrasse 109) to the train station (Zürich Binz)
        var distance = geoUtils.distance(47.3611224,8.5174539,47.362632,8.518424);
        expect(distance).toBeCloseTo(0.2, 2);
    });
    
    it('deg2rad() to convert degrees to radians', function() {
        expect(geoUtils.deg2rad(10)).toBeCloseTo(0.1745, 3);
    });
    
    it('formatLatLng() to format coordinates as string with appConfig precision', function() {
        appConfig.LATLNG_DECIMAL_PRECISION = 3;
        expect(geoUtils.formatLatLng({lat: 12.345678, lng: 98.76543})).toBe('12.346,98.765');
    });
    
    it('formatLatLng() to format coordinates as string with custom precision', function() {
        expect(geoUtils.formatLatLng({lat: 12.345678, lng: 98.76543}, 1)).toBe('12.3,98.8');
    });

});
