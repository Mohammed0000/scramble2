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
        keybaseSession={this.state.keybaseSession} />)
    } else if (this.state.screen === 'login') {
      return (<Login />)
    } else {
      throw 'Invalid state ' + this.state.screen
    }
  }
})
