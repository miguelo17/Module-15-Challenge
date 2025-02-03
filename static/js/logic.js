
// OPTIONAL: Step 2
// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
// Add a control to the map that will allow the user to change which layers are visible.
// Create the base layers
let streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
});

let satelliteMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap ( CC-BY-SA )'
});

let earthquakesLayer = L.layerGroup();
let tectonicPlatesLayer = L.layerGroup();

let myMap = L.map("map", {
  center: [37.10, -95.71], // Center of the map
  zoom: 5, // Initial zoom level
  layers: [streetMap, earthquakesLayer, tectonicPlatesLayer] // Add layers
});


// Add base layers to the map
let baseMaps = {
  "Street Map": streetMap,
  "Satellite Map": satelliteMap
};

// Add overlay layers to the map
let overlayMaps = {
  "Earthquakes": earthquakesLayer,
  "Tectonic Plates": tectonicPlatesLayer // Add tectonicPlatesLayer here
};

L.control.layers(baseMaps, overlayMaps, {
  collapsed: false // Keep the control expanded by default
}).addTo(myMap);



// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  console.log(data);

  // This prints the array of earthquake features (rows) from the GeoJSON file
  console.log("Row data:", data.features); 

  console.log("Magnitude:" ,data.features[1].properties.mag);  // Magnitude of the first earthquake
  console.log("Coordinates:" , data.features[1].geometry.coordinates); // Coordinates of the first earthquake
  console.log("Location:" , data.features[1].properties.place); // Location of the first earthquake

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 0.5,
      fillColor: getColor(feature.geometry.coordinates[2]), // Depth is the third coordinate
      color: "#000000", // Outline color
      radius: getRadius(feature.properties.mag), // Magnitude
      stroke: true,
      weight: 0.8
    };
  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    if (depth <= 10) {
      return "#31a354"; // Green for shallow earthquakes
    } else if (depth <= 30) {
      return "#fff7bc"; // Yellow for moderate depth
    } else if (depth <= 50) {
      return "#feb24c"; // Orange for deeper earthquakes
    } else {
      return "#f03b20"; // Red for very deep earthquakes
    }
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1; // Minimum radius for magnitude 0
    }
    return magnitude * 4; // Scale radius based on magnitude
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlon) {
      return L.circleMarker(latlon, styleInfo(feature)); 
    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup(`<strong>Magnitude: </strong> ${feature.properties.mag}<br><strong> Location:</strong> ${feature.properties.place}`);
    }
  }).addTo(earthquakesLayer); // Add the GeoJSON data to the earthquakesLayer

  // OPTIONAL: Make a request to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    // Style for tectonic plates
    L.geoJSON(plate_data, {
      style: {
        color: "#ff2f00", // Set the color of the tectonic plate boundaries
        weight: 2 
      }
    }).addTo(tectonicPlatesLayer); // Add tectonic plates to the layer
  });
});
