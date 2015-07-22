var React = require('react')
var BS = require('react-bootstrap')
var Tabs = require('./Tabs')
var SearchList = require('./SearchList')
var StatusBar = require('./StatusBar')
var InboxActions = require('../actions/InboxActions')
var IMAPActions = require('../actions/IMAPActions')
var SandboxFrame = require('../views/SandboxFrame')
var moment = require('moment')

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

    // HTML
    var snippetHTML = ' &mdash; ' + thread.sanitizedSnippetHTML
    var fromAddrs = thread.fromAddresses
    var fromMaxAddrs = 2
    var fromString = fromAddrs.slice(0, fromMaxAddrs).map(getDisplayNameForAddress).join(', ')
    if (fromAddrs.length > fromMaxAddrs) {
      // eg "Bob, Joe, +2 more"
      fromString += ', +' + (fromAddrs.length - fromMaxAddrs) + ' more'
    }
    var dateString = getDisplayNameForTimestamp(thread.latestTimestamp)

    return (<div>
        <div style={styleEllipsis}>
          <span >{thread.subject}</span>
          <span className="deemphasize" dangerouslySetInnerHTML={{__html: snippetHTML}} />
        </div>
        <div style={styleFlex}>
          <span style={styleFrom}>{fromString}</span>
          <span style={styleDate}>{dateString}</span>
        </div>
      </div>)
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
    var messageElems = thread.sanitizedMessages.map(function (message) {
      if (message.from.length !== 1) {
        console.warn('Expected message.from to be an array of one element, found ' +
          JSON.stringify(message.from))
      }
      var fromElem = this.renderNameAddress(message.from[0])
      var recipients = [].concat(message.to, message.cc || [], message.bcc || [])
      var toElems = recipients.map(this.renderNameAddress)
      var toListElems = new Array(toElems.length * 2 - 1)
      for (var i = 0; i < toElems.length; i++) {
        toListElems[i * 2] = toElems[i]
        if (i === toElems.length - 2) {
          toListElems[i * 2 + 1] = (<span key={'to-delimiter-' + i}> and </span>)
        } else if (i < toElems.length - 2) {
          toListElems[i * 2 + 1] = (<span key={'to-delimiter-' + i}>, </span>)
        }
      }

      // You can't use external CSS to style an iframe, and as an added layer of
      // security on top of CAJA I want to sandbox the email body in an <iframe>
      // So: here's a hack to set the font inline
      var sanitizedFrameHtml = ('<html>' +
        '<head><style>body{font-family:sans-serif; color:#333; margin: 30px 0}</style></head>' +
        '<body>' + message.sanitizedHtmlBody)

      return (
        <div key={message.scrambleMailId} className='message'>
          <div className='message-from-to'>from {fromElem}</div>
          <div className='message-from-to'>to {toListElems}</div>
          <SandboxFrame className='message-body' sanitizedHtml={sanitizedFrameHtml} />
        </div>)
    }.bind(this))

    return (
      <div className='thread'>
        <h1 key="header" className='thread-subject'>{subject}</h1>
        {messageElems}
      </div>)
  },

  renderNameAddress: function (nameAddress, i) {
    return (<BS.Label key={'to-' + i}>{nameAddress.name || nameAddress.address}</BS.Label>)
  }
})

/**
 * Returns a display name for an RFC standard name-address pair.
 * For example get...("Loco Dice <loco@scramble.io>") returns "Loco Dice"
 * Also get...("<noname@scramble.io>") return "noname"
 */
function getDisplayNameForAddress (address) {
  var parts = address.split(/\s+/)
  var endsWithAddress = parts[parts.length - 1].startsWith('<')
  if (parts.length > 1 && endsWithAddress) {
    // use name
    var name = parts.slice(0, parts.length - 1).join(' ')
    if (name.startsWith('"') && name.endsWith('"')) {
      name = name.slice(1, name.length - 1)
    }
    return name
  } else if (endsWithAddress) {
    // use first part of email address, eg "hello" for "<hello@scramble.io>"
    return parts[parts.length - 1].slice(1).split('@')[0]
  } else {
    // unknown format, just use the whole string
    console.warn('Couldn\'t parse RFC name-address pair "' + address + '"')
    return address
  }
}

/**
 * Displays a timestamp, relative to current time.
 * For example, if it's 8am on Jan 1 2015 UTC, then:
 * - getDisplayNameForTimestamp("2014-12-31T10:00:00Z") returns "Yesterday"
 * - getDisplayNameForTimestamp("2013-12-31T10:00:00Z") returns "Dec 31, 2013"
 */
function getDisplayNameForTimestamp (timestamp) {
  return moment(timestamp).fromNow()
}
