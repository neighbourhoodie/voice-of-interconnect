/* global requestAnimationFrame */

// For drawing audio information upon the canvas
module.exports = CanvasAudio

var canvasCtx
var WIDTH
var HEIGHT
function CanvasAudio (volume, time, analyser) {
  var canvas = document.querySelector('.visualizer')
  canvasCtx = canvas.getContext('2d')

  // the number of bars/stops
  analyser.fftSize = 128

  var bufferLength = analyser.frequencyBinCount
  var dataArray = new Uint8Array(bufferLength)

  var intendedWidth = document.querySelector('.stage__questions').clientWidth
  var intendedHeight = document.querySelector('.stage__questions').clientHeight

  time = Math.round(time)

  var timeLeft = time / 10000

  canvas.width = intendedWidth
  canvas.height = intendedHeight

  WIDTH = canvas.width
  HEIGHT = canvas.height
  if (timeLeft < 1) {
    HEIGHT = canvas.height * timeLeft
  }

  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT)

  function draw () {
    analyser.getByteTimeDomainData(dataArray)

    canvasCtx.fillStyle = 'rgba(0, 0, 0, 0)'
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT)

    canvasCtx.lineWidth = 3
    canvasCtx.strokeStyle = 'rgb(255, 76, 154)'

    canvasCtx.beginPath()

    var sliceWidth = HEIGHT / bufferLength
    var y = canvas.height

    for (var i = 0; i < bufferLength; i++) {
      var v = dataArray[i] / 128.0
      var x = v * WIDTH / 2

      if (i === 0) {
        canvasCtx.moveTo(x, y)
      } else {
        canvasCtx.lineTo(x, y)
      }

      y -= sliceWidth
    }
    canvasCtx.stroke()

    // bar showing how much time is left / recording head
    if (timeLeft < 1) {
      var barHeight = canvas.height - timeLeft * canvas.height

      canvasCtx.beginPath()
      canvasCtx.lineWidth = 1
      canvasCtx.strokeStyle = 'rgba(255, 76, 154, .3)'

      canvasCtx.moveTo(0, barHeight)
      canvasCtx.lineTo(WIDTH, barHeight)

      canvasCtx.stroke()
    }
  }

  draw()
}
