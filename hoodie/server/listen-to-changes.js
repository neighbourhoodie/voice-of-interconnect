module.exports = listenToChanges

function listenToChanges (server, name) {
  const Store = server.plugins.store.api

  return Store.open(name)

  .then((store) => {
    server.log(['verbose', 'change'], `Listening to changes in ${name}`)

    // once https://github.com/hoodiehq/pouchdb-hoodie-api/pull/123 is merged we
    // can use store.on('change'). Until then we have to use PouchDB’s changes

    // Unless dbUrl is set, this will not work until this bug is resolved:
    // https://github.com/pouchdb/pouchdb-server/pull/214
    store.db.changes({
      since: 'now',
      live: true,
      include_docs: true
    })
    .on('change', function (change) {
      server.log(['info', 'change'], `${change.id} by ${change.doc.createdAt}`)
    })
  })
}
