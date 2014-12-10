'use strict';

describe('Service: appLoader', function() {

    // load the service's module
    beforeEach(module('poitourApp'));

    // instantiate service
    var appLoader;
    beforeEach(inject(function(_appLoader_) {
        appLoader = _appLoader_;
    }));

    it('to initially not be loaded', function() {
        expect(appLoader.isLoaded).toBe(false);
    });
    
    it('to increment outstanding on acquire', function() {
        appLoader.acquire();
        expect(appLoader.pending).toBe(1);
        expect(appLoader.isLoaded).toBe(false);
    });
    
    it('to decrement outstanding on acquire', function() {
        appLoader.release();
        expect(appLoader.pending).toBe(-1);
        expect(appLoader.isLoaded).toBe(true);
    });

});
