 $(function () {
	// loads latest official release of google charts
	// corechart = chart types
	google.charts.load('current', {packages: ['corechart']});
	
 	// get data
 	var restaurant_data = [];
	var analytics_type = '';
	
	// add event for analytics type
	$( '#show_analytics' ).click(function() {
		// get selected analytics type
		analytics_type = $('#analytics_type').val();
		
		// enable analytics "Close" button
		$('#close_chart').show();
		$('#chart_container').show();
		
		// call corresponding charts
		switch(analytics_type) {
			case 'resto_ratings':
				drawRatingChart();
				break;
				
			case 'resto_specialty':
				drawSpecialtyChart();
				break;
			
			case 'resto_types':
				drawTypeChart();
				break;
				
			case 'resto_visits':
			default:
				drawVisitChart();
				break;
		}
	});
	
	// hide button and chart
	$( '#close_chart' ).click(function() {
		$(this).hide();
		$('#chart_container').hide();
	});
 });

 // simply receives the data from another JS file
 // this data will be use for analytics
 function analytics_data(resto_data) {
	if(resto_data.length > 0) {
		restaurant_data = resto_data;
		
		// enable analytics "Go" button
		$('#show_analytics').prop('disabled', false);
	}
}

// get restaurant specialties
function getSpecialties() {
	var specialties = [];
	
	// loop through each restaurants to get specialties
	$.each( restaurant_data, function( key, val ) {
		var val_sp = val.specialty;
		$.each( val_sp, function( k, v ) {
			if( specialties.indexOf(v) < 0) {
				specialties.push(v);
			}
		});
	});

	return specialties.sort();
}

// shows the line chart for restaurant ratings
function drawRatingChart() {
   // Define the chart to be drawn
	var data = new google.visualization.DataTable();

	// loop through each restaurant to get rating
	var rows = [];
	$.each( restaurant_data, function( key, val ) {
		var type_count = [];
		
		// append type count
		type_count.push(val.name);
		type_count.push(val.rating);
		rows.push(type_count);
	});
	
	// add chart data for each restaurant rating
	data.addColumn('string', 'Name');
	data.addColumn('number', 'Rating');
	data.addRows(rows);
   
   // Set chart options
   var options = {'title':'Restaurant Ratings',
      'width': 800,
      'height': 500};

   // Instantiate and draw the chart.
   var chart = new google.visualization.LineChart(document.getElementById('chart_container'));
   chart.draw(data, options);
}

// shows the column chart for each restaurant visits
function drawVisitChart() {
   // Define the chart to be drawn
	var data = new google.visualization.DataTable();

	// loop through each restaurant to get visits
	var rows = [];
	$.each( restaurant_data, function( key, val ) {
		var type_count = [];
		
		// append type count
		type_count.push(val.name);
		type_count.push(val.visits);
		rows.push(type_count);
	});
	
	// add chart data for each restaurant visits
	data.addColumn('string', 'Name');
	data.addColumn('number', 'Visits');
	data.addRows(rows);
   
   // Set chart options
   var options = {'title':'Restaurant Visits',
      'width': 800,
      'height': 500};

   // Instantiate and draw the chart.
   var chart = new google.visualization.ColumnChart(document.getElementById('chart_container'));
   chart.draw(data, options);
}

// shows the pie chart for # of restaurant on each restaurant types
function drawTypeChart() {
	// Define the chart to be drawn
	var data = new google.visualization.DataTable();
   
	// get restaurant types
	var resto_types = getFilterType();

	// loop through each type to get number of restaurant in a type
	var rows = [];
	$.each( resto_types, function( key, val ) {
		var type_count = [];
		
		// loop through each restaurant to get type
		var count = 0;
		$.each( restaurant_data, function( rd_key, rd_val ) {
			if(val == rd_val.type) {
				count++;
			}
		});
		
		// append type count
		type_count.push(val);
		type_count.push(count);
		rows.push(type_count);
	});
	
	// add chart data for each restaurant types
	data.addColumn('string', 'Types');
	data.addColumn('number', 'Restaurants Count');
	data.addRows(rows);
   
   // Set chart options
   var options = {'title':'Number of Restaurants Per Type',
      'width': 600,
      'height': 500};

   // Instantiate and draw the chart.
   var chart = new google.visualization.PieChart(document.getElementById('chart_container'));
   chart.draw(data, options);
}

// shows chart for # of restaurant per specialty
function drawSpecialtyChart() {
	// Define the chart to be drawn
	var data = new google.visualization.DataTable();
   
	// get specialties
	var resto_specialties = getSpecialties();

	// loop through each specialty to get total number of restaurant
	var rows = [];
	$.each( resto_specialties, function( key, val ) {
		var type_count = [];
		
		// loop through each restaurant to count specialties
		var count = 0;
		$.each( restaurant_data, function( rd_key, rd_val ) {
			var rdv_specialty = rd_val.specialty;
			if( rdv_specialty.indexOf(val) < 0) {
				count++;
			}
		});
		
		// append type count
		type_count.push(val);
		type_count.push(count);
		rows.push(type_count);
	});
	
	// add chart data for each restaurant types
	data.addColumn('string', 'Specialty');
	data.addColumn('number', 'Restaurants Count');
	data.addRows(rows);
   
   // Set chart options
   var options = {'title':'Number of Restaurants Per Specialty',
      'width': 600,
      'height': 500};

   // Instantiate and draw the chart.
   var chart = new google.visualization.BarChart(document.getElementById('chart_container'));
   chart.draw(data, options);
}