// set the url to a variable
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson";


// Perform a GET request to the query URL
d3.json(url, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// Define a markerSize function that set the radius of the circle markers based quake significance rating
function markerSize(significance) {
  return significance / 20;
};

function markerColor(magnitude) {
  if (magnitude < 2.0) {
    color = "#ffffcc";
  }
  // else if (magnitude < 3.0) {
  //   color = "#ffeda0";
  // }
  else if (magnitude < 3.0) {
    color = "#fed976";
  }
  // else if (magnitude < 4.0) {
  //   color = "#feb24c";
  // }
  else if (magnitude < 4.0) {
    color = "#fd8d3c";
  }
  else if (magnitude < 5.0) {
    color = "#fc4e2a";
  }
  else if (magnitude < 5.5) {
    color = "#e31a1c";
  }
  else if (magnitude < 6.0) {
    color = "#bd0026";
  }
  else {
    color = "#800026";
  }
  return color
};

  // create variable for the color of the circle markers
  // var color = "";


// var quakeMarkers = [];
 
function createFeatures(earthquakeData) {
  // iterate through data to get information for markers
  function pointToLayer(feature, latlng) {
    // conditionals to set the color of the circle markers based on quake magnitude 

    var markerRadius = markerSize(feature.properties.sig);
    console.log(`radius: ${markerRadius}`);
    var magValue = feature.properties.mag;
    console.log(`magValue: ${magValue}`);
    var circleColor = markerColor(feature.properties.mag);
    console.log(`color: ${circleColor}`);

    var geojsonMarkerOptions = {
      radius: markerRadius,
      fillColor: circleColor,
      color: circleColor,
      weight: 1,
      // opacity: 1,
      fillOpacity: 0.5
    };
    
    // var latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]
    console.log(`latlng: ${latlng}`);
    
      return L.circleMarker(latlng, geojsonMarkerOptions)
        .bindPopup("<lu><strong>" + feature.properties.place + "</strong>" +
        "<li>Magnitude: " + feature.properties.mag + 
        "</li><li>Significance: " + feature.properties.sig + 
        "</li><li>Felt Reports: " + feature.properties.felt +
        "</li><a href=" + feature.properties.url + ">Event USGS URL</a></lu>");
    
  };

  
  var earthquakes = L.geoJSON(earthquakeData,    {
    pointToLayer: pointToLayer
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
};

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
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
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [satellitemap, earthquakes]
    });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  

    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
      function (platedata) {
        var plates = L.geoJSON(platedata, {
          color: "orange", weight: 2}).addTo(myMap);
      });

}
