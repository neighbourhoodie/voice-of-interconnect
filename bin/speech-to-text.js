const fs = require('fs')

const ffmpeg = require('fluent-ffmpeg')
const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1')

if (process.env.FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH)
}

const pathToSpeechFile = process.argv[2]

if (!pathToSpeechFile) {
  console.log('Usage: node bin/speech-to-text ./path/to/file.webm')
  process.exit(1)
}

if (!/\.(webm|ogg)$/.test(pathToSpeechFile)) {
  console.log(`Error: ${pathToSpeechFile} not supported (.webm and .ogg only)`)
  process.exit(1)
}

if (!process.env.SPEECH_TO_TEXT_USERNAME || !process.env.SPEECH_TO_TEXT_PASSWORD) {
  console.log('Error: SPEECH_TO_TEXT_USERNAME & SPEECH_TO_TEXT_PASSWORD must be set.')
  process.exit(1)
}

const speechToText = new SpeechToTextV1({
  username: process.env.SPEECH_TO_TEXT_USERNAME,
  password: process.env.SPEECH_TO_TEXT_PASSWORD
})

if (/\.ogg$/.test(pathToSpeechFile)) {
  console.log(`Transcribing ${pathToSpeechFile}...`)
  fs.createReadStream(pathToSpeechFile)
    .pipe(speechToText.createRecognizeStream())
    .pipe(process.stdout)
} else {
  console.log(`Converting ${pathToSpeechFile} to .ogg and transcribing ...`)
  ffmpeg(fs.createReadStream(pathToSpeechFile))
    .audioCodec('copy')
    .format('ogg')
    .pipe(speechToText.createRecognizeStream())
    .pipe(process.stdout)
}
