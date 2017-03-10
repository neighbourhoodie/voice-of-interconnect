const fs = require('fs')
const path = require('path')

const note = {
  _id: 'note/123',
  hasSpeech: true,
  progress: []
}

const speech = {
  _id: 'note/123/speech',
  _attachments: {
    'speech': {
      content_type: 'audio/ogg',
      data: fs.readFileSync(path.resolve(__dirname, 'speech.ogg'))
    }
  }
}

module.exports = [
  note,
  speech
]
