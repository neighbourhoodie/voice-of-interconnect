module.exports = require('fluent-ffmpeg')

if (process.env.FFMPEG_PATH) {
  module.exports.setFfmpegPath(process.env.FFMPEG_PATH)
}
