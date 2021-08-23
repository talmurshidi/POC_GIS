let map; // Global variable
let drawingManager;
let infoWindow;
var isEditable = false;
var features = {
	polygons: [],
	multiPolygons: [],
	multiLineString: [],
	polylines: [],
	markers: [],
};
let deleteMenu;
const gj = {
	type: "FeatureCollection",
	features: [],
};
const constants = {
	name: "name",
	fill: "fill",
	stroke: "stroke",
	zIndex: "z-index",
	fillOpacity: "fill-opacity",
	strokeWidth: "stroke-width",
	icon: "icon",
	label: "label",
	fontSize: "fontSize",
	text: "text",
	color: "color",
	fontWeight: "fontWeight",
	iconPath: "path",
	iconScale: "scale",
	iconLabelOrigin: "labelOrigin",
	iconSize: "size",
	iconAnchor: "anchor",
};
// set default drawing styles
const styles = {
	polygon: {
		fillColor: "#555555",
		fillOpacity: 0.2,
		strokeColor: "#000000",
		strokeWeight: 2,
		clickable: true,
		editable: false,
		zIndex: 1,
	},
	polyline: {
		strokeColor: "#555555",
		strokeWeight: 2,
		strokeOpacity: 1,
		clickable: true,
		editable: false,
		zIndex: 2,
	},
	marker: {
		icon: "https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_red.png",
		clickable: true,
		draggable: false,
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
// set default drawing manager styles
const drawingStyles = {
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
		strokeColor: "red",
		strokeWeight: 2,
		strokeOpacity: 1,
		clickable: true,
		editable: true,
		zIndex: 2,
	},
	marker: styles.marker,
};
// Features types constants
const featureTypes = {
	polygon: "polygon",
	multiPolygon: "multipolygon",
	multiLineString: "multilinestring",
	marker: "marker",
	point: "point", // Used in GeoJson type
	polyline: "polyline",
	lineString: "linestring", // Used in GeoJson type
};

// Initialize map
function initMap(isEditableShape) {
	isEditable = isEditableShape;
	var mapCanvas = document.getElementById("map");

	//InfoWindow
	infoWindow = new google.maps.InfoWindow();

	// Center
	var center = new google.maps.LatLng(23.56347275, 36.2476387);

	// Map Options
	var mapOptions = {
		zoom: 4,
		center: center,
		mapTypeControl: true,
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
			// style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
			position: google.maps.ControlPosition.RIGHT_TOP,
		},
		// rotateControl: true,
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
		fullScreenControl: true,
		fullScreenControlOptions: {},
		scrollwheel: true,
		// options: {
		// 	gestureHandling: "greedy",
		// },
		// mapTypeId: "hybrid",
		// styles: [
		// 	{
		// 		featureType: "all",
		// 		elementType: "labels.icon.text",
		// 		stylers: [
		// 			{
		// 				visibility: isEditable == true ? "on" : "off",
		// 			},
		// 		],
		// 	},
		// 	// { stylers: [{ visibility: "simplified" }] },
		// 	// { elementType: "labels", stylers: [{ visibility: "off" }] },
		// ],
	};

	if (isEditableShape == true) {
		mapOptions["mapTypeId"] = "roadmap";
	} else {
		mapOptions["mapTypeControl"] = false;
		// mapOptions["zoomControl"] = true;
	}

	var mapStyles = [
		// {
		// 	featureType: "all",
		// 	elementType: "labels",
		// 	stylers: [{ visibility: "off" }],
		// },
		{
			featureType: "administrative",
			elementType: "labels",
			stylers: [{ visibility: "off" }],
		},
		{
			featureType: "landscape",
			elementType: "labels",
			stylers: [{ visibility: "off" }],
		},
		{
			featureType: "poi",
			elementType: "labels",
			stylers: [{ visibility: "off" }],
		},
		{
			featureType: "road",
			elementType: "labels",
			stylers: [{ visibility: "off" }],
		},
		{
			featureType: "transit",
			elementType: "labels",
			stylers: [{ visibility: "off" }],
		},
		// {
		// 	featureType: "water",
		// 	elementType: "labels",
		// 	stylers: [{ visibility: "off" }],
		// },
	];
	mapOptions["styles"] = mapStyles;

	map = new google.maps.Map(mapCanvas, mapOptions);

	if (isEditableShape) {
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

			markerOptions: drawingStyles.marker, // markers created are editable by default
			polygonOptions: drawingStyles.polygon, // polygons created are editable by default
			polylineOptions: drawingStyles.polyline, // polylines created are editable by default
		});

		drawingManager.setMap(map);
		deleteMenu = new DeleteMenu();

		// Add drawing manager listener to handle completed overlay
		drawingManagerListener();
	}

	google.charts.load("current", {
		//callback: drawChart,
		packages: ["bar", "corechart", "line", "table"],
	});
}

