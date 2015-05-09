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

var _accountTypes = {
  GMAIL: 'GMAIL',
  OTHER: 'OTHER'
}

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

  /**
   * Returns the account with given email address,
   * or null if an account w/ that address doesn't exist
   */
  getAccount: function (emailAddress) {
    for (var i = 0; i < _accounts.length; i++) {
      if (_accounts[i].emailAddress === emailAddress) {
        return _accounts[i]
      }
    }
    return null
  },

  addGmailAccount: function (emailAddress, password) {
    if (this.getAccount(emailAddress) !== null) {
      throw new Error('Account ' + emailAddres + ' already exists')
    }

    // First, create an IMAP connection and try to download mail
    var account = {
      type: _accountTypes.GMAIL,
      emailAddress: emailAddress,
      password: password
    }
    var imap = createIMAPConnection.call(this, account)
    imap.fetchAll()

    // Only save the account once we've connected successfully
    imap.once('box', function (boxStats) {
      // Connected successfully. Add this account to our list of accounts
      console.log('Connected successfully. Inbox stats: ' + JSON.stringify(boxStats))
      LocalStore.saveAccount(account)
      _accounts.push(account)
    })
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
      _accounts.forEach((function(account) {
        getOrCreateMailRepo(account.emailAddress)
        var imap = createIMAPConnection.call(this, account)
        //TODO: fetch latest, not all
        imap.fetchAll()
      }).bind(this))
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
 * Instance method. Fires after each message's headers are
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
 * Instance method. Handles any kind of sync error.
 * For example: if the connection to the IMAP server dies, or if you're offline.
 */
function onError (emailAddress, error) {
  console.warn('Sync error for ' + emailAddress, error)
  var syncState = getSyncStateForAddress(emailAddress)
  syncState.errors.push(error)
  emitSyncChanged.apply(this)
}

/**
 * Instance method.
 * Adds a scramble-imap connection to the set of open connections.
 */
function createIMAPConnection(account) {
  var emailAddress = account.emailAddress
  if (_imapConnections[emailAddress]) {
     console.warn('Disconnecting IMAP connection for ' + emailAddress)
     _imapConnections[emailAddress].destroy()
  }

  // Create IMAP connection from account info
  var imap
  if (account.type === _accountTypes.GMAIL) {
    imap = ScrambleIMAP.createForGmail(emailAddress, account.password)
  } else {
    throw new Error('Account type ' + account.type + ' for ' + emailAddress + ' unsupported')
  }
  _imapConnections[emailAddress] = imap

  addIMAPEventHandlers.call(this, emailAddress, imap)

  return imap
}

/**
 * Instance method. Handle each downloaded message, error, etc
 */
function addIMAPEventHandlers(emailAddress, imap) {
  imap.once('box', function(boxStats) {
    // Create a folder for raw email messages, one per file
    mkdirp.sync(path.join(_mailDir, emailAddress))

    // Update the sync state: 0 downloaded, n left to download
    var syncState = getSyncStateForAddress(emailAddress)
    syncState.numToDownload = boxStats.messages.total

    emitAccountsChanged.apply(this)
    emitSyncChanged.apply(this)
  }.bind(this))

  imap.on('message', onMessage.bind(this, emailAddress))
  imap.on('error', onError.bind(this, emailAddress))
}

function getOrCreateMailRepo (emailAddress) {
  var mailRepo = _mailRepos[emailAddress]
  if (!mailRepo) {
    mailRepo = new ScrambleMailRepo(path.join(_mailDir, emailAddress))
    _mailRepos[emailAddress] = mailRepo
  }
  return mailRepo
}
