var React = require('react')
var BS = require('react-bootstrap')
var Tabs = require('./Tabs')
var SearchList = require('./SearchList')
var StatusBar = require('./StatusBar')
var InboxActions = require('../actions/InboxActions')
var IMAPActions = require('../actions/IMAPActions')
var SandboxFrame = require('../views/SandboxFrame')


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
    return message.scrambleThreadId
  },

  renderThread: function (thread) {
    return (<div dangerouslySetInnerHTML={{__html:thread.sanitizedSnippetHTML}} />)
  },

  render: function () {
    var contentElem = (this.props.selectedAccount === null ?
        this.renderWelcome() :
        this.renderInboxState())
    var imapAccountButton = this.renderIMAPAccountButton()
    var keybaseUser = this.props.keybaseSession.me
    var keybaseUsername = keybaseUser.id
    var keybaseImageURL =
        (keybaseUser.pictures && keybaseUser.pictures.primary.url) || 'img/anon.png'

    return (
      <div>
        <Tabs tabs={['Inbox', 'Outbox', 'Contacts']} />
        <div className='container'>
          <div className='row'>
            <div className='col-md-4'>
              <div className='row'>
                <div className='col-md-6'>
                  <img src={keybaseImageURL} className='profile-pic' />
                  <span className='keybase-logo'>KEYBASE</span>
                  <span className='keybase-user'>{keybaseUsername}</span>
                </div>
                <div className='col-md-6'>{imapAccountButton}</div>
              </div>

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
        <BS.DropdownButton bsStyle="link" title={selectedEmailAddress} onClick={this.onSelectAccount}>
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
    var sanitizedMessage = thread.sanitizedMessages[0]
    var subject = sanitizedMessage.subject
    var messageElems = thread.sanitizedMessages.map((function(message) {
      if (message.from.length !== 1) {
        console.warn('Expected message.from to be an array of one element, found ' +
          JSON.stringify(message.from))
      }
      var fromElem = this.renderNameAddress(message.from[0])
      var recipients = [].concat(message.to, message.cc || [], message.bcc || [])
      var toElems = recipients.map(this.renderNameAddress)
      var toListElems = new Array(toElems.length * 2 - 1)
      for (var i = 0; i < toElems.length; i++) {
        toListElems[i*2] = toElems[i]
        if (i === toElems.length - 2) {
          toListElems[i*2 + 1] = (<span> and </span>)
        } else if (i < toElems.length - 2) {
          toListElems[i*2 + 1] = (<span>, </span>)
        }
      }
      return (
        <div key={message.scrambleMailId} className='message'>
          <div className='message-from-to'>from {fromElem} to {toListElems}</div>
          <SandboxFrame className='message-body'
            sanitizedHtml={message.sanitizedHtmlBody} />
        </div>)
    }).bind(this))

    return (
      <div className='thread'>
        <h1 className='thread-subject'>{subject}</h1>
        {messageElems}
      </div>)
  },

  renderNameAddress: function (nameAddress) {
    return (<BS.Label>{nameAddress.name || nameAddress.address}</BS.Label>)
  }
})
