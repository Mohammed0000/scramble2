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

// TODO: clean up event handling
remoteIMAPApi.on('accountsChanged', function (inboxStats) {
  var accounts = remoteIMAPApi.getAccounts()
  IMAPStore.setAccounts(accounts)
})

remoteIMAPApi.on('syncChanged', function () {
  // Handle download progress
  var syncState = remoteIMAPApi.getSyncState()
  IMAPStore.setSyncState(syncState)

  // Handle errors
  var err = remoteIMAPApi.getSyncError()
  var message
  if (!err) {
    message = null
  } else if (err.source === 'timeout') {
    message = "Can't connect to the IMAP server. Are you offline?"
  } else if (err.source === 'authentication') {
    message = 'Wrong username or password'
  } else {
    message = 'Error: ' + err.source
  }
  IMAPStore.setAddAccountErrorMessage(message)
})
