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
      threads: [],
      selectedThread: null
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
        selectedThread: null
      })
      InboxActions.queryThreads(selectedAccount.emailAddress, "", 1)
    }

    this.setState({
      accounts: accounts,
      selectedAccount: selectedAccount,
      isAddingAccount: isAddingAccount
    })
  },

  onInboxStoreChanged: function () {
    console.log("InboxStoreChanged")
    var errorMessage = InboxStore.getQueryError()
    if (errorMessage) {
      alert(errorMessage)
    }
    var threads = InboxStore.getThreads()
    this.setState({
      threads: threads,
      selectedThread: (threads && threads[0] || null)
    })
  },

  render: function () {
    if (this.state.screen === 'inbox') {
      var inbox = (
        <Inbox
          keybaseSession={this.state.keybaseSession}
          accounts={this.state.accounts}
          selectedAccount={this.state.selectedAccount}
          threads={this.state.threads}
          selectedThreads={null} />)
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
