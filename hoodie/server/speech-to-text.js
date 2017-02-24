module.exports = speechToText

const stream = require('stream')
const ffmpeg = require('./ffmpeg-api')

const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1')

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
      let textStream
      let text = ''

      if (doc._attachments.speech.content_type === 'audio/ogg') {
        server.log(['verbose', 'speech-to-text'], `${doc.id}: already in ogg format, no conversion required`)
        textStream = audioStream
          .pipe(api.createRecognizeStream())
      } else {
        server.log(['verbose', 'speech-to-text'], `${doc.id}: converting webm to ogg...`)

        textStream = ffmpeg(audioStream)
          .on('error', (error) => {
            server.log(['error', 'speech-to-text'], `cannot find ffmpeg binary for webm to ogg conversion: ${error}`)
          })
          .audioCodec('copy')
          .format('ogg')
          .pipe(api.createRecognizeStream())
      }

      textStream
        .on('data', (data) => {
          text += data
        })
        .on('end', () => {
          addText(store, noteId, text).then(resolve, reject)
        })
        .on('error', (error) => {
          reject(`cannot find ffmpeg binary for webm to ogg conversion: ${error}`)
        })

      audioStream.end(audio)
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
