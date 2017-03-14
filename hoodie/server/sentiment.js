module.exports = sentiment

const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')

function sentiment (server, store, noteId, text) {
  if (server.app.simulateWatson) {
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        addAnalysis(store, noteId, [{
          sentiment: {
            score: parseFloat(Math.random().toFixed(6))
          },
          emotion: {
            sadness: 0,
            joy: 0,
            fear: 0,
            disgust: 0,
            anger: 0
          }
        }]).then(resolve, reject)
      }, server.app.simulateWatsonTimeout)
    })
  }

  const api = new NaturalLanguageUnderstandingV1(server.app.naturalLanguageUnderstanding)

  return new Promise((resolve, reject) => {
    api.analyze({
      text: text,
      language: 'en',
      features: {
        concepts: {},
        keywords: {
          sentiment: true,
          emotion: true
        }
      }
    }, function (error, result) {
      if (error) {
        return reject(error)
      }

      // https://www.ibm.com/watson/developercloud/natural-language-understanding/api/v1/#methods
      // {
      //   "language": "en",
      //   "keywords": [
      //     {
      //       "text": "pizza",
      //       "sentiment": {
      //         "score": 0.614316
      //       },
      //       "relevance": 0.976124,
      //       "emotion": {
      //         "sadness": 0.278594,
      //         "joy": 0.738431,
      //         "fear": 0.004589,
      //         "disgust": 0.006282,
      //         "anger": 0.0257
      //       }
      //     }
      //   ],
      //   "concepts": []
      // }
      addAnalysis(store, noteId, result.keywords).then(resolve, reject)
    })
  })
}

function addAnalysis (store, noteId, analysis) {
  return store.update(noteId, function (doc) {
    doc.progress.push({
      type: 'analysis',
      at: new Date()
    })

    // this is what we use in the app
    doc.sentiment = analysis[0].sentiment.score || 0

    // this is just in case we decide to use any of this information later
    doc.analysis = analysis

    return doc
  })
}
