const simple = require('simple-mock')
const test = require('tap').test

const findWatsonCredentials = require('../../../hoodie/server/find-watson-credentials')

test('findWatsonCredentials without any ENV variables', (t) => {
  const serverMock = {
    log: simple.stub(),
    app: {}
  }

  simple.mock(process.env, 'VCAP_SERVICES', '')
  simple.mock(process.env, 'SPEECH_TO_TEXT_USERNAME', '')
  simple.mock(process.env, 'SPEECH_TO_TEXT_PASSWORD', '')
  simple.mock(process.env, 'NATURAL_LANGUAGE_UNDERSTANDING_USERNAME', '')
  simple.mock(process.env, 'NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD', '')
  simple.mock(process.env, 'WATSON_MOCK_TIMEOUT', '')
  findWatsonCredentials(serverMock)

  t.equal(serverMock.app.simulateWatson, true)
  t.equal(serverMock.app.simulateWatsonTimeout, 3000)

  simple.restore()
  t.end()
})

test('findWatsonCredentials with WATSON_MOCK_TIMEOUT', (t) => {
  const serverMock = {
    log: simple.stub(),
    app: {}
  }

  simple.mock(process.env, 'VCAP_SERVICES', '')
  simple.mock(process.env, 'SPEECH_TO_TEXT_USERNAME', '')
  simple.mock(process.env, 'SPEECH_TO_TEXT_PASSWORD', '')
  simple.mock(process.env, 'NATURAL_LANGUAGE_UNDERSTANDING_USERNAME', '')
  simple.mock(process.env, 'NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD', '')
  simple.mock(process.env, 'WATSON_MOCK_TIMEOUT', '1234')
  findWatsonCredentials(serverMock)

  t.equal(serverMock.app.simulateWatsonTimeout, 1234)

  simple.restore()
  t.end()
})

test('findWatsonCredentials with separate ENV variables for Watson services', (t) => {
  const serverMock = {
    log: simple.stub(),
    app: {}
  }

  simple.mock(process.env, 'VCAP_SERVICES', '')
  simple.mock(process.env, 'SPEECH_TO_TEXT_USERNAME', 'speech_to_text_username')
  simple.mock(process.env, 'SPEECH_TO_TEXT_PASSWORD', 'speech_to_text_password')
  simple.mock(process.env, 'NATURAL_LANGUAGE_UNDERSTANDING_USERNAME', 'natural_language_understanding_username')
  simple.mock(process.env, 'NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD', 'natural_language_understanding_password')
  findWatsonCredentials(serverMock)

  t.equal(serverMock.app.speechToText.username, 'speech_to_text_username')
  t.equal(serverMock.app.speechToText.password, 'speech_to_text_password')
  t.equal(serverMock.app.naturalLanguageUnderstanding.username, 'natural_language_understanding_username')
  t.equal(serverMock.app.naturalLanguageUnderstanding.password, 'natural_language_understanding_password')

  simple.restore()
  t.end()
})

test('findWatsonCredentials with VCAP_SERVICES set', (t) => {
  const serverMock = {
    log: simple.stub(),
    app: {}
  }

  simple.mock(process.env, 'VCAP_SERVICES', JSON.stringify({
    speech_to_text: [
      {
        credentials: {
          password: 'stt password',
          username: 'stt username'
        }
      }
    ],
    'natural-language-understanding': [
      {
        credentials: {
          password: 'nlu password',
          username: 'nlu username'
        }
      }
    ]
  }))
  findWatsonCredentials(serverMock)

  t.equal(serverMock.app.speechToText.username, 'stt username')
  t.equal(serverMock.app.speechToText.password, 'stt password')
  t.equal(serverMock.app.naturalLanguageUnderstanding.username, 'nlu username')
  t.equal(serverMock.app.naturalLanguageUnderstanding.password, 'nlu password')

  simple.restore()
  t.end()
})
