const format = d3.format(',');
// Set tooltips
const tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(d => `<strong>Country: </strong><span class='details'>${d.properties.name}<br></span><strong>Population: </strong><span class='details'>${format(d.population)}</span>`);
var margin = {top: -100, right: 0, bottom: 0, left: 0};
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;
//no scroll, this only changes canvas size, cut off map   

var country_selected = "Australia"
var mapfilter = function(d){}
// const width = 960 - margin.left - margin.right;
// const height = 500 - margin.top - margin.bottom;
// const color = d3.scaleThreshold()
//   .domain([
//     10000,
//     100000,
//     500000,
//     1000000,
//     5000000,
//     10000000,
//     50000000,
//     100000000,
//     500000000,
//     1500000000
//   ])
//   .range([
//     'rgb(247,251,255)',
//     'rgb(222,235,247)', 
//     'rgb(198,219,239)', 
//     'rgb(158,202,225)',
//     'rgb(107,174,214)',
//     'rgb(66,146,198)',
//     'rgb(33,113,181)',
//     'rgb(8,81,156)',
//     'rgb(8,48,107)',
//     'rgb(3,19,43)'
//   ]);
const color = d3.scaleThreshold()
  .domain([    10000,    100000,    500000,    1000000,    5000000,    10000000,    50000000,    100000000,    500000000,    1500000000  ])
  .range(["#fcfbfd","#f0eef6","#dedded","#c6c6e1","#abaad1","#918dc2","#796eb2","#65489f","#52238d","#3f007d"]);
//https://observablehq.com/@d3/color-schemes


//const svg = d3.select('body')
var svg = d3.select('#dataviz1')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('class', 'map');
const projection = d3.geoRobinson()
  .scale(148)
  .rotate([352, 0, 0])
  .translate( [width / 2, height / 2]);
const path = d3.geoPath().projection(projection);
svg.call(tip);
queue()
  .defer(d3.json, 'world_countries.json')
  .defer(d3.csv, 'countries.csv')
  .defer(d3.tsv, 'country_name.tsv')
  .await(ready);
function ready(error, data, population, countryName) {
  const populationById = {};
  const countryById = {};
  const countryByName = {};

  countryName.forEach(d => { 
    // d.Country = d.Country.replace(/[^a-z0-9]/gi,'')
    // d.id = d.Country 
    countryById[d.name] = d.id; 
    countryByName[d.id] = d.name;
    
  });
  population.forEach(d => { 
    // d.Country = d.Country.replace(/[^a-z0-9]/gi,'')
    // d.id = d.Country 
    populationById[countryById[d.Country]] = +d.Population; 
    // populationById[d.id] = +d.Population; 
    
  });
  data.features.forEach(d => { d.population = populationById[d.id] 
    d.Country =  countryByName[d.id]
  });
  svg.append('g')
    .attr('class', 'countries')
    .selectAll('path')
    .data(data.features)
    .enter().append('path')
      .attr('d', path)
      .style('fill', d => color(populationById[d.id]))
      .style('stroke', 'white')
      .style('opacity', 0.8)
      .style('stroke-width', 0.3)
      .on('click',function(d){
        country_selected = d.Country
        console.log(country_selected)
        mapfilter(d)
      })

      // tooltips
      .on('mouseover',function(d){
        // country_selected = d.properties.name
        // console.log(country_selected)
        // mapfilter(d)

        tip.show(d);
        d3.select(this)
          .style('opacity', 1)
          .style('stroke-width', 3);
      })
      .on('mouseout', function(d){
        tip.hide(d);
        d3.select(this)
          .style('opacity', 0.8)
          .style('stroke-width',0.3);
      });
  svg.append('path')
    .datum(topojson.mesh(data.features, (a, b) => a.id !== b.id))
    .attr('class', 'names')
    .attr('d', path);
}