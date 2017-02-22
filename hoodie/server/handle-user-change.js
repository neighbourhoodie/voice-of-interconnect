module.exports = handleUserChange

function handleUserChange (server, store, doc) {
  server.log(['info', 'change'], `${doc._id} by ${doc.createdAt}`)
  var noteId = toDocId(doc)

  if (isSpeech(doc)) {
    server.log(['verbose', 'speech'], `sending ${doc._id} to Speech to Text...`)

    // simulate transcription
    setTimeout(function () {
      return Promise.all([
        store.update(noteId, function (doc) {
          doc.progress.push({
            type: 'transcription',
            at: new Date()
          })
        }),
        store.add({
          id: noteId + '/text',
          text: 'I love dinosaurs'
        })
      ])
        .then(() => {
          server.log(['verbose', 'speech'], `retrieved text for ${doc._id}`)
        })
        .catch((error) => {
          server.log(['error', 'speech'], error)
        })
    }, 3000)
  }

  if (isText(doc)) {
    server.log(['verbose', 'speech'], `sending ${doc._id} to AlchemyLanguage...`)

    // simulate sentiment analysis
    setTimeout(function () {
      return Promise.all([
        store.update(noteId, function (doc) {
          doc.progress.push({
            type: 'analysis',
            at: new Date()
          })
        }),
        store.add({
          id: noteId + '/sentiment',
          sentiment: parseFloat(Math.random().toFixed(6))
        })
      ])
        .then(() => {
          server.log(['verbose', 'speech'], `retrieved sentiment for ${doc._id}`)
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
