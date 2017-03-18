module.exports = assureAccount

const generateRandomString = require('./generate-random-string')
const reportError = require('./report-error')

function assureAccount (hoodie) {
  hoodie.account.on('unauthenticate', tryToSignIn.bind(null, hoodie))
  hoodie.store.one('add', signUp.bind(null, hoodie))

  return Promise.resolve()
}

function signUp (hoodie) {
  // We need to sign in in order for data to be synced to the server. Instead
  // of asking the user to enter a username / password, we use the account id
  // as username and a random password that we persist locally
  return hoodie.account.get(['id', 'session'])

  .then(({id, session}) => {
    if (session) {
      if (session.invalid) {
        return tryToSignIn(hoodie)
      }
      return
    }

    var options = {
      username: id,
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
      return hoodie.store.updateOrAdd('_local/account', {password: options.password})
    })

    .then(function () {
      return // resolve with nothing
    })
  })

  .catch(reportError)
}

function tryToSignIn (hoodie) {
  return Promise.all([
    hoodie.store.find('_local/account'),
    hoodie.account.get('username', {local: true})
  ])

  .then(([{password}, username]) => {
    return hoodie.account.signIn({password, username})
  })
}
