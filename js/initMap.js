let map; // Global variable
let drawingManager;
let isEditable = false;
var features = {
	polygons: [],
	polylines: [],
	markers: [],
};
let deleteMenu;
const gj = {
	type: "FeatureCollection",
	features: [],
};
// set default drawing styles
const styles = {
	polygon: {
		fillColor: "#555555",
		fillOpacity: 0.2,
		strokeColor: "#000000",
		strokeWeight: 2,
		clickable: true,
		editable: true,
		zIndex: 1,
	},
	polyline: {
		strokeColor: "#555555",
		strokeWeight: 3,
		clickable: true,
		editable: true,
		zIndex: 2,
	},
	marker: {
		icon: "https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_red.png",
		clickable: true,
		draggable: true,
		zIndex: 3,
		// icon: {
		// 	path: google.maps.SymbolPath.CIRCLE,
		// 	scale: 0,
		// 	labelOrigin: new google.maps.Point(75, 0),
		// 	size: new google.maps.Size(32, 32),
		// 	anchor: new google.maps.Point(16, 32),
		// },
		// label: {
		// 	text: "5409 Madison St",
		// 	color: "#C70E20",
		// 	fontWeight: "bold",
		// },
	},
};

const featureTypes = {
	polygon: "polygon",
	marker: "marker",
	point: "point", // Used in GeoJson type
	polyline: "polyline",
};

function initMap(isEditable) {
	this.isEditable = isEditable;

	var mapCanvas = document.getElementById("map");

	// Center
	var center = new google.maps.LatLng(23.56347275, 36.2476387);

	// Map Options
	var mapOptions = {
		zoom: 5,
		center: center,
		mapTypeControl: false,
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
			position: google.maps.ControlPosition.TOP_CENTER,
		},
		panControl: true,
		zoomControl: true,
		zoomControlOptions: {
			position: google.maps.ControlPosition.RIGHT_BOTTOM,
			style: google.maps.ZoomControlStyle.SMALL,
		},
		scaleControl: false,
		streetViewControl: false,
		streetViewControlOptions: {
			position: google.maps.ControlPosition.LEFT_TOP,
		},
		fullscreenControl: true,
		scrollwheel: true,
		//mapTypeId: "terrain",
		styles: [
			{
				featureType: "all",
				elementType: "labels",
				stylers: [
					{
						visibility: isEditable == true ? "on" : "off",
					},
				],
			},
			// { stylers: [{ visibility: "simplified" }] },
			// { elementType: "labels", stylers: [{ visibility: "off" }] },
		],
	};

	map = new google.maps.Map(mapCanvas, mapOptions);

	if (isEditable) {
		//initialize a common Drawing Manager object
		//we will use only one Drawing Manager
		drawingManager = new google.maps.drawing.DrawingManager({
			drawingControl: true,
			drawingControlOptions: {
				position: google.maps.ControlPosition.TOP_CENTER,
				drawingModes: [
					google.maps.drawing.OverlayType.MARKER,
					// google.maps.drawing.OverlayType.CIRCLE,
					// google.maps.drawing.OverlayType.RECTANGLE,
					google.maps.drawing.OverlayType.POLYGON,
					google.maps.drawing.OverlayType.POLYLINE,
				],
			},
			// markerOptions: { editable: true, draggable: true }, // markers created are editable by default
			// circleOptions: { editable: true }, // circles created are editable by default
			// rectangleOptions: { editable: true }, // rectangles created are editable by default
			// polygonOptions: { editable: true }, // polygons created are editable by default
			// polylineOptions: { editable: true }, // polylines created are editable by default

			markerOptions: styles.marker, // markers created are editable by default
			polygonOptions: styles.polygon, // polygons created are editable by default
			polylineOptions: styles.polyline, // polylines created are editable by default
		});

		drawingManager.setMap(map);
		deleteMenu = new DeleteMenu();

		google.maps.event.addListener(
			drawingManager,
			"overlaycomplete",
			function (event) {
				overlayClickListener(event.overlay);

				var newShape = event.overlay;
				newShape.type = event.type;

				// Disable drawingManager
				drawingManager.setDrawingMode(null);

				if (newShape.type.toLowerCase() == featureTypes.polygon) {
					var paths = event.overlay.getPaths();

					// Remove overlay from map
					event.overlay.setMap(null);

					// Create Polygon
					addFeature(featureTypes.polygon, paths);
				} else if (newShape.type.toLowerCase() == featureTypes.polyline) {
					var polylinePath = event.overlay.getPath();

					// Remove overlay from map
					event.overlay.setMap(null);

					// Create Polyline
					addFeature(featureTypes.polyline, polylinePath);
				} else if (newShape.type.toLowerCase() == featureTypes.marker) {
					var marker = event.overlay;
					var markerPosition = marker.getPosition();

					// Remove overlay from map
					event.overlay.setMap(null);

					// Create Marker
					addFeature(featureTypes.marker, markerPosition);
				}
				// createGeoJSON(gj);
			}
		);
	}

	google.charts.load("current", {
		//callback: drawChart,
		packages: ["bar", "corechart", "line", "table"],
	});
}

