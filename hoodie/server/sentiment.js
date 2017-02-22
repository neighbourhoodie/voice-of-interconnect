module.exports = sentiment

function sentiment (store, noteId) {
  // simulate sentiment analysis
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
}
