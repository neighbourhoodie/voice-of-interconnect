module.exports = detectOffline

const $body = document.querySelector('body')
const $recordings = document.querySelector('#stage__recordings')

function detectOffline (hoodie) {

  hoodie.connectionStatus.startChecking({interval: 3000}).then(function () {

    function handleOfflineState() {
      $recordings.classList.add('offline')
      $body.classList.add('offline')
    }

    function handleOnlineState() {
      $recordings.classList.remove('offline')
      $body.classList.remove('offline')
    }

    if (hoodie.connectionStatus.ok === false) {
      // we are offline
      handleOfflineState();
    }

    hoodie.connectionStatus.on('disconnect', handleOfflineState)
    hoodie.connectionStatus.on('reconnect', handleOnlineState)

  })

}