function drawingManagerListener() {
	//overlaycomplete listener
	google.maps.event.addListener(
		drawingManager,
		"overlaycomplete",
		function (event) {
			// overlayClickListener(event.overlay);

			var newShape = event.overlay;
			newShape.type = event.type;

			// Disable drawingManager
			drawingManager.setDrawingMode(null);

			if (newShape.type.toLowerCase() == featureTypes.polygon) {
				var paths = event.overlay.getPaths();

				// Remove overlay from map
				event.overlay.setMap(null);

				// Create Polygon
				addFeature(featureTypes.polygon, paths, null, true);
			} else if (newShape.type.toLowerCase() == featureTypes.multiPolygon) {
				var paths = event.overlay.getPaths();

				// Remove overlay from map
				event.overlay.setMap(null);

				// Create Polygon
				addFeature(featureTypes.multiPolygon, paths, null, true);
			} else if (newShape.type.toLowerCase() == featureTypes.polyline) {
				var polylinePath = event.overlay.getPath();

				// Remove overlay from map
				event.overlay.setMap(null);

				// Create Polyline
				addFeature(featureTypes.polyline, polylinePath, null, true);
			} else if (newShape.type.toLowerCase() == featureTypes.marker) {
				var marker = event.overlay;
				var markerPosition = marker.getPosition();

				// Remove overlay from map
				event.overlay.setMap(null);

				// Create Marker
				addFeature(featureTypes.marker, markerPosition, null, true);
			}
			// createGeoJSON(gj);
		}
	);
}

