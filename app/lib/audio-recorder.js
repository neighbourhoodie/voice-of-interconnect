/* global MediaRecorder, Blob, AudioContext, requestAnimationFrame */
module.exports = AudioRecorder

function AudioRecorder () {
  const state = {
    recorder: null,
    startTime: null,
    audioContext: new AudioContext()
  }

  return {
    getUserPermission: getUserPermission.bind(null, state),
    start: start.bind(null, state),
    stop: stop.bind(null, state)
  }
}

function getUserPermission (state) {
  return navigator.mediaDevices.getUserMedia({
    audio: true
  })
}

function start (state, stream, onComplete, onVolume) {
  let mimeType = 'unsupported'

  if (MediaRecorder.isTypeSupported('audio/webm; codecs=opus')) {
    // Chrome does not support ogg, but we convert on the server
    mimeType = 'audio/webm; codecs=opus'
  }
  if (MediaRecorder.isTypeSupported('audio/ogg; codecs=opus')) {
    // firefox does all we need
    mimeType = 'audio/ogg; codecs=opus'
  }

  if (mimeType === 'unsupported') {
    return Promise.reject('Cannot record audio')
  }

  state.sourceNode = state.audioContext.createMediaStreamSource(stream)
  state.recorder = new MediaRecorder(stream, {
    mimeType: mimeType
  })
  const recordedData = []

  state.recorder.addEventListener('error', (event) => {
    console.log('Audio Recording error', event)
  })

  state.recorder.addEventListener('dataavailable', (event) => {
    if (typeof event.data === 'undefined') {
      return
    }

    if (event.data.size === 0) {
      return
    }

    recordedData.push(event.data)
  })

  state.recorder.addEventListener('stop', (event) => {
    let tracks = stream.getTracks()
    tracks.forEach(track => track.stop())

    onComplete(new Blob(recordedData, {
      type: mimeType.split(';')[0]
    }))
  })

  // Record in 10ms bursts.
  state.startTime = Date.now()
  state.recorder.start(10)

  return getAnalyser(state)

  .then((analyser) => {
    let analyserDataSize = 256
    let analyserStart = 32
    let analyserEnd = analyserDataSize
    let analyserDataRange = analyserEnd - analyserStart
    let analyserData = new Uint8Array(analyserDataSize)

    analyser.fftSize = analyserDataSize
    analyser.smoothingTimeConstant = 0.3

    function trackAudioVolume () {
      if (!isRecording(state)) {
        return
      }

      let volumeSum = 0
      let volumeMax = 0
      analyser.getByteFrequencyData(analyserData)

      for (let i = analyserStart; i < analyserEnd; i++) {
        volumeSum += analyserData[i]
      }

      let volume = volumeSum / analyserDataRange
      if (volume > volumeMax) {
        volumeMax = volume
      }

      onVolume(volume, Date.now() - state.startTime, analyser)

      requestAnimationFrame(trackAudioVolume)
    }

    requestAnimationFrame(trackAudioVolume)
  })
}

function getAnalyser (state) {
  return new Promise((resolve, reject) => {
    let maxCount = 200
    let checkForSourceNode = () => {
      if (typeof state.sourceNode === 'undefined') {
          // Wait up to 20 seconds.
        maxCount--
        if (maxCount === 0) {
          return reject()
        }

        return setTimeout(checkForSourceNode, 100)
      }

      let listener = state.audioContext.createAnalyser()
      state.sourceNode.connect(listener)

      resolve(listener)
    }

    checkForSourceNode()
  })
}

function stop (state) {
  if (!isRecording(state)) {
    return
  }

  state.recorder.stop()
}

function isRecording (state) {
  return state.recorder.state === 'recording'
}
