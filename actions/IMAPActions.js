var remote = require('remote')
var IMAPStore = require('../stores/IMAPStore')
var remoteIMAPApi = remote.require('./apis/IMAPApi')

/**
 * All actions related to IMAP accounts.
 */
module.exports = {
  addGmailAccount: function (username, password) {
    // Try connecting to the account to download mail
    var emailAddress = /@/.test(username) ? username : (username + '@gmail.com')
    remoteIMAPApi.addGmailAccount(emailAddress, password)
  },

  addIMAPAccount: function (server, port, username, password) {
    throw new Error('Unimplemented')
  },

  removeAccount: function (accountID) {
    throw new Error('Unimplemented')
  },

  startAddAccount: function () {
    IMAPStore.setNewAccount({})
  },

  cancelAddAccount: function () {
    IMAPStore.setNewAccount(null)
  },

  cancelSync: function () {
    remoteIMAPApi.cancelSync()
  }
}

remoteIMAPApi.on('accountsChanged', function (accountsJson) {
  IMAPStore.setAccounts(JSON.parse(accountsJson))
})

remoteIMAPApi.on('syncChanged', function (syncStateJson) {
  IMAPStore.setSyncState(JSON.parse(syncStateJson))
})
