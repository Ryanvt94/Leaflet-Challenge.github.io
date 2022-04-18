//pull the earthquake and tectonic plate data
let earthquackeURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'
let tonicplateURL = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json'

//layers for two different sets of data, earthquakes and tectonic plates
let earthquakes = new L.LayerGroup();
let tonicplates = new L.LayerGroup();
 // grayscale map
var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoicnZ0MjMiLCJhIjoiY2wyNTZrOThlMDA5aDNjcDhpaGV0emo4OSJ9._cXaes_wLa4pHFmibsFTqg");

// satellite map.
var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoicnZ0MjMiLCJhIjoiY2wyNTZrOThlMDA5aDNjcDhpaGV0emo4OSJ9._cXaes_wLa4pHFmibsFTqg");

// outdoors map.
var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoicnZ0MjMiLCJhIjoiY2wyNTZrOThlMDA5aDNjcDhpaGV0emo4OSJ9._cXaes_wLa4pHFmibsFTqg");

  //base map
let baseMaps = {
    'satellite': satelliteMap,
    'grayscale': grayscaleMap,
    'outdoor': outdoorsMap
};

//overlaymap
let overlayMaps ={
    'Earthquakes': earthquakes,
    'Tectonic Plates': tonicplates
};

// map object to an array of layers that were created
let maps = L.map('map', {
    center: [37.0902, -95.7129],
    zoom: 3,
    layers: [satelliteMap, grayscaleMap, outdoorsMap, earthquakes]
});

// Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
L.control.layers(baseMaps, overlayMaps).addTo(maps);

d3.json(earthquackeURL, function(eqdata){

    function styleInfo(feature){
        return{
            opacity: 1,
            fillOpacity: 1,
            fillColor: colorChoice(feature.properties.mag),
            color: '#000000',
            radius: markersize(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    function colorChoice(magnitude){
        switch(true){
            case magnitude > 5:
                return "#DA2400";
            case magnitude > 4:
                return '#E35603';
            case magnitude > 3:
                return '#7C3BF7';
            case magnitude > 2:
                return '#2C5FE0';
            case magnitude > 1:
                return '#2CBAE0';
            default:
                return '#10AD4B';                        
        }
    }

    function markersize(magnitude){
        if(magnitude === 0){
            return 1;
        }
        return magnitude * 3;
    }

    L.geoJSON(eqdata, {
        pointToLayer: function(feature, latlng){
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: function(feature, layer){
            layer.bindPopup('<h4>Location: ' + feature.properties.place + 
            '</h4>>hr><p>Date & Time:' +new Date(feature.properties.time) +
            '</p><hr><p>Magnitude: ' + feature.properties.mag + '</p>');
        }
    }).addTo(earthquakes);
    earthquakes.addTo(maps);

    d3.json(tonicplateURL, function(platedata){
        L.geoJSON(platedata, {
            color: 'light brown',
            weight: 2
        }).addTo(tonicplates);
        tonicplates.addTo(maps);
    });

    let legend = L.control({position: 'bottomright'});
    legend.onAdd = function(){
        let div = L.domUtil.create('div', 'info legend'),
        magLevels = [0, 1, 2, 3, 4, 5];
        div.innerHTML += '<h3>Magnitude</h3>'

        for (let i = 0; i < magLevels.length; i++){
            div.innerHTML +=
                '<i style="background: ' +colorChoice(magLevels[i] + 1) + '"></i> ' +
                magLevels[i] + (magLevels[i+1] ? '&ndash;' + magLevels[i+1] +'>br>' : '+');
        }
        return div;
    };
    legend.addTo(maps);  
});


