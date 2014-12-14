'use strict';

describe('Controller: FormCtrl', function() {

    // Mock data
    var categories = {
        categories: [{
            id: 'mock',
            name: 'Mock',
            display_name: 'Mocks',
            description: ''
        }]
    };

    beforeEach(module('poitourApp'));

    var $httpBackend, $rootScope, $scope, $timeout, $window, state, fc, appConfig, appLoader;

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, _$rootScope_, _$httpBackend_, _$timeout_, _$window_, _appConfig_, _appLoader_) {
        $httpBackend = _$httpBackend_;
        $timeout = _$timeout_;
        $window = _$window_;
        $rootScope = _$rootScope_;

        $scope = $rootScope.$new();
        $scope.form = jasmine.createSpyObj('form', ['$setPristine']);
        
        appConfig = _appConfig_;
        appLoader = _appLoader_;
        state = jasmine.createSpyObj('$state', ['go']);

        fc = $controller('FormCtrl', {
            $scope: $scope,
            $state: state
        });

        respondConfigRequest();
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
    
    var respondConfigRequest = function() {
        $httpBackend.expectGET('/config').respond({
            config: {
                START: 'Zürich HB',
                END: 'Bellevue',
                HOURS: 4,
                MINUTES: 30,
                STAY_TIME: 5,
                CATEGORIES: ['mock']
            },
            categories: categories
        });

        $httpBackend.flush();
    };

    it('to load form defaults from servers app config', function() {
        appConfig(function(config) {
            expect(fc.tour.start).toEqual(config.START);
            expect(fc.tour.end).toEqual(config.END);
            expect(fc.tour.hours).toEqual(config.HOURS);
            expect(fc.tour.minutes).toEqual(config.MINUTES);
            expect(fc.tour.stayTime).toEqual(config.STAY_TIME);
        });
        
    });
    
    it('to release app loader when initalized', function() {
        expect(appLoader.isLoaded).toBe(false);
        expect(appLoader.pending).toBeGreaterThan(0);
        $timeout.flush();
        expect(appLoader.isLoaded).toBe(true);
        expect(appLoader.pending).toBe(0);
    });
    
    
    it('isValidTime() to validate hour and minute selection', function() {
        expect(fc.isValidTime(0, 0)).toBe(false);
        expect(fc.isValidTime(-1, -1)).toBe(false);
        expect(fc.isValidTime(1, 0)).toBe(true);
        expect(fc.isValidTime(0, 1)).toBe(true);
    });

    it('to request a tour from server and notify the MapCtrl when successful', function() {
        appConfig.API_URL = 'http://poi-tour';
        $scope.form.$pending = false;
        $scope.form.$valid = true;
        

        $window.ga = function() {};
        spyOn($window, 'ga');
        spyOn($rootScope, '$broadcast');
        
        
        fc.start = {
            lat: '42',
            lon: '42'
        };
        
        fc.end = {
            lat: '42',
            lon: '42'
        };
        
        
        fc.tour.hours = 2;
        fc.tour.minutes = 30;
        fc.tour.categories = categories.categories;
        fc.tour.stayTime = 5;
        
        $httpBackend.expectGET(new RegExp(appConfig.API_URL + '.*')).respond({points: {features: [1,2,3]}});
        fc.submit();
        $timeout.flush();
        $scope.$apply();
        $httpBackend.flush();
        
        // google analytics
        expect($window.ga).toHaveBeenCalled();
        expect($rootScope.$broadcast).toHaveBeenCalled();
    });

});
