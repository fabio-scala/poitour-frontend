'use strict';

describe('Service: FlickrPhoto', function() { 
    
    // load the service's module
    beforeEach(module('poitourApp'));
    
    // Mock appCnfig
    beforeEach(module(function($provide) {
        $provide.factory('appConfig', function() {
            return {};
        });
    }));
    
    // instantiate service
    var $httpBackend, FlickrPhoto;
    beforeEach(inject(function(_$httpBackend_, _FlickrPhoto_) {
        $httpBackend = _$httpBackend_;
        FlickrPhoto = _FlickrPhoto_;
    }));

    var expectRequest = function(expectUrl) {
        $httpBackend.expectJSONP(new RegExp('https://api.flickr.com' + expectUrl)).respond({
            photos: {
                photo: [{
                    foo: 'bar'
                }, {
                    baz: 42
                }]
            }
        });
    };

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('to make a Flickr API request for a perticular lat/lon location', function() {
        expectRequest('.*(8.123|47.123).*(8.123|47.123).*');
        FlickrPhoto.getByLocation(8.123, 47.123);
        $httpBackend.flush();
    });

    it('to make a Flickr API request by location with additional parameters', function() {
        expectRequest('.*addtlParam=true.*');
        FlickrPhoto.getByLocation(8.123, 47.123, {
            addtlParam: true
        });
        $httpBackend.flush();
    });

});
