var React = require('react')
var BS = require('react-bootstrap')
var AddAccountModal = require('./AddAccountModal')
var Tabs = require('./Tabs')
var SearchList = require('./SearchList')
var StatusBar = require('./StatusBar')

module.exports = React.createClass({
  displayName: 'Inbox',

  propTypes: {
    keybaseSession: React.PropTypes.object.isRequired,
    accounts: React.PropTypes.array.isRequired,
    selectedAccount: React.PropTypes.object,
    threads: React.PropTypes.array.isRequired,
    selectedThread: React.PropTypes.object
  },

  getInitialState: function () {
    return {
      isAddingAccount: false
    }
  },

  onAddAccount: function () {
    // Show the Add Account modal
    this.setState({
      isAddingAccount: true
    })
  },

  onCancelSync: function () {
    // TODO: here for testing, remove
    console.log('Cancelling sync...')
    require('../actions/IMAPActions').cancelSync()
  },

  searchThreads: function (query) {
    // TODO: fire a search action
  },

  selectThread: function (scrambleMailId) {
    // TODO: fire a select action
  },

  getThreadID: function (message) {
    return message.scrambleMailId
  },

  renderThread: function (message) {
    return (<div>{message.subject}</div>)
  },

  render: function () {
    var contentElem = (this.state.selectedAccount === null ?
        this.renderWelcome() :
        this.renderInboxState())
    var keybaseUsername = this.props.keybaseSession.me.id

    return (
      <div>
        <Tabs tabs={['Inbox', 'Outbox', 'Contacts']} />
        <div className='container'>
          <div className='row'>
            <div className='col-md-4'>
              <p>Welcome, {keybaseUsername}!</p>
              <SearchList
                data={this.props.threads}
                elementFunc={this.renderThread}
                keyFunc={this.getThreadID}
                onSelect={this.selectThread}
                onSearch={this.searchThreads}/>

              <footer className='footer'>
                <div className='btn-toolbar'>
                  <BS.Button bsStyle='primary' onClick={this.onAddAccount}>Add Account</BS.Button>
                  <BS.Button onClick={this.onCancelSync}>Cancel Sync</BS.Button>
                </div>
              </footer>
            </div>
            <div className='col-md-8'>
              {contentElem}
            </div>
          </div>
        </div>

        { this.state.isAddingAccount ? (<AddAccountModal />) : null }

        <StatusBar />
      </div>)
  },

  renderWelcome: function () {
    return (
      <div>
        <h1>Welcome to Scramble!</h1>
        <p>To get started, click Add Account.</p>
      </div>)
  },

  renderInboxState: function () {
    return (
      <div>
        <h1>Inbox Zero. Congrats!</h1>
        <p>TODO: check whether it is actually inbox zero. Display stats.</p>
      </div>)
  }
})
