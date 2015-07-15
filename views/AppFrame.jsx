var React = require('react')
var Login = require('./Login')
var Inbox = require('./Inbox')
var AddAccountModal = require('./AddAccountModal')
var KeybaseStore = require('../stores/KeybaseStore')
var IMAPStore = require('../stores/IMAPStore')
var InboxStore = require('../stores/InboxStore')
var InboxActions = require('../actions/InboxActions')

module.exports = React.createClass({

  displayName: 'AppFrame',

  propTypes: {},

  getInitialState: function () {
    return {
      screen: 'login',

      keybaseSession: null,

      accounts: [],
      selectedAccount: null,
      isAddingAccount: false,

      threadQuery: null,
      threads: [],
      selectedThreadID: null,
      threadResult: null,
      selectedMessageID: null,

      contactQuery: null,
      contacts: [],
      selectedContactID: null,
      selectedContact: null
    }
  },

  componentDidMount: function () {
    KeybaseStore.addListener('change', this.onKeybaseStoreChanged)
    IMAPStore.addListener('change', this.onIMAPStoreChanged)
    InboxStore.addListener('change', this.onInboxStoreChanged)
  },

  componentWillUnmount: function () {
    KeybaseStore.removeListener('change', this.onKeybaseStoreChanged)
    IMAPStore.removeListener('change', this.onIMAPStoreChanged)
    InboxStore.removeListener('change', this.onInboxStoreChanged)
  },

  onKeybaseStoreChanged: function () {
    var keybaseSession = KeybaseStore.getKeybaseSession()
    var screen = keybaseSession == null ? 'login' : 'inbox'
    this.setState({
      screen: screen,
      keybaseSession: keybaseSession
    })
  },

  onIMAPStoreChanged: function () {
    var accounts = IMAPStore.getAccounts()
    var selectedAccount = this.state.selectedAccount || accounts[0] || null
    var isAddingAccount = IMAPStore.getNewAccount() !== null

    // If the selected account has changed, kick off a new
    // query to get the latest threads.
    // TODO: does this logic belong in InboxActions?
    // The state (selectedAccount) prob belongs in IMAPStore
    // ...and prob should be saved to the DB thru IMAPApi
    if (selectedAccount !== this.state.selectedAccount) {
      this.setState({
        threads: [],
        threadResult: null
      })
      InboxActions.queryThreads(selectedAccount.emailAddress, '', 1)
    }

    this.setState({
      accounts: accounts,
      selectedAccount: selectedAccount,
      isAddingAccount: isAddingAccount
    })
  },

  onInboxStoreChanged: function () {
    var errorMessage = InboxStore.getQueryError()
    if (errorMessage) {
      // TODO: display error, probably in the status bar
      console.error(errorMessage)
    }
    this.setState({
      threads: InboxStore.getThreads(),
      selectedThreadID: InboxStore.getSelectedThreadID(),
      threadResult: InboxStore.getThreadResult()
    })
  },

  render: function () {
    if (this.state.screen === 'inbox') {
      var selectedThread
      if (this.state.threadResult !== null &&
          this.state.threadResult.threadID === this.state.selectedThreadID) {
        selectedThread = this.state.threadResult.thread
      } else {
        selectedThread = null
      }
      var inbox = (
        <Inbox
          keybaseSession={this.state.keybaseSession}
          accounts={this.state.accounts}
          selectedAccount={this.state.selectedAccount}
          threads={this.state.threads}
          selectedThreadID={this.state.selectedThreadID}
          selectedThread={selectedThread} />)
      var modal = this.state.isAddingAccount ? (<AddAccountModal />) : null
      return (
        <div>
          {inbox}
          {modal}
        </div>)
    } else if (this.state.screen === 'login') {
      return (<Login />)
    } else {
      throw 'Invalid state ' + this.state.screen
    }
  }
})
