/* global hoodie, XMLHttpRequest, location, URL */

var $status = document.querySelector('#status')
var $btnRecord = document.querySelector('#record')
var $notes = document.querySelector('#notes')

$btnRecord.addEventListener('click', function (event) {
  event.preventDefault()

  fetchExmapleRecording()

  .then(function (blob) {
    var noteId = 'note/' + generateRandomString(7)
    var note = {
      id: noteId,
      progress: []
    }
    var speech = {
      id: noteId + '/speech',
      _attachments: {
        'speech.test-12.wav': {
          content_type: blob.type,
          data: blob
        }
      }
    }

    hoodie.store.add([note, speech])

    .then(function () {
      console.log('stored')
    })

    .catch(function (error) {
      console.log(error)
    })
  })
})

$notes.addEventListener('click', function (event) {
  event.preventDefault()

  var action = event.target.dataset.action
  if (action !== 'play') {
    return
  }

  var id = event.target.closest('[data-id]').dataset.id

  hoodie.store.db.getAttachment(id + '/speech', 'speech.test-12.wav')

  .then(function (blob) {
    var audio = document.createElement('audio')
    audio.src = URL.createObjectURL(blob)
    audio.play()
  })
})

hoodie.ready.then(function () {
  // We need to sign in in order for data to be synced to the server. Instead
  // of asking the user to enter a username / password, we use the account id
  // as username and a random password that we persist locally
  if (hoodie.account.isSignedIn()) {
    console.log('user already signed up:', hoodie.account.username)
    return init()
  }

  var options = {
    username: hoodie.account.id,
    password: generateRandomString()
  }

  console.log('new user, signing up ...')

  hoodie.account.signUp(options)

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
    console.log('signed up as', hoodie.account.username)
    init()
  })

  .catch(function (error) {
    $status.textContent = 'Error: ' + error
  })
})

function generateRandomString (length) {
  return Math.random().toString(36).substr(2, length || 25)
}

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

function init () {
  $status.textContent = 'app is ready'
  console.log('starting app')

  hoodie.store.on('change', render)
  render()
}

function render () {
  hoodie.store.findAll()

  .then(function (docs) {
    var html = docs
      .filter(function (doc) {
        return !!doc.progress
      })
      .map(function (doc) {
        return '<tr data-id="' + doc.id + '"><td>' + doc.id + '</td><td><button data-action="play">play</button></td><td>' + JSON.stringify(doc.progress.pop() || null) + '</td></tr>'
      }).join('\n')
    $notes.innerHTML = html
  })
}
