'use strict';

describe('Directive: ptLocationValidator', function() {

    // load the directive's module
    beforeEach(module('poitourApp'));

    beforeEach(module(function($provide) {
        // mock
        $provide.factory('appConfig', function() {
            return {};
        });
    }));

    var element, form, $scope, $q, nominatim;

    beforeEach(inject(function($rootScope, $compile, _$q_, _nominatim_) {
        $q = _$q_;
        nominatim = _nominatim_;
        $scope = $rootScope.$new();
        $scope.model = {
            loc: null
        };
        element = angular.element('<form name="form"><input name="loc" ng-model="model.loc" pt-location-validator type="text"/></form>');
        element = $compile(element)($scope);
        $scope.$digest();
        form = $scope.form;
    }));

    it('to positively validate a location if a result is returned', function() {
        spyOn(nominatim, 'search').and.returnValue($q.when([{}]));
        form.loc.$setViewValue('Rapperswil');
        expect(nominatim.search).toHaveBeenCalledWith('Rapperswil');
        expect(form.loc.$valid).toBe(true);
    });

    it('to positively validate a location on empty input', function() {
        form.loc.$setViewValue('');
        expect(form.loc.$valid).toBe(true);
    });
    
    it('to negatively validate a location if no result is returned', function() {
        spyOn(nominatim, 'search').and.returnValue($q.when([]));
        form.loc.$setViewValue('Charlies Schokoladenfabrik');
        expect(nominatim.search).toHaveBeenCalledWith('Charlies Schokoladenfabrik');
        expect(form.loc.$valid).toBe(false);
    });
});
