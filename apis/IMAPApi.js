var EventEmitter = require('events').EventEmitter
var path = require('path')
var mkdirp = require('mkdirp')
var objectAssign = require('object-assign')
var ScrambleIMAP = require('scramble-imap')
var ScrambleMailRepo = require('scramble-mail-repo')
var LocalStore = require('./LocalStore')

var _accounts = []
var _accountSyncState = {}
var _mailRepos = {}
var _imapConnections = {}
var _mailDir = LocalStore.getAppDir()

/**
 * Provides everything the UI needs to sync IMAP accounts.
 * Uses scramble-imap and scramble-mail-repo under the hood.
 *
 * Fires two events: syncChanged and accountsChanged.
 * Neither has arguments. Use getAccounts() and getSyncState() to respond.
 */
module.exports = objectAssign({}, EventEmitter.prototype, {

  getAccounts: function () {
    return _accounts
  },

  getSyncState: function () {
    return _accountSyncState
  },

  addGmailAccount: function (emailAddress, password) {
    var imap = ScrambleIMAP.createForGmail(emailAddress, password)
    imap.fetchAll()

    imap.once('box', function (boxStats) {
      // Connected successfully. Add this account to our list of accounts
      console.log('Connected successfully. Inbox stats: ' + JSON.stringify(boxStats))

      var account = {
        type: 'GMAIL',
        emailAddress: emailAddress,
        password: password
      }
      LocalStore.saveAccount(account)
      _accounts.push(account)

      var syncState = getSyncStateForAddress(emailAddress)
      syncState.numToDownload = boxStats.messages.total

      mkdirp.sync(path.join(_mailDir, emailAddress))

      emitAccountsChanged.apply(this)
      emitSyncChanged.apply(this)
    }.bind(this))

    imap.on('message', onMessage.bind(this, emailAddress))
    imap.on('error', onError.bind(this, emailAddress))
    addIMAPConnection(emailAddress, imap)
  },

  addIMAPAccount: function (server, port, username, password) {
    throw new Error('Unimplemented')
  },

  /**
   * Gets the scramble-mail-repo instance for this account, or null if none exists.
   * This lets you read mail, search, and so on.
   */
  getMailRepo: function (emailAddress) {
    return _mailRepos[emailAddress]
  },

  cancelSync: function () {
    Object.keys(_imapConnections).forEach(function (emailAddress) {
      _imapConnections[emailAddress].disconnect()
    })
  },

  /**
   * Starts loading accounts from IMAP servers.
   * TODO: split out initialize() to just load from sqlite?
   */
  startSyncingAllAccounts: function () {
    LocalStore.loadAccounts((function(error, accountRows) {
      _accounts = accountRows
      _accounts.forEach(function(account) {
        getOrCreateMailRepo(account.emailAddress)
      })
      // TODO: start sync
      emitAccountsChanged.apply(this)
    }).bind(this))
  }
})

/**
 * Private event emitters
 */
EventEmitter.call(module.exports)

function emitSyncChanged () {
  // atom-shell remote RPC objects have a lot of caveats
  // one of them is callbacks should only take string arguments
  // if you pass an object here (ie, if we remove the call to stringify)
  // then the renderer process actually gets a *remoted* object back,
  // where atom-shell intercepts all property gets and sets and turns them
  // into synchronous RPC calls (!!)
  // not only is this inefficient, it also causes infinite recursion...
  this.emit('syncChanged', JSON.stringify(this.getSyncState()))
}

function emitAccountsChanged () {
  console.log("emitAccountsChanged "+JSON.stringify(this.getAccounts()))
  this.emit('accountsChanged', JSON.stringify(this.getAccounts()))
}

/**
 * Returns the sync state object for a given account,
 * creating a new zeroed-out state if needed.
 */
function getSyncStateForAddress (emailAddress) {
  if (!_accountSyncState[emailAddress]) {
    _accountSyncState[emailAddress] = {
      numToDownload: 0,
      numDownloaded: 0,
      numIndexed: 0,
      numToUpload: 0,
      numUploaded: 0,
      errors: []
    }
  }
  return _accountSyncState[emailAddress]
}

/**
 * Private event handler, fires after each message's headers are
 * downloaded via IMAP but before the body is saved to a file.
 */
function onMessage (emailAddress, msg) {
  // Save it to the index
  var syncState = getSyncStateForAddress(emailAddress)
  var mailRepo = getOrCreateMailRepo(emailAddress)
  mailRepo.saveRawEmail(msg.bodyStream, function () {
    syncState.numDownloaded++
    emitSyncChanged.apply(this)
  }.bind(this))
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

/**
 * Handles any kind of sync error.
 * For example: if the connection to the IMAP server dies, or if you're offline.
 */
function onError (emailAddress, error) {
  console.warn('Sync error for ' + emailAddress, error)
  var syncState = getSyncStateForAddress(emailAddress)
  syncState.errors.push(error)
  emitSyncChanged.apply(this)
}

/**
 * Adds a scramble-imap connection to the set of open connections.
 */
function addIMAPConnection(emailAddress, imap) {
  if (_imapConnections[emailAddress]) {
    throw new Error('There\'s already an active IMAP connection for ' + emailAddress)
  }
  _imapConnections[emailAddress] = imap
}

function getOrCreateMailRepo (emailAddress) {
  var mailRepo = _mailRepos[emailAddress]
  if (!mailRepo) {
    mailRepo = new ScrambleMailRepo(path.join(_mailDir, emailAddress))
    _mailRepos[emailAddress] = mailRepo
  }
  return mailRepo
}
