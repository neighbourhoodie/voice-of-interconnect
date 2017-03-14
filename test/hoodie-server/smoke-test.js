const Hapi = require('hapi')
const hoodie = require('hoodie')
const simple = require('simple-mock')
const test = require('tap').test
const PouchDB = require('pouchdb-core')
  .plugin(require('pouchdb-mapreduce'))
  .plugin(require('pouchdb-replication'))
  .plugin(require('pouchdb-adapter-memory'))

require('npmlog').level = 'error'

test('smoke test', (group) => {
  group.beforeEach(function (done) {
    simple.mock(process.env, 'WATSON_MOCK_TIMEOUT', 0)
    this.server = new Hapi.Server()
    this.server.connection({port: 0})
    done()
  })

  group.afterEach(function (done) {
    simple.restore()
    done()
  })

  group.test('new user note', function (t) {
    const server = this.server

    this.server.register({
      register: hoodie,
      options: {
        inMemory: true,
        PouchDB: PouchDB
      }
    }, (error) => {
      t.error(error)

      const accountApi = server.plugins.account.api
      const storeApi = server.plugins.store.api

      accountApi.accounts.add({
        id: 'test123',
        username: 'test',
        password: 'secret'
      })

      storeApi.on('create', (dbName) => {
        storeApi.open('user/test123')

        .then((userDb) => {
          userDb.one('update', (doc) => {
            t.is(doc.progress.length, 1)
            t.is(doc.progress[0].type, 'transcription')
            t.is(doc.text, 'I love dinosaurs')

            userDb.one('update', (doc) => {
              t.is(doc.progress.length, 2)
              t.is(doc.progress[1].type, 'analysis')
              t.is(typeof doc.sentiment, 'number')
              t.end()
            })
          })

          userDb.add(require('../fixtures/new-note-and-speech'))
        })
      })
    })
  })

  group.end()
})
