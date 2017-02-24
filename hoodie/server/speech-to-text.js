module.exports = speechToText

const stream = require('stream')

const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1')

const convertWebmToOgg = require('./convert-webm-to-ogg')

function speechToText (server, store, noteId) {
  if (server.app.simulateWatson) {
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        addText(store, noteId, 'I love dinosaurs').then(resolve, reject)
      }, 3000)
    })
  }

  const api = new SpeechToTextV1({
    username: process.env.SPEECH_TO_TEXT_USERNAME,
    password: process.env.SPEECH_TO_TEXT_PASSWORD
  })
  return Promise.all([
    store.find(`${noteId}/speech`),
    store.db.getAttachment(`${noteId}/speech`, 'speech')
  ])

  .then(([doc, audio]) => {
    return new Promise((resolve, reject) => {
      const audioStream = new stream.PassThrough()
      let text = ''

      audioStream
        // .pipe(api.createRecognizeStream({ content_type: 'audio/l16; rate=44100' }))
        .pipe(api.createRecognizeStream())
        .on('data', (data) => {
          text += data
        })
        .on('end', () => {
          addText(store, noteId, text).then(resolve, reject)
        })

      if (doc._attachments.speech.content_type === 'audio/ogg') {
        return audioStream.end(audio)
      }

      server.log(['verbose', 'speech-to-text'], `${doc.id}: converting webm to ogg...`)
      convertWebmToOgg(audio)
        .then((buffer) => {
          server.log(['info', 'speech-to-text'], `${doc.id}: converted webm to ogg`)
          audioStream.end(buffer)
        })
    })
  })
}

function addText (store, noteId, text) {
  return store.update(noteId, (doc) => {
    doc.progress.push({
      type: 'transcription',
      at: new Date()
    })
    doc.text = text
    return doc
  })
}
