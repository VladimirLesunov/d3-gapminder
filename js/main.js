const margin = {left: 20, right: 10, top: 10, bottom: 30};
const timeInterval = 100;

const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const canvas = d3.select('#chart-area').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

const xAxisGroup = canvas.append('g')
  .attr('class', 'x axis')
  .attr('transform', `translate(0, ${height})`);

const yAxisGroup = canvas.append('g')
  .attr('class', 'y-axis');

const x = d3.scaleLog()
  .domain([300, 150000])
  .range([0, width]);

const y = d3.scaleLinear()
  .domain([0, 90])
  .range([height, 0]);

const r = d3.scaleLinear()
  .range([15 * Math.PI, 1300 * Math.PI]);

const continentColor = d3.scaleOrdinal(d3.schemePaired);

const xAxisCall = d3.axisBottom(x)
  .ticks(4)
  .tickValues([400, 4000, 40000])
  .tickFormat(d => '$' + d);
xAxisGroup.call(xAxisCall);

const yAxisCall = d3.axisLeft(y);
yAxisGroup.call(yAxisCall);

const yearText = canvas.append('g')
  .attr('height', 40)
  .attr('width', 100)
  .append('text')
  .attr('x', width)
  .attr('y', height - 20)
  .attr('font-size', '40px')
  .attr('fill', '#795548')
  .attr('text-anchor', 'end');

const continents = ['europe', 'asia', 'americas', 'africa'];

const legend = canvas.append('g')
  .attr('transform', `translate(${width - 10}, ${height - 150})`);

continents.forEach((continent, i) => {
  const legendRow = legend.append('g')
    .attr('transform', `translate(0, ${i * 20})`);


  legendRow.append('rect')
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', continentColor(continent));

  legendRow.append('text')
    .attr('x', -10)
    .attr('y', 10)
    .attr('text-anchor', 'end')
    .style('text-transform', 'capitalize')
    .text(continent);
});

d3.json("data/data.json").then(data => {
  const countriesData = data
    .map(year => year.countries.filter(country => !!country.income && !!country.life_exp && !!country.population));

  let idx = 0;

  d3.interval(() => {
    idx++;
    countriesData[idx] ? updateData(countriesData[idx]) : idx = 0;
    yearText.text(data[idx].year);
  }, timeInterval)
});

function updateData(data) {
  const t = d3.transition().duration(timeInterval);
  const circles = canvas.selectAll('circle').data(data, d => d.country);

  r.domain([2000, d3.max(data, d => +d.population)]);

  circles.exit()
    .remove();

  circles
    .enter()
    .append('circle')
    .attr('fill', d => {
      return continentColor(d.continent)
    })
    .attr('cy', d => y(+d.life_exp))
    .attr('cx', d => x(+d.income))
    .attr('r', d => Math.sqrt(r(+d.population) / Math.PI))
    .merge(circles)
    .transition(t)
    .attr('cy', d => y(+d.life_exp))
    .attr('cx', d => x(+d.income))
    .attr('r', d => Math.sqrt(r(+d.population) / Math.PI))
}
