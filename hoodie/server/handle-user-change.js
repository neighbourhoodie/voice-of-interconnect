module.exports = handleUserChange

const sentiment = require('./sentiment')
const speechToText = require('./speech-to-text')

function handleUserChange (server, store, eventName, doc) {
  if (!doc.hoodie) {
    server.log(['warn', 'change'], `Ignoring change in ${doc._id}: not a Hoodie document`)
    server.log(['verbose', 'change'], JSON.stringify(doc))
    return
  }

  server.log(['info', 'change'], `${doc._id} by ${doc.hoodie.createdAt}`)
  var noteId = toDocId(doc)

  if (isSpeech(doc)) {
    server.log(['verbose', 'natural-language-understanding'], `sending ${noteId} to Speech to Text...`)

    return speechToText(server, store, noteId)
      .then(() => {
        server.log(['verbose', 'natural-language-understanding'], `retrieved text for ${noteId}`)
      })
      .catch((error) => {
        server.log(['error', 'natural-language-understanding'], error.toString())
      })
  }

  if (isText(doc)) {
    server.log(['verbose', 'natural-language-understanding'], `sending ${noteId} to Natural Language Understanding...`)

    return sentiment(server, store, noteId, doc.text)
      .then(() => {
        server.log(['verbose', 'natural-language-understanding'], `retrieved sentiment for ${noteId}`)
      })
      .catch((error) => {
        server.log(['error', 'natural-language-understanding'], error)
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
