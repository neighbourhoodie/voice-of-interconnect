module.exports = handleUserChange

const sentiment = require('./sentiment')
const speechToText = require('./speech-to-text')

function handleUserChange (server, store, doc) {
  server.log(['info', 'change'], `${doc._id} by ${doc.createdAt}`)
  var noteId = toDocId(doc)

  if (isSpeech(doc)) {
    server.log(['verbose', 'alchemy'], `sending ${noteId} to Speech to Text...`)

    return speechToText(server, store, noteId)
      .then(() => {
        server.log(['verbose', 'alchemy'], `retrieved text for ${noteId}`)
      })
      .catch((error) => {
        server.log(['error', 'alchemy'], error.toString())
      })
  }

  if (isText(doc)) {
    server.log(['verbose', 'alchemy'], `sending ${noteId} to AlchemyLanguage...`)

    return sentiment(server, store, noteId, doc.text)
      .then(() => {
        server.log(['verbose', 'alchemy'], `retrieved sentiment for ${noteId}`)
      })
      .catch((error) => {
        server.log(['error', 'alchemy'], error)
      })
  }
}

function isSpeech (doc) {
  return /speech$/.test(doc._id)
}

function isText (doc) {
  if (!doc.text || doc.sentiment) {
    return
  }

  if (doc.hasSpeech === false) {
    return true
  }

  if (doc.progress.pop().type === 'transcription') {
    return true
  }
}

function toDocId (doc) {
  return doc._id.match(/^note\/[^/]+/).pop()
}
