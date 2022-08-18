// This example uses the Google Maps JavaScript API's Data layer
// to create a rectangular polygon with 2 holes in it.
function initMap() {
	const map = new google.maps.Map(document.getElementById("map"), {
		zoom: 5,
		center: { lat: 33.2232, lng: 43.6793 },
	});
	// Define the LatLng coordinates for the outer path.
	const outerCoords = [
		{ lat: -32.364, lng: 153.207 },
		{ lat: -35.364, lng: 153.207 },
		{ lat: -35.364, lng: 158.207 },
		{ lat: -32.364, lng: 158.207 },
	];

	map.data.add({
		geometry: new google.maps.Data.Polygon([outerCoords]),
	});
}
