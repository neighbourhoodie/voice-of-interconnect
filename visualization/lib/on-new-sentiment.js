module.exports = onNewSentiment

function onNewSentiment (handler) {
  generateSentiment(handler)
}

function generateSentiment (handler) {
  setTimeout(() => {
    handler({
      score: Math.random() * 2 - 1,
      at: new Date()
    })
    generateSentiment(handler)
  }, Math.random() * 5000 + 2000)
}
