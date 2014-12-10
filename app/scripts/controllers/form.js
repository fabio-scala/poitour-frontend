'use strict';

/**
 * @ngdoc function
 * @name poitourApp.controller:FormCtrl
 * @description # Form controller
 */
angular.module('poitourApp').controller('FormCtrl', function($scope, $http, $timeout, $rootScope, $q, $state, $stateParams, $location, $window, appConfig, appLoader, geoUtils) {
    var self = this;
    

    self._init = function() {
        self._initListeners();
        self._initScope();
        
        
        // display loader
        appLoader.acquire();
        appConfig(function(config) {
            self.categories = config.data.categories;

            angular.extend(self.tour, {
                start: config.START || self.tour.start,
                end: config.END || self.tour.end,
                hours: config.HOURS || self.tour.hours,
                minutes: config.MINUTES || self.tour.minutes,
                stayTime: config.STAY_TIME || self.tour.stayTime,
                categories: []
            });
            
            angular.extend(self.tour, $stateParams);
            // sfk doesn't want camel case in URL ;-)
            self.tour.stayTime = $stateParams['stay-time'] || self.tour.stayTime;

            var categoryIds = $stateParams.categories || config.CATEGORIES;

            self.tour.categories = self._getCategoriesByIds(categoryIds);
            self.tour.categories.reverse(); // last is fist in view
            
            var weights = $stateParams.weights || config.WEIGHTS;
            weights = Array.isArray(weights) ? weights : [weights];
            // reverse -> we display last added first in UI
            weights.reverse();
            
            angular.forEach(self.tour.categories, function(c, i) {
                c.weight = weights[i] * 1;
            });
            
            // Render things first before opening the curtains ;-) feels cleaner than $digest
            $timeout(function() {
                if($stateParams.start) {
                    self.submit();
                } else {
                    $scope.form.$setPristine();
                }
                appLoader.release();
            });

        });
    };
    
    
    self._initScope = function() {
        angular.extend(self, {
            categories: [],
            processing: false,
            errors: {},
            tour: {
                start: '',
                end: '',
                hours: '',
                minutes: '',
                stayTime: '',
                categories: []
            },
            tourResult: {
                hasResult: false,
                hours: 0,
                minutes: 0,
                distance_km: 0,
                distance_m: 0
            }
        });
    };
    
    self._initListeners = function() {
        // Triggered by right click (ctx menu) on map
        $scope.$on('setStart', function(e, start) {
            self.tour.start = geoUtils.formatLatLng(start);
        });

        $scope.$on('setEnd', function(e, end) {
            self.tour.end = geoUtils.formatLatLng(end);
        });
    };

    /**
     * Returns object with URL $stateParams based on current form input
     */
    self._getQueryOptions = function() {
        var opts = angular.copy(self.tour);
        // preserve order as displayed in UI, newly added on top
        opts.categories.reverse();
        opts.weights = opts.categories.map(function(c) {
            return c.weight;
        });
        opts.categories = opts.categories.map(function(c) {
            return c.id;
        });
        opts['stay-time'] = opts.stayTime;
        
        return opts;
    };

    /**
     * Retrieve the concrete category objects by a list of category IDs
     */
    self._getCategoriesByIds = function(ids) {
        ids = angular.isArray(ids) ? ids : [ids];
        var categories = [];
        angular.forEach(ids, function(id) {
            categories = categories.concat(_.where(self.categories, {id: id}));
        });
        return categories;
    };
    
    /**
     * Called after location validator finished validating the entered location.
     */
    self.setLocation = function(field, promise) {
      self[field] = null;
      promise.then(function(data) {
          self[field] = data[0];
          $rootScope.$broadcast(field + 'Changed', data[0]);
      }, function() {
          self[field] = null;
          $rootScope.$broadcast(field + 'Changed', false);
      });
    };

    /**
     * Called onChange of the start field because our location validator won't get the chance to clear self.start as it's an async
     * validator and only gets called after all other succeed.
     */
    self.removeStartFromMap = function() {
        if(self.tour.start === '') {
            $rootScope.$broadcast('startChanged', false);
        }
    };
    
    /**
     * Apply default weight after selection of new category.
     */
    self.selectCategory = function(item, model) {
        model.weight = appConfig.DEFAULT_WEIGHT;
    };
    
    /**
     * Checks if total time is greater than 0. Other validation is in markup.
     */
    self.isValidTime = function(hours, minutes) {
        return (hours + minutes) > 0;
    };
    
    /**
     * Delegate geolocation request to MapCtrl.
     */
    self.fixLocation = function(field) {
      $rootScope.$broadcast('locationFixClicked', field);
    };
    
    
    self.submit = function() {
        self.submitted = true;

        $timeout(function() { // make sure validators are called first
            
            // check if everything is ok after async validators are done
            var watch = $scope.$watch('form.$pending', function(pending, old) {
                if(!pending) {
                    watch();
                }
                if(!pending && $scope.form.$valid) {
                    $state.go('main.tour', self._getQueryOptions());
                    
                    // google analytics more precise tracking (we wan't to know what kind of tours people are interested in)
                    $window.ga('send', 'pageview', { page: $location.url() });
                    
                    // display blockUI spinner in form
                    self.processing = true;

                    // gather/compute GET params
                    var start = self.start.lat + ',' + self.start.lon;
                    var end = self.end ? self.end.lat + ',' + self.end.lon : start;
                    var params = {
                        start: start,
                        end: end,
                        time_s: self.tour.hours * 60 * 60 + self.tour.minutes * 60,
                        stay_time_s: self.tour.stayTime * 60,
                        categories: self.tour.categories.map(function(c, i) {
                            return c.id;
                        }).join(','),
                        weights: self.tour.categories.map(function(c, i) {
                            return c.weight;
                        }).join(','),
                    };

                    $http.get(appConfig.API_URL, {
                        params: params
                    }).success(function(data) {
                        self.errors.calculation = false;
                        self.errors.noTour = false;
                        self.processing = false;

                        if(data.points.features.length <= 2) {
                            // our tour contains less or equal than 2 points -> no POIs found or start/end too distant
                            self.errors.noTour = true;
                            return;
                        }

                        $rootScope.$broadcast('tourChanged', data);
                        
                        angular.extend(self.tourResult, {
                           hasResult: true,
                           hours: Math.floor(data.time_total_s / 3600),
                           minutes: Math.round(data.time_total_s % 3600 / 60),
                           distance_km: (data.distance_m / 1000).toFixed(1) * 1, // cast
                           distance_m: data.distance_m
                        });
                        
                        
                    }).error(function() {
                        // other error (server) occurred
                        self.errors.calculation = true;
                        self.processing = false;
                    });
                }
            });
        });

    };
    
    
    self._init();
});
