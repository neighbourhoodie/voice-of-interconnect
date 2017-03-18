const url = require('url')

const PouchDB = require('pouchdb-core')
  .plugin(require('pouchdb-adapter-http'))
const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1')
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')
const stream = require('stream')
const ffmpeg = require('fluent-ffmpeg')

const [couchUrl, dbName] = process.argv.slice(2)
const {
  SPEECH_TO_TEXT_USERNAME,
  SPEECH_TO_TEXT_PASSWORD,
  NATURAL_LANGUAGE_UNDERSTANDING_USERNAME,
  NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD
} = process.env

if (!couchUrl) {
  console.log('Usage: node bin/couch-doctor.js https://user:password@couchhost.com [dbName]')
  process.exit(1)
}

if (!SPEECH_TO_TEXT_USERNAME || !SPEECH_TO_TEXT_PASSWORD) {
  console.log('Error: SPEECH_TO_TEXT_USERNAME & SPEECH_TO_TEXT_PASSWORD must be set.')
  process.exit(1)
}

if (!NATURAL_LANGUAGE_UNDERSTANDING_USERNAME || !NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD) {
  console.log('Error: NATURAL_LANGUAGE_UNDERSTANDING_USERNAME & NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD must be set.')
  process.exit(1)
}

if (dbName) {
  checkDb(dbName)
} else {
  console.log('loading all user DBs...')
  const storeDb = new PouchDB(url.resolve(couchUrl, 'hoodie-store'), {
    skip_setup: true
  })
  storeDb.allDocs({
    startkey: 'db_',
    endkey: 'db_\uffff'
  })

  .then((result) => {
    const dbNames = result.rows
      .map(row => row.id.substr(3))
      .filter(name => /^user\//.test(name))

    dbNames.reduce((promise, name) => {
      return promise.then(() => {
        console.log(`checking ${name}...`)
        return checkDb(name)
      })
    }, Promise.resolve())
  })
}

function checkDb (name) {
  const db = new PouchDB(url.resolve(couchUrl, encodeURIComponent(name)), {
    skip_setup: true
  })

  return db.allDocs({
    include_docs: true
  })

  .then(result => result.rows.map(row => row.doc))

  .then((docs) => {
    // migrate to new hoodie format)
    docs = docs.map((doc) => {
      if (!doc.hoodie) {
        console.log(`doc migrated in ${dbName}`)
        doc.hoodie = {
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt
        }

        delete doc.createdAt
        delete doc.updatedAt
      }

      return doc
    })

    // find docs with speech but without text
    const docsWithPendingTranscription = docs.filter((doc) => {
      return doc.hasSpeech && !doc.text
    })
    console.log(`${docsWithPendingTranscription.length} docs with pending transcription`)
    const transcriptionPromises = docsWithPendingTranscription.map((doc) => {
      return transcribe(db, doc)

      .catch((error) => {
        console.log('Transcription error:', error)
      })
    })

    // find docs with text but without sentiment
    const docsWithPendingSentimentAnalysis = docs.filter((doc) => {
      return doc.text && !doc.analysis
    })
    console.log(`${docsWithPendingSentimentAnalysis.length} docs with pending sentiment analysis`)

    const analysisPromises = docsWithPendingSentimentAnalysis.map((doc) => {
      addSentiment(db, doc)

      .catch((error) => {
        console.log('Sentiment Analysis error:', error)
      })
    })

    return Promise.all(transcriptionPromises.concat(analysisPromises))
  })

  .catch(console.log)

  function transcribe (db, doc) {
    const api = new SpeechToTextV1({
      username: SPEECH_TO_TEXT_USERNAME,
      password: SPEECH_TO_TEXT_PASSWORD
    })
    return Promise.all([
      db.get(`${doc._id}/speech`),
      db.getAttachment(`${doc._id}/speech`, 'speech')
    ])

    .then(([speechDoc, audio]) => {
      return new Promise((resolve, reject) => {
        const audioStream = new stream.PassThrough()
        let textStream
        let text = ''

        if (speechDoc._attachments.speech.content_type === 'audio/ogg') {
          console.log(`${speechDoc._id}: already in ogg format, no conversion required`)
          textStream = audioStream
            .pipe(api.createRecognizeStream())
        } else {
          console.log(`${speechDoc._id}: converting webm to ogg...`)

          textStream = ffmpeg(audioStream)
            .on('error', (error) => {
              if (/Invalid data found when processing input/.test(error.message)) {
                console.log('invalid audio format, deleting')
                doc._deleted = true
                speechDoc._deleted = true
                db.bulkDocs([doc, speechDoc])
                return resolve()
              }

              console.log(`Cannot find ffmpeg binary for webm to ogg conversion: ${error}`)
            })
            .audioCodec('copy')
            .format('ogg')
            .pipe(api.createRecognizeStream())
        }

        textStream
          .on('data', (data) => {
            text += data
          })
          .on('end', () => {
            addText(db, doc, text).then(resolve, reject)
          })
          .on('error', (error) => {
            reject(`cannot find ffmpeg binary for webm to ogg conversion: ${error}`)
          })

        audioStream.end(audio)
      })
    })
  }

  function addSentiment (db, doc) {
    const api = new NaturalLanguageUnderstandingV1({
      username: NATURAL_LANGUAGE_UNDERSTANDING_USERNAME,
      password: NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD,
      version_date: NaturalLanguageUnderstandingV1.VERSION_DATE_2017_02_27
    })

    return new Promise((resolve, reject) => {
      api.analyze({
        text: doc.text,
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
        addAnalysis(db, doc, result.keywords).then(resolve, reject)
      })
    })
  }

  function addText (db, doc, text) {
    doc.text = text
    doc.progress.push({
      type: 'transcription',
      at: new Date()
    })

    return db.put(doc)
  }

  function addAnalysis (db, doc, analysis) {
    doc.progress.push({
      type: 'transcription',
      at: new Date()
    })

    if (analysis[0]) {
      doc.sentiment = analysis[0].sentiment.score || 0
    } else {
      doc.sentiment = 0
    }
    doc.analysis = analysis

    return db.put(doc)
  }
}
