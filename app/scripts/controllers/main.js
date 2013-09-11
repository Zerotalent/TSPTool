'use strict';

angular.module('TSPToolApp')
    .controller('MainCtrl', function($scope) {
        /*
        $('#overlay').bind('click', function() {
            var newTop = 0;

            if (!$(this).hasClass('hidden')) {
                newTop = ($(this).height() * -1) + 30;
            }

            $(this).css({
                top: newTop
            });
            $(this).toggleClass('hidden');
        });
        */

        var canvas = 'map-canvas';
        var home = 'Industriestr. 22-24, 28816 Stuhr-Seckenhausen';
        $scope.waypoints = [
            'Bismarckstr, 38640 Goslar',
            'Hauptstraße, 38319 Remlingen',
            'Alte Hauptstraße, 38165 Lehre',
            'Kirchgang 3, 31246 Lahstedt',
            'Neue Straße, 38268 Lengede'
        ];

        // GMaps vars
        var map;
        var markerArray = [];
        var directionsService;
        var directionsDisplay;

        // Create a map
        var mapOptions = {
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        map = new google.maps.Map(document.getElementById(canvas), mapOptions);

        // init router
        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer({
            draggable: true,
            map: map
        });

        // add listener for recalculation after drag
        google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {
            $scope.waypoints = directionsDisplay.directions.routes[0].legs;
            $scope.$apply();
        });

        // and calculate the route
        calculateRoute();

        function calculateRoute() {
            // First, remove any existing markers from the map.
            for (var i = 0; i < markerArray.length; i++) {
                markerArray[i].setMap(null);
            }

            // Now, clear the array itself.
            markerArray = [];

            // Retrieve the start and end locations and create
            // a DirectionsRequest using DRIVING  directions.
            var _waypoints = [];

            angular.forEach($scope.waypoints, function(val, key) {
                _waypoints.push({
                    location: val,
                    stopover: true
                });
            });

            var request = {
                origin: home,
                destination: home,
                optimizeWaypoints: true, // use "Traveling Salesperson Problem (TSP)" calculation
                waypoints: _waypoints,
                travelMode: google.maps.TravelMode.DRIVING,
                region: 'DE'
            };

            // Route the directions and pass the response to a
            // function to create markers for each step.
            directionsService.route(request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    if (response.routes[0].warnings.length > 0) {
                        console.error(response.routes[0].warnings);
                    }

                    directionsDisplay.setDirections(response);

                    $scope.waypoints = directionsDisplay.directions.routes[0].legs;
                    $scope.$apply();
                }
            });
        }

        $scope.waypointsUpdated = function() {
            var _waypoints = [];

            angular.forEach($scope.waypoints, function(val, key) {
                _waypoints.push(val.end_address);
            });

            $scope.waypoints = _waypoints;

            calculateRoute();
        };
    });