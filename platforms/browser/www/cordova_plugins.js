cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-mapbox/www/Mapbox.js",
        "id": "cordova-plugin-mapbox.Mapbox",
        "pluginId": "cordova-plugin-mapbox",
        "clobbers": [
            "Mapbox"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.3.4",
    "cordova-plugin-mapbox": "1.2.3",
    "cordova-plugin-geolocation": "4.0.2"
}
// BOTTOM OF METADATA
});