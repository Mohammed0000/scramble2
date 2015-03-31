/**
 * Stores IMAP accounts. 
 * 
 * Talks to the browser process over IPC to fetch and save accounts.
 * 
 * Does not talk to IMAP servers. For that, see IMAPActions and scramble-imap.
 */
var EventEmitter = require('events').EventEmitter
var assign = require('object-assign')

var accounts = []
var accountsByEmailAddress = {}
var addAccountErrorMessage = null
var accountSyncState = {}

module.exports = {
  AccountType: {
    GMAIL: "GMAIL",
    IMAP: "IMAP"
  },

  emitChange: function() {
    this.emit('change')
  },

  getAccounts: function() {
    return accounts
  },

  getAddAccountErrorMessage: function() {
    return addAccountErrorMessage
  },

  addAccount: function(account) {
    if (!this.AccountType[account.type] ||
        !account.emailAddress) {
      throw 'Invalid account: ' + JSON.stringify(account)
    }
    if (accountsByEmailAddress[account.emailAddress]) {
      throw 'Account ' + account.emailAddress + ' already exists'
    }
    accounts.push(account)
    accountsByEmailAddress[account.emailAddress] = account

    accountSyncState[account.emailAddress] = {
        numToDownload: 0,
        numDownloaded: 0,
        numToUpload: 0,
        numUploaded: 0,
      }

    this.emitChange()
  },

  setAddAccountErrorMessage: function(message) {
    addAccountErrorMessage = message 
    this.emitChange()
  },

  getSyncState: function(emailAddress) {
    return accountSyncState[emailAddress]
  },
  
  getSyncStateTotals: function () {
    return accounts.map(function(account) {
          return accountSyncState[account.emailAddress]
        }).reduce(function(a, b){
          return {
              numToDownload: a.numToDownload + b.numToDownload,
              numDownloaded: a.numDownloaded + b.numDownloaded,
              numToUpload: a.numToUpload + b.numToUpload,
              numUploaded: a.numUploaded + b.numUploaded
            }
        }, {
          numToDownload: 0,
          numDownloaded: 0,
          numToUpload: 0,
          numUploaded: 0
        })
  },

  setSyncState: function(emailAddress, stateChange) {
    assign(accountSyncState[emailAddress], stateChange)
    this.emitChange()
  }
}

module.exports.__proto__ = EventEmitter.prototype
EventEmitter.call(module.exports)
