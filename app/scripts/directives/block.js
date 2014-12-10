'use strict';

/**
 * @ngdoc directive
 * @name poitourApp.directive:ptBlock
 * @description # jQuery blockUI plugin wrapper with custom styling
 */
angular.module('poitourApp').directive('ptBlock', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var expr = attrs.ptBlock;
            var text = attrs.ptBlockText ? '&nbsp;<span style="font-size: 2.5em;">' + attrs.ptBlockText + '</span>' : '';
            var icon = attrs.ptBlockIcon || 'refresh';
                icon = '<i style="line-height: initial;" class="fa fa-3x fa-' + icon + ' fa-spin"></i>';

            scope.$watch(expr, function(newVal, oldVal) {
                if(newVal) {
                    element.block({
                        message: icon + text,
                        css: {
                            border: 'none',
                            padding: '15px',
                            backgroundColor: '#000',
                            '-webkit-border-radius': '10px',
                            '-moz-border-radius': '10px',
                            '-ms-border-radius': '10px',
                            'border-radius': '10px',
                            opacity: 0.5,
                            color: '#fff'
                        }
                    });
                } else {
                    element.unblock();
                }
            });
        }
    };
});