function addFeature(type, path, properties, isEditable) {
	if (properties == null || typeof properties == undefined) properties = {};
	var style = {};
	switch (type) {
		case featureTypes.multiPolygon:
		case featureTypes.polygon:
			if (Object.keys(properties).length) {
				var fillColor = getProperty(properties, constants.fill);
				var fillOpacity = getProperty(properties, constants.fillOpacity);
				var strokeColor = getProperty(properties, constants.stroke);
				var strokeWeight = getProperty(properties, constants.strokeWidth);
				var zIndex = getProperty(properties, constants.zIndex);
				style = {
					fillColor:
						typeof fillColor !== "undefined"
							? fillColor
							: styles.polygon.fillColor,
					fillOpacity:
						typeof fillOpacity !== "undefined"
							? fillOpacity
							: styles.polygon.fillOpacity,
					strokeColor:
						typeof strokeColor !== "undefined"
							? strokeColor
							: styles.polygon.strokeColor,
					strokeWeight:
						typeof strokeWeight !== "undefined"
							? strokeWeight
							: styles.polygon.strokeWeight,
					zIndex:
						typeof zIndex !== "undefined" ? zIndex : styles.polygon.zIndex,
					clickable: true,
					editable: false,
				};
			} else {
				style = styles.polygon;
			}

			var polygon = new google.maps.Polygon(style);

			var paths = [];

			if (type == featureTypes.polygon) {
				path.forEach(function (elements, index) {
					paths.push(elements.getArray());
				});
			} else {
				path.forEach(function (elements, index) {
					elements.getArray().forEach(function (points, index) {
						paths.push(points.getArray());
					});
				});
			}

			polygon.setPaths(paths);

			if (isEditable) {
				polygon.addListener("click", function (event) {
					var isEditable = this.getEditable();
					this.setEditable(!isEditable);
				});
			}
			// polygon.addListener("remove_at", function () {
			// 	// alert("remove_at triggered");
			// });

			// polygon.addListener("set_at", function () {
			// 	// console.log("set_at");
			// });

			// polygon.addListener("insert_at", function () {
			// 	// console.log("insert_at");
			// });

			google.maps.event.addListener(polygon, "contextmenu", (e) => {
				// Check if click was on a vertex control point
				if (e.vertex == undefined) {
					return;
				}
				deleteMenu.open(map, polygon.getPath(), e.vertex, featureTypes.polygon);
			});

			var polygonShape = {
				shape: polygon,
				properties: properties,
			};

			features.polygons.push(polygonShape);

			polygon.setMap(map);

			break;

		// case featureTypes.multiLineString:
		case featureTypes.lineString:
		case featureTypes.polyline:
			if (Object.keys(properties).length) {
				var strokeColor = getProperty(properties, constants.stroke);
				var strokeWeight = getProperty(properties, constants.strokeWidth);
				var zIndex = getProperty(properties, constants.zIndex);
				style = {
					strokeColor:
						typeof strokeColor !== "undefined"
							? strokeColor
							: styles.polyline.strokeColor,
					strokeWeight:
						typeof strokeWeight !== "undefined"
							? strokeWeight
							: styles.polyline.strokeWeight,
					zIndex:
						typeof zIndex !== "undefined" ? zIndex : styles.polyline.zIndex,
					clickable: true,
					editable: false,
				};
			} else {
				style = styles.polyline;
			}

			var polyline = new google.maps.Polyline(style);

			polyline.setPath(path);

			if (isEditable) {
				polyline.addListener("click", function (event) {
					var isEditable = this.getEditable();
					this.setEditable(!isEditable);
				});
			}

			// polyline.addListener("remove_at", function () {
			// 	// alert("remove_at triggered");
			// });

			// polyline.addListener("set_at", function () {
			// 	// console.log("set_at");
			// });

			// polyline.addListener("insert_at", function () {
			// 	// console.log("insert_at");
			// });

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

			var polylineShape = {
				shape: polyline,
				properties: properties,
			};

			features.polylines.push(polylineShape);

			polyline.setMap(map);

			break;

		case featureTypes.point:
		case featureTypes.marker:
			if (Object.keys(properties).length) {
				var icon = getProperty(properties, constants.icon);
				var label = getProperty(properties, constants.label);
				var zIndex = getProperty(properties, constants.zIndex);
				style = {
					icon: icon,
					label: label,
					zIndex: typeof zIndex !== "undefined" ? zIndex : styles.marker.zIndex,
					clickable: true,
					draggable: false,
				};
			} else {
				style = styles.marker;
			}

			var marker = new google.maps.Marker(styles.marker);

			marker.setPosition(path);

			if (isEditable) {
				marker.addListener("click", function (event) {
					var isDraggable = this.getDraggable();
					this.setDraggable(!isDraggable);
				});
			}

			marker.addListener("rightclick", function (e) {
				marker.setMap(null);
				features.markers = features.markers.shape.filter(isValid);
			});

			var markerShape = {
				shape: marker,
				properties: properties,
			};

			features.markers.push(markerShape);

			marker.setMap(map);

			break;
	}
}

function overlayClickListener(overlay) {
	google.maps.event.addListener(overlay, "mouseup", function (event) {});
}

function addPropertyToJSON(type, properties) {
	if (!properties.hasOwnProperty(constants.name)) {
		properties[constants.name] = "";
	}

	if (type == featureTypes.polygon || type == featureTypes.multiPolygon) {
		if (!properties.hasOwnProperty(constants.stroke)) {
			properties[constants.stroke] = styles.polygon.strokeColor;
		}
		if (!properties.hasOwnProperty(constants.fill)) {
			properties[constants.fill] = styles.polygon.fillColor;
		}
	} else if (
		type == featureTypes.polyline ||
		type == featureTypes.lineString ||
		type == featureTypes.multiLineString
	) {
		if (!properties.hasOwnProperty(constants.stroke)) {
			properties[constants.stroke] = styles.polyline.strokeColor;
		}
	}
}

