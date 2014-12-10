'use strict';

describe('Service: appConfig', function() {

    // load the service's module
    beforeEach(module('poitourApp'));

    // instantiate service
    var appConfig, $httpBackend;
    beforeEach(inject(function(_$httpBackend_, _appConfig_) {
        appConfig = _appConfig_;
        $httpBackend = _$httpBackend_;
        
        

    }));
    
    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
    
    
    var respondRequest = function(response) {
        response = response || {
            config: {
                foo: 'bar'
            },
            otherData1: 42,
            otherData2: 77
        };
        
        $httpBackend.expectGET('/config').respond(response);
        $httpBackend.flush();
    };

    it('to fetch configuration from the server', function() {
        respondRequest();
    });
    
    it('to call us when config is available (shorthand syntax)', function() {
        var cb = jasmine.createSpy();
        appConfig(cb);
        respondRequest();
        expect(cb).toHaveBeenCalled();
    });
    
    it('to call us when fetching config failed (shorthand syntax)', function() {
        var cb = jasmine.createSpy();
        appConfig(undefined, cb);
        respondRequest(500);
        expect(cb).toHaveBeenCalled();
    });
    
    it('to resolve the promise when config is available', function() {
        var cb = jasmine.createSpy();
        appConfig.promise.then(cb);
        respondRequest();
        expect(cb).toHaveBeenCalled();
    });
    
    it('to reject the promise when fetching config failed', function() {
        var cb = jasmine.createSpy();
        appConfig.promise.catch(cb);
        respondRequest(500);
        expect(cb).toHaveBeenCalled();
    });

});
