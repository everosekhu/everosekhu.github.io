$(function () {
 	// initialize marker info window
	info_window = new google.maps.InfoWindow();

    // get coordinates of location clicked on the map
    google.maps.event.addListener(map, 'click', function(event) {
    	var new_location = {lat: event.latLng.lat(), lng: event.latLng.lng()};
    	removeMarkers();
    	removeCircle();
    	showCircle(new_location);

    	// display # of records found within the circle
		document.getElementById("found").innerHTML = countFound(new_location);		            
	});

    // Create a <script> tag
	var script = document.createElement('script');

	// get mock data
    script.src = 'assets/js/mock_data.js';
    document.getElementsByTagName('head')[0].appendChild(script);
	
	// get user current location
	getLocation();

 	// show markers in map
    window.mock_data_callback = function(results) {
    	// check if we have results
    	if(results.data.length > 0) {

    		$('#select_destination').append('<option>Select Destination</option>');
    		mock_data = results.data;

			// sort mock data by name    		
		    mock_data = mock_data.sort(function(a, b) {
		        return (a['name'] > b['name']) ? 1 : ((a['name'] < b['name']) ? -1 : 0);
		    });

		    // show analytics
		   // analytics_data(mock_data);
    		 

	        for (var i = 0; i < mock_data.length; i++) {

	        	// get restaurant types
				if( filter_types.indexOf(mock_data[i].type) < 0) {
					filter_types.push(mock_data[i].type);
				}
	        	
	        	// add marker to map
        		createMarker(mock_data[i]);

        		// set option content
                $('#select_destination').append(
                	'<option'
                		+ ' data-lat="' + mock_data[i].geometry.coordinates.lat
                		+ '" data-lng="' + mock_data[i].geometry.coordinates.lng
                		+ '">'
                		+ mock_data[i].name 
                	+ '</option>');
	        }

	        // show filter UI
			showFilterType();

			// add event for filter
   			$( 'input[name="filter_restaurant"]' ).click(function() {
	  			filterRestaurants(this);
			});

	    }

	    // display # of results found
    	document.getElementById("found").innerHTML = results.data.length;
    }
			
	// listener for direction from user current location to selected destination
	google.maps.event.addDomListener(document.getElementById('get_direction'), 'click', showRoute);    

});


// plots the marker in the map
function createMarker(place) {

	// get default pin image
	var pin_image = getDefaultPinImage();

    var coords = place.geometry.coordinates;
    var latLng = new google.maps.LatLng(coords.lat, coords.lng);
    var marker = new google.maps.Marker({
        map : map,
        position : latLng,
        icon: pin_image,
    });

    // check if we have a rating
    var rating = place.rating;
    if(rating == undefined) {
    	rating = '';
    }

    // format specialty
    var specialty = '';
    if(place.specialty.length > 0) {
    	specialty = place.specialty.join();
    }


    // create info window content   
    var info_window_content = '<div class="info_content">'
        + '<h3>' + place.name + '</h3>'
        + '<div>'
        	+ 	'<b>Location:</b> ' + place.vicinity
        	+ 	'<br><b>Type:</b> ' + place.type
        	+ 	'<br><b>Specialty:</b> ' + specialty
        	+ 	'<br><b>Visits:</b> ' + place.visits
        	+ 	'<br><b>Rating:</b> ' + rating
        	+ 	'<br>'
        + '</div>' +
    '</div>';

    google.maps.event.addListener(marker, 'click', function() {
        info_window.setContent(info_window_content);
        info_window.open(map, this);
       
    });

    markers_arr.push(marker);			 
}

 // removes the marker in the map
function removeMarkers() {
	if(markers_arr.length > 0) {
    	for(var i in markers_arr) {
		   markers_arr[i].setMap(null);
		}
	}
}

// adds a circle around a selected area
function showCircle(location) {
	clearRoutes();

	cityCircle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        center: location,
        radius: radius
    });
}

// removes the existing circles
function removeCircle() {
	// initially no circle around the city is set
	// remove circle only if it is set
	if(cityCircle != undefined) {
    	cityCircle.setMap(null);
    }
}

// add direction from current location to destination restaurant
function showRoute() {
	// get currently selected dstination
	getDestinationLatLng();

	document.getElementById('error_container').style.display = 'none';
	document.getElementById('error_container').innerHTML = '';
	
	// get current location coordinates
	var current_location_lat = $("#user_current_location").attr('data-lat');
	var current_location_lng = $("#user_current_location").attr('data-lng');

	// check if we have a valid start and end points
	if(current_location_lat == null || current_location_lat == undefined) {
		document.getElementById('error_container').style.display = 'block';
		document.getElementById('error_container').innerHTML = 'Unable to find user location.';

		return;
	} 

	if(destination_lat == null) {
		document.getElementById('error_container').style.display = 'block';
		document.getElementById('error_container').innerHTML = 'Please select destination.';

		return;
	}

	removeMarkers();
	removeCircle();
	
	var start = new google.maps.LatLng(current_location_lat, current_location_lng);
	var end = new google.maps.LatLng(destination_lat, destination_lng);
	var selected_travel_mode = $('#mode_type').val();
	var bounds = new google.maps.LatLngBounds();
    bounds.extend(start);
    bounds.extend(end);
    map.fitBounds(bounds);
    
    var request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode[selected_travel_mode]
    };
    
    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            directionsDisplay.setMap(map);

            // display # of records found within the circle
			$('#found').html(mock_data.length);
        } else {console.log(status);
            document.getElementById('error_container').style.display = 'block';
    		document.getElementById('error_container').innerHTML = 'Please select valid destination.';

    		return false;
        }
    });

}

