function drawChart(event, map, infoWindow) {
	let country = event.feature.getProperty("name");
	// Create the data table.
	var data = google.visualization.arrayToDataTable([
		[" ", "Shafai", "Hanbali", "Hanafi"],
		[country, 1000, 400, 200],
	]);

	// Set chart options
	var options = {
		height: 200,
		width: 200,
		fontSize: 16,
		legend: { position: "none" },
		chart: {
			//title: "Country: " + country,
			//subtitle: "Sales, Expenses, and Profit: 2014-2017",
		},
		// Colors only the chart area, with opacity
		// chartArea: {
		// 	backgroundColor: {
		// 		fill: "transparent",
		// 		fillOpacity: 100,
		// 	},
		// },
		// Colors the entire chart area, simple version
		// backgroundColor: '#FF0000',
		// Colors the entire chart area, with opacity
		// backgroundColor: {
		// 	fill: "transparent",
		// 	fillOpacity: 100,
		// },
	};

	var node = document.createElement("div"),
		infoWindow = new google.maps.InfoWindow(),
		chart = new google.charts.Bar(node);

	chart.draw(data, google.charts.Bar.convertOptions(options));
	infoWindow.close();
	infoWindow.setContent(node);
	infoWindow.setPosition(event.latLng); // anchor the infoWindow at the marker
	infoWindow.setOptions({ pixelOffset: new google.maps.Size(0, -20) }); // move the infoWindow up slightly to the top of the marker icon
	infoWindow.open(map);
	//return infoWindow;
}
