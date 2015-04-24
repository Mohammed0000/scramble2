var React = require('react')
var Login = require('./Login')
var Inbox = require('./Inbox')
var AddAccountModal = require('./AddAccountModal')
var KeybaseStore = require('../stores/KeybaseStore')
var IMAPStore = require('../stores/IMAPStore')
var InboxStore = require('../stores/InboxStore')

module.exports = React.createClass({

  displayName: 'AppFrame',

  propTypes: {},

  getInitialState: function () {
    return {
      screen: 'login',
      keybaseSession: null,
      accounts: [],
      selectedAccount: null,
      isAddingAccount: false
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
    this.setState({
      accounts: accounts,
      selectedAccount: selectedAccount,
      isAddingAccount: isAddingAccount
    })
  },

  onInboxStoreChanged: function () {
    console.log("InboxStoreChanged")
  },

  render: function () {
    if (this.state.screen === 'inbox') {
      var inbox = (
        <Inbox
          keybaseSession={this.state.keybaseSession}
          accounts={this.state.accounts}
          selectedAccount={this.state.selectedAccount}
          threads={[]}
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
