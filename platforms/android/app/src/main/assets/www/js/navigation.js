<!DOCTYPE html>
<html>

<head>
<meta charset='utf-8' />
    <title>Get started with the Map Matching API</title>
<meta name='viewport' content='initial-scale=1,maximum-scale=1,user-scalable=no' />
    <!-- Import Mapbox GL JS  -->
<script src='https://api.tiles.mapbox.com/mapbox-gl-js/v1.6.1/mapbox-gl.js'></script>
    <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v1.6.1/mapbox-gl.css' rel='stylesheet' />
    <!-- Import jQuery -->
<script src='https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js'></script>
    <!-- Import Mapbox GL Draw -->

    <style>
    body {
    margin: 0;
    padding: 0;
}

#map {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
}

.info-box {
    position: absolute;
    margin: 20px;
    width: 25%;
    top: 0;
    bottom: 40%;
    padding: 20px;
    background-color: rgba(255, 255, 255, 0.9);
    overflow-y: scroll;
    font-family: sans-serif;
    font-size: 0.8em;
    line-height: 2em;
}

#info {
    font-size: 16px;
    font-weight: bold;
}
</style>
</head>

<body>
<!-- Create a container for the map -->
<div id='map'></div>

    <div class="info-box">
    <div id="info">
    <p>Draw your route using the draw tools on the right. To get the most accurate route match, draw points at regular intervals.</p>
</div>
<div id="directions"></div>
    </div>

    <script>
var user_position;
var map;
var onSuccess = function(position) {
    user_position = position;
    mapboxgl.accessToken = 'pk.eyJ1IjoiYXltdmVsIiwiYSI6ImNrNW53a2pqYzBnMG8zZm5zaW4xYzU2dmYifQ.h8Y5iYCc8ePspCp46jMGoA';
    map = new mapboxgl.Map({
        container: 'map',
        center: [user_position.coords.longitude, user_position.coords.latitude],
        style: 'mapbox://styles/mapbox/streets-v11',
        zoom: 14
    });
    map.addControl(
        new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true
        }));


    map.on('load', function () {
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
                                    '<button onclick="updateRoute( [6.1757, 49.1202])">Go</button><strong>Make it Mount Pleasant</strong><p><a href="http://www.mtpleasantdc.com/makeitmtpleasant" target="_blank" title="Opens in a new window">Make it Mount Pleasant</a> is a handmade and vintage market and afternoon of live entertainment and kids activities. 12:00-6:00 p.m.</p>',
                                'icon': 'college'
                            },
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [6.1757, 49.1202]
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
    map.on('click', 'places', function (e) {
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
    map.on('mouseenter', 'places', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

// Change it back to a pointer when it leaves.
    map.on('mouseleave', 'places', function () {
        map.getCanvas().style.cursor = '';
    });
}


function updateRoute(location) {
    // Set the profile
    var profile = "walking";
    // Get the coordinates that were drawn on the map

    var coords = [];
    coords.push([user_position.coords.longitude,user_position.coords.latitude]);
    coords.push(location);
    console.log(coords)
    // Format the coordinates
    var newCoords = coords.join(';')
    // Set the radius for each coordinate pair to 25 meters
    var radius = [];
    coords.forEach(element => {
        radius.push(25);
    });
    getMatch(newCoords, radius, profile);
}

// Make a Map Matching request
function getMatch(coordinates, radius, profile) {
    // Separate the radiuses with semicolons
    var radiuses = radius.join(';')
    // Create the query
    var query = 'https://api.mapbox.com/matching/v5/mapbox/' + profile + '/' + coordinates + '?geometries=geojson&radiuses=' + radiuses + '&steps=true&access_token=' + mapboxgl.accessToken;

    $.ajax({
        method: 'GET',
        url: query
    }).done(function (data) {
        // Get the coordinates from the response
        var coords = data.matchings[0].geometry;
        // Draw the route on the map
        addRoute(coords);
        getInstructions(data.matchings[0]);
    });
}

// Draw the Map Matching route as a new layer on the map
function addRoute(coords) {
    // If a route is already loaded, remove it
    if (map.getSource('route')) {
        map.removeLayer('route')
        map.removeSource('route')
    } else {
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
    }
    ;
}

function getInstructions(data) {
    // Target the sidebar to add the instructions
    var directions = document.getElementById('directions');

    var legs = data.legs;
    var tripDirections = [];
    // Output the instructions for each step of each leg in the response object
    for (var i = 0; i < legs.length; i++) {
        var steps = legs[i].steps;
        for (var j = 0; j < steps.length; j++) {
            tripDirections.push('<br><li>' + steps[j].maneuver.instruction) + '</li>';
        }
    }
    directions.innerHTML = '<br><h2>Trip duration: ' + Math.floor(data.duration / 60) + ' min.</h2>' + tripDirections;
}


function onError(error) {
    alert('code: ' + error.code + '\n' +
        'message: ' + error.message + '\n');
}

navigator.geolocation.getCurrentPosition(onSuccess, onError);

</script>
</body>

</html>
