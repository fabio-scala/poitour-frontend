'use strict';

describe('Directive: ptFocus', function() {

    // load the directive's module
    beforeEach(module('poitourApp'));

    var element, $scope, $rootScope, $timeout;

    beforeEach(inject(function(_$rootScope_, _$timeout_) {
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $timeout = _$timeout_;
    }));

    it('should initially focus an input', inject(function($compile) {
        element = angular.element('<form><input type="text" pt-focus="myScopeVar"></div></form>');
        $scope.myScopeVar = true;
        element = $compile(element)($scope);
        var input = element.find('input')[0];
        spyOn(input, 'focus');

        $scope.$apply();
        $timeout.flush();
        $scope.$apply();

        expect(input.focus).toHaveBeenCalled();
    }));

});
