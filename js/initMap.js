let map; // Global variable
let lat_longs = new Array();
let markers = new Array();
let drawingManager;
function initMap(isEditable) {
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
		zoomControl: true,
		zoomControlOptions: {
			position: google.maps.ControlPosition.RIGHT_BOTTOM,
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
						visibility: isEditable == true ? "one" : "off",
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
					google.maps.drawing.OverlayType.CIRCLE,
					google.maps.drawing.OverlayType.RECTANGLE,
					google.maps.drawing.OverlayType.POLYGON,
					google.maps.drawing.OverlayType.POLYLINE,
				],
			},
			markerOptions: { editable: true, draggable: true }, // markers created are editable by default
			circleOptions: { editable: true }, // circles created are editable by default
			rectangleOptions: { editable: true }, // rectangles created are editable by default
			polygonOptions: { editable: true }, // polygons created are editable by default
			polylineOptions: { editable: true }, // polylines created are editable by default
		});
		drawingManager.setMap(map);
	}

	// var markers = [
	// 	["The Mosque of Ahmad Ibn Tulun", 30.028706, 31.249592],
	// 	["Abu Rizk Mosque", 30.553848, 31.518208],
	// ];

	// var marker, i;

	// for (i = 0; i < markers.length; i++) {
	// 	marker = new google.maps.Marker({
	// 		position: new google.maps.LatLng(markers[i][1], markers[i][2]),
	// 		icon: "icons/Map_icons_by_Scott_de_Jonge_mosque.svg",
	// 		map: map,
	// 	});

	// 	google.maps.event.addListener(
	// 		marker,
	// 		"click",
	// 		(function (marker, i) {
	// 			return function () {
	// 				infoWindow.setContent(markers[i][0]);
	// 				infoWindow.setPosition(event.latLng); // anchor the infoWindow at the marker
	// 				infoWindow.setOptions({
	// 					pixelOffset: new google.maps.Size(0, -10),
	// 				}); // move the infoWindow up slightly to the top of the marker icon
	// 				infoWindow.open(map, marker);
	// 			};
	// 		})(marker, i)
	// 	);
	// }
	// drawLegend(map);
	google.charts.load("current", {
		//callback: drawChart,
		packages: ["bar", "corechart", "line", "table"],
	});
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
	console.log("Json Load");
	var infoWindow = new google.maps.InfoWindow();
	//map.data.loadGeoJson("./json/geodata.geojson");
	$.getJSON("./json/data.json", function (json) {
		//console.log(json);
		map.data.addGeoJson(json);
	});

	map.data.setStyle(function (feature) {
		var name = feature.getProperty("name");
		let color = feature.getProperty("color");
		return {
			fillColor: color,
			strokeWeight: 1,
		};
	});

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

// google.maps.event.addDomListener(window, "load", initMap);
