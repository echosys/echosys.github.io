// load data with queue
var url1 = "./sacramento.geojson";
var url2 = "./tree_canopy.csv";

var q = d3_queue.queue(1)
  .defer(d3.json, url1)
  .defer(d3.csv, url2)
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

  var colorscheme = ["#D7301F", "#EF6548", "#FBB676", "#FEF4B9", "#A8C87D", "#359A4B", "#1B532D", "#12351F"]
  var colorsLabel = [0, 10, 15, 20, 25, 30, 35, 40]

  var color = d3.scaleThreshold()
    .domain(colorsLabel)
    .range(colorscheme)
    //.range(d3.schemeReds[7]);

  // grab the bounding box of the container
  var boundingBox = d3.select('#map').node().getBoundingClientRect();

  //  grab the width and height of our containing SVG
  var svgHeight = boundingBox.height;
  var svgWidth = boundingBox.width;
  
  // create a projection properly scaled for SF
  var projection = d3.geoMercator().fitSize([svgWidth, svgHeight], data[0])
    // .center([-121.490999, 38.575057])
    // .scale(100500)
    // .translate([width / 1.5, height / 1.74]);

  // create a path to draw the neighborhoods
  var path = d3.geoPath()
    .projection(projection);

  // create and append the map of SF neighborhoods
  var map = d3.select('#map').selectAll('path')
    .data(data[0].features)
    .enter()
    .append('path')
    .attr('d', path)
    .style('stroke', 'white')
    //.style('stroke', 'black')
    .style('stroke-width', 0.75);

  // // normalize neighborhood names
  map.datum(function(d) {
    var normalized = d.properties.name
      // .replace(/ /g, '_')
      // .replace(/\//g, '_');
    d.properties.name = normalized;
    // d.count = data[1][d.properties.name];
    d.count = data[1].filter(function(x){return x.Neighborhood == d.properties.name})[0]['Canopy']
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
      div.html(d.properties.name + "<br/>" 
        + "Canopy Percentage:" + "<br/>" 
        + data[1].filter(function(x){return x.Neighborhood == d.properties.name})[0]['Canopy']
        )

      .style("left", (d3.event.pageX) + "px")		
      .style("top", (d3.event.pageY - 28) + "px");	
    })
    .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
    .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
    //.on("mousedown", function(){ifClicked = true})
    //.on("mouseup", function(){ifClicked = false})
    // .call(d3.keybinding()
    // // .on('c',function(d){
    // //   map.attr("fill", color(0) )}
    // ));
  
  //animation
  document.addEventListener('keydown', (event) => {
    const keyName = event.key;
    if (keyName === 'c') {
      var count = 0
      //var intv = window.setInterval(function() {
      var intv = d3.interval(function() {  
        if (count == 6){
          intv.stop();}
          //clearInterval(intv)}
        //else{
        
        animation(count);
        count = count + 1;//}
      }, 1500);
      
      return;
    }  
    // if (event.ctrlKey) {
    //   // Even though event.key is not 'Control' (e.g., 'a' is pressed),
    //   // event.ctrlKey may be true if Ctrl key is pressed at the same time.
    //   alert(`Combination of ctrlKey + ${keyName}`);
    // } else {
    //   alert(`Key pressed ${keyName}`);
    // }
  }, false);

  function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  //Uncaught Error: too late; already started
  function animation(count) {
    function returnColor(d, count){
      if (count == 0){
        return 'white'}
      else if (count == 1){
        if(d.count < 15){return color(d.count)}
        else{return 'white'}} 
      else if (count == 2){
        if(d.count < 25){return color(d.count)}
        else{return 'white'}} 
      else if (count == 3){
        if(d.count < 30){return color(d.count)}
        else{return 'white'}} 
      else if (count == 4){
        if(d.count < 35){return color(d.count)}
        else{return 'white'}} 
      else if (count == 5){
        if(d.count < 40){return color(d.count)}
        else{return 'white'}} 
      else{return color(d.count)}
    }
    d3.select('#map').selectAll('path')
      .transition()
      .duration(1000)
      .attr("fill", function(d) {
        return returnColor(d, count);
      })
      //.attr("fill", colorscheme[count] );
  }

  var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

  var tooltip = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

  var formatPercent = d3.format(".0%"),
    formatNumber = d3.format(".0f");

  var threshold = d3.scaleThreshold()
      .domain(colorsLabel)
      .range(colorscheme);

  var x = d3.scaleLinear()
      .domain([0, 40])
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
      .text("Tree Canopy Percentage");
  
  var gtw = svgWidth / 2 - width + 90
  var gth = 0
  d3.select("#cLegend")
  //.attr("transform", "translate(90,50)")
  .attr("transform", `translate(${gtw},${gth})`)

}
