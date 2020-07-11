// set the dimensions and margins of the graph
var margin = {
    top: 0,
    right: 20,
    bottom: 10,
    left: 5
  },
  width = 600 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// parse the date / time
var parseTime = d3.timeParse("%Y");

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the line
var valueLine = d3.line()
  .x(function(d) {
    return x(d.years);
  })
  .y(function(d) {
    return y(d.Chinatown);
  });

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin

var svg = d3.select("#chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);
  // .attr("width", width + margin.left + margin.right)
  // .attr("height", height + margin.top + margin.bottom);

// drawLineChart
var cityName = getSelection()
var updateLineChart = function(){};
//console.log(cityName)

var condition = false
function wait(){
  if (!condition){
    setTimeout(wait, 200);
    cityName = getSelection() == undefined ? "Chinatown" : getSelection()
    updateLineChart()
    // console.log(getTime())
    // console.log(cityName)
  } else {
    console.log('test2')
  }
}

function getTime(){
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;
  return dateTime
}

//var globalData;
// Get the data
handler()
function handler(){
d3.csv("./data/2010-2017_review.csv", function(error, data) {
  if (error) throw error;
  drawLineChart(data)
});
}

function drawLineChart(data){ 
  // format the data
  // data.forEach(function(d) {
  //   d.year = parseTime(d.years);
  //   d.Chinatown = +d.Chinatown;
  // });

  data.forEach(function(d) {
    d.yearsTime = parseTime(d.years);
    data.columns.forEach(function (item, index) {
      if(item != "years"){
      //data[item] = + data[item];
      d[item] = + d[item];
    }})
  });

  //function drawLineChart(){
  cityName = getSelection() == undefined ? "Chinatown" : getSelection()
  // Scale the range of the data
  x.domain(d3.extent(data, function(d) {
    return d.years;
  }));
  y.domain([0, d3.max(data, function(d) {
    return d[cityName];
    //return d.Chinatown;
  })]).nice();

  // Add the valueline path.
  valuelinePath = svg.append("path")
    .data([data])
    .attr("class", "line2")
    .attr("d", valueLine)
    .attr("transform", "translate(42" + ", 70" + ")");

  // Add the X Axis
  var marginB = 460;

  svg.append("g")
    .attr("transform", "translate(40," + marginB + ")")
    .call(d3.axisBottom(x)
      .tickFormat(d3.format(".4r")));

  // Add the Y Axis
  svg.append("g")
    .attr('class', 'y axis')
    .attr("transform", "translate(40" + ", 70" + ")")
    .call(d3.axisLeft(y)
      .ticks(5));

  // Add the X Axis label
  xaxis_label = svg.append("text")
    .attr("class", "axisLabel")
    .attr("transform",
      "translate(" + (width / 2.5 + 110) + " ," +
      (height + 110) + ")")
    .style("text-anchor", "middle")
    .text("Years");

  // Add the Y Axis label
  yaxis_label = svg.append("text")
    .attr("class", "axisLabel")
    .attr("transform", "rotate(-90)")
    // .attr("y", 60)
    // .attr("x", 50)
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .attr("fill", "black") 
    .text("Number of Reviews");

  // Add the chart label
  var chartLabel = svg.append("text")
    // .attr("x", (width / 2))             
    // .attr("y", 0 - (margin.top / 2))
    .attr("x", (width / 2))             
    .attr("y", 50)
    .attr("text-anchor", "middle")  
    .style("font-size", "16px") 
    .style("text-decoration", "underline")  
    .text("Value vs Date Graph")
    .text(cityName)
    

  var bisectDate = d3.bisector(function(d) { return d.yearsTime; }).left;

  //var focus = svg.append("g")
  var focus = svg.append("g")
    .attr("class", "focus")
    .style("display", "none");
  
  focus.append("line")
      .attr("class", "x-hover-line hover-line")
      .attr("y1", 0)
      .attr("y2", height);

  focus.append("line")
      .attr("class", "y-hover-line hover-line")
      .attr("x1", width)
      .attr("x2", width);
  
  focus.append("circle")
      .attr("r", 7.5);
  
  focus.append("text")
      .attr("x", 15)
      .attr("dy", ".31em");
  
  svg
  .append("rect")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  .attr("class", "overlay")
  .attr("width", width)
  .attr("height", height)
  .on("mouseover", function() { focus.style("display", null); })
  .on("mouseout", function() { focus.style("display", "none"); })
  .on("mousemove", mousemove);

  function mousemove() {
    //cityName = getSelection() == undefined ? "Chinatown" : getSelection()
    //updateLineChart()  //this will make line not shown

    x.domain(d3.extent(data, function(d) {
      return d.yearsTime;
    }));
    
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.years > d1.years - x0 ? d1 : d0;
    focus.attr("transform", "translate(" + x(d.yearsTime) + "," + y(d[cityName]) + ")");
    focus.select("text").text(function() { return d[cityName]; });
    focus.select(".x-hover-line").attr("y2", height - y(d[cityName]));
    focus.select(".y-hover-line").attr("x2", width + width);
  }

  updateLineChart = function(){
    cityName = getSelection() == undefined ? "Chinatown" : getSelection()
    chartLabel.text(cityName)
    y.domain([0, d3.max(data, function(d) {
      return d[cityName];
      //return d.Chinatown;
    })]).nice();
    valueLine = d3.line()
      .x(function(d) {
        return x(d.years);
      })
      .y(function(d) {
        return y(d[cityName]);
      });
    valuelinePath.attr("d", valueLine)
      
    var yAxis = d3.axisLeft()
    .scale(y);
    svg.selectAll(".y.axis")
      .call(yAxis);
    yaxis_label.text("Number of Reviews")
      .style("fill", "black"); 
  }

}