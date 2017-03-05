const Chart = require('chart.js')
const d3 = require('d3')

const loadAllSentiment = require('./lib/load-all-sentiments')
const onNewSentiment = require('./lib/on-new-sentiment')

require('./style/base.scss')

loadAllSentiment()

.then((result) => {
  const chart = new Chart('chart', {
    type: 'bar',
    data: {
      labels: result.sentimentsByHour.map(sentiment => sentiment.hour),
      datasets: [{
        label: 'number of sentiments',
        data: result.sentimentsByHour.map(sentiment => sentiment.num),
        backgroundColor: result.sentimentsByHour.map(sentiment => `hsl(${Math.round((sentiment.score + 1) * 360)},  100%,50%)`)
      }]
    }
  })

  onNewSentiment((sentiment) => {
    //console.log(`\nsentiment ==============================`)
    //console.log(sentiment)

    chart.data.datasets[0].data[23] += 1
    chart.data.datasets[0].backgroundColor[23] = `hsl(${Math.round(Math.random() * 360)},  100%,50%)`
    chart.update()
  })


  var resultSet = result.sentimentsByHour.map(sentiment => sentiment.hour)
  var resultNum = result.sentimentsByHour.map(sentiment => sentiment.num)
  var resultScore = result.sentimentsByHour.map(sentiment => sentiment.score)

  var barPadding = 40
  const WIDTH = window.innerWidth * .9
  const HEIGHT = window.innerHeight * .9


  for (i = 0; i < resultScore.length; i++){
    resultScore[i] = Math.round((resultScore[i] + 1) * 5);
  }

  var maxScore = function() {
    return Math.max.apply(null, resultScore);
  }

  // gridlines in x axis function
  function make_x_gridlines() {
      return d3.axisBottom(x)
          .ticks(12)
  }

  // gridlines in y axis function
  function make_y_gridlines() {
      return d3.axisLeft(y)
          .ticks(5)
  }

  var color = d3.scaleQuantize()
    .domain([0,maxScore()])
    .range(['#FF006A','#FF3F00','#FF5500','#FF5500','#F89D00','#D7C017','#79CC1A','#1ACC6D','#1ACCA9','#1ABACC'])


  // set the dimensions and margins of the graph
  var margin = {top: 20, right: 20, bottom: 30, left: 50},
      paddedWidth = WIDTH - margin.left - margin.right,
      paddedHeight = HEIGHT - margin.top - margin.bottom;

  // parse the date / time
  var parseTime = d3.timeParse("%d-%b-%y");

  // set the ranges
  var x = d3.scaleTime().range([0, paddedWidth]);
  var y = d3.scaleLinear().range([paddedHeight, 0]);

  // define the line
  var valueline = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.close); });




  const svg = d3.select('body')
                .append('svg')
                .attr('width', paddedWidth)
                .attr('height', paddedHeight)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Gridlines
  svg.append('g')
    .attr('class', 'grid')
    .attr('transform', 'translate(0,' + paddedHeight + ')')
    .call(make_x_gridlines()
      .tickSize(-paddedHeight)
      .tickFormat("")
    )

  svg.append('g')
    .attr('class', 'grid')
    .call(make_y_gridlines()
      .tickSize(-paddedWidth)
      .tickFormat("")
    )

  svg.selectAll('rect')
    .data(resultScore)
    .enter()
    .append('rect')
    .attr('x', function (d, i) {
      return i * (paddedWidth / resultSet.length)
    })
    .attr('y', function (d, i) {
      return paddedHeight * .5 - resultNum[i] * 1
    })
    .attr('width', paddedWidth / resultSet.length - barPadding)
    .attr('height', function (d, i) {
      return resultNum[i] * 2
    })
    .attr('rx', (paddedWidth / resultSet.length - barPadding) / 2)
    .attr('ry', (paddedWidth / resultSet.length - barPadding) / 2)
    .attr('fill', function (d, i) {
      return color(d)
    })



    // data.forEach(function(d) {
    //     d.date = parseTime(d.date);
    //     d.close = +d.close;
    // });


})
