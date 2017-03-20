const d3 = require('d3')
const OfflinePlugin = require('offline-plugin/runtime')

const sentiments = require('./lib/sentiments')

require('./style/base.scss')

OfflinePlugin.install({
  onInstalled: function () {},
  onUpdating: function () {},
  onUpdateReady: function () {
    OfflinePlugin.applyUpdate()
  },
  onUpdated: function () {
    window.location.reload()
  }
})

sentiments((result) => {
  var resultSet = result.sentimentsByHour.map(sentiment => sentiment.hour)
  var resultNum = result.sentimentsByHour.map(sentiment => sentiment.num)
  var resultScore = result.sentimentsByHour.map(sentiment => sentiment.score)

  function drawSentimentChart () {
    for (i = 0; i < resultScore.length; i++) {
      resultScore[i] = Math.round((resultScore[i] + 1) * 5)
    }

    var maxScore = function () {
      return Math.max.apply(null, resultScore)
    }

    // gridlines in x axis function
    function makeXGridlines () {
      return d3.axisBottom(x)
            .ticks(96)
    }

    // gridlines in y axis function
    function makeYGridlines () {
      return d3.axisLeft(y)
            .ticks(8)
    }

    function makeLabels () {
      return d3.axisBottom(x)
            .ticks(9)
    }

    var color = d3.scaleQuantize()
      .domain([0, maxScore()])
      .range(['#FF006A', '#FF3F00', '#FF5500', '#FF5500', '#F89D00', '#D7C017', '#79CC1A', '#1ACC6D', '#1ACCA9', '#1ABACC'])

    const WIDTH = window.innerWidth
    const HEIGHT = window.innerHeight

    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 50, bottom: 120, left: 50}
    var paddedWidth = WIDTH - margin.left - margin.right
    var paddedHeight = HEIGHT - margin.top - margin.bottom

    var barPadding = paddedWidth * 0.7 / resultSet.length

    var maxNum = Math.max.apply(null, resultNum)
    var multiplier = (paddedHeight * 0.4) / maxNum
    var numRelativeHeight = []

    for (var i = 0; i < resultNum.length; i++) {
      numRelativeHeight[i] = resultNum[i] * multiplier
    }

    // set the ranges
    var x = d3.scaleTime().range([0, paddedWidth])
    var y = d3.scaleLinear().range([paddedHeight, 0])

    // define the line
    d3.line()
      .x(function (d) { return x(d.date) })
      .y(function (d) { return y(d.close) })

    var visDiv = document.querySelector('.visualization')
    visDiv.innerHTML = ''
    const svg = d3.select(visDiv)
                  .append('svg')
                  .attr('width', paddedWidth)
                  .attr('height', paddedHeight)
                  .append('g')
                  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    // Gridlines
    svg.append('g')
      .attr('class', 'grid x-grid')
      .attr('transform', 'translate(0,' + paddedHeight + ')')
      .call(makeXGridlines()
        .tickSize(-paddedHeight)
        .tickFormat('')
      )

    svg.append('g')
      .attr('class', 'grid y-grid')
      .call(makeYGridlines()
        .tickSize(-paddedWidth)
        .tickFormat('')
      )

    svg.selectAll('rect')
      .data(resultScore)
      .enter()
      .append('rect')
      .attr('x', function (d, i) {
        return (i * (paddedWidth / resultSet.length)) + barPadding / 2
      })
      .attr('y', function (d, i) {
        return paddedHeight * 0.5 - numRelativeHeight[i] * 1
      })
      .attr('width', paddedWidth / resultSet.length - barPadding)
      .attr('height', function (d, i) {
        return numRelativeHeight[i] * 2
      })
      .attr('rx', (paddedWidth / resultSet.length - barPadding) / 2)
      .attr('ry', (paddedWidth / resultSet.length - barPadding) / 2)
      .attr('fill', function (d, i) {
        return color(d)
      })

    const labels = result.labels
    let labelIndex = 0

    svg.append('g')
      .attr('transform', 'translate(0,' + paddedHeight + ')')
      .attr('class', 'labels')
      .style('font-size', '16px')
      .style('font-family', 'Lato')
      .call(makeLabels()
        .tickFormat(() => {
          return labels[labelIndex++]
        })
      )
  }

  drawSentimentChart()
})
