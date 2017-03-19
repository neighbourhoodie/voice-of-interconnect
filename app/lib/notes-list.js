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

          return `<li data-id="${doc._id}" class="analyzed" data-state="stop">
            <svg width="19px" height="19px" viewBox="0 0 19 19">
              <use xlink:href="#face-${sentimentClass}"></use>
            </svg>
            <p class="depiction analyzed__${sentimentClass}">${doc.text}</p>
            <button class="hidden-reference" data-action="play">►</button>
            <button class="hidden-reference" data-action="stop">◼︎</button>
          </li>`
        }

        if (doc.text) {
          return `<li data-id="${doc._id}" data-state="stop">
            <span class="progress ${docProgress}">
              <span class="progress_bar"></span>
            </span>
            <p class="depiction">${doc.text}</p>
            <span class="status ${docProgress}">
              <strong>${statusText}</strong> &mdash; ${statusDesc}
            </span>
            <button class="hidden-reference" data-action="play">►</button>
            <button class="hidden-reference" data-action="stop">◼︎</button>
          </li>`
        }

        return `<li data-id="${doc._id}" data-state="stop">
          <span class="progress ${docProgress}">
            <span class="progress_bar"></span>
          </span>
          <span class="status ${docProgress}">
            <strong>${statusText}</strong> &mdash; ${statusDesc}
          </span>
          <button class="hidden-reference" data-action="play">►</button>
          <button class="hidden-reference" data-action="stop">◼︎</button>
        </li>`
      }).join('\n')

    $notes.innerHTML = html

    var $emptyState = document.querySelector('.empty-state')

    if (docs.length === 0) {
      $emptyState.classList.add('show')
    } else {
      $emptyState.classList.remove('show')
    }
  })
}

let audio, $lastLi
function handleNotesClick (hoodie, event) {
  event.preventDefault()
  const $li = event.target.closest('[data-state]')

  const action = event.target.dataset.action
  if (action === 'stop') {
    audio.pause()
    $li.dataset.state = 'stop'
  }
  if (action !== 'play') {
    return
  }

  if (audio) {
    $lastLi.dataset.state = 'stop'
    audio.pause()
  }

  $li.dataset.state = 'play'

  var id = event.target.closest('[data-id]').dataset.id

  hoodie.store.db.getAttachment(id + '/speech', 'speech')

  .then(function (blob) {
    audio = document.createElement('audio')
    audio.src = URL.createObjectURL(blob)

    // events https://developer.mozilla.org/en-US/Apps/Fundamentals/Audio_and_video_delivery/Cross-browser_audio_basics#Media_Playing_Events
    audio.addEventListener('ended', function () {
      $li.dataset.state = 'stop'
    })

    audio.play()

    $lastLi = $li
  })

  .catch(function (error) {
    if (error.status === 404) {
      // this is a text-only note, no audio file to play. Ignore error
    }

    throw error
  })
}
