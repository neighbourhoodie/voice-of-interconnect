module.exports = plugin
plugin.attributes = {
  name: 'voice-of-interconnect'
}

const findWatsonCredentials = require('./find-watson-credentials')
const listenToChanges = require('./listen-to-changes')
const redirectPlugin = require('./redirect')
const rollbarPlugin = require('./rollbar')

function plugin (server, options, next) {
  const Account = server.plugins.account.api
  const Store = server.plugins.store.api

  findWatsonCredentials(server)

  server.register(redirectPlugin)
  server.register({
    register: rollbarPlugin,
    options
  })

  server.log(['verbose', 'app'], 'loading all user dbs')
  Account.accounts.findAll({})

  .then((accounts) => {
    server.log(['info', 'app'], `${accounts.length} accounts loaded`)

    const promises = accounts.map((account) => {
      return listenToChanges(server, `user/${account.id}`)
    })

    Promise.all(promises)

    .then(function () {
      next()
    })

    .catch((error) => {
      server.log(['error', 'app'], `User DB error: ${error}`)
      next(error)
    })
  })

  .catch((error) => {
    server.log(['error', 'app'], `Could not load user accounts: ${error}`)
    next(error)
  })

  Store.on('create', (name) => {
    server.log(['info', 'db'], `new database: ${name}`)
    listenToChanges(server, name)
  })
}
