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
  }
}

remoteIMAPApi.on('accountsChanged', function (accounts) {
  IMAPStore.setAccounts(accounts)
})

remoteIMAPApi.on('syncChanged', function (syncState) {
  IMAPStore.setSyncState(syncState)
})