function addFeature(type, path) {
	switch (type) {
		case featureTypes.polygon:
			var polygon = new google.maps.Polygon(styles.polygon);

			polygon.setPaths(path);

			polygon.addListener("remove_at", function () {
				// alert("remove_at triggered");
			});

			polygon.addListener("set_at", function () {
				// console.log("set_at");
			});

			polygon.addListener("insert_at", function () {
				// console.log("insert_at");
			});

			google.maps.event.addListener(polygon, "contextmenu", (e) => {
				// Check if click was on a vertex control point
				if (e.vertex == undefined) {
					return;
				}
				deleteMenu.open(map, polygon.getPath(), e.vertex, featureTypes.polygon);
			});

			features.polygons.push(polygon);

			polygon.setMap(map);

			break;

		case featureTypes.polyline:
			var polyline = new google.maps.Polyline(styles.polyline);

			polyline.setPath(path);

			polyline.addListener("remove_at", function () {
				// alert("remove_at triggered");
			});

			polyline.addListener("set_at", function () {
				// console.log("set_at");
			});

			polyline.addListener("insert_at", function () {
				// console.log("insert_at");
			});

			google.maps.event.addListener(polyline, "contextmenu", (e) => {
				// Check if click was on a vertex control point
				if (e.vertex == undefined) {
					return;
				}
				deleteMenu.open(
					map,
					polyline.getPath(),
					e.vertex,
					featureTypes.polyline
				);
			});

			features.polylines.push(polyline);

			polyline.setMap(map);

			break;

		case featureTypes.marker:
			var marker = new google.maps.Marker(styles.marker);

			marker.setPosition(path);

			marker.addListener("rightclick", function (e) {
				marker.setMap(null);
				features.markers = features.markers.filter(isValid);
			});

			features.markers.push(marker);

			marker.setMap(map);

			break;
	}
}

function isValid(f) {
	return f.getMap() != null;
}

function overlayClickListener(overlay) {
	google.maps.event.addListener(overlay, "mouseup", function (event) {});
}

function createGeoJSONOutput(dataGeoJSON) {
	document.getElementById("output").value = formatJson(dataGeoJSON);
}

function formatJson(dataGeoJSON) {
	var json = JSON.stringify(dataGeoJSON, null, 4);
	return json;
}

