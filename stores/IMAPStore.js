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
var _addAccountErrorMessage = null
var _accountSyncState = {}

module.exports = objectAssign({}, EventEmitter.prototype, {
  AccountType: {
    GMAIL: 'GMAIL',
    IMAP: 'IMAP'
  },

  emitChange: function () {
    this.emit('change')
  },

  getAccounts: function () {
    return _accounts
  },

  getAddAccountErrorMessage: function () {
    return _addAccountErrorMessage
  },

  setAccounts: function (accounts) {
    _accounts = []
    _accountsByEmailAddress = {}
    accounts.forEach(this._addAccount.bind(this))
    this.emitChange()
  },

  addAccount: function (account) {
    this._addAccount(account)
    this.emitChange()
  },

  _addAccount: function (account) {
    if (!this.AccountType[account.type] || !account.emailAddress) {
      throw 'Invalid account: ' + JSON.stringify(account)
    }
    if (_accountsByEmailAddress[account.emailAddress]) {
      throw 'Account ' + account.emailAddress + ' already exists'
    }
    _accounts.push(account)
    _accountsByEmailAddress[account.emailAddress] = account
  },

  setAddAccountErrorMessage: function (message) {
    _addAccountErrorMessage = message
    this.emitChange()
  },

  getSyncState: function (emailAddress) {
    return _accountSyncState[emailAddress]
  },

  getSyncStateTotals: function () {
    return _accounts.map(function (account) {
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

  updateSyncState: function (emailAddress, stateChange) {
    objectAssign(_accountSyncState[emailAddress], stateChange)
    this.emitChange()
  },

  setSyncState: function (syncState) {
    _accountSyncState = syncState
    this.emitChange()
  }
})

EventEmitter.call(module.exports)
