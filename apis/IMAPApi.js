var EventEmitter = require('events').EventEmitter
var path = require('path')
var mkdirp = require('mkdirp')
var fs = require('fs')
var objectAssign = require('object-assign')
var ScrambleIMAP = require('scramble-imap')
var ScrambleMailRepo = require('scramble-mail-repo')

var accounts = []
var accountSyncState = {}

// TODO: map by email address, store sync state in SQLite
var syncError = null

// TODO: abstract home directory into a settings module
var homeDir
if (process.env.APPDATA) {
  homeDir = path.join(process.env.APPDATA, 'Scramble')
} else if (process.env.HOME) {
  homeDir = path.join(process.env.HOME, '.scramble')
} else {
  throw new Error('Can\'t find home directory')
}
mkdirp.sync(homeDir)
var mailRepo = new ScrambleMailRepo(homeDir)

/**
 * Provides everything the UI needs to sync IMAP accounts.
 * Uses scramble-imap and scramble-mail-repo under the hood.
 *
 * Fires two events: syncChanged and accountsChanged.
 * Neither has arguments. Use getAccounts() and getSyncState() to respond.
 */
module.exports = objectAssign({}, EventEmitter.prototype, {

  getAccounts: function () {
    return accounts
  },

  getSyncState: function () {
    return accountSyncState
  },

  getSyncError: function () {
    return syncError
  },

  addGmailAccount: function (emailAddress, password) {
    var imap = ScrambleIMAP.createForGmail(emailAddress, password)
    imap.fetchAll()

    imap.on('box', function (boxStats) {
      // Connected successfully. Add this account to our list of accounts
      console.log('Connected successfully. Inbox stats: ' + JSON.stringify(boxStats))

      // TODO: write to SQLite
      accounts.push({
        type: 'GMAIL',
        emailAddress: emailAddress,
        password: password
      })
      accountSyncState[emailAddress] = {
        numToDownload: boxStats.messages.total,
        numDownloaded: 0,
        numIndexed: 0,
        numToUpload: 0,
        numUploaded: 0
      }

      mkdirp.sync(path.join(homeDir, emailAddress))

      this.emit('accountsChanged')
      this.emit('syncChanged')
    }.bind(this))

    imap.on('message', onMessage.bind(this, emailAddress))

    imap.on('error', onError.bind(this, emailAddress))
  },

  addIMAPAccount: function (server, port, username, password) {
    throw new Error('Unimplemented')
  }

})

EventEmitter.call(module.exports)

/**
 * Private event handler, fires after each message's headers are
 * downloaded via IMAP but before the body is saved to a file.
 */
function onMessage (emailAddress, msg) {
  console.log('Got message! ' + JSON.stringify(msg.attributes))

  // Parse out the message ID
  // var gmailThrId = msg.attributes['x-gm-thrid']
  var gmailMsgId = msg.attributes['x-gm-msgid']
  var uid = gmailMsgId || msg.attributes.uid

  // Save to file
  var syncState = accountSyncState[emailAddress]
  var outputStream = fs.createWriteStream(path.join(homeDir, emailAddress, uid + '.txt'))
  outputStream.on('close', function() {
    syncState.numDownloaded++
    this.emit('syncChanged')
  }.bind(this))
  msg.bodyStream.pipe(outputStream)

  // Save it to the index
  // TODO
  /*mailRepo.saveRawEmail(msg.bodyStream, function() {
    syncState.numIndexed++
    this.emit('syncChanged')
  }.bind(this))*/
}

/**
 * Example boxStats
 * {
 *   "name":"[Gmail]/All Mail",
 *   "flags":["\\Answered","\\Flagged","\\Draft","\\Deleted","\\Seen","$Phishing","$Forwarded","$NotPhishing"],
 *   "readOnly":true,
 *   "uidvalidity":596465977,
 *   "uidnext":910271,
 *   "permFlags":[],
 *   "keywords":[],
 *   "newKeywords":false,
 *   "persistentUIDs":true,
 *   "nomodseq":false,
 *   "messages":{
 *     "total":242110,
 *     "new":0
 *   },
 *   "highestmodseq":"21890643"
 * }
 */
function onBox (emailAddress, boxStats) {
}

function onError (emailAddress, error) {
  syncError = error
  this.emit('syncChanged')
}
