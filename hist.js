// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

function getmax(arrayset){
	const max = [];
	for(let i=0; i<arrayset.length; i++){
		max.push(d3.max(arrayset[i]));
	}
	return d3.max(max);
}

function getmin(arrayset){
	const min = [];
	for(let i=0; i<arrayset.length; i++){
		min.push(d3.min(arrayset[i]));
	}
	return d3.min(min);
}	


d3.dsv(" ",filename).then(function(events) {
	console.log(events.length);
	console.log(events[0].mass);

	// Divide events by tag
	const data_e=[],  data_m=[], data_4ee=[], data_4mm=[], data_4me=[];	data_g = [];	
	for(let i=0; i<events.length; i++){
		switch(events[i].tag){
			case "e":
				data_e.push(parseFloat(events[i].mass));
				break;
			case "m":
				data_m.push(parseFloat(events[i].mass));
				break;
			case "4ee":
				data_4ee.push(parseFloat(events[i].mass));
				break;
			case "4mm":
				data_4mm.push(parseFloat(events[i].mass));
				break;
			case "4me":
				data_4me.push(parseFloat(events[i].mass));
				break;
			case "g":
				data_g.push(parseFloat(events[i].mass));
				break;
		}
	}
	console.log(events[0].mass);
	console.log(d3.maxIndex(data_e));
	console.log(data_e);

	let svg = d3.select("#my_dataviz")
			.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
			.append("g")
		.attr("transform","translate(" + margin.left + "," + margin.top + ")");

	// X axis: scale and draw:
		let x = d3.scaleLinear()
  		.domain([d3.max([0,d3.mean(data_e)-2*d3.deviation(data_e)]), d3.mean(data_e)+2*d3.deviation(data_e)])     
  		.range([0, width]);
		svg.append("g")
  		.attr("transform", "translate(0," + height + ")")
  		.call(d3.axisBottom(x));


  	// set the parameters for the histogram
		let histogram = d3.histogram()
  		.value(function(d){return d;})   // I need to give the vector of value
  		.domain(x.domain())  // then the domain of the graphic
  		.thresholds(x.ticks(20)); // then the numbers of bins

  	let bins = histogram(data_e);

	// Y axis: scale and draw:
		var y = d3.scaleLog()
  		.range([height, 0]);
  		y.domain([1, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
		svg.append("g")
  		.call(d3.axisLeft(y));

  	

  	// append the bar rectangles to the svg element
		svg.selectAll("rect")
  		.data(bins)
  		.enter()
  		.append("rect")
    		.attr("x", 1)
    		.attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
    		.attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
    		.attr("height", function(d) { return height - y(d.length); })
    		.style("fill", "steelblue")
    
})
