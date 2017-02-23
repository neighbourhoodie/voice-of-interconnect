/* global XMLHttpRequest, hoodie, location */
const generateRandomString = require('./generate-random-string')

const $btnRecord = document.querySelector('#record')

$btnRecord.addEventListener('click', function (event) {
  event.preventDefault()

  fetchExmapleRecording()

  .then(function (blob) {
    const noteId = 'note/' + generateRandomString(7)
    const note = {
      id: noteId,
      progress: []
    }
    const speech = {
      id: noteId + '/speech',
      _attachments: {
        'speech.wav': {
          content_type: blob.type,
          data: blob
        }
      }
    }

    hoodie.store.add([note, speech])

    .then(() => {
      console.log('stored')
    })

    .catch((error) => {
      console.log(error)
    })
  })
})

function fetchExmapleRecording () {
  return new Promise(function (resolve) {
    var xhr = new XMLHttpRequest()
    var url = location.origin + '/assets/test-12.wav'
    xhr.open('GET', url, true)
    xhr.responseType = 'blob'
    xhr.onload = function () {
      if (this.status === 200) {
        var blob = this.response
        // debug
        window.blob = blob
        resolve(blob)
      }
    }
    xhr.send()
  })
}
