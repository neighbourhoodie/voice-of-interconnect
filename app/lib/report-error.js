/* global Rollbar */
module.exports = reportError

function reportError (error) {
  if (typeof Rollbar === 'undefined') {
    console.log(error)
    return
  }

  Rollbar.error(error)
}
