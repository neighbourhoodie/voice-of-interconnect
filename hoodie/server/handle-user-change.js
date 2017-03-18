module.exports = handleUserChange

const sentiment = require('./sentiment')
const speechToText = require('./speech-to-text')

function handleUserChange (server, store, eventName, doc) {
  if (!doc.hoodie) {
    server.log(['warn', 'change'], `Ignoring change in ${doc._id}: not a Hoodie document`)
    server.log(['verbose', 'change'], JSON.stringify(doc))
    return
  }

  const dbName = store.db.name
  const revision = parseInt(doc._rev, 10)

  if (revision > 10) {
    server.log(['error', 'change'], `${dbName}/${doc._id} has revision higher than 10. Ignoring to avoid unwanted infinite-loop changes.`)
    return
  }

  server.log(['info', 'change'], `${dbName}/${doc._id} by ${doc.hoodie.createdAt}`)
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
      .then((doc) => {
        server.log(['verbose', 'natural-language-understanding'], `retrieved sentiment for ${noteId}`)

        const dayAndHour = doc.hoodie.createdAt.substr(0, 13).replace(/\D/g, '')
        const sentimentDocId = `sentiment/${dayAndHour}/${doc._id.substr(5)}`
        server.log(['verbose', 'sentiments'], `creating sentiments document for analysis: ${sentimentDocId}`)
        server.plugins.sentiments.db.updateOrAdd({
          _id: sentimentDocId,
          sentiment: doc.sentiment,
          analysis: doc.analysis,
          hoodie: doc.hoodie
        })
          .then((doc) => {
            server.log(['verbose', 'sentiments'], `${sentimentDocId} created/updated: #${doc._rev}`)
          })
          .catch((error) => {
            server.log(['error', 'sentiments'], `Could not create ${sentimentDocId}: ${error}`)
          })
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
  if (!doc.text || 'sentiment' in doc) {
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
