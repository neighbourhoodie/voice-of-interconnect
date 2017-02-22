const fs = require('fs')
const path = require('path')

const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1')

const pathToSpeechFile = path.resolve(__dirname, '..', 'public', 'assets', 'test-12.wav')

if (!process.env.SPEECH_TO_TEXT_USERNAME || !process.env.SPEECH_TO_TEXT_PASSWORD) {
  throw new Error('SPEECH_TO_TEXT_USERNAME & SPEECH_TO_TEXT_PASSWORD must be set.')
}

const speechToText = new SpeechToTextV1({
  username: process.env.SPEECH_TO_TEXT_USERNAME,
  password: process.env.SPEECH_TO_TEXT_PASSWORD
})

// speechToText.recognize seems to cut off at ~5s, so we use the streaming
// see also https://github.com/watson-developer-cloud/node-sdk#speech-to-text
fs.createReadStream(pathToSpeechFile)
  .pipe(speechToText.createRecognizeStream({ content_type: 'audio/l16; rate=44100' }))
  .pipe(process.stdout)
