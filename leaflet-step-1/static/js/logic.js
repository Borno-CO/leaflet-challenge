// set the url to a variable
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson";


// Perform a GET request to the earthquake query URL
d3.json(url, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// Define a markerSize function that set the radius of the circle markers based quake significance rating
function markerSize(significance) {
  return significance / 20;
};

// Define function with conditionals to set the color of the circle markers based on quake magnitude 
function markerColor(magnitude) {
  if (magnitude < 2.0) {
    color = "#ffffcc";
  }
  else if (magnitude < 3.0) {
    color = "#fed976";
  }
  else if (magnitude < 4.0) {
    color = "#fd8d3c";
  }
  else if (magnitude < 5.0) {
    color = "#fc4e2a";
  }
  else if (magnitude < 6.0) {
    color = "#bd0026";
  }
  else {
    color = "#800026";
  }
  return color
};
 
// Define function to create the circle markers and popups
function createFeatures(earthquakeData) {
  // iterate through data to get information for markers
  function pointToLayer(feature, latlng) {
    
    // set the circle marker radius using the function above
    var markerRadius = markerSize(feature.properties.sig);
    // console.log(`radius: ${markerRadius}`);
    // var magValue = feature.properties.mag;
    // console.log(`magValue: ${magValue}`);

    // set the marker color using the function above
    var circleColor = markerColor(feature.properties.mag);
    console.log(`color: ${circleColor}`);

    // set marker style equal to a variable
    var geojsonMarkerOptions = {
      radius: markerRadius,
      fillColor: circleColor,
      fillOpacity: 0.5,
      color: circleColor,
      weight: 1
    };
    
    // latlng variable not needed since L.geoJSON returns coordinates on line 79
    // var latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]
    // console.log(`latlng: ${latlng}`);
    
    // create circle markers with latlng from L.geoJSON (line 79) and using marker sytle options set above
    // bind popups to the circle markers
    return L.circleMarker(latlng, geojsonMarkerOptions)
      .bindPopup("<lu><strong>" + feature.properties.place + "</strong>" +
      "<li>Magnitude: " + feature.properties.mag + 
      "</li><li>Significance: " + feature.properties.sig + 
      "</li><li>Felt Reports: " + feature.properties.felt +
      "</li><a href=" + feature.properties.url + ">Event USGS URL</a></lu>");
    
  };

  // L.geoJSON gets the latlng coordinates
  var earthquakes = L.geoJSON(earthquakeData,    {
    pointToLayer: pointToLayer
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
};

// Define a function to create the map layers
function createMap(earthquakes) {

    // Define satellitemap and outdoormap base layers
    var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.satellite",
      accessToken: API_KEY
    });
  
    var outdoormap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.outdoors",
      accessToken: API_KEY
    });
  
    
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Satellite": satellitemap,
      "Outdoors": outdoormap
    };
  
    // Create overlay object to hold our overlay layers
    var overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the satellitemap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 3,
      layers: [satellitemap, earthquakes]
    });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  
    // get plate data and add to the map
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
      function (platedata) {
        L.geoJSON(platedata, {
          color: "orange", weight: 2}).addTo(myMap);
      });
    

    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function(map) {
      var div = L.DomUtil.create("div", "legend");
      div.innerHTML += "<h4>Magnitude</h4>";
      div.innerHTML += '<i style="background: #ffffcc"></i><span>0.0 < 2.0</span><br>';
      div.innerHTML += '<i style="background: #fed976"></i><span>2.0 < 3.0</span><br>';
      div.innerHTML += '<i style="background: #fd8d3c"></i><span>3.0 < 4.0</span><br>';
      div.innerHTML += '<i style="background: #fc4e2a"></i><span>4.0 < 5.0</span><br>';
      div.innerHTML += '<i style="background: #bd0026"></i><span>5.0 < 6.0</span><br>';
      div.innerHTML += '<i style="background: #800026"></i><span>6.0 - 10.0</span><br>';
         
      return div;
    };
    
    legend.addTo(myMap);

};
