module.exports = sentiments

function sentiments (notify) {
  const state = {
    notify: notify,
    result: null
  }
  loadAllSentiment().then((result) => {
    state.result = result
    state.notify(state.result)
  })

  // update each hour
  const now = new Date()
  const secondsUntilNextHour = (60 - now.getMinutes()) * 60 + 60 - now.getSeconds()
  setTimeout(onNextHour.bind(null, state), secondsUntilNextHour * 1000)

  // simulate updates from remote
  generateSentiment(state)
}

function onNextHour (state) {
  if (state.result) {
    state.result.start = state.result.start === 23 ? 0 : state.result.start + 1
    state.result.end = state.result.end === 23 ? 0 : state.result.end + 1
    state.result.sentimentsByHour.shift()
    state.result.sentimentsByHour.push({
      hour: state.result.end,
      num: 0,
      score: 0
    })
    state.notify(state.result)
  }
  setTimeout(onNextHour.bind(null, state), 3600000)
}

function loadAllSentiment (state) {
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
    console.log(`\nhour, 12 - Math.abs(hour - 12) ==============================`)
    console.log(hour, 12 - Math.abs(hour - 12))

    sentimentsByHour.unshift({
      hour: hour,
      num: Math.round(Math.random() * 15) + (12 - Math.abs(hour - 12)) * 5,
      score: Math.random() * 2 - 1
    })
    hour--
    if (hour < 0) {
      hour = 23
    }
  }

  return sentimentsByHour
}

function generateSentiment (state) {
  setTimeout(() => {
    const sentimentsByHour = state.result.sentimentsByHour
    const [last] = sentimentsByHour.slice(-1)
    const newScore = Math.random() * 2 - 1

    last.score = (last.num * last.score + newScore) / (last.num + 1)
    last.num++
    state.result.max = sentimentsByHour.reduce((max, sentiment) => {
      return sentiment.num > max ? sentiment.num : max
    }, 0)

    state.notify(state.result)
    generateSentiment(state)
  }, Math.random() * 5000 + 2000)
}