function createGeoJSON() {
	// gj.features = [];

	var data = new google.maps.Data();

	// map.data.forEach((feature) => {
	// 	const geometry = feature.getGeometry();
	// 	const type = geometry.getType();
	// 	console.log(type);
	// 	if (geometry) {
	// 		// processPoints(geometry, bounds.extend, bounds);
	// 	}
	// });

	if (features.polygons.length) {
		features.polygons.forEach(function (polygon, indexPolygon) {
			var paths = polygon.getPaths();
			paths.forEach(function (path, indexPath) {
				if (path !== undefined) {
					data.add({
						properties: {
							name: "",
						},
						geometry: new google.maps.Data.Polygon([path.getArray()]),
					});
				}

				// var bounds = [];
				// path.forEach(function (coords, indexCoords) {
				// 	var point = [coords.lng(), coords.lat()];
				// 	bounds.push(point);
				// });

				// if (bounds.length) bounds.push(bounds[0]);

				// gj.features.push({
				// 	type: "Feature",
				// 	properties: {
				// 		name: "",
				// 	},
				// 	geometry: { type: "Polygon", coordinates: [bounds] },
				// });
			});
		});

		if (features.polylines.length) {
			features.polylines.forEach(function (polyline, index) {
				data.add({
					properties: {
						name: "",
					},
					geometry: new google.maps.Data.LineString(
						polyline.getPath().getArray()
					),
				});
			});
		}

		if (features.markers.length) {
			features.markers.forEach(function (marker, index) {
				data.add({
					properties: {
						name: "",
					},
					geometry: new google.maps.Data.Point(marker.getPosition()),
				});
			});
		}

		data.toGeoJson(function (json) {
			createGeoJSONOutput(json);
		});
	}
}

function exportGeoJson() {
	let value = $("#output").val();
	if (value) {
		let jsonValue = JSON.parse(value);
		let fileName = "export.geojson";

		let fileToSave = new Blob([formatJson(jsonValue)], {
			type: "application/json",
			name: fileName,
		});

		saveAs(fileToSave, fileName);
	}
}

function drawLegend(map) {
	const legends = [
		{
			name: "Shafi",
			color: "blue",
		},
		{
			name: "Hanbali",
			color: "red",
		},
		{
			name: "Hanafi",
			color: "yellow",
		},
	];

	const legend = document.getElementById("legend");

	for (const key in legends) {
		const type = legends[key];
		const name = type.name;
		const color = type.color;
		const div = document.createElement("div");
		div.innerHTML = `
		<div style="height:25px;">
			<div class="legend-color-box" style="background-color: ${color}"></div>
			<span style="line-height: 23px;">${name}</span>
		</div>`;

		legend.appendChild(div);
	}

	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);
}

function loadJson(map) {
	var infoWindow = new google.maps.InfoWindow();
	map.data.addListener("addfeature", featureAdded);
	//map.data.loadGeoJson("./json/geodata.geojson");
	$.getJSON("./json/black sea.geojson", function (json) {
		//console.log(json);
		map.data.addGeoJson(json);
	});

	featureStyle(false);

	map.data.addListener("click", function (event) {
		//let state = event.feature.getProperty("name");
		//let html = "Country: " + state; // combine state name with a label
		drawChart(event, map, infoWindow);
		//console.log(infoWindow);
		//infoWindow.setContent(html); // show the html variable in the infoWindow
		//infoWindow.setPosition(event.latLng); // anchor the infowindow at the marker
		//infoWindow.setOptions({ pixelOffset: new google.maps.Size(0, -30) }); // move the infoWindow up slightly to the top of the marker icon
		//infoWindow.open(map);
	});
}

function loadGeoJsonString(geoString) {
	try {
		map.data.addListener("addfeature", featureAdded);

		const geojson = JSON.parse(geoString);
		map.data.addGeoJson(geojson);
		featureStyle(true);
		// map.data.setStyle({
		// 	editable: true,
		// draggable: true,
		// });
	} catch (e) {
		alert("Not a GeoJSON file!");
	}
	// zoom(map);
}

