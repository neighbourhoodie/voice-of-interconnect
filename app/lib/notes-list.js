/* global URL */
module.exports = notesList

function notesList (hoodie) {
  var $notes = document.querySelector('#notes')

  hoodie.store.on('change', render.bind(null, $notes, hoodie))
  render($notes, hoodie)

  $notes.addEventListener('click', handleNotesClick.bind(null, hoodie))
}

function render ($notes, hoodie) {
  hoodie.store.findAll()

  .then(function (docs) {
    var html = docs
      .filter(function (doc) {
        return !!doc.progress
      })
      .map(function (doc) {
        return '<tr data-id="' + doc.id + '"><td>' + doc.id + '</td><td><button data-action="play">play</button></td><td><pre>' + JSON.stringify(doc, null, 2) + '</pre></td></tr>'
      }).join('\n')

    $notes.innerHTML = html
  })
}

function handleNotesClick (hoodie, event) {
  event.preventDefault()

  var action = event.target.dataset.action
  if (action !== 'play') {
    return
  }

  var id = event.target.closest('[data-id]').dataset.id

  hoodie.store.db.getAttachment(id + '/speech', 'speech')

  .then(function (blob) {
    var audio = document.createElement('audio')
    audio.src = URL.createObjectURL(blob)
    audio.play()
  })
}
