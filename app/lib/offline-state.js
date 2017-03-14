module.exports = detectOffline

const $systemStateOffline = document.querySelector('#reconnecting')
const $systemStateOnline = document.querySelector('#restored')
const $recordings = document.querySelector('#stage__recordings')

function detectOffline (hoodie) {
  hoodie.connectionStatus.on('disconnect', handleOfflineState.bind(null, hoodie))
  hoodie.connectionStatus.on('reconnect', handleOnlineState.bind(null, hoodie))

  hoodie.connectionStatus.startChecking({
    interval: {
      connected: 30000,
      disconnected: 3000
    }
  }).then(function () {
    if (hoodie.connectionStatus.ok === false) {
      // we are offline
      handleOfflineState(hoodie)
    }
  })
}

function handleOfflineState (hoodie) {
  $recordings.classList.add('offline')
  $systemStateOffline.classList.add('offline')
}

function handleOnlineState (hoodie) {
  $recordings.classList.remove('offline')
  $systemStateOffline.classList.remove('offline')
  hoodie.store.connect()

  $systemStateOnline.classList.add('online')
  setTimeout(function () {
    $systemStateOnline.classList.remove('online')
  }, 3000)
}