function featureAdded(e) {
	var featureType = e.feature.getGeometry().getType().toLowerCase();
	switch (featureType) {
		case featureTypes.polygon:
			addFeature(
				featureTypes.polygon,
				e.feature.getGeometry().getAt(0).getArray()
			);
			break;
		case featureTypes.polyline:
			addFeature(featureTypes.polyline, e.feature.getGeometry().getArray());
			break;
		case featureTypes.point:
			addFeature(featureTypes.point, e.feature.getGeometry().get());
	}
	map.data.remove(e.feature);
}

function featureStyle(isEditable) {
	map.data.setStyle(function (feature) {
		let featureType = feature.getGeometry().getType().toLowerCase();

		if (featureType == featureTypes.polygon) {
			var fillColor = feature.getProperty("fillColor");
			var fillOpacity = feature.getProperty("fillOpacity");
			var strokeColor = feature.getProperty("strokeColor");
			var strokeWeight = feature.getProperty("strokeWeight");
			var zIndex = feature.getProperty("zIndex");
			var clickable = feature.getProperty("clickable");
			console.log(!!fillColor ? fillColor : styles.polygon.fillColor);
			return {
				fillColor: !!fillColor ? fillColor : styles.polygon.fillColor,
				fillOpacity: !!fillOpacity ? fillOpacity : styles.polygon.fillOpacity,
				strokeColor: !!strokeColor ? strokeColor : styles.polygon.strokeColor,
				strokeWeight: !!strokeWeight
					? strokeWeight
					: styles.polygon.strokeWeight,
				zIndex: !!zIndex ? !!zIndex : styles.polygon.zIndex,
				clickable: clickable == true ? true : false,
				editable: isEditable == true ? true : false,
			};
		} else if (featureType == featureTypes.polyline) {
			var strokeColor = feature.getProperty("strokeColor");
			var strokeWeight = feature.getProperty("strokeWeight");
			var zIndex = feature.getProperty("zIndex");
			var clickable = feature.getProperty("clickable");
			return {
				strokeColor: !!strokeColor ? strokeColor : styles.polyline.strokeColor,
				strokeWeight: !!strokeWeight
					? strokeWeight
					: styles.polyline.strokeWeight,
				zIndex: !!zIndex ? zIndex : styles.polyline.zIndex,
				clickable: clickable == true ? true : false,
				editable: isEditable == true ? true : false,
			};
		} else if (featureType == featureTypes.point) {
			var icon = feature.getProperty("icon");
			var label = feature.getProperty("label");
			var zIndex = feature.getProperty("zIndex");
			var clickable = feature.getProperty("clickable");
			return {
				icon: icon,
				label: label,
				zIndex: !!zIndex ? zIndex : styles.marker.zIndex,
				clickable: clickable == true ? true : false,
				draggable: isEditable == true ? true : false,
			};
		}
		return {
			editable: isEditable == true ? true : false,
		};
	});
}

/**
 * Update a map's viewport to fit each geometry in a dataset
 */
function zoom(map) {
	const bounds = new google.maps.LatLngBounds();
	map.data.forEach((feature) => {
		const geometry = feature.getGeometry();

		if (geometry) {
			processPoints(geometry, bounds.extend, bounds);
		}
	});
	map.fitBounds(bounds);
}

/**
 * Process each point in a Geometry, regardless of how deep the points may lie.
 */
function processPoints(geometry, callback, thisArg) {
	if (geometry instanceof google.maps.LatLng) {
		callback.call(thisArg, geometry);
	} else if (geometry instanceof google.maps.Data.Point) {
		callback.call(thisArg, geometry.get());
	} else {
		geometry.getArray().forEach((g) => {
			processPoints(g, callback, thisArg);
		});
	}
}