// Clear past routes
function clearRoutes() {
    if (directionsDisplay != null) {
        directionsDisplay.setMap(null);
    }
}

// get coordinates of selected destination
function getDestinationLatLng() {
	var select_des = document.getElementById("select_destination");
		destination_lat = select_des.options[select_des.selectedIndex].getAttribute('data-lat');
		destination_lng = select_des.options[select_des.selectedIndex].getAttribute('data-lng');
}

// get default Pin Image
function getDefaultPinImage() {
	// set default pin
	var pin_color = "fffb14";
	var pin_image = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pin_color,
        new google.maps.Size(21, 34),
        new google.maps.Point(0,0),
        new google.maps.Point(10, 34)
    );

    return pin_image;
}

// counts the number of restaurants within the circle
function countFound(location) {
	var num_found = 0;
	var _pCord, distance;
	var _kCord = new google.maps.LatLng(location.lat, location.lng);


	// loop through all mock data
	// compute distance and get only those within the radius
	for (var i = 0; i < mock_data.length; i++) {
		createMarker(mock_data[i]);
		_pCord = new google.maps.LatLng(mock_data[i].geometry.coordinates.lat, mock_data[i].geometry.coordinates.lng);

		// compute the distance
		distance = google.maps.geometry.spherical.computeDistanceBetween(_pCord, _kCord);

		if(distance <= radius) {
			num_found++;
		}
	}

	return num_found;
}

// filter restaurants
function filterRestaurants(obj) {
	removeMarkers();
	removeCircle();
	clearRoutes();
	
	// append filter to selected filters
	var index = selected_filters.indexOf(obj.value);
	if( index < 0) {
		selected_filters.push(obj.value);
	} else {
		// remove type from filter
		selected_filters.splice(index, 1);
	}

	// loop through all mock data
	var count = 0;
	for (var i = 0; i < mock_data.length; i++) {
		// get only restos matching the selected type
		//if(mock_data[i].type == obj.value) {
		if(selected_filters.indexOf(mock_data[i].type) > -1) {
			createMarker(mock_data[i]);
			count++;
		}
	}

	// display # of results found
	document.getElementById("found").innerHTML = count;
}

// shows the options to filter restaurants
function showFilterType() {
	// set option values
	var options = '';

	filter_types.sort();
	$.each( filter_types, function( key, value ) {

		options += '<li>'
			+ '<input type="checkbox" name="filter_restaurant" value="'
				+ value + '">'
			+ '<label for="' + value + '">' + value + '</label>'
			+ '</li>';
	});

 	$( '#filter_restaurant_container' ).append(options);

}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        $("#user_current_location").html("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
	var pos = {
		  lat: position.coords.latitude,
		  lng: position.coords.longitude
		};
	
	// get user address
	geocodePosition(pos);
	
/*
	var my_marker = new google.maps.Marker({
		map: map,
		position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
	});
		
	var my_info_window = new google.maps.InfoWindow;
	*/
	
	
	/*
	// create info window content   
    var my_info_window_content = '<div class="info_content">'
        + '<h3>My Location</h3>'
        + '<div>'
        	+ 	'<b>Latitude:</b> ' + pos.lat
        	+ 	'<br><b>Longitude:</b> ' + pos.lng
        + '</div>' +
    '</div>';
	
	// show my locations info window 		
	my_info_window.setPosition(pos);
		my_info_window.setContent(my_info_window_content);
		my_info_window.open(map);
		map.setCenter(pos);
		
	google.maps.event.addListener(my_marker, 'click', function() {
		my_info_window.setContent(my_info_window_content);
		my_info_window.open(map);	   
	});*/
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            $("#user_current_location").html("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            $("#user_current_location").html("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            $("#user_current_location").html("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            $("#user_current_location").html("An unknown error occurred.");
            break;
    }

    // set color to red
    $("#user_current_location").css({'color':'red'});
}

function geocodePosition(pos) {
	var address;
	
	geocoder.geocode({
		'location': pos
	}, function(responses) {
		if (responses && responses.length > 0) {
			address = responses[0].formatted_address;

			$('#get_direction').prop('disabled', false);

			// set color to green
		    $("#user_current_location").css({'color':'green'});

		} else {
			address = 'Cannot determine address at this location.';
		}
		
		$("#user_current_location").html(address);
		$("#user_current_location").attr('data-lat', pos.lat);
		$("#user_current_location").attr('data-lng', pos.lng);
	});
}