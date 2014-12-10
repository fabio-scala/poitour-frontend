'use strict';

describe('Directive: ptBlock', function() {

    // load the directive's module
    beforeEach(module('poitourApp'));

    var element, $scope, $rootScope;

    beforeEach(inject(function(_$rootScope_) {
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
    }));

    it('should initially block an element', inject(function($compile) {
        element = angular.element('<div pt-block="myScopeVar"></div>');
        $scope.myScopeVar = true;
        spyOn(jQuery.fn, 'block');
        element = $compile(element)($scope);
        $scope.$apply();
        expect(jQuery.fn.block).toHaveBeenCalled();
    }));

    it('should initially NOT block an element', inject(function($compile) {
        element = angular.element('<div pt-block="myScopeVar"></div>');
        $scope.myScopeVar = false;
        spyOn(jQuery.fn, 'block');
        element = $compile(element)($scope);
        $scope.$apply();
        expect(jQuery.fn.block).not.toHaveBeenCalled();
    }));
});
