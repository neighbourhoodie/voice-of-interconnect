module.exports.register = sentimentsDb
module.exports.register.attributes = {
  name: 'sentiments'
}

function sentimentsDb (server, options, next) {
  const Store = server.plugins.store.api

  server.log(['verbose', 'sentiments'], 'creating sentiments db...')

  Store.create('sentiments', {
    access: 'read'
  })
    .then(() => {
      server.log(['info', 'sentiments'], 'sentiments db created')
    })
    .catch((error) => {
      if (error.status === 409) {
        server.log(['info', 'sentiments'], 'sentiments db already exists.')
        return
      }
      throw error
    })
    .then(() => Store.open('sentiments'))
    .then((db) => {
      server.expose('db', db)
      next()
    })
    .catch((error) => {
      server.log(['error', 'sentiments'], `Could not create sentiments db: ${error}`)
      next(error)
    })
}
