var flag = false;
var NameArray = [];
var LocationArray = [];
var ContactInfoArray = [];
var marker2;
var infowindow2;
var latitude;
var longitude;
var Markers = [];
var map;
let infowindow;
var directionsService;
var directionsRenderer;
function randomImg() {
    var images = ["gophers-mascot.png", "Shepherd.jpg", "morrill_140522_2592.jpg", "keller.jpg"];
    var rnd = Math.floor(Math.random() * images.length);
    if (rnd == 0) {
            rnd = 1;
    }
    var theimage = document.getElementById("image");
    theimage.src = images[rnd];
}
function rotateImg() {
	if (flag === true) {
		document.getElementById("image").setAttribute("style", "animation-play-state: paused;");
			flag = false;
		} else {
		document.getElementById("image").setAttribute("class", "rotate");
		document.getElementById("image").setAttribute("style", "animation-play-state: running;");
  		flag = true;
  	}
}
function contactInfo() {
	var table = document.getElementById("contactsTable");
	for (var i=1; i<table.rows.length; i++) {
		var currRowCells = table.rows.item(i).cells;
		for(var j=0; j<currRowCells.length; j++){
			if (j === 0){
				NameArray.push(currRowCells[j].innerHTML);
			}
			else if (j === 2){
				LocationArray.push(currRowCells[j].innerHTML);
			}
			else if (j === 3){
				ContactInfoArray.push(currRowCells[j].innerHTML);
			}
		}
	}
}
function initMap() {
	contactInfo();
	getLocation();
	directionsService = new google.maps.DirectionsService();
		directionsRenderer = new google.maps.DirectionsRenderer();
	var prop= {
	  center:new google.maps.LatLng(44.9727, -93.23540000000003),
	  zoom:14,
	};
	map = new google.maps.Map(document.getElementById("googleMap"),prop);
	var geocoder = new google.maps.Geocoder(); // Create a geocoder object
	for (var i=0; i<LocationArray.length; i++) {
		geocodeAddress(geocoder, map, LocationArray[i], NameArray[i], ContactInfoArray[i]);  
	}
	directionsRenderer.setMap(map);
}
function geocodeAddress(geocoder, resultsMap, address, name, cinfo) { //function extracted from geocoder_ex.html
	geocoder.geocode({'address': address}, function(results, status) {
		if (status === google.maps.GeocoderStatus.OK) {
				resultsMap.setCenter(results[0].geometry.location);
				marker2 = new google.maps.Marker({
							map: resultsMap,
							position: results[0].geometry.location,
							title:address,
							icon: 'http://maps.google.com/mapfiles/kml/pushpin/ltblu-pushpin.png'
							});
				Markers.push(marker2);
				infowindow2 = new google.maps.InfoWindow({
							content: ("<p>" + name + "<br />" + cinfo + "<br />" + address + "</p>")
							});
				google.maps.event.addListener(marker2, 'click', createWindow(resultsMap,infowindow2, marker2));
		} else {
				alert('Geocode was not successful for the following reason: ' + status);
		} //end if-then-else
	}); // end call to geocoder.geocode function
} // end geocodeAddress function

// Function to return an anonymous function that will be called when the rmarker created in the 
// geocodeAddress function is clicked	
function createWindow(rmap, rinfowindow, rmarker){
          return function(){
			rinfowindow.open(rmap, rmarker);
        }
}//end create (info) window
function other() {
	if (document.getElementById('typeofplace').value === 'other') {
		document.getElementById('keywords').removeAttribute('disabled');
	}
}
function search(typeofloc, rad) {
	directionsRenderer.setMap(null);
	for (var i = 0; i<Markers.length; i++) {
		Markers[i].setMap(null);
	}
	var pyrmont = new google.maps.LatLng(latitude,longitude);
	map.setCenter(pyrmont);
	var request = {
			location: pyrmont,
			radius: rad,
			type: typeofloc
		};
	if (typeofloc == 'other') {
		var keywor = document.getElementById("keywords").value;
		request = {
			location: pyrmont,
			radius: rad,
			keyword: keywor
		};
	}
	else{
		request = {
			location: pyrmont,
			radius: rad,
			type: typeofloc
		};
	}
	var service8 = new google.maps.places.PlacesService(map);
	service8.nearbySearch(request, callback);
}
function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
    	for (var i = 0; i < results.length; i++) {
	    	createMarker(results[i]);
    	}
    }
} // got this code from google maps
function createMarker(place) {
  infowindow = new google.maps.InfoWindow();
  if (!place.geometry || !place.geometry.location) return;
  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
  });
  Markers.push(marker);
  google.maps.event.addListener(marker, "click", () => {
    infowindow.setContent("<p>" + place.name + "<br />" + place.vicinity + "</p>");
    infowindow.open(map, marker);
  });
} //got this code from google maps
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(setPosition);
  }
}
function setPosition(position) {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
}
function calcRoute() {
  directionsRenderer.setMap(map);
  for (var i = 0; i<Markers.length; i++) {
		Markers[i].setMap(null);
	}
  var radios = document.getElementsByName("mode");
  var source = new google.maps.LatLng(latitude, longitude);
  var destinat = document.getElementById("destination").value;
  for (var i = 0; i < radios.length; i++) {
	if (radios[i].checked) {
	  var selectedMode = radios[i].value;
	  break;
  	}
  }
  var request = {
      origin: source,
      destination: destinat,
      travelMode: google.maps.TravelMode[selectedMode]
  };
  directionsService.route(request, function(response, status) {
    if (status == 'OK') {
      directionsRenderer.setDirections(response);
      console.log("here");
      directionsRenderer.setPanel(document.getElementById('directionsPanel'));
    }
  });
}