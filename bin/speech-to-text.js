const fs = require('fs')
const path = require('path')

const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1')

const pathToSpeechFile = path.resolve(__dirname, '..', 'public', 'assets', 'test-12.wav')

if (!process.env.speech_to_text_username || !process.env.speech_to_text_password) {
  throw new Error('speech_to_text_username & speech_to_text_password must be set.')
}

const speechToText = new SpeechToTextV1({
  username: process.env.speech_to_text_username,
  password: process.env.speech_to_text_password
})

// speechToText.recognize seems to cut off at ~5s, so we use the streaming
// see also https://github.com/watson-developer-cloud/node-sdk#speech-to-text
fs.createReadStream(pathToSpeechFile)
  .pipe(speechToText.createRecognizeStream({ content_type: 'audio/l16; rate=44100' }))
  .pipe(process.stdout)
