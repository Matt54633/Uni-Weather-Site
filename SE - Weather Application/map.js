/* This file handles the API for the Mapbox map that appears on the site
   The radar data using Rainviewer API is also included in this file
*/

function DisplayMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWF0dDU0NjMzIiwiYSI6ImNrd2V6YmxwMjA5b2oycXJ1eHR2c2hud20ifQ.Ek14VtF_6iMwU_xOmr5DFA';

    //find user's location
    navigator.geolocation.getCurrentPosition(function(position) {
        var x = position.coords.latitude;
        var y = position.coords.longitude;

        //create a map instance and use the style from our account, center map at current location
        var map = new mapboxgl.Map({
            container: 'Map',
            style: 'mapbox://styles/matt54633/ckwi1dujh6fjc14ocuwnoaso2',
            center: [y, x],
            zoom: 6,

        });
        //create and place a marker on the user's location
        new mapboxgl.Marker({
            color: "#0099FF",
        }).setLngLat([y, x]).addTo(map);
        window.map = map;

        //rainview api finds the radar data and then overlays onto the mapbox map
        map.on("load", () => {
            fetch("https://api.rainviewer.com/public/weather-maps.json")
                .then(res => res.json())
                .then(apiData => {
                    apiData.radar.nowcast.forEach(frame => {
                        map.addLayer({
                            id: `rainviewer_${frame.path}`,
                            type: "raster",
                            source: {
                                type: "raster",
                                tiles: [
                                    apiData.host + frame.path + '/256/{z}/{x}/{y}/2/1_1.png'
                                ],
                                tileSize: 256
                            },
                            layout: { visibility: "none" },
                            minzoom: 0,
                            maxzoom: 12
                        });
                    });

                    //show a moving map of radar data so that you can see where rain is moving
                    let i = 0;
                    const interval = setInterval(() => {
                        if (i > apiData.radar.nowcast.length - 1) {
                            clearInterval(interval);
                            return;
                        } else {
                            apiData.radar.nowcast.forEach((frame, index) => {
                                map.setLayoutProperty(
                                    `rainviewer_${frame.path}`,
                                    "visibility",
                                    index === i || index === i - 1 ? "visible" : "none"
                                );
                            });
                            if (i - 1 >= 0) {
                                const frame = apiData.radar.nowcast[i - 1];
                                let opacity = 1;
                                setTimeout(() => {
                                    const i2 = setInterval(() => {
                                        if (opacity <= 0) {
                                            return clearInterval(i2);
                                        }
                                        map.setPaintProperty(
                                            `rainviewer_${frame.path}`,
                                            "raster-opacity",
                                            opacity
                                        );
                                        opacity -= 0.1;
                                    }, 50);
                                }, 400);
                            }
                            i += 1;
                        }
                    }, 2000);
                })
                .catch(console.error);
        })
    })
}