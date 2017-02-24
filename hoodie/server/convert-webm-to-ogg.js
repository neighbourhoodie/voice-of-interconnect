module.exports = convertWebmToOgg

const ffmpeg = require('ffmpeg.js/ffmpeg-webm.js')

function convertWebmToOgg (webm) {
  return new Promise((resolve, reject) => {
    // let stdout = ''
    let stderr = ''
    let code
    const result = ffmpeg({
      MEMFS: [{name: 'audio.webm', data: new Uint8Array(webm)}],
      arguments: ['-i', 'audio.webm', '-acodec', 'opus', 'audio.ogg'],
      // print: function (data) {
      //   stdout += data + '\n'
      // },
      printErr: function (data) {
        stderr += data + '\n'
      },
      // Ignore stdin read requests.
      stdin: function () {},
      onExit: function (_code) {
        code = _code
      }
    })

    if (code !== 0) {
      return reject(new Error(stderr))
    }

    resolve(new Buffer(result.MEMFS[0].data))
  })
}
