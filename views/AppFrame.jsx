var path = require('path')
var remote = require('remote')
var React = require('react')
var Login = require('./Login')
var Inbox = require('./Inbox')
var KeybaseStore = require('../stores/KeybaseStore')

module.exports = React.createClass({

  displayName: 'AppFrame',

  propTypes: {},

  getInitialState: function () {
    return {
      screen: 'login',
      keybaseSession: null
    }
  },

  componentDidMount: function () {
    KeybaseStore.addListener('change', this.onKeybaseStoreChanged)
  },

  componentWillUnmount: function () {
    KeybaseStore.addListener('change', this.onKeybaseStoreChanged)
  }, 

  onKeybaseStoreChanged: function () {
    var keybaseSession = KeybaseStore.getKeybaseSession()
    var screen = keybaseSession == null ? 'login' : 'inbox'
    this.setState({
      screen: screen,
      keybaseSession: keybaseSession
    })
  },

  render: function () {
    if (this.state.screen === 'inbox') {
      console.log('Rendering inbox')
      return (<Inbox
        accounts={[]}
        searchMessages={searchMessages}
        loadMessageCleanHTML={loadCleanHTML} 
        keybaseSession={this.state.keybaseSession} />)
    } else if (this.state.screen === 'login') {
      return (<Login />)
    } else {
      throw 'Invalid state ' + this.state.screen
    }
  }
})

// TODO: factor out store
var ScrambleMailRepo = remote.require('scramble-mail-repo')
var mailRepoDir = path.join(process.env.HOME, 'scramble-test-dir')
var mailRepo = new ScrambleMailRepo(mailRepoDir)
var messages = []
function searchMessages (query, cb) {
  mailRepo.search(query, function (err, msgs) {
    messages = msgs
    cb(err, msgs)
  })
}

function loadCleanHTML (scrambleMailId) {
  // TODO: read from disk, use MailParser, then use CAJA to sanitize HTML
  // TODO: refactor to use a callback rather than returning directly
  for (var i = 0; i < messages.length; i++) {
    var message = messages[i]
    if (message.scrambleMailId === scrambleMailId) {
      return '<pre> ' + message.snippet + ' </pre>'
    }
  }
  return '<div class="text-error">Not found</div>'
}
