
//https://stackoverflow.com/questions/20936108/d3-js-independent-charts-and-divs-overlapping
//d3 graph overlapping         asynchronous data loading handler

// set the dimensions and margins of the graph
//var
margin = {top: 30, right: 50, bottom: 10, left: 50},
width = 460 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

//svg inline by default 
//https://stackoverflow.com/questions/44073386/put-2-svg-side-by-side
// append the svg object to the body of the page
//var    
svg2 = d3.select("#dataviz2")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("countries.csv", function(data) {

var scaleR = []
var dataIndex = {}
data.forEach(function(d) {

  //change to % min max [7026, 1313973713]    [2, 17075200]   [-20.99, 23.06]  [0, 55100]
  d.Population = +d.Population/1313973713
  d.Area = +d.Area/17075200
  d.NetMigration = Math.abs(+d.NetMigration / 23.06)
  d.GDP = +d.GDP / 55100
  d.InfantMortality = +d.InfantMortality / 191.19

  d.Region = d.Region.replace(/[^a-z0-9]/gi,'')
  scaleR.push(d.Region )  
  d.Country = d.Country.replace(/[^a-z0-9]/gi,'')
  //gi is necessary because it means global (not just on the first match)

  dataIndex[d.Country] = d
});
let unique = [...new Set(scaleR)];  //...[1,2,3] == 1,2,3
console.log(unique);

// var colorScale = d3.scaleOrdinal(unique)
//.range(d3.schemeReds[7])

// Color scale: give me a specie name, I return a color
var color = d3.scaleOrdinal()
  .domain(unique)
  .range([ "#440154ff", "#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"])
  // .domain(["setosa", "versicolor", "virginica" ])
  // .range([ "#440154ff", "#21908dff", "#fde725ff"])
colorScale = color

// Here I set the list of dimension manually to control the order of axis:
dimensions = ["Population", "Area", "NetMigration", "GDP","InfantMortality"]

// For each dimension, I build a linear scale. I store all in a y object
var y = {}
for (i in dimensions) {
  name = dimensions[i]
  console.log([d3.extent(data, function(d) { return +d[name]; })]);
  y[name] = d3.scaleLinear()
    .domain( [0,1] ) // --> Same axis range for each group
    // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
    //.domain( [d3.extent(data, function(d) { return +d[name]; })] )
    //this breaks path Error: <path> attribute d: Expected number, "M0,NaNL120,NaNL240,…".
    .range([height, 0])
}

// Build the X scale -> it find the best position for each Y axis
x = d3.scalePoint()
  .range([0, width])
  .domain(dimensions);

          
// Highlight the specie that is map selected
mapfilter = function(d){

  //selected_country = d.Country
  //country_selected = "Australia"
  d.Country = d.Country.replace(/[^a-z0-9]/gi,'')
  selected_country = d.Country
  console.log(d.Country)
 //console.log(d.Population)
  countryObj = dataIndex[d.Country]
  console.log(countryObj.Population)
  console.log(countryObj.Area)
  console.log(countryObj.NetMigration)
  console.log(countryObj.GDP)

  // first every group turns grey
  d3.selectAll(".line")
    .transition().duration(200)
    .style("stroke", "lightgrey")
    .style("opacity", "0.2")
    .attr('stroke-width', "1")
  // Second the hovered specie takes its color
  d3.selectAll("." + selected_country)
    .transition().duration(200)
    .style("stroke", colorScale(selected_country))
    .style("opacity", "1")
    .attr('stroke-width', "4")
}

// Highlight the specie that is hovered
var highlight = function(d){

  selected_country = d.Country

  // first every group turns grey
  d3.selectAll(".line")
    .transition().duration(200)
    .style("stroke", "lightgrey")
    .style("opacity", "0.2")
  // Second the hovered specie takes its color
  d3.selectAll("." + selected_country)
    .transition().duration(200)
    .style("stroke", colorScale(selected_country))
    .style("opacity", "1")
}

// Unhighlight
var doNotHighlight = function(d){
  d3.selectAll(".line")
    .transition().duration(200).delay(1000)
    .style("stroke", function(d){ return( colorScale(d.Country))} )
    .style("opacity", "1")
}

// The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
function path(d) {
    return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
}

// Draw the lines
svg2
  .selectAll("myPath")
  .data(data)
  .enter()
  .append("path")
    .attr("class", function (d) { return "line " + d.Country } ) 
    // 2 class for each line: 'line' and the group name
    .attr("d",  path)
    .style("fill", "none" )
    .style("stroke", function(d){ return( colorScale(d.Region ))} )
    .style("opacity", 0.5)
    // .on("mouseover", mapfilter)
    // .on("click", mapfilter)
    .on("mouseleave", doNotHighlight )
    // .on("click", highlight)
    // .on("mouseleave", doNotHighlight )

// Draw the axis:
svg2.selectAll("myAxis")
  // For each dimension of the dataset I add a 'g' element:
  .data(dimensions).enter()
  .append("g")
  .attr("class", "axis")
  // I translate this element to its right position on the x axis
  .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
  // And I build the axis with the call function
  .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d])); })
  // Add axis title
  .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function(d) { return d; })
    .style("fill", "black")

})