/* global location */
module.exports = sentiments

const PouchDB = require('pouchdb-browser')
const moment = require('moment')

const reportError = require('./report-error')

function sentiments (notify) {
  const localDbName = 'sentiments'
  const remoteDbUrl = location.origin + '/hoodie/store/api/sentiments'

  const state = {
    notify: notify,
    result: null,
    localDb: new PouchDB(localDbName),
    remoteDb: new PouchDB(remoteDbUrl)
  }

  loadAllSentiment(state)

  .then((result) => {
    state.result = result
    state.notify(state.result)

    window.replication = state.replication = state.localDb.replicate.from(state.remoteDb, {
      live: true,
      retry: true
    })
    state.replication.on('change', updateStats.bind(null, state))
    state.replication.on('error', (error) => {
      reportError(`Sentiments Replication Error: ${error.message}`)
    })
  })

  // update each hour
  const now = new Date()
  const secondsUntilNextHour = (60 - now.getMinutes()) * 60 + 60 - now.getSeconds()
  setTimeout(onNextHour.bind(null, state), secondsUntilNextHour * 1000)
}

function onNextHour (state) {
  if (state.result) {
    state.result.start = state.result.start === 23 ? 0 : state.result.start + 1
    state.result.end = state.result.end === 23 ? 0 : state.result.end + 1
    state.result.labels = hourToLabels(state.result.start)
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
  const oneDayAgo = moment().subtract(24, 'hours')
  const timestamp = oneDayAgo.toISOString()
  const dayAndHour = timestamp.substr(0, 13).replace(/\D/g, '')

  return state.localDb.allDocs({
    startkey: `sentiment/${dayAndHour}`,
    include_docs: true
  })

  .then(result => result.rows.map(row => row.doc))
  .then((docs) => {
    const docStatsByHour = docs.reduce((map, doc) => {
      const hours = moment(doc.hoodie.createdAt).hours()
      if (map[hours]) {
        map[hours] = {
          num: map[hours].num + 1,
          score: (map[hours].num * map[hours].score + doc.sentiment) / (map[hours].num + 1)
        }
      } else {
        map[hours] = {
          hour: hours,
          num: 1,
          score: doc.sentiment
        }
      }
      return map
    }, {})

    const m = moment().subtract(24, 'hours')
    const start = m.hours()
    let sentimentsByHour = []
    let max = 0
    let stats
    for (var i = 0; i < 24; i++) {
      m.add(1, 'hour')
      stats = docStatsByHour[m.hours()] || {
        hour: m.hours(),
        score: 0,
        num: 0
      }
      sentimentsByHour.push(stats)
      max = Math.max(stats.num, max)
    }
    const end = m.hours()

    const labels = hourToLabels(start)
    return {start, end, max, labels, sentimentsByHour}
  })
}

function updateStats (state) {
  loadAllSentiment(state)

  .then((result) => {
    state.result = result
    state.notify(state.result)
  })
}

function hourToLabels (hour) {
  const m = moment().subtract(24, 'hours')
  let i = 0
  let a = []
  for (i = 0; i < 25; i++) {
    m.add(1, 'hour')

    // only labels for each 3rd hour
    if (i % 3 === 0) {
      a.push(m.format('h a'))
    } else {
      a.push('')
    }

    hour++
    if (hour > 23) {
      hour = 0
    }
  }
  return a
}
