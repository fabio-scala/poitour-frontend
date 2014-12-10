'use strict';

/**
 * @ngdoc directive
 * @name poitourApp.directive:ptFocus
 * @description # Focus an input field
 */
angular.module('poitourApp').directive('ptFocus', function($timeout) {
    return {
        restrict: 'A',
        require: '^form',
        link: function(scope, element, attrs, form) {
            var expr = attrs.ptFocus;
            scope.$watch(expr, function(newVal, oldVal) {
                if(newVal) {
                    $timeout(function() {
                        element[0].focus();
                        // revert user intercation flag
                        form.$setUntouched();
                    });
                }
            });
        }

    };
});
