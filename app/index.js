/* global location */

const Hoodie = require('@hoodie/client')
const OfflinePlugin = require('offline-plugin/runtime')

const assureAccount = require('./lib/assure-account')
const notesList = require('./lib/notes-list')
const record = require('./lib/record')
const setAppStatus = require('./lib/set-app-status')
const detectOffline = require('./lib/offline-state.js')

require('./style/base.scss')

const hoodie = new Hoodie({
  url: location.origin,
  PouchDB: require('pouchdb-idb')
})

OfflinePlugin.install({
  onInstalled: function () {},
  onUpdating: function () {},
  onUpdateReady: function () {
    OfflinePlugin.applyUpdate()
  },
  onUpdated: function () {
    window.location.reload()
  }
})

record(hoodie)
assureAccount(hoodie)
  .then(function () {
    console.log('signed up as', hoodie.account.username)
    init()
  })
  .catch(function (error) {
    setAppStatus('Error: ' + error)
  })

function init () {
  setAppStatus('app is ready')
  console.log('starting app')

  detectOffline(hoodie)
  notesList(hoodie)
}

global.hoodie = hoodie
