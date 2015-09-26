var React = require('react')
var BS = require('react-bootstrap')
var SearchList = require('./SearchList')
var Thread = require('./Thread')
var InboxActions = require('../actions/InboxActions')
var IMAPActions = require('../actions/IMAPActions')
var Stringers = require('./Stringers')

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
    console.log('Inbox.onSelectAccount')
  },

  onReply: function (evt) {
    console.log('Inbox.onReply')
  },

  searchThreads: function (queryString) {
    // TODO: email address and page
    InboxActions.queryThreads('dcposch@gmail.com', queryString, 1)
  },

  selectThread: function (threadID) {
    InboxActions.selectThread('dcposch@gmail.com', threadID)
  },

  getThreadID: function (message) {
    return message.scrambleThreadId
  },

  renderThread: function (thread) {
    // Styles
    var styleFlex = {
      display: 'flex',
      flexFlow: 'row nowrap'
    }
    var styleEllipsis = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
    var styleFrom = {
      fontSize: '0.9em'
    }
    var styleDate = {
      fontSize: '0.9em',
      marginLeft: 'auto'
    }
    var styleLockIcon = {
      paddingRight: '5px',
      marginLeft: 'auto'
    }

    // HTML
    var snippetHTML = ' &mdash; ' + thread.sanitizedSnippetHTML
    var fromAddrs = thread.fromAddresses
    var fromMaxAddrs = 2
    var fromString = fromAddrs.slice(0, fromMaxAddrs).map(Stringers.addressToString).join(', ')
    if (fromAddrs.length > fromMaxAddrs) {
      // eg "Bob, Joe, +2 more"
      fromString += ', +' + (fromAddrs.length - fromMaxAddrs) + ' more'
    }
    var dateString = Stringers.timestampToString(thread.latestTimestamp)

    // TODO: populate isEncrypted in the inbox service
    // if (thread.isEncrypted) {
    var lockIcon = null
    lockIcon = (<span className="glyphicon glyphicon-lock" style={styleLockIcon}></span>)

    return (<div>
        <div style={styleFlex}>
          <div style={styleEllipsis}>
            <span>{thread.subject}</span>
            <span className="deemphasize" dangerouslySetInnerHTML={{__html: snippetHTML}} />
          </div>
          {lockIcon}
        </div>
        <div style={styleFlex}>
          <span style={styleFrom}>{fromString}</span>
          <span style={styleDate}>{dateString}</span>
        </div>
      </div>)
  },

  render: function () {
    var contentElem = this.renderContent()
    var sidebarElem = this.renderSidebar()

    return (
      <div className='container'>
        <div className='row'>
          <div className='col-md-4'>
            {sidebarElem}
          </div>
          <div className='col-md-8'>
            {contentElem}
          </div>
        </div>
      </div>
    )
  },

  /**
   * Creates the sidebar, which lets you search threads and select one to read.
   */
  renderSidebar: function () {
    var imapAccountButton = this.renderIMAPAccountButton()
    var keybaseUser = this.props.keybaseSession.me
    var keybaseUsername = keybaseUser.id
    var keybaseImageURL =
        (keybaseUser.pictures && keybaseUser.pictures.primary.url) || 'img/anon.png'

    return (
      <div>
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
          onSearch={this.searchThreads} />
      </div>
    )
  },

  renderIMAPAccountButton: function () {
    if (this.props.selectedAccount === null) {
      return (
        <BS.Button bsStyle='primary' onClick={this.onAddAccount}>
          Add Account
        </BS.Button>)
    } else {
      var selectedEmailAddress = this.props.selectedAccount.emailAddress
      var accountElems = this.props.accounts.filter(function (account) {
        return account.emailAddress !== selectedEmailAddress
      }).map(function (account) {
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
        <BS.DropdownButton
            bsStyle="link"
            title={selectedEmailAddress}
            onClick={this.onSelectAccount}>
          {accountElems}
        </BS.DropdownButton>)
    }
  },

  /**
   * Renders the main content pane (as opposed to header, footer, or sidebar)
   */
  renderContent: function () {
    if (this.props.selectedAccount === null) {
      return (
        <div>
          <h1>Welcome to Scramble!</h1>
          <p>To get started, click Add Account.</p>
        </div>
      )
    } else if (this.props.selectedThread !== null) {
      return (<Thread thread={this.props.selectedThread} />)
    } else {
      return null
    }
  }
})
