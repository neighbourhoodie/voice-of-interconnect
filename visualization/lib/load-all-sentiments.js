module.exports = loadAllSentiment

getPast24hMockData()

function loadAllSentiment () {
  const sentimentsByHour = getPast24hMockData()
  const now = new Date()
  const start = now.toISOString().substr(0, 13)
  now.setHours(now.getHours() - 1)
  const end = now.toISOString().substr(0, 13)
  const max = sentimentsByHour.reduce((max, sentiment) => {
    return sentiment.num > max ? sentiment.num : max
  }, 0)

  return Promise.resolve({
    start,
    end,
    max,
    sentimentsByHour
  })
}

function getPast24hMockData () {
  let hour = new Date().getHours()
  const sentimentsByHour = []

  for (var i = 0; i < 24; i++) {
    sentimentsByHour.unshift({
      hour: hour,
      num: Math.round(Math.random() * 250) + 50,
      score: Math.random() * 2 - 1
    })
    hour--
    if (hour < 0) {
      hour = 23
    }
  }

  return sentimentsByHour
}
