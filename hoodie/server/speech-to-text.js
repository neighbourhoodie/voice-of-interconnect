module.exports = speechToText

const stream = require('stream')

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
  return store.db.getAttachment(`${noteId}/speech`, 'speech.wav')

  .then((audio) => {
    return new Promise((resolve, reject) => {
      const audioStream = new stream.PassThrough()
      let text = ''

      audioStream
        .pipe(api.createRecognizeStream({ content_type: 'audio/l16; rate=44100' }))
        .on('data', (data) => {
          text += data
        })
        .on('end', () => {
          addText(store, noteId, text).then(resolve, reject)
        })

      audioStream.end(audio)
    })
  })
}

function addText (store, noteId, text) {
  return Promise.all([
    store.update(noteId, (doc) => {
      doc.progress.push({
        type: 'transcription',
        at: new Date()
      })
      return doc
    }),
    store.add({
      id: noteId + '/text',
      text: text
    })
  ])
}
