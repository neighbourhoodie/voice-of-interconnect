module.exports.register = loadUserAccounts
module.exports.register.attributes = {
  name: 'load-user-accounts',
  dependencies: 'sentiments'
}

const bootstrap = require('./bootstrap')
const listenToChanges = require('./listen-to-changes')

function loadUserAccounts (server, options, next) {
  const Account = server.plugins.account.api
  const Store = server.plugins.store.api

  Store.on('create', (name) => {
    if (name.substr(0, 'user/'.length) !== 'user/') {
      return
    }

    server.log(['info', 'db'], `new database: ${name}`)
    listenToChanges(server, name)
  })

  server.log(['verbose', 'app'], 'loading all user dbs')
  Account.accounts.findAll({})

  .then((accounts) => {
    server.log(['info', 'app'], `${accounts.length} accounts loaded`)

    const promises = accounts.map((account) => {
      return listenToChanges(server, `user/${account.id}`)
    })

    Promise.all(promises)

    .then(function (userStores) {
      next()

      // we throttle bootstrapping, so don’t wait for it to finish before
      // accepting requests.
      bootstrap(server, userStores)
        .catch((error) => {
          server.log(['error', 'bootstrap'], error.message)
        })
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
}
