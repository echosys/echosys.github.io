// load data with queue
var url1 = "./data/neighborhood.geojson";
var url2 = "./data/listing_count.json";

var q = d3_queue.queue(1)
  .defer(d3.json, url1)
  .defer(d3.json, url2)
  // .defer(d3.csv, url3)
  .awaitAll(draw);

var citySelected;

function draw(error, data) {
  "use strict";

  // important: First argument it expects is error
  if (error) throw error;
  var ifClicked = false;

  // initialize the Bayview as the default neighborhood
  var field = "Bayview";

  var margin = 50,
    width = 450 - margin, //- 100; //this moves the map to the left, no the canvas
    height = 500 - margin;

  var colors = ["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f"]
  var colorsLabel = [1, 25, 50, 100, 200, 300, 700]

  var color = d3.scaleThreshold()
    .domain([1, 25, 50, 100, 200, 300, 700])
    .range(["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f"])
    //.range(d3.schemeReds[7]);

  // create a projection properly scaled for SF
  var projection = d3.geoMercator()
    .center([-122.433701, 37.767683])
    .scale(175000)
    .translate([width / 1.5, height / 1.74]);

  // create a path to draw the neighborhoods
  var path = d3.geoPath()
    .projection(projection);

  // create and append the map of SF neighborhoods
  var map = d3.select('#map').selectAll('path')
    .data(data[0].features)
    .enter()
    .append('path')
    .attr('d', path)
    .style('stroke', 'black')
    .style('stroke-width', 0.75);

  // // normalize neighborhood names
  map.datum(function(d) {
    var normalized = d.properties.neighbourhood
      .replace(/ /g, '_')
      .replace(/\//g, '_');

    d.properties.neighbourhood = normalized;
    d.count = data[1][d.properties.neighbourhood];
    return d;
  });

  // // add the neighborhood name as its class
  map
    .attr('class', function(d) {
      return d.properties.neighbourhood;
    })
    .attr("fill", function(d) {
      return color(d.count);
    })
    .attr("transform", "translate(60" + ", 50" + ")");

  map
    .on("mouseover", function(d){
      div.transition()		
        .duration(200)		
        .style("opacity", .9);		
      div.html(d.properties.neighbourhood + "<br/>" 
        + "Number of Listings:" + "<br/>" 
        + data[1][d.properties.neighbourhood])	
      .style("left", (d3.event.pageX) + "px")		
      .style("top", (d3.event.pageY - 28) + "px");	
    })
    .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
    .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
    //.on("mousedown", function(){ifClicked = true})
    //.on("mouseup", function(){ifClicked = false})
    .on("click", function(d){
      citySelected = this.className.animVal
      cityName = this.className.animVal
      updateLineChart()

      if(ifClicked){
        map.attr('opacity','1');
        ifClicked = false
      }else if (!ifClicked){
        map.attr('opacity','0.2');
        d3.select(this).attr('opacity','1');
        ifClicked = true
        //d3.select(this).attr('class','selected');
        //map.attr("fill","blue")
      }
    });

  var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

  var tooltip = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

  var formatPercent = d3.format(".0%"),
    formatNumber = d3.format(".0f");

  var threshold = d3.scaleThreshold()
      .domain([1, 25, 50, 100, 200, 300, 700])
      .range(["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f"]);

  var x = d3.scaleLinear()
      .domain([1, 700])
      .range([0, 480]);  //240     domain map to range

  var xAxis = d3.axisBottom(x)
      .tickSize(7)
      .tickValues(threshold.domain())
      .tickFormat(function(d) { return formatNumber(d); });

  //var g = d3.select("#map").select("g").call(xAxis)  //top of map also
  //var g = d3.select("#map").append("g").call(xAxis)  //top of map
  var g = d3.select("#cLegend").select("g").call(xAxis)
     //.attr("transform", "translate(90,-1)")
  

  g.select(".domain")
      .remove();

  g.selectAll("rect")
    .data(threshold.range().map(function(color) {
      var d = threshold.invertExtent(color);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
    .enter().insert("rect", ".tick")
      .attr("height", 8)
      .attr("x", function(d) { return x(d[0]); })
      .attr("width", function(d) { return x(d[1]) - x(d[0]); })
      .attr("fill", function(d) { return threshold(d[0]); });

  g.append("text")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .attr("y", -6)
      .text("Number of Airbnb Listings");

}


function selected() {
  //d3.select('.selected').classed('selected', false);
  map.classed('opacity', '0.2');
  d3.select(this).attr('opacity','1');
}

function getSelection(){
  //var cityName = citySelected.className.animVal
  return citySelected
}