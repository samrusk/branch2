$( document ).ready(function() {

	var event_data = [];
	// $.getJSON('events.json', function(json) {

	// 	event_data = json;
	// 	save_json(json);
 //    });

    $.ajax({
		type: "GET",
		url: "events.json",
		dataType: "json",
		async: false,
		success : function(data) {
	                event_data = data;
	                console.log("data")
	                console.log(data)
            	}
	});


    $.ajax({
		type: "GET",
		url: "/Users/samrusk/Downloads/json_data.txt",
		dataType: "json",
		async: false,
		success : function(data) {
	                window_data = data;
	                console.log("window_data")
	                console.log(window_data)
            	}
	});


	//Intatiate variables
	var start_date = null;
	var end_date = null;

	for (var each in event_data){
		//Converting Datetime string into Date Object
		event_data[each]['datetime'] = new Date(event_data[each]['datetime']);
		var curr_datetime = event_data[each]['datetime'];

		//Setting boolean requiring event to above or below timeline
		event_data[each]['top'] = (each%2 == 0);
		
		//Finding Earliest Date in all events
		if (start_date > curr_datetime || start_date == null){
			start_date = curr_datetime;
		}
		//Find Latest DAte in all events
		if (end_date < curr_datetime || end_date == null){
			end_date = curr_datetime;
		}
	}



	// Positioning of SVG
	var margin = {top: 60, right: 150, bottom: 320, left: 130},
    width = 1400 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
	


	// Format
	var formatNumber = d3.time.format("%m-%d");

	var xscale = d3.time.scale()
		.range([0, width])
		.domain([start_date,end_date]);

	var xAxis = d3.svg.axis()
		.scale(xscale)
		.ticks(0)
		.tickFormat(formatNumber)
		.orient("bottom");

	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var gx = svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.attr("class","axis_line")
		.call(xAxis);
		
	var bar = 30;	




				
	// Event Box Positioning Parameters	
	var box_width = 200;
	var box_height = 130;
	var line_length = 50
	var line_height = height-line_length;



	var events = svg.append("g").selectAll("path")
			.data(event_data)
			.enter();


	var line = events.append("line")
			.attr("x1", function(d) {return xscale(d['datetime']);})
			.attr("x2", function(d) {return xscale(d['datetime']);})
			.attr("y1", function(d) {
				if (d['top']){
					return height-line_length;
				} else {
					return height;
				}
			})
			.attr("y2", function(d) {
				if (d['top']){
					return height;
				} else {
					return height+line_length;
				}
			})
			.attr("class","axis_line");


	var rect = events.append("rect")
			
			.attr("x", function(d) {return xscale(d['datetime'])-box_width/2;}  )
			.attr("y", function(d) {
				if (d['top']){
					return height-line_length-box_height;
				} else {
					return height+line_length;
				}
			})
			.attr("width", box_width)
			.attr("height", box_height)
			.attr("class", "timeline_rect");


	var foreignObj = events.append("foreignObject")
		    .attr("width", box_width-20)
		    .attr("height", box_height)
		    .attr("text-anchor", "left")
			.attr("x", function(d) {return xscale(d['datetime'])-box_width/2 + 5;}  )
				.attr("y", function(d) {
					if (d['top']){
						return height-line_length-box_height+5;
					} else {
						return height+line_length+5;
					}
				})
			.attr("dy", "0.75em")
			.attr("dx", "0.25em");
			

	var htmlback = foreignObj.append("xhtml:body")
		    .html(function(d) {
				return create_html_text(d['name'],d['datetime'],d['location'],d['description']);
			});


	var circles = events.append("circle")
			.attr("cx", function(d){return  xscale(d['datetime']);})
		 	.attr("cy", height)
		 	.attr("r", 18)
		 	.style("background_color", "white")
		 	.attr("class","axis_line")
		 	.attr("id",function(d){return d['name'];})
			.on("mouseenter", function(d){set_background(d['name'])})
			.on("mouseleave",function(d){set_background(null)});

	var background = events.append("rect")
			
			.attr("x", function(d) {return xscale(d['datetime'])-box_width/2;}  )
			.attr("y", function(d) {
				if (d['top']){
					return height-line_length-box_height;
				} else {
					return height+line_length;
				}
			})
			.attr("id",function(d){return d['name'];})
			.attr("width", box_width)
			.attr("height", box_height)
			.attr("class", "background_color")
			.on("mouseenter", function(d){set_background(d['name'])})
			.on("mouseleave",function(d){set_background(null)});



	function set_background(name){
		if (name == null){
			background.attr("class","background_color");
			circles.style("fill","white");
			return;
		}
		background.attr("class",function(d){
			if (d['name'] == name){
				return "background_color_dark";}
			else {
				return "background_color";
			}
		});
		circles.style("fill",function(d){
			if (d['name'] == name){
				return "rgba(33, 76, 21, 0.31)";}
			else {
				return "white";
			}
		});
		

	}

	function create_html_text(name,date,location,description){
		    var monthNames = ["January", "February", "March","April", "May", "June", "July",
	        "August", "September", "October","November", "December"];

			var html = 
				"<span class='event_title'>" + name + "</span>" +
				"<div class='event_text'>" + 
				monthNames[date.getMonth()]+" "+date.getDate()+", "+date.getFullYear()+"<br>" + 
				location +"<br>" + 
				description+"</div>";
			return html;
	}








});




						
