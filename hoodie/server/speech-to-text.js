module.exports = speechToText

function speechToText (store, noteId) {
  // simulate transcription
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
}
