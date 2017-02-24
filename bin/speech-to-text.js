const fs = require('fs')
const path = require('path')

const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1')

const pathToSpeechFile = path.resolve(__dirname, '..', 'assets', 'speech.opus')

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
  .pipe(speechToText.createRecognizeStream())
  .pipe(process.stdout)

// we can pass a model for different languages and frequency
// https://www.ibm.com/watson/developercloud/speech-to-text/api/v1/#recognize_audio_websockets
// https://www.ibm.com/watson/developercloud/doc/speech-to-text/input.shtml#models