function getProperty(properties, propertyName) {
	return properties[propertyName];
}

function isValid(f) {
	return f.getMap() != null;
}

function createGeoJSONOutput(dataGeoJSON) {
	document.getElementById("output").value = formatJson(dataGeoJSON);
	document.getElementById("create-json-btn").disabled = false;
}

function clearGeoJSONOutput() {
	document.getElementById("create-json-btn").disabled = true;
	document.getElementById("output").value = "";
}

function formatJson(dataGeoJSON) {
	var json = JSON.stringify(dataGeoJSON, null, 2);
	return json;
}

function exportGeoJson() {
	let value = $("#output").val();
	if (value) {
		let jsonValue = JSON.parse(value);
		let fileName = "export.geojson";

		let fileToSave = new Blob([JSON.stringify(jsonValue)], {
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

function loadGeoJsonStringDisplaying(geoJson) {
	map.data.addListener("addfeature", featureAdded);
	//map.data.loadGeoJson("./json/geodata.geojson");

	$.getJSON("./json/sample.geojson", function (json) {
		// var geojson = JSON.parse(JSON.stringify(json));

		map.data.addGeoJson(json);
	});

	featureStyle(false);

	// map.data.addListener("click", function (event) {
	// 	//let state = event.feature.getProperty("name");
	// 	//let html = "Country: " + state; // combine state name with a label
	// 	drawChart(event, map, infoWindow);
	// 	//console.log(infoWindow);
	// 	//infoWindow.setContent(html); // show the html variable in the infoWindow
	// 	//infoWindow.setPosition(event.latLng); // anchor the infowindow at the marker
	// 	//infoWindow.setOptions({ pixelOffset: new google.maps.Size(0, -30) }); // move the infoWindow up slightly to the top of the marker icon
	// 	//infoWindow.open(map);
	// });
}

function loadGeoJsonStringEditing(geoString) {
	try {
		map.data.addListener("addfeature", featureAdded);

		const geojson = JSON.parse(geoString);
		map.data.addGeoJson(geojson);
		featureStyle(true);
	} catch (e) {
		console.log(e);
		alert("Not a GeoJSON file!");
	}
	// zoom(map);
}

function featureAdded(e) {
	var featureType = e.feature.getGeometry().getType().toLowerCase();
	var properties = {};
	e.feature.forEachProperty(function (value, property) {
		// console.log(property, ":", value);
		properties[property] = value;
	});
	switch (featureType) {
		case featureTypes.polygon:
			addFeature(
				featureTypes.polygon,
				e.feature.getGeometry().getArray(),
				properties,
				isEditable
			);
			break;
		case featureTypes.multiPolygon:
			addFeature(
				featureTypes.multiPolygon,
				e.feature.getGeometry().getArray(),
				properties,
				isEditable
			);
			break;
		case featureTypes.polyline:
		case featureTypes.lineString:
			addFeature(
				featureTypes.polyline,
				e.feature.getGeometry().getArray(),
				properties,
				isEditable
			);
			break;
		// case featureTypes.multiLineString:
		// 	addFeature(
		// 		featureTypes.multiLineString,
		// 		e.feature.getGeometry().getArray(),
		// 		properties,
		// 		isEditable
		// 	);
		// 	break;
		case featureTypes.point:
		case featureTypes.marker:
			addFeature(
				featureTypes.point,
				e.feature.getGeometry().get(),
				properties,
				isEditable
			);
	}
	map.data.remove(e.feature);
}

function createGeoJSON() {
	// gj.features = [];

	// Clear GeoJSON output teat
	clearGeoJSONOutput();

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
			if (polygon.shape) {
				var paths = polygon.shape.getPaths();
				var properties = polygon.properties;
				addPropertyToJSON(featureTypes.polygon, properties);
				paths.forEach(function (path, indexPath) {
					if (typeof path !== "undefined") {
						data.add({
							properties: properties,
							geometry: new google.maps.Data.Polygon([path.getArray()]),
						});
					}
				});
			}
		});
	}

	if (features.polylines.length) {
		features.polylines.forEach(function (polyline, index) {
			if (polyline.shape) {
				var polylineShape = polyline.shape;
				var properties = polyline.properties;
				addPropertyToJSON(featureTypes.polyline, properties);
				data.add({
					properties: properties,
					geometry: new google.maps.Data.LineString(
						polylineShape.getPath().getArray()
					),
				});
			}
		});
	}

	if (features.markers.length) {
		features.markers.forEach(function (marker, index) {
			if (marker.shape) {
				var markerShape = marker.shape;
				var properties = marker.properties;
				addPropertyToJSON(featureTypes.marker, properties);
				data.add({
					properties: properties,
					geometry: new google.maps.Data.Point(markerShape.getPosition()),
				});
			}
		});
	}

	data.toGeoJson(function (json) {
		createGeoJSONOutput(json);
	});
}

function output(obj) {
	console.log(formatJson(obj));
}

function featureStyle(isEditable) {
	map.data.setStyle(function (feature) {
		let featureType = feature.getGeometry().getType().toLowerCase();

		if (
			featureType == featureTypes.polygon ||
			featureType == featureTypes.multiPolygon
		) {
			var fillColor = feature.getProperty(constants.fill);
			var fillOpacity = feature.getProperty(constants.fillOpacity);
			var strokeColor = feature.getProperty(constants.stroke);
			var strokeWeight = feature.getProperty(constants.strokeWidth);
			var zIndex = feature.getProperty(constants.zIndex);
			return {
				fillColor:
					typeof fillColor !== "undefined"
						? fillColor
						: styles.polygon.fillColor,
				fillOpacity:
					typeof fillOpacity !== "undefined"
						? fillOpacity
						: styles.polygon.fillOpacity,
				strokeColor:
					typeof strokeColor !== "undefined"
						? strokeColor
						: styles.polygon.strokeColor,
				strokeWeight:
					typeof strokeWeight !== "undefined"
						? strokeWeight
						: styles.polygon.strokeWeight,
				zIndex: typeof zIndex !== "undefined" ? zIndex : styles.polygon.zIndex,
				clickable: true,
				editable: false,
			};
		} else if (
			featureType == featureTypes.polyline ||
			featureType == featureTypes.lineString
		) {
			var strokeColor = feature.getProperty(constants.stroke);
			var strokeWeight = feature.getProperty(constants.strokeWidth);
			var zIndex = feature.getProperty(constants.zIndex);
			return {
				strokeColor:
					typeof strokeColor !== "undefined"
						? strokeColor
						: styles.polyline.strokeColor,
				strokeWeight:
					typeof strokeWeight !== "undefined"
						? strokeWeight
						: styles.polyline.strokeWeight,
				zIndex: typeof zIndex !== "undefined" ? zIndex : styles.polyline.zIndex,
				clickable: true,
				editable: false,
			};
		} else if (featureType == featureTypes.point) {
			var icon = feature.getProperty(constants.icon);
			var label = feature.getProperty(constants.label);
			var zIndex = feature.getProperty(constants.zIndex);
			return {
				icon: icon,
				label: label,
				zIndex: !!zIndex ? zIndex : styles.marker.zIndex,
				clickable: true,
				draggable: false,
			};
		}
		return {
			editable: false,
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
				loadGeoJsonStringEditing(reader.result);
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
			loadGeoJsonStringEditing(plainText);
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

/**
 * Creates an array of coordinates from the content of the MultiGeometryCoordinates node of the GADM database.
 */
function buildCoordinatesArrayFromString(MultiGeometryCoordinates) {
	var finalData = [];
	var grouped = MultiGeometryCoordinates.split("\n");

	grouped.forEach(function (item, i) {
		let a = item.trim().split(",");

		finalData.push({
			lng: parseFloat(a[0]),
			lat: parseFloat(a[1]),
		});
	});

	return finalData;
}
