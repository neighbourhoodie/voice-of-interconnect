module.exports = detectOffline

function detectOffline (hoodie) {

  hoodie.connectionStatus.ready.then(function () {

    if (hoodie.connectionStatus.ok === false) {
      // we are offline
      console.log('offline');
    }

    console.log(hoodie.connectionStatus.ok);
  })

}