/* DOM (drag/drop) functions */
function initEvents() {
	[...document.getElementsByClassName("file")].forEach((fileElement) => {
		fileElement.addEventListener(
			"dragstart",
			(e) => {
				e.dataTransfer.setData(
					"text/plain",
					JSON.stringify(files[Number(e.target.dataset.value)])
				);
				console.log(e);
			},
			false
		);
	});
	// set up the drag & drop events
	const mapContainer = document.getElementById("map");
	mapContainer.addEventListener("dragenter", addClassToDropTarget, false);
	mapContainer.addEventListener("dragover", addClassToDropTarget, false);
	mapContainer.addEventListener("drop", handleDrop, false);
	mapContainer.addEventListener("dragleave", removeClassFromDropTarget, false);
}

function addClassToDropTarget(e) {
	e.stopPropagation();
	e.preventDefault();
	document.getElementById("map").classList.add("over");
	return false;
}

function removeClassFromDropTarget(e) {
	document.getElementById("map").classList.remove("over");
}

function handleDrop(e) {
	e.preventDefault();
	e.stopPropagation();
	removeClassFromDropTarget(e);
	const files = e.dataTransfer.files;

	if (files.length) {
		// process file(s) being dropped
		// grab the file data from each file
		for (let i = 0, file; (file = files[i]); i++) {
			const reader = new FileReader();

			reader.onload = function (e) {
				loadGeoJsonString(reader.result);
			};

			reader.onerror = function (e) {
				console.error("reading failed");
			};
			reader.readAsText(file);
		}
	} else {
		// process non-file (e.g. text or html) content being dropped
		// grab the plain text version of the data
		const plainText = e.dataTransfer.getData("text/plain");
		console.log(plainText);

		if (plainText) {
			loadGeoJsonString(plainText);
		}
	}
	// prevent drag event from bubbling further
	return false;
}

// google.maps.event.addDomListener(window, "load", initMap);

/**
 * A menu that lets a user delete a selected vertex of a path.
 */
class DeleteMenu extends google.maps.OverlayView {
	div_;
	divListener_;
	constructor() {
		super();
		this.div_ = document.createElement("div");
		this.div_.className = "delete-menu";
		this.div_.innerHTML = "Delete";
		const menu = this;
		google.maps.event.addDomListener(this.div_, "click", () => {
			menu.removeVertex();
		});
	}
	onAdd() {
		const deleteMenu = this;
		const map = this.getMap();
		this.getPanes().floatPane.appendChild(this.div_);
		// mousedown anywhere on the map except on the menu div will close the
		// menu.
		this.divListener_ = google.maps.event.addDomListener(
			map.getDiv(),
			"mousedown",
			(e) => {
				if (e.target != deleteMenu.div_) {
					deleteMenu.close();
				}
			},
			true
		);
	}
	onRemove() {
		if (this.divListener_) {
			google.maps.event.removeListener(this.divListener_);
		}
		this.div_.parentNode.removeChild(this.div_);
		// clean up
		this.set("position", null);
		this.set("path", null);
		this.set("vertex", null);
		this.set("type", null);
	}
	close() {
		this.setMap(null);
	}
	draw() {
		const position = this.get("position");
		const projection = this.getProjection();

		if (!position || !projection) {
			return;
		}
		const point = projection.fromLatLngToDivPixel(position);
		this.div_.style.top = point.y + "px";
		this.div_.style.left = point.x + "px";
	}
	/**
	 * Opens the menu at a vertex of a given path.
	 */
	open(map, path, vertex, type) {
		if (type == featureTypes.polyline) {
			if (path.getLength() == 2) return;
		} else if (type == featureTypes.polygon) {
			if (path.getLength() == 3) return;
		}
		this.set("position", path.getAt(vertex));
		this.set("path", path);
		this.set("vertex", vertex);
		this.set("type", type);
		this.setMap(map);
		this.draw();
	}
	/**
	 * Deletes the vertex from the path.
	 */
	removeVertex() {
		const path = this.get("path");
		const vertex = this.get("vertex");
		const type = this.get("type");

		if (!path || vertex == undefined) {
			this.close();
			return;
		}
		path.removeAt(vertex);
		this.close();
	}
}
