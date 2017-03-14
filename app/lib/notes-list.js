/* global URL */
module.exports = notesList

function notesList (hoodie) {
  var $notes = document.querySelector('#recordings')

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
        let docProgress
        let statusText
        let statusDesc

        if (doc.progress.length > 0) {
          docProgress = doc.progress[doc.progress.length - 1].type
        } else {
          docProgress = 'uploading'
          statusText = 'Uploading'
          statusDesc = 'Sending your voice to the heavens...'
        }

        if (docProgress === 'transcription') {
          statusText = 'Processing'
          statusDesc = 'Converting audio to text...'
        } else if (docProgress === 'analysis') {
          statusText = 'Analyzing'
          statusDesc = 'Detecting sentiment...'
        }

        if ('sentiment' in doc) {
          var sentimentClass = doc.sentiment >= 0 ? 'happy' : 'sad'

          return `<li data-id="${doc._id}" class="analyzed">
            <svg width="19px" height="19px" viewBox="0 0 19 19">
              <use xlink:href="#face-${sentimentClass}"></use>
            </svg>
            <p class="depiction analyzed__${sentimentClass}">${doc.text}</p>
            <span class="hidden-reference"><button data-action="play">play</button></span>
          </li>`
        }

        if (doc.text) {
          return `<li data-id="${doc._id}">
            <span class="progress">
              <span class="progress_bar"></span>
            </span>
            <p class="depiction">${doc.text}</p>
            <span class="status ${docProgress}">
              <strong>${statusText}</strong> &mdash; ${statusDesc}
            </span>
            <span class="hidden-reference"><button data-action="play">play</button></span>
          </li>`
        }

        return `<li data-id="${doc._id}">
          <span class="progress">
            <span class="progress_bar"></span>
          </span>
          <span class="status ${docProgress}">
            <strong>${statusText}</strong> &mdash; ${statusDesc}
          </span>
          <span class="hidden-reference"><button data-action="play">play</button></span>
        </li>`
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

  .catch(function (error) {
    if (error.status === 404) {
      // this is a text-only note, no audio file to play. Ignore error
    }

    throw error
  })
}
