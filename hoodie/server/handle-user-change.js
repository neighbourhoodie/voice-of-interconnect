module.exports = handleUserChange

const sentiment = require('./sentiment')
const speechToText = require('./speech-to-text')

function handleUserChange (server, store, doc) {
  server.log(['info', 'change'], `${doc._id} by ${doc.createdAt}`)
  var noteId = toDocId(doc)

  if (isSpeech(doc)) {
    server.log(['verbose', 'speech'], `sending ${noteId} to Speech to Text...`)

    setTimeout(function () {
      return speechToText(store, noteId)
        .then(() => {
          server.log(['verbose', 'speech'], `retrieved text for ${noteId}`)
        })
        .catch((error) => {
          server.log(['error', 'speech'], error)
        })
    }, 3000)
  }

  if (isText(doc)) {
    server.log(['verbose', 'speech'], `sending ${noteId} to AlchemyLanguage...`)

    setTimeout(function () {
      return sentiment(store, noteId)
        .then(() => {
          server.log(['verbose', 'speech'], `retrieved sentiment for ${noteId}`)
        })
        .catch((error) => {
          server.log(['error', 'speech'], error)
        })
    }, 3000)
  }
}

function isSpeech (doc) {
  return /speech$/.test(doc._id)
}

function isText (doc) {
  return /text$/.test(doc._id)
}

function toDocId (doc) {
  return doc._id.match(/^note\/[^/]+/).pop()
}
