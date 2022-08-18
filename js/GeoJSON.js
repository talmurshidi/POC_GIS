var app = {markers: []};

function serializePolygon(gpoly) {
  var gjp = {
    "type": "Polygon",
    "coordinates": []
  };
  for (var i = 0; i < gpoly.latLngs.length; i++) {
    gjp.coordinates[i] = []
    var ring = gpoly.latLngs.getAt(i)
    for (var j = 0; j < ring.length; j++) {
      var ll = ring.getAt(j)
      gjp.coordinates[i].push([ll.lng(), ll.lat()])
    }
  }
  return gjp
}

function printGeoJSON() {
  $('#geojson').text(JSON.stringify(serializePolygon(app.googleObj), null, ' '))
}

var GeoJSON = function( geojson, options ){

  var _geometryToGoogleMaps = function( geojsonGeometry, opts, geojsonProperties ){
  
  var googleObj;
  
  switch ( geojsonGeometry.type ){
    case "Point":
    opts.position = new google.maps.LatLng(geojsonGeometry.coordinates[1], geojsonGeometry.coordinates[0]);
    googleObj = new google.maps.Marker(opts);
    if (geojsonProperties) {
      googleObj.set("geojsonProperties", geojsonProperties);
    }
    break;
    
    case "MultiPoint":
    googleObj = [];
    for (var i = 0; i < geojsonGeometry.coordinates.length; i++){
      opts.position = new google.maps.LatLng(geojsonGeometry.coordinates[i][1], geojsonGeometry.coordinates[i][0]);
      googleObj.push(new google.maps.Marker(opts));
    }
    if (geojsonProperties) {
      for (var k = 0; k < googleObj.length; k++){
      googleObj[k].set("geojsonProperties", geojsonProperties);
      }
    }
    break;
    
    case "LineString":
    var path = [];
    for (var i = 0; i < geojsonGeometry.coordinates.length; i++){
      var coord = geojsonGeometry.coordinates[i];
      var ll = new google.maps.LatLng(coord[1], coord[0]);
      path.push(ll);
    }
    opts.path = path;
    googleObj = new google.maps.Polyline(opts);
    if (geojsonProperties) {
      googleObj.set("geojsonProperties", geojsonProperties);
    }
    break;
    
    case "MultiLineString":
    googleObj = [];
    for (var i = 0; i < geojsonGeometry.coordinates.length; i++){
      var path = [];
      for (var j = 0; j < geojsonGeometry.coordinates[i].length; j++){
      var coord = geojsonGeometry.coordinates[i][j];
      var ll = new google.maps.LatLng(coord[1], coord[0]);
      path.push(ll);
      }
      opts.path = path;
      googleObj.push(new google.maps.Polyline(opts));
    }
    if (geojsonProperties) {
      for (var k = 0; k < googleObj.length; k++){
      googleObj[k].set("geojsonProperties", geojsonProperties);
      }
    }
    break;
    
    case "Polygon":
    var paths = new google.maps.MVCArray;
        
    for (var i = 0; i < geojsonGeometry.coordinates.length; i++){
      var path = new google.maps.MVCArray;
      for (var j = 0; j < geojsonGeometry.coordinates[i].length; j++){
      var ll = new google.maps.LatLng(geojsonGeometry.coordinates[i][j][1], geojsonGeometry.coordinates[i][j][0]);

      var marker = new google.maps.Marker({
              position: ll,
              map: map,
              draggable: true,
              icon: new google.maps.MarkerImage(
                'http://dl.dropbox.com/u/125783/knob.png',
                      new google.maps.Size(23, 24),
                      new google.maps.Point(0,0),
                      new google.maps.Point(12,12)
              ),
              shape: {coord: [12,12,12], type: "circle"}
            });
            app.markers.push(marker);

            // capture marker in a closure
            (function(marker) {
              google.maps.event.addListener(marker, 'dragend', function() {
                // set i to the index of the marker that moved
                for (var i = 0, I = app.markers.length; i < I && app.markers[i] != marker; ++i);
                
                path.setAt(i, marker.getPosition());
                printGeoJSON()
              });
            })(marker)
                        
      path.insertAt(path.length, ll);
      }
      paths.insertAt(paths.length, path);
    }
    opts.paths = paths;
    app.googleObj = new google.maps.Polygon(opts);
    if (geojsonProperties) {
      app.googleObj.set("geojsonProperties", geojsonProperties);
    }
    
    printGeoJSON()
    
        // google.maps.event.addListener(map, 'click', function (event) {
        //   var paths = app.googleObj.getPath()
        //           paths.insertAt(paths.length, event.latLng);
        //         });
    
    break;
    
    case "MultiPolygon":
    googleObj = [];
    for (var i = 0; i < geojsonGeometry.coordinates.length; i++){
      var paths = [];
      for (var j = 0; j < geojsonGeometry.coordinates[i].length; j++){
      var path = [];
      for (var k = 0; k < geojsonGeometry.coordinates[i][j].length; k++){
        var ll = new google.maps.LatLng(geojsonGeometry.coordinates[i][j][k][1], geojsonGeometry.coordinates[i][j][k][0]);
        path.push(ll);
      }
      paths.push(path);
      }
      opts.paths = paths;
      googleObj.push(new google.maps.Polygon(opts));
    }
    if (geojsonProperties) {
      for (var k = 0; k < googleObj.length; k++){
      googleObj[k].set("geojsonProperties", geojsonProperties);
      }
    }
    break;
    
    case "GeometryCollection":
    googleObj = [];
    if (!geojsonGeometry.geometries){
      googleObj = _error("Invalid GeoJSON object: GeometryCollection object missing \"geometries\" member.");
    }else{
      for (var i = 0; i < geojsonGeometry.geometries.length; i++){
      googleObj.push(_geometryToGoogleMaps(geojsonGeometry.geometries[i], opts, geojsonProperties || null));
      }
    }
    break;
    
    default:
    googleObj = _error("Invalid GeoJSON object: Geometry object must be one of \"Point\", \"LineString\", \"Polygon\" or \"MultiPolygon\".");
  }
  
  return app.googleObj;
  
  };
  
  var _error = function( message ){
  
  return {
    type: "Error",
    message: message
  };
  
  };
  
  var obj;
  
  var opts = options || {};
  
  switch ( geojson.type ){
  
  case "FeatureCollection":
    if (!geojson.features){
    obj = _error("Invalid GeoJSON object: FeatureCollection object missing \"features\" member.");
    }else{
    obj = [];
    for (var i = 0; i < geojson.features.length; i++){
      obj.push(_geometryToGoogleMaps(geojson.features[i].geometry, opts, geojson.features[i].properties));
    }
    }
    break;
  
  case "GeometryCollection":
    if (!geojson.geometries){
    obj = _error("Invalid GeoJSON object: GeometryCollection object missing \"geometries\" member.");
    }else{
    obj = [];
    for (var i = 0; i < geojson.geometries.length; i++){
      obj.push(_geometryToGoogleMaps(geojson.geometries[i], opts));
    }
    }
    break;
  
  case "Feature":
    if (!( geojson.properties && geojson.geometry )){
    obj = _error("Invalid GeoJSON object: Feature object missing \"properties\" or \"geometry\" member.");
    }else{
    obj = _geometryToGoogleMaps(geojson.geometry, opts, geojson.properties);
    }
    break;
  
  case "Point": case "MultiPoint": case "LineString": case "MultiLineString": case "Polygon": case "MultiPolygon":
    obj = geojson.coordinates
    ? obj = _geometryToGoogleMaps(geojson, opts)
    : _error("Invalid GeoJSON object: Geometry object missing \"coordinates\" member.");
    break;
  
  default:
    obj = _error("Invalid GeoJSON object: GeoJSON object must be one of \"Point\", \"LineString\", \"Polygon\", \"MultiPolygon\", \"Feature\", \"FeatureCollection\" or \"GeometryCollection\".");
  
  }
  
  return obj;
  
};
