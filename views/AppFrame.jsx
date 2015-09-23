var React = require('react')
var Login = require('./Login')
var Tabs = require('./Tabs')
var Inbox = require('./Inbox')
var Contacts = require('./Contacts')
var StatusBar = require('./StatusBar')
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

  onTabSelect: function (tabName) {
    console.log('Switching tabs to ' + tabName)
    this.setState({
      screen: tabName.toLowerCase()
    })
  },

  // renders the main app frame. depending on application state, this means either:
  // * login window
  // * create keybase account
  // * one of the tabs of the logged-in view
  render: function () {
    if (this.state.screen === 'login') {
      return (<Login />)
    }

    // the inbox, outbox, and contacts screens share a tab bar across the top
    // and a status bar across the bottom. content is one of three different views
    var content = null
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
      content = (
        <div>
          {inbox}
          {modal}
        </div>)
    } else if (this.state.screen === 'outbox') {
      content = (<h1>Outbox</h1>)
    } else if (this.state.screen === 'contacts') {
      var mockResults = [
        {id: 1, emailAddress: 'bob@gmail.com', name: 'Bob McBob', keys: ['fake']},
        {id: 2, emailAddress: 'joe@yamamail.com', name: 'Joe Fukuyama', keys: []},
        {id: 3, emailAddress: 'jim@gmail.com', name: 'Jim Chen', keys: []}
      ]
      content = (<Contacts contactsResult={mockResults}/>)
    } else {
      throw 'Invalid state ' + this.state.screen
    }
    return (
      <div>
        <Tabs tabs={['Inbox', 'Outbox', 'Contacts']} onSelect={this.onTabSelect} />
        {content}
        <StatusBar />
      </div>)
  }
})
