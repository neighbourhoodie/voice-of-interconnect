module.exports = assureAccount

const generateRandomString = require('./generate-random-string')

function assureAccount (hoodie) {
  // We need to sign in in order for data to be synced to the server. Instead
  // of asking the user to enter a username / password, we use the account id
  // as username and a random password that we persist locally
  if (hoodie.account.isSignedIn()) {
    return Promise.resolve()
  }

  var options = {
    username: hoodie.account.id,
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
}
