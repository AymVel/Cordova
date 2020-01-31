var onSuccess = function(position) {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYXltdmVsIiwiYSI6ImNrNW53a2pqYzBnMG8zZm5zaW4xYzU2dmYifQ.h8Y5iYCc8ePspCp46jMGoA';
    var map = new mapboxgl.Map({
        container: 'map',
        center: [position.coords.longitude, position.coords.latitude],
        style: 'mapbox://styles/mapbox/streets-v11',
        zoom: 6
    });
    map.addControl(
        new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true
        }));

    map.on('load', function() {
// Add a layer showing the places.
        map.addLayer({
            'id': 'places',
            'type': 'symbol',
            'source': {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'properties': {
                                'description':
                                    '<strong>Make it Mount Pleasant</strong><p><a href="http://www.mtpleasantdc.com/makeitmtpleasant" target="_blank" title="Opens in a new window">Make it Mount Pleasant</a> is a handmade and vintage market and afternoon of live entertainment and kids activities. 12:00-6:00 p.m.</p>',
                                'icon': 'college'
                            },
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [6.16,49.12]
                            }
                        }]
                }

                },
            'layout': {
                'icon-image': '{icon}-15',
                'icon-allow-overlap': true,
                'icon-size': 2
            }
        })
    })
    map.on('click', 'places', function(e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.description;

// Ensure that if the map is zoomed out such that multiple
// copies of the feature are visible, the popup appears
// over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });

// Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'places', function() {
        map.getCanvas().style.cursor = 'pointer';
    });

// Change it back to a pointer when it leaves.
    map.on('mouseleave', 'places', function() {
        map.getCanvas().style.cursor = '';
    });
    console.log(position.coords.longitude)


    var query = "https://api.mapbox.com/matching/v5/mapbox/walking/"+ 6.16+","+49.13+";"+ 6.16+","+49.12+"?steps=true&geometries=geojson&radiuses=25;25&access_token=pk.eyJ1IjoiYXltdmVsIiwiYSI6ImNrNW53d2R5bzBmeXYzbG5zc2syNHg4OXMifQ.NdFq4nxUMGOwvrZJcWA5Iw"

    $.ajax({
        method: 'GET',
        url: query
    }).done(function(data) {
        // Get the coordinates from the response
        console.log(data);
        var coords = data.matchings[0].geometry;
        addRoute(coords);

        // Code from the next step will go here
    });
    function addRoute(coords) {
        // If a route is already loaded, remove it
        if (map.getSource('route')) {
            map.removeLayer('route')
            map.removeSource('route')
        } else { // Add a new layer to the map
            map.addLayer({
                "id": "route",
                "type": "line",
                "source": {
                    "type": "geojson",
                    "data": {
                        "type": "Feature",
                        "properties": {},
                        "geometry": coords
                    }
                },
                "layout": {
                    "line-join": "round",
                    "line-cap": "round"
                },
                "paint": {
                    "line-color": "#03AA46",
                    "line-width": 8,
                    "line-opacity": 0.8
                }
            });
        };
    }



};

// onError Callback receives a PositionError object
//
function onError(error) {
    alert('code: '    + error.code    + '\n' +
        'message: ' + error.message + '\n');
}

navigator.geolocation.getCurrentPosition(onSuccess, onError);

