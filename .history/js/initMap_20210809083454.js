var map; // Global variable
$(document).ready(function () {
	function initMap() {
		var infoWindow = new google.maps.InfoWindow();
		var mapCanvas = document.getElementById("map");

		// Center
		var center = new google.maps.LatLng(23.56347275, 36.2476387);

		// Map Options
		var mapOptions = {
			zoom: 5,
			center: center,
			scrollwheel: false,
			//mapTypeId: "terrain",
			mapTypeControl: false,
			styles: [
				{
					featureType: "all",
					elementType: "labels",
					stylers: [
						{
							visibility: "off",
						},
					],
				},
				// { stylers: [{ visibility: "simplified" }] },
				// { elementType: "labels", stylers: [{ visibility: "off" }] },
			],
		};

		map = new google.maps.Map(mapCanvas, mapOptions);

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
	}
	drawLegend(map);
	google.charts.load("current", {
		//callback: drawChart,
		packages: ["bar", "corechart", "line", "table"],
	});
	/*google.charts.load("current", {
				packages: ["geochart"],
				// Note: you will need to get a mapsApiKey for your project.
				// See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
				mapsApiKey: "AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY",
			});*/
	$(initMap);
});

function drawLegend(map) {
	console.log("Called");
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
