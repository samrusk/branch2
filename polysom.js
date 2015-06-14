$( document ).ready(function() {

	var event_data = [];
	var test_data = []


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
	                test_data = data;
	                console.log("test_data")
	                console.log(test_data)
            	}
	});

    window_index = 0;
	num_signals = test_data['window_test'][window_index].length
	signal_data = test_data['window_test'][window_index]
	pred_prob = test_data['proba'];
	y_test = test_data['y_test'];



	//Intatiate variables
	var start_date = null;
	var end_date = null;

	window_length = -1;
	for (var ii in signal_data){
		if (signal_data[ii].length < window_length || window_length == -1){
			window_length = signal_data[ii].length
		}
	}


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
   	var margin = {top: 10, right: 40, bottom: 150, left: 60},
	width = 1140 - margin.left - margin.right,
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

	// var gx = svg.append("g")
	// 	.attr("class", "x axis")
	// 	.attr("transform", "translate(0," + height + ")")
	// 	.attr("class","axis_line")
	// 	.call(xAxis);
		
	var bar = 30;	

	/*   Start SVG Chart Area      */


	var contextHeight = 30;
	var contextWidth = width * .5;

	//var svg = d3.select("#chart-container").append("svg")


	// var svg = d3.select("#dashboard").append("svg")
	// .attr("width", width + margin.left + margin.right)
	// .attr("height", (height + margin.top + margin.bottom + 50));



	/*  Start Chart Creation Section   */

	var chartHeight = height * (1 / num_signals);


	/*   End Chart Creation Section    */

	real_label = y_test[window_index];
	pred_label = pred_prob[window_index];

	svg.append("text")
		.attr("class","country-title")
		.attr("transform", "translate(-10,15)")
		.attr("fill", "#777")
		.text("Real Label: " + real_label + " Pred Label: " + pred_label);

	/* Start Brush Section   */

	xScale = d3.time.scale()
	.range([0, this.width])
	.domain([start_date,end_date]);


	var contextXScale = d3.time.scale()
	.range([0, contextWidth])
	.domain(xScale.domain());	
	
	var contextAxis = d3.svg.axis()
	.scale(contextXScale)
	.tickSize(contextHeight)
	.tickPadding(-10)
	.orient("bottom");
	
	var contextArea = d3.svg.area()
	.interpolate("linear-closed")
	.x(function(d) { return contextXScale(d.date); })
	.y0(contextHeight)
	.y1(0);


	var brush = d3.svg.brush()
	.x(contextXScale)
	.on("brushend",onBrush);

	var context = svg.append("g")
	.attr("class","context")
	//.attr("transform", "translate(" + (margin.left + width * .25) + "," + (height + margin.top + chartHeight) + ")")
	.attr("transform", "translate(" + (margin.left + width * .25) + "," + -100 + ")")
	
	var yBrushPlacement = 100;

	// context.append("text")
	// .attr("class","instructions")
	// .attr("transform", "translate(50," + (contextHeight + yBrushPlacement+20) + ")")
	// .text('Click and drag above to zoom / pan the data');

	context.append("g")
	.attr("class", "x axis top")
	.attr("transform", "translate(0,"+yBrushPlacement+")")
	.call(contextAxis)

	context.append("g")
	.attr("class", "x brush")
	.call(brush)
	.selectAll("rect")
	.attr("y", yBrushPlacement)
	.attr("height", contextHeight);





	/*   End Brush Section      */


	/* Start Chart Section */

	signal_names = ['a','b','c','d','e','f','g','h','i','j','k','m'];
	charts = [];
	draw_charts();

	function draw_charts(){
		for(var i = 0; i < num_signals; i++){
			max = 1.1*Math.max.apply(null, signal_data[i]);
			min = Math.min.apply(null, signal_data[i]);
			if (min<0){
				min = min*1.1;
			} else if (min == 0) {
				min = -1;
			} else {
				min = min*0.9;
			}
			samp_rate = signal_data[i].length/window_length;
			charts.push(new Chart({
				signal_data: signal_data,
				samp_rate: samp_rate,
				id: i,
				name: signal_names[i],
				width: width,
				height: height * (1 / num_signals),
				max_data: max,
				min_data: min,
				svg: svg,
				margin: margin,
				showBottomAxis: (i == num_signals - 1)
			}));
			
		}
	}


	
	function Chart(options){
		this.signal_data = options.signal_data;
		this.width = options.width;
		this.height = options.height;
		this.max_data = options.max_data;
		this.min_data = options.min_data;
		this.svg = options.svg;
		this.id = options.id;
		this.name = options.name;
		this.margin = options.margin;
		this.showBottomAxis = options.showBottomAxis;
		this.samp_rate = options.samp_rate



		var localName = this.name;
		var signal_data = this.signal_data;
		var samp_rate = options.samp_rate;
		var id = this.id;


		/* XScale is time based */
		this.xScale = d3.time.scale()
		.range([0, this.width])
		.domain([start_date,end_date])

		// .domain(d3.extent(this.data.map(function(d) { console.log(d);return d.event_time; })));
		/* YScale is linear based on the maxData Point we found earlier */
		this.yScale = d3.scale.linear()
		.range([this.height,0])
		.domain([this.min_data,this.max_data]);
		var xS = this.xScale;
		var yS = this.yScale;


	/* 
		This is what creates the chart.
		There are a number of interpolation options. 
		'basis' smooths it the most, however, when working with a lot of data, this will slow it down 
		*/
		this.area = d3.svg.area()
		.interpolate("linear")
		.x(function(d,i) {
			var ratio = i/signal_data[id].length;
			var diff = end_date.getTime()-start_date.getTime();
			var currDate = new Date((diff*ratio)+start_date.getTime());
			return xS(currDate);
			
		})
		.y0(this.height)
		.y1(function(d,i) {
			return yS(d);
		});
		

		/*
		This isn't required - it simply creates a mask. If this wasn't here,
		when we zoom/panned, we'd see the chart go off to the left under the y-axis 
		*/
		this.svg.append("defs").append("clipPath")
		.attr("id", "clip-" + this.id)
		.append("rect")
		.attr("width", this.width)
		.attr("height", this.height);




		/*
		Assign it a class so we can assign a fill color
		And position it on the page
		*/
		//console.log(this.name.toLowerCase())
		var min = 0;
		var max = 4;
		var rand =  Math.floor(Math.random() * (max - min + 1)) + min;
		this.chartContainer = svg.append("g")
		.attr('class','plots')
		.attr("transform", "translate(" + this.margin.left + "," + (this.margin.top + 40 + (this.height * this.id) + (10 * this.id)) + ")");


		/* We've created everything, let's actually add it to the page */
		this.chartContainer.append("path")
		.data([signal_data[this.id]])
		.attr("class", "chart")
		.attr("clip-path", "url(#clip-" + this.id + ")")
		.attr("d", this.area);
		// .on("mouseover", function(){return tooltip.style("visibility", "visible");})
		// .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
		// .on("mousemove", function(d){
		// 	var xPosition = d3.mouse(this)[0],yPosition = d3.mouse(this)[1];
		// 	var timeRange = brush.empty() ? xS.domain() : brush.extent();
		// 	var ratio = xPosition/options.width;
		// 	var diff = timeRange[1].getTime()-timeRange[0].getTime();
		// 	var currDate = new Date((diff*ratio)+timeRange[0].getTime());

		// 	var pos_time = currDate.getTime()-xScale.domain()[0].getTime();
		// 	var total_time = xScale.domain()[1].getTime() - xScale.domain()[0].getTime();
		// 	var data_index = Math.round((1-pos_time/total_time)*signal_data[this.id].length)-1;
		// 	var data_index = Math.round((pos_time/total_time)*signal_data[this.id].length)-1;

		// 	var currVal = signal_data[this.id][data_index];

		
		// 	tooltip.html(currDate.toLocaleString()+ "<br>Value: "+currVal+"<br>Px: "+xPosition );
		// 	tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
		// });




		this.xAxisTop = d3.svg.axis().scale(this.xScale).orient("bottom");
		this.xAxisBottom = d3.svg.axis().scale(this.xScale).orient("top");
		/* We only want a top axis if it's the first country */
		if(this.id == 0){
			this.chartContainer.append("g")
			.attr("class", "x axis top")
			.attr("transform", "translate(0,0)")
			.call(this.xAxisBottom);
			// .call(this.xAxisTop);
		}

		/* Only want a bottom axis on the last country */
		if(this.showBottomAxis){
			this.chartContainer.append("g")
			.attr("class", "x axis bottom")
			.attr("transform", "translate(0," + this.height + ")")
			.call(this.xAxisTop);
			// .call(this.xAxisBottom);
		}  
		
		this.yAxis = d3.svg.axis().scale(this.yScale).orient("left").ticks(4);


		
		this.chartContainer.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(-15,0)")
		.call(this.yAxis);

		this.chartContainer.append("text")
		.attr("class","country-title")
		.attr("transform", "translate(10,15)")
		.attr("fill", "#777")
		.text(this.name);





	}
	

	Chart.prototype.showOnly = function(b){
		// console.time('xScale doman');
		this.xScale.domain(b);
		// console.timeEnd('xScale doman');
		console.time(this.name);
		this.chartContainer.select("path").attr("d", this.area);
		console.timeEnd(this.name);
		// console.time('xaxis top');
		this.chartContainer.select(".x.axis.top").call(this.xAxisBottom);
		// console.timeEnd('xaxis top');
		// console.time('xaxis bottom');
		this.chartContainer.select(".x.axis.bottom").call(this.xAxisTop);
		// console.timeEnd('xaxis bottom');
	}

	/* End Chart Section */

	function onTimeChange(b,brExt){
		console.log("onTimeChange")
		for(var i = 0; i < num_signals; i++){
			charts[i].showOnly(b);
		}

		brush.extent(brExt);
		brush(d3.select(".brush").transition());
		//brush.event(d3.select(".brush").transition();
		// updateMetrics(b);
	}
	function onBrush(){
		/* this will return a date range to pass into the chart object */
		var b = brush.empty() ? contextXScale.domain() : brush.extent();
		for(var i = 0; i < num_signals; i++){
			charts[i].showOnly(b);
		}
		// updateMetrics(b);
	}
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



	$('#prev_window').on('click', function (e) {
		console.log("prev_window click");
		window_index-=1;
		signal_data = test_data['window_test'][window_index];
		draw_charts();

		
	})
	$('#next_window').on('click', function (e) {
		console.log("next_window click");
		window_index+=1
		signal_data = test_data['window_test'][window_index]
		draw_charts();
		
	})








});




						
