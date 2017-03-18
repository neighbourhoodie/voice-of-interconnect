/* global location */

const Hoodie = require('@hoodie/client')
const OfflinePlugin = require('offline-plugin/runtime')
const PouchDB = require('pouchdb-browser')

const assureAccount = require('./lib/assure-account')
const notesList = require('./lib/notes-list')
const record = require('./lib/record')
const detectOffline = require('./lib/offline-state.js')
const appNav = require('./lib/app-nav.js')
const common = require('./lib/common')

require('./style/base.scss')

const hoodie = new Hoodie({
  url: location.origin,
  PouchDB: PouchDB
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
common(hoodie)
assureAccount(hoodie)
  .then(function () {
    console.log('signed up as', hoodie.account.username)
    init()
  })

function init () {
  console.log('starting app')

  detectOffline(hoodie)
  notesList(hoodie)
  appNav()
}

// debuging
global.hoodie = hoodie
