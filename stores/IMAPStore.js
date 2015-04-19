/**
 * Stores IMAP accounts.
 *
 * Talks to the browser process over IPC to fetch and save accounts.
 *
 * Does not talk to IMAP servers. For that, see IMAPActions and scramble-imap.
 */

var EventEmitter = require('events').EventEmitter
var objectAssign = require('object-assign')

var _accounts = []
var _accountsByEmailAddress = {}
var _accountSyncState = {}

module.exports = objectAssign({}, EventEmitter.prototype, {
  AccountType: {
    GMAIL: 'GMAIL',
    IMAP: 'IMAP'
  },

  getAccounts: function () {
    return _accounts
  },

  setAccounts: function (accounts) {
    _accounts = []
    _accountsByEmailAddress = {}
    accounts.forEach(verifyAndAddAccount.bind(this))
    emitChange.apply(this)
  },

  addAccount: function (account) {
    verifyAndAddAccount.apply(this, account)
    emitChange.apply(this)
  },

  /**
   * Gets the sync state of a single acocunt. Returns an object as follows:
   * {numToDownload, numDownloaded, numIndexed, numToUpload, numUploaded}
   */
  getSyncState: function (emailAddress) {
    return _accountSyncState[emailAddress]
  },

  /**
   * Gets the combined sync state across all accounts. Returns an object as follows:
   * {numToDownload, numDownloaded, numIndexed, numToUpload, numUploaded}
   */
  getSyncStateTotals: function () {
    return _accounts.filter(function(account) {
      return _accountSyncState[account.emailAddress]
    }).map(function (account) {
      return _accountSyncState[account.emailAddress]
    }).reduce(function (a, b) {
      return {
        numToDownload: a.numToDownload + b.numToDownload,
        numDownloaded: a.numDownloaded + b.numDownloaded,
        numIndexed: a.numIndexed + b.numIndexed,
        numToUpload: a.numToUpload + b.numToUpload,
        numUploaded: a.numUploaded + b.numUploaded
      }
    }, {
      numToDownload: 0,
      numDownloaded: 0,
      numIndexed: 0,
      numToUpload: 0,
      numUploaded: 0
    })
  },

  /**
   * Returns a single error message if any of the accounts aren't syncing,
   * or null if everything is OK.
   */
  getCombinedErrorMessage: function () {
    for (var i in _accounts) {
      if (_accounts[i].error) {
        return getErrorMessage(_accounts[i].error)
      }
    }
    return null
  },

  updateSyncState: function (emailAddress, stateChange) {
    objectAssign(_accountSyncState[emailAddress], stateChange)
    emitChange.apply(this)
  },

  setSyncState: function (syncState) {
    _accountSyncState = syncState
    emitChange.apply(this)
  }
})

EventEmitter.call(module.exports)

function verifyAndAddAccount(account) {
  if (!this.AccountType[account.type] || !account.emailAddress) {
    throw 'Invalid account: ' + JSON.stringify(account)
  }
  if (_accountsByEmailAddress[account.emailAddress]) {
    throw 'Account ' + account.emailAddress + ' already exists'
  }
  _accounts.push(account)
  _accountsByEmailAddress[account.emailAddress] = account
}

function getErrorMessage (err) {
  if (!err) {
    return null
  } else if (err.source === 'timeout') {
    return "Can't connect to the IMAP server. Are you offline?"
  } else if (err.source === 'authentication') {
    return 'Wrong username or password'
  } else {
    console.log('IMAPStore: Unknown IMAP sync error', err)
    return 'Error: ' + err.source
  }
}

function emitChange() {
  this.emit('change')
}
