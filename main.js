var Keybase = require('node-keybase')
var App = require('app')
var BrowserWindow = require('browser-window')
var IMAPApi = require('./apis/IMAPApi')

var mainWindow = null

// Quit when all windows are closed, even on Darwin
App.on('window-all-closed', App.quit.bind(App))

// Wait for atom-shell to initialize
App.commandLine.appendSwitch('js-flags', '--harmony')
App.on('ready', function () {
  console.log('Starting Scramble. process.version is ' + process.version)

  mainWindow = new BrowserWindow({'width': 1200, 'height': 900})
  mainWindow.loadUrl('file://' + __dirname + '/build/index.html')
  mainWindow.openDevTools()

  mainWindow.webContents.on('did-finish-load', function () {
    IMAPApi.startSyncingAllAccounts()
    if (false) {
      demoKeybase()
    }
  })
})

// Demo: Keybase
function demoKeybase () {
  var keybaseUser = process.argv[2]
  var keybasePassphrase = process.argv[3]
  if (!keybaseUser || !keybasePassphrase) {
    console.log('To test Keybase: node <...> <keybase user> <keybase passphrase>')
  } else {
    var keybase = new Keybase(keybaseUser, keybasePassphrase)
    keybase.user_autocomplete('dc', function (err, result) {
      if (err) {
        return console.warn('Keybase autocomplete error', err)
      }
      console.log('Autocomplete', result)
    })
    keybase.login(function (err, result) {
      if (err) {
        return console.warn('Keybase login error', err)
      }
      console.log('Keybase login: ', result.status.name)
    })
  }
}
