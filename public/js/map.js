mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: "mapbox://styles/mapbox/streets-v12", // style URL
        center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 9 // starting zoom
    });


const marker = new mapboxgl.Marker({ color: "red"})
  .setLngLat(listing.geometry.coordinates) //Listing.geometry.coordinates
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }) .setHTML(
        `<h4>${listing.title}</h4><p>Exact location provided upon booking.</p>`
    )
  )
  .addTo(map);

map.on('load', () => {
    map.loadImage(
        'https://cdn-icons-png.flaticon.com/512/25/25694.png', // home icon image
        (error, image) => {
            if (error) throw error;

            // Add the image to the map style
            map.addImage('home-icon', image);

            // Add a data source containing one point feature
            map.addSource('point', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': listing.geometry.coordinates // your location
                            }
                        }
                    ]
                }
            });

            // Add a layer to use the home icon
            map.addLayer({
                'id': 'points',
                'type': 'symbol',
                'source': 'point',
                'layout': {
                    'icon-image': 'home-icon', // use the home icon
                    'icon-size': 0.25
                }
            });
        }
    );
});


