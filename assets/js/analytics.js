 $(function () {
 	// get data
 	var resto_data = [];
 	var temp_data = [];
 });

 function analytics_data(resto_data) {

 	// initialise data table
 	$('table#analytics_table').dataTable({
 		searching: false,
 		paging: false,
 		data: resto_data,
 		columns: [
 			{ title: "name", target: 'name' },
 		]
 	});
 }