'use strict';

describe('Service: Nominatim', function() {

    // load the service's module
    beforeEach(module('poitourApp'));

    // instantiate service
    var nominatim, $httpBackend, appConfig;
    beforeEach(inject(function(_nominatim_, _$httpBackend_, _appConfig_) {
        $httpBackend = _$httpBackend_;
        nominatim = _nominatim_;
        appConfig = _appConfig_;        
        $httpBackend.resetExpectations();
        
        appConfig.NOMINATIM_URL = 'http://my-url?q={{query}}';
        $httpBackend.whenGET('/config').respond({});
    }));
    
    var makeRequest = function() {
        $httpBackend.expectGET(new RegExp('http://my-url?.*q=test.*')).respond([{attr: 'foo'}]);
        return nominatim.search('test');
    };
    
    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should do an http request to the nominatim API url', function() {
        makeRequest();
        $httpBackend.flush();
    });
    
    it('should return an array of objects returned by the API', function() {
        var retArr = makeRequest(function() {
          expect(retArr[0].attr).toEqual('foo');
        });
        $httpBackend.flush();
    });


});
