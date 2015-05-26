var React = require('react')
var BS = require('react-bootstrap')
var Tabs = require('./Tabs')
var SearchList = require('./SearchList')
var StatusBar = require('./StatusBar')
var InboxActions = require('../actions/InboxActions')
var IMAPActions = require('../actions/IMAPActions')

module.exports = React.createClass({
  displayName: 'Inbox',

  propTypes: {
    keybaseSession: React.PropTypes.object.isRequired,
    accounts: React.PropTypes.array.isRequired,
    selectedAccount: React.PropTypes.object,
    threads: React.PropTypes.array.isRequired,
    selectedThreadID: React.PropTypes.string,
    selectedThread: React.PropTypes.object
  },

  onAddAccount: function () {
    // Start the Add Account flow
    IMAPActions.startAddAccount()
  },

  onCancelSync: function () {
    // TODO: here for testing, remove
    console.log('Cancelling sync...')
    IMAPActions.cancelSync()
  },

  onSelectAccount: function (evt) {
    console.log('Inbox.onSelectAccount ' + JSON.stringify(evt))
  },

  searchThreads: function (queryString) {
    // TODO: email address and page
    InboxActions.queryThreads('dcposch@gmail.com', queryString, 1)
  },

  selectThread: function (threadID) {
    InboxActions.selectThread ('dcposch@gmail.com', threadID)
  },

  getThreadID: function (message) {
    return message.scrambleMailId
  },

  renderThread: function (message) {
    return (<div>{message.subject}</div>)
  },

  render: function () {
    var contentElem = (this.props.selectedAccount === null ?
        this.renderWelcome() :
        this.renderInboxState())
    var imapAccountButton = this.renderIMAPAccountButton()
    var keybaseUsername = this.props.keybaseSession.me.id

    return (
      <div>
        <Tabs tabs={['Inbox', 'Outbox', 'Contacts']} />
        <div className='container'>
          <div className='row'>
            <div className='col-md-4'>
              <p>Welcome, {keybaseUsername}!</p>

              {imapAccountButton}

              <SearchList
                data={this.props.threads}
                elementFunc={this.renderThread}
                keyFunc={this.getThreadID}
                onSelect={this.selectThread}
                onSearch={this.searchThreads}/>

            </div>
            <div className='col-md-8'>
              {contentElem}
            </div>
          </div>
        </div>

        <StatusBar />
      </div>)
  },

  renderIMAPAccountButton: function () {
    if (this.props.selectedAccount === null) {
      return (
        <BS.Button bsStyle='primary' onClick={this.onAddAccount}>
          Add Account
        </BS.Button>)
    } else {
      var selectedEmailAddress = this.props.selectedAccount.emailAddress 
      var accountElems = this.props.accounts.filter(function(account){
        return account.emailAddress !== selectedEmailAddress
      }).map(function(account) {
        return (
          <BS.MenuItem key={account.emailAddress} eventKey={account.emailAddress}>
            {account.emailAddress}
          </BS.MenuItem>)
      })
      if (accountElems.length > 0) {
        accountElems.push(<BS.MenuItem key="div" divider="1" />)
      }
      accountElems.push(
        <BS.MenuItem key="add" onClick={this.onAddAccount}>
          Add Account
        </BS.MenuItem>)
      return (
        <BS.DropdownButton title={selectedEmailAddress} onClick={this.onSelectAccount}>
          {accountElems}
        </BS.DropdownButton>)
    }
  },

  renderWelcome: function () {
    return (
      <div>
        <h1>Welcome to Scramble!</h1>
        <p>To get started, click Add Account.</p>
      </div>)
  },

  renderInboxState: function () {
    var thread = this.props.selectedThread
    if (thread === null) {
      return null
    }
    var subject = thread.messages[0].subject
    var sanitizedHtmlBody = thread.messages[0].sanitizedHtmlBody
    var messageElems = thread.messages.map(function(message) {
      return (
        <p>
          <h3>from {message.fromAddress} to {message.toAddress}</h3>
          <div className="body" dangerouslySetInnerHTML={{__html: sanitizedHtmlBody}} />
        </p>)
    })

    return (
      <div>
        <h1>{subject}</h1>
        {messageElems}
      </div>)
  }
})
