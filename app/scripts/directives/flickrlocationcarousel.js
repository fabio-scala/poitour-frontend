'use strict';

/**
 * @ngdoc directive
 * @name poitourApp.directive:ptFlickrLocationCarousel
 * @description # Display a carousel of photos from Flickr based on lat,lon coordinates
 */
angular.module('poitourApp').directive('ptFlickrLocationCarousel', function(FlickrPhoto, geoUtils) {
    return {
        templateUrl: 'views/flickrcarousel.html',
        restrict: 'E',
        scope: {
            onDismiss: '&'
        },
        
        link: function(scope, element, attrs) {
            scope.$parent.$watchGroup([attrs.lat, attrs.lon], function(newVals, oldVals) {
                var lat = newVals[0];
                var lon = newVals[1];
                
                if(!lat || !lon) {
                    return;
                }
                
                scope.lat = lat;
                scope.lon = lon;
    
                scope.processing = true;
                scope.maxWidth = 300;
    
                FlickrPhoto.getByLocation(scope.lon, scope.lat).then(function(data) {
    
                    // remove portrait format. takes too much space and too many "false positives" (portraits of people)
                    //data = _.filter(data, function(p) { return p.width_m * 1 > p.height_m * 1; });
                    
                    if(data.length) {
                        // sort by distance
                        data = _.sortBy(data.map(function(p, i) {
                            return {
                                originalOrder: i,
                                photo: p,
                                distance: geoUtils.distance(scope.lon, scope.lat, p.longitude, p.latitude)
                            };
                        }), 'originalOrder'); // change this to distance to sort by distance, but default seems to be better
                        
                        
                        // exclude portrait, too many false positives
                        data = _.filter(data, function(p) {
                            return p.photo.height_m < p.photo.width_m;
                        });
                        
                        
                        // then, if the nearest have the same distance, sort by original order
                        //var groups = _.groupBy(data, 'distance');
                        //var nearestPhotos = groups[data[0].distance];
                        
                        //nearestPhotos = _.sortBy(nearestPhotos, 'originalOrder');
                        
    
                        scope.active = 0;
                        
                        scope.photos = _(data).first(100).pluck('photo').map(function(photo, i) {
                            var height = photo.height_m * 1;
                            var width = photo.width_m * 1 * 1;
                            
                            return {
                                active: i === 0,
                                url: photo.url_m,
                                ownerName: photo.ownername,
                                photoId: photo.id,
                                ownerId: photo.owner,
                                title: photo.title,
                                width: Math.ceil(width > 300 ? 300 : width),
                                height: Math.ceil(width > 300 ? 300/width*height : height)
                            };
                        }).value();
                        
                        scope.maxHeight = _(scope.photos).pluck('height').max().value();
                        scope.maxWidth = _(scope.photos).pluck('width').max().value();
                    }
                        scope.processing = false;
                });
            });
        }
    };
});
