module.exports = assureAccount

const generateRandomString = require('./generate-random-string')

function assureAccount (hoodie) {
  // We need to sign in in order for data to be synced to the server. Instead
  // of asking the user to enter a username / password, we use the account id
  // as username and a random password that we persist locally
  return hoodie.account.get(['id', 'session'])

  .then((properties) => {
    if (properties.session) {
      return
    }

    var options = {
      username: properties.id,
      password: generateRandomString()
    }

    console.log('new user, signing up ...')

    return hoodie.account.signUp(options)

    .catch(function (error) {
      if (error.name === 'ConflictError') {
        return // all good, let’s try to sign in
      }

      throw error
    })

    .then(function () {
      return hoodie.account.signIn(options)
    })

    .then(function () {
      return hoodie.store.addOrUpdate('_account', {password: options.password})
    })

    .then(function () {
      return // resolve with nothing
    })
  })
}
