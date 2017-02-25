const Chart = require('chart.js')

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

  onNewSentiment((sentiment) => {
    console.log(`\nsentiment ==============================`)
    console.log(sentiment)

    chart.data.datasets[0].data[23] += 1
    chart.data.datasets[0].backgroundColor[23] = `hsl(${Math.round(Math.random() * 360)},  100%,50%)`
    chart.update()
  })
})
