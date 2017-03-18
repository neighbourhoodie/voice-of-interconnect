module.exports.register = rollbar
module.exports.register.attributes = {
  name: 'rollbar'
}

function rollbar (server, options, next) {
  if (process.env.ROLLBAR_ACCESS_TOKEN) {
    const rollbar = require('rollbar')
    rollbar.init(process.env.ROLLBAR_ACCESS_TOKEN, {
      env: process.env.NODE_ENV
    })
    rollbar.handleUncaughtExceptionsAndRejections(process.env.POST_SERVER_ITEM_ACCESS_TOKEN, {
      exitOnUncaughtException: true
    })

    server.on('log', (event, tags) => {
      if (!tags.error) {
        return
      }

      rollbar.reportMessage(event.data)
    })
  }

  next()
}
