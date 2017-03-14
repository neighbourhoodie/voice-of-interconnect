module.exports = detectOffline

const $systemStateOffline = document.querySelector('#reconnecting')
const $systemStateOnline = document.querySelector('#restored')
const $recordings = document.querySelector('#stage__recordings')

function detectOffline (hoodie) {
  hoodie.connectionStatus.startChecking({interval: 3000}).then(function () {
    function handleOfflineState () {
      $recordings.classList.add('offline')
      $systemStateOffline.classList.add('offline')
    }

    function handleOnlineState () {
      $recordings.classList.remove('offline')
      $systemStateOffline.classList.remove('offline')

      $systemStateOnline.classList.add('online')
      setTimeout(function () {
        $systemStateOnline.classList.remove('online')
      }, 3000)
    }

    if (hoodie.connectionStatus.ok === false) {
      // we are offline
      handleOfflineState()
    }

    hoodie.connectionStatus.on('disconnect', handleOfflineState)
    hoodie.connectionStatus.on('reconnect', handleOnlineState)
  })
}
