module.exports = record

const generateRandomString = require('./generate-random-string')
const AudioRecorder = require('./audio-recorder')
const CanvasAudio = require('./canvas-audio')

function record (hoodie) {
  const $btnRecord = document.querySelector('#record')
  const $save = document.querySelector('#save-recording')
  const $download = document.querySelector('#download-recording')
  const $volume = document.querySelector('#volume span')
  const $audioControls = document.querySelector('#audioControls')
  const $discardRecording = document.querySelector('#discard')
  const $restartRecord = document.querySelector('#restart-record')
  const $recordingsLists = document.querySelector('#stage__recordings')
  const $compose = document.querySelector('#compose')
  const $composeFields = document.querySelector('#compose__field')
  const $backButton = document.querySelector('#back')
  const $closeList = document.querySelector('#close')
  const $answerField = document.querySelector('#answer__compose')
  const $submitAnswerButton = document.querySelector('#submitAnswer')
  const $listRecordings = document.querySelector('#list-recordings')
  const state = {
    audio: null
  }
  let record

  $listRecordings.addEventListener('click', function (event) {
    event.preventDefault()

    $recordingsLists.classList.add('active')
  })

  $btnRecord.addEventListener('click', function (event) {
    event.preventDefault()

    if (!$btnRecord.classList.contains('active')) {
      record = new AudioRecorder()

      record.getUserPermission()

      .then((stream) => {
        return record.start(stream, onComplete.bind(null, state), showVolume.bind(null, $volume))
      })

      $btnRecord.classList.add('active')
    } else {
      record.stop()
      $btnRecord.classList.remove('active')
      $audioControls.classList.add('active')
    }
  })

  $closeList.addEventListener('click', function (event) {
    event.preventDefault()
    $recordingsLists.classList.remove('active')
  })

  $discardRecording.addEventListener('click', function (event) {
    event.preventDefault()

    const canvas = document.querySelector('.visualizer')
    const canvasCtx = canvas.getContext('2d')
    let cWidth = canvas.width
    let cHeight = canvas.height

    canvasCtx.clearRect(0, 0, cWidth, cHeight)

    $audioControls.classList.remove('active')
  })

  $restartRecord.addEventListener('click', function (event) {
    event.preventDefault()

    // TODO: Need to discard data before new AudioRecorder is created?
    $audioControls.classList.remove('active')
    $btnRecord.click()
  })

  $save.addEventListener('click', function (event) {
    event.preventDefault()
    record.stop()

    const noteId = 'note/' + generateRandomString(7)
    const note = {
      id: noteId,
      hasSpeech: true,
      progress: []
    }
    const speech = {
      id: noteId + '/speech',
      _attachments: {
        'speech': {
          content_type: state.audio.type,
          data: state.audio
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

    $audioControls.classList.remove('active')
    $recordingsLists.classList.add('active')
  })

  $download.addEventListener('click', function (event) {
    const a = document.createElement('a')
    const url = window.URL.createObjectURL(state.audio)

    a.href = url
    a.download = 'speech.webm'
    a.click()
    document.body.appendChild(a)

    // http://stackoverflow.com/questions/30694453/blob-createobjecturl-download-not-working-in-firefox-but-works-when-debugging
    setTimeout(function () {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 100)
  })

  $compose.addEventListener('click', function (event) {
    event.preventDefault()

    $composeFields.classList.add('active')
  })

  $backButton.addEventListener('click', function (event) {
    event.preventDefault()

    $composeFields.classList.remove('active')
  })

  $answerField.addEventListener('keyup', function (event) {
    if ($answerField.value !== null && $answerField.value !== '') {
      $submitAnswerButton.classList.add('hasValue')
    } else {
      $submitAnswerButton.classList.remove('hasValue')
    }
  })

  $submitAnswerButton.addEventListener('click', function (event) {
    event.preventDefault()

    const text = $answerField.value
    const noteId = 'note/' + generateRandomString(7)
    const note = {
      id: noteId,
      text: text,
      hasSpeech: false,
      progress: []
    }
    hoodie.store.add(note)

    .then(() => {
      console.log('stored')
    })

    .catch((error) => {
      console.log(error)
    })

    $composeFields.classList.remove('active')
  })
}

function onComplete (state, audioData) {
  // aborted
  if (audioData === null) {
    return
  }

  state.audio = audioData
}

function showVolume ($volume, volume, time, analyser) {
  $volume.textContent = volume
  CanvasAudio(volume, time, analyser)

  // console.log('volume %d at %dms', volume, time)
}
