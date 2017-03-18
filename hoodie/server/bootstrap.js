module.exports = bootstrap

function bootstrap (server, stores) {
  return stores.reduce((promise, store) => {
    return promise

    .then(() => {
      return findAllSentiments(server, store)
    })

    .then(() => {
      // 1s timeout between bootstrapping
      return new Promise(resolve => setTimeout(resolve, 1000))
    })
  }, Promise.resolve())
}

function findAllSentiments (server, store) {
  server.log(['verbose', 'bootstrap'], `bootstrapping ${store.db.name}...`)
  return store.findAll()

  .then((docs) => {
    return docs.filter(doc => !!doc.sentiment)
  })

  .then((docs) => {
    server.log(['info', 'bootstrap'], `${docs.length} notes with sentiments found in ${store.db.name}`)
    const sentimentDocs = docs.map((doc) => {
      const dayAndHour = doc.hoodie.createdAt.substr(0, 13).replace(/\D/g, '')
      const sentimentDocId = `sentiment/${dayAndHour}/${doc._id.substr(5)}`

      return {
        _id: sentimentDocId,
        sentiment: doc.sentiment,
        analysis: doc.analysis,
        hoodie: doc.hoodie
      }
    })

    server.log(['verbose', 'bootstrap'], `Adding sentiment docs for to ${store.db.name}`)
    server.plugins.sentiments.db.add(sentimentDocs)
      .then((result) => {
        // already existent docs get ignored
        server.log(['verbose', 'bootstrap'], `Sentiment docs added to ${store.db.name}`)
      })
      .catch((error) => {
        server.log(['error', 'bootstrap'], `Error adding sentiment docs to ${store.db.name}: ${error}`)
      })
  })
}
