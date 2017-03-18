module.exports = plugin
plugin.attributes = {
  name: 'voice-of-interconnect'
}

const findWatsonCredentials = require('./find-watson-credentials')

const redirectPlugin = require('./redirect')
const rollbarPlugin = require('./rollbar')
const loadUserAccountsPlugin = require('./load-user-accounts')
const sentimentsDbPlugin = require('./sentiments-db')

function plugin (server, options, next) {
  findWatsonCredentials(server)

  const pluginsWitOptions = [
    redirectPlugin,
    rollbarPlugin,
    sentimentsDbPlugin,
    loadUserAccountsPlugin
  ].map((plugin) => {
    return {register: plugin, options}
  })

  server.register(pluginsWitOptions, next)
}
