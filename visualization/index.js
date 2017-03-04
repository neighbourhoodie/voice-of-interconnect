const Chart = require('chart.js')
const d3 = require('d3')

const loadAllSentiment = require('./lib/load-all-sentiments')
const onNewSentiment = require('./lib/on-new-sentiment')

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

  var resultSet = result.sentimentsByHour.map(sentiment => sentiment.hour)
  var resultNum = result.sentimentsByHour.map(sentiment => sentiment.num)

  var barPadding = 1
  const WIDTH = window.innerWidth
  const HEIGHT = window.innerHeight

  const svg = d3.select('body')
                .append('svg')
                .attr('width', WIDTH)
                .attr('height', HEIGHT)

  svg.selectAll('rect')
                  .data(resultNum)
                  .enter()
                  .append('rect')
                  .attr('class', 'rectangle')
                  .attr('x', function (d, i) {
                    return i * (WIDTH / resultSet.length)
                  })
                  .attr('y', function (d) {
                    return HEIGHT - d * 4
                  })
                  .attr('width', WIDTH / resultSet.length - barPadding)
                  .attr('height', function (d) {
                    return d * 4
                  })
                  .attr('fill', function (d) {
                    return 'rgba(0, 0, ' + (d * 10) + ', .' + (d) + ')'
                  })

  onNewSentiment((sentiment) => {
    console.log(`\nsentiment ==============================`)
    console.log(sentiment)

    chart.data.datasets[0].data[23] += 1
    chart.data.datasets[0].backgroundColor[23] = `hsl(${Math.round(Math.random() * 360)},  100%,50%)`
    chart.update()
  })
})
