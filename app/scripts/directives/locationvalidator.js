'use strict';

/**
 * @ngdoc directive
 * @name poitourApp.directive:locationValidator
 * @description # Async. Nominatim (Geocode) location validator
 */
angular.module('poitourApp').directive('ptLocationValidator', function($q, $parse, nominatim) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function postLink(scope, element, attrs, ngModel) {
            var callback = $parse(attrs.ptLocationValidator);
            
            ngModel.$asyncValidators.location = function(modelValue, viewValue) {
                var deferred = $q.defer();
                
                callback(scope, {
                    $promise: deferred.promise
                });
                
                if(!modelValue) {
                    deferred.reject();
                    return $q.when();
                }

                nominatim.search(modelValue).then(function(data) {
                    if(data.length) {
                        deferred.resolve(data);
                    } else {
                        deferred.reject(data);
                    }
                });

                return deferred.promise;
            };
        }
    };
});
