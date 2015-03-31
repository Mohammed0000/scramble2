var remote = require('remote')
var IMAPStore = require('../stores/IMAPStore')

var remoteScrambleIMAP = remote.require('scramble-imap')

/**
 * All actions related to IMAP accounts.
 */
module.exports = {

  addGmailAccount: function(username, password) {
    // Try connecting to the account to download mail
    var emailAddress = /@/.test(username) ? username : (username + '@gmail.com')
    var imap = remoteScrambleIMAP.createForGmail(emailAddress, password)
    imap.fetchAll()
    
    // Example inboxStats
    // {
    //   "name":"[Gmail]/All Mail",
    //   "flags":["\\Answered","\\Flagged","\\Draft","\\Deleted","\\Seen","$Phishing","$Forwarded","$NotPhishing"],
    //   "readOnly":true,
    //   "uidvalidity":596465977,
    //   "uidnext":910271,
    //   "permFlags":[],
    //   "keywords":[],
    //   "newKeywords":false,
    //   "persistentUIDs":true,
    //   "nomodseq":false,
    //   "messages":{
    //     "total":242110,
    //     "new":0
    //   },
    //   "highestmodseq":"21890643"
    // }
    imap.on('box', function(inboxStats) {
      // Connected successfully. Add this account to our list of accounts
      console.log('Connected successfully. Inbox stats: ' + JSON.stringify(inboxStats))
      // TODO: tell remote to store this IMAP account
      IMAPStore.addAccount({
        type: IMAPStore.AccountType.GMAIL,
        emailAddress: emailAddress,
        password: password
      })
      var numMsgs = inboxStats.messages.total
      IMAPStore.setSyncState(emailAddress, {numToDownload: numMsgs})
    })

    imap.on('error', function(err) {
      var message
      if (err.source === 'timeout') {
        message = 'Can\'t connect to the IMAP server. Are you offline?'
      } else if (err.source === 'authentication') {
        message = 'Wrong username or password'
      } else {
        message = 'Error: ' + err.source
      }
      IMAPStore.setAddAccountErrorMessage(message)
    })

    var numDownloaded = 0
    imap.on('message', function(msg) {
      console.log('Got message! ' + JSON.stringify(msg.attributes))
      IMAPStore.setSyncState(emailAddress, {numDownloaded: ++numDownloaded})
    })
  },

  addIMAPAccount: function(server, port, username, password) {
    throw 'Unimplemented'
  },

  removeAccount: function(accountID) {
    throw 'Unimplemented'
  }
}
