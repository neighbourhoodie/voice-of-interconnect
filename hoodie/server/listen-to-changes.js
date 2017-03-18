module.exports = listenToChanges

const handleUserChange = require('./handle-user-change')

function listenToChanges (server, name) {
  const Store = server.plugins.store.api

  return Store.open(name)

  .catch((error) => {
    server.log(['warn', 'listen-to-changes'], `Database missing for ${name}`)

    if (error.status === 404) {
      const idRole = 'id:' + name.substr('user/'.length)
      return Store.create(name, {
        access: ['read', 'write'],
        role: [idRole]
      })

      .then(function (name) {
        server.log(['info', 'listen-to-changes'], `Database ${name} created with read/write access for ${idRole}`)

        return Store.open(name)
      })
    }

    throw error
  })

  .then((store) => {
    server.log(['verbose', 'listen-to-changes'], `Listening to changes in ${name}`)

    // once https://github.com/hoodiehq/pouchdb-hoodie-api/pull/123 is merged we
    // can use store.on('change'). Until then we have to use PouchDB’s changes

    // Unless dbUrl is set, this will not work until this bug is resolved:
    // https://github.com/pouchdb/pouchdb-server/pull/214
    store.on('change', function (eventName, doc) {
      handleUserChange(server, store, eventName, doc)
    })

    return store
  })
}
