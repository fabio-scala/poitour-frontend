'use strict';

/**
 * @ngdoc function
 * @name poitourApp.controller:MapCtrl
 * @description # MapCtrl Controller of the poitourApp
 */
angular.module('poitourApp').controller('MapCtrl', function($scope, $rootScope, $interval, $stateParams, $state, $timeout, $window, ngToast, TooltipMarker, appConfig, leafletData, leafletEvents) {
    var self = this;
    
    // Icon used for start (home)
    var startIcon = L.AwesomeMarkers.icon({
        markerColor: 'red',
        prefix: 'fa',
        icon: 'home'
    });

    // Icon used for end (flag)
    var endIcon = L.AwesomeMarkers.icon({
        markerColor: 'red',
        prefix: 'fa',
        icon: 'flag'
    });

    // Blue icon used for POIs of the tour
    var poiIcon = L.AwesomeMarkers.icon({
        markerColor: 'blue',
        prefix: 'fa',
        icon: 'circle'
    });

    // Current tour polyline
    var polyline = L.polyline([], {
        color: '#008000',
        weight: 8
    });

    // Only used upon entering tour start/end in form
    var formLocMarkers = L.featureGroup();

    var startMarker = L.marker([], {
        icon: startIcon
    }).bindPopup('Start');

    var endMarker = L.marker([], {
        icon: endIcon
    }).bindPopup('Ziel');
    
    
    // Polyline (arrow) animation objects
    var polylineAnimation;
    var polylineAnimationPromise;
    var polylineAnimationSymbol = L.Symbol.arrowHead({
        pixelSize: 7,
        polygon: false,
        pathOptions: {
            opacity: 1,
            weight: 2,
            fillOpacity: 1,
            color: '#008000'
        }
    });
    
    // Context menu (right click) callbacks. Note that this is non-angular stuff so we need to $apply manually.
    self._ctxStartCallback = function(e) {
        $rootScope.$apply(function() {
            $rootScope.$broadcast('setStart', e.latlng);
        });
    };

    self._ctxEndCallback = function(e) {
        $rootScope.$apply(function() {
            $rootScope.$broadcast('setEnd', e.latlng);
        });
    };


    // Valid start or end entered by user, display and pan to it
    self._displayFormMarker = function(nominatimResponse, marker) {
        leafletData.getMap().then(function(map) {
            if(nominatimResponse) {
                var lat = nominatimResponse.lat * 1, lon = nominatimResponse.lon * 1;
                marker.setLatLng([lat, lon]);
                marker.addTo(formLocMarkers);
                
                // if marker is not visible the user likely used the input box and not the context menu, pan to marker
                // other the other han, if the ctx menu was used, it would be disturbing because the user might also want to select the end point
                var markerVisible = map.getBounds().intersects(formLocMarkers.getBounds());
                if(formLocMarkers.getLayers().length > 1 || !markerVisible) {
                    map.fitBounds(formLocMarkers);
                }
            } else {
                formLocMarkers.removeLayer(marker);
            }
        });
    };
    
    
    self._init = function() {
        // Leaflet settings for angular-leaflet
        self.leaflet = {
            center: {
                lat: 47.3748,
                lng: 8.5456,
                zoom: 12
            },
            defaults: {
                attributionControl: false,
                tileLayerOptions: {
                    attribution: '',
                    minZoom: 8
                }
            },
            events: {
                // Performance: https://github.com/tombatossals/angular-leaflet-directive/issues/290
                map : { disable: leafletEvents.getAvailableMapEvents() },
                markers : { disable: leafletEvents.getAvailableMarkerEvents() },
                path : { disable: leafletEvents.getAvailableMarkerEvents() }
            }
        };
        
        self.flickrCarousel = {
                show: false
        };
        
        self._initListeners();
        self._initMap();
    };
    
    
    self._initMap = function() {
    leafletData.getMap().then(function(map) {
        self._map = map;
        formLocMarkers.addTo(map);

        // Use a group so that we can easily clear everything that belongs together
        // as well as "pan to" the entire group and handle events
        self._tourGroup = L.featureGroup().addTo(map).bringToFront();
        
        // Show Flickr images on click
        self._tourGroup.on('click', function(e) {
            $scope.$apply(function() {
                self.flickrCarousel = {
                        lat: e.latlng.lat,
                        lon: e.latlng.lng,
                        show: true
                };
                self._setStateParams();
            });
        });
        
        // Set attribution text from server config
        appConfig(function() {
            new L.control.attribution({
                prefix: false
            }).addTo(map).addAttribution(appConfig.ATTRIBUTION);
        });
        
        // Initialize context menu
        L.Util.setOptions(map, {
            contextmenu: true,
            contextmenuWidth: 140,
            contextmenuItems: [{
                text: '<i class="fa fa-home">&nbsp;</i> Start setzen',
                callback: self._ctxStartCallback
            }, {
                text: '<i class="fa fa-flag">&nbsp;</i> Ziel setzen',
                callback: self._ctxEndCallback
            }]
        });
        new L.Map.ContextMenu(map).addHooks();
        
        // Add lat,lng display bottom left of the map
        L.control.mousePosition({
            separator: ', ',
            emptyString: '',
            numDigits: appConfig.LATLNG_DECIMAL_PRECISION
            
        }).addTo(map);
        
        
        // Geolocation request listeners
        self._map.on('locationfound', function(e) {
            if(self._locationRequestField) {
                if(self._locationRequestField === 'start') {
                    self._ctxStartCallback(e);
                } else {
                    self._ctxEndCallback(e);
                }
            }
        });
        
        self._map.on('locationerror', function(e) {
            ngToast.create({
                'class': 'danger',
                content: 'Dein Browser hat die Freigabe deines Standortes verweigert'
            });
        });


    });
    };
    
    self._initListeners = function() {
        $scope.$on('startChanged', function(event, nominatimResponse) {
            self._displayFormMarker(nominatimResponse, startMarker);
        });

        $scope.$on('endChanged', function(event, nominatimResponse) {
            self._displayFormMarker(nominatimResponse, endMarker);
        });

        
        $scope.$on('locationFixClicked', function(event, field) {
            if(!$window.navigator.geolocation) {
                ngToast.create({
                    'class': 'warning',
                    content: 'Dein Browser unterstützt diese Funktion nicht'
                });
                return;
            }
            
            self._locationRequestField = field;
            self._map.locate({setView: true});
        });
        

        $scope.$on('tourChanged', function(event, data) {
            leafletData.getMap().then(function(map) {
                
                // Cleanup
                formLocMarkers.clearLayers();
                self._tourGroup.clearLayers();
                self.flickrCarousel.show = false;
                if(polylineAnimation) {
                    map.removeLayer(polylineAnimation);
                    $interval.cancel(polylineAnimationPromise);
                } else if($stateParams.photos) { // first but from state params, show previous photos
                    var latLng = $stateParams.photos.split(',');
                    angular.extend(self.flickrCarousel, {
                        lat: latLng[0],
                        lon: latLng[1],
                        show: true
                    });
                }
                

                // Polyline
                polyline.setLatLngs(data.path.coordinates.map(function(v) {
                    return {
                        lat: v[1],
                        lng: v[0]
                    };
                })).addTo(map);
                self._tourGroup.addLayer(polyline);

                
                // Start & End Point
                var features = data.points.features;
                var start = new TooltipMarker([features[0].geometry.coordinates[1], features[0].geometry.coordinates[0]], {
                    icon: startIcon
                });
                start.bindPopup('Start', {
                    showOnMouseOver: true
                });

                var end = new TooltipMarker([features[features.length - 1].geometry.coordinates[1], features[features.length - 1].geometry.coordinates[0]], {
                    icon: endIcon
                });
                end.bindPopup('Ziel', {
                    showOnMouseOver: true
                });

                
                // Tour Polyline Animation
                // does not work together with fitBounds() in LayerGroup, so we add it to map
                polylineAnimation = L.polylineDecorator(polyline.getLatLngs(), {
                    patterns: [{
                        offset: 0,
                        repeat: '40px',
                        symbol: polylineAnimationSymbol
                    }]
                }).addTo(map);
                
                var arrowOffset = 0;
                polylineAnimationPromise = $interval(function() {

                    polylineAnimation.setPatterns([{
                        offset: arrowOffset,
                        repeat: '40px',
                        symbol: polylineAnimationSymbol
                    }]);
                    arrowOffset += 5;
                    if(arrowOffset > 40) {
                        arrowOffset = 0;
                    }
                }, 200, 0, false);


                self._tourGroup.addLayer(end);
                self._tourGroup.addLayer(start);

                angular.forEach(features.slice(1, -1), function(p, i) {
                    var coords = p.geometry.coordinates;

                    var marker = new TooltipMarker([coords[1], coords[0]], {
                        icon: poiIcon
                    });
                    self._tourGroup.addLayer(marker);
                    var title = p.properties.name || '(ohne Namen)';
                    
                    var popupMarkup;
                    if(p.properties.url) {
                        popupMarkup = '<a target="_blank" href="' + p.properties.url +'">'+title+'</a>';
                    } else {
                        popupMarkup = title;
                    }
                    
                    marker.bindPopup(popupMarkup, {showOnMouseOver: true});
                });

                map.fitBounds(self._tourGroup.getBounds());

            });
        });
    };
    
    /**
     * Modifies $stateParams based on currently shown Flickr photos
     */
    self._setStateParams = function() {
        if(self.flickrCarousel.show) {
            $stateParams.photos = self.flickrCarousel.lat + ',' + self.flickrCarousel.lon;
        } else {
            delete $stateParams.photos;
        }
        $state.go('main.tour', $stateParams);
    };
    
    self.removePhotoCarousel = function() {
        self.flickrCarousel.show = false;
        self._setStateParams();
    };
    

    self._init();

});
