var React = require('react')
var BS = require('react-bootstrap')
var LoginActions = require('../actions/LoginActions')
var KeybaseStore = require('../stores/KeybaseStore')

module.exports = React.createClass({
  displayName: 'Login',

  propTypes: {},

  getInitialState: function () {
    return {
      loginState: KeybaseStore.getLoginState(),
      inProgress: false
    }
  },

  componentDidMount: function () {
    KeybaseStore.addListener('change', this.onKeybaseStoreChange)
  },

  componentWillUnmount: function () {
    KeybaseStore.removeListener('change', this.onKeybaseStoreChange)
  },

  onKeybaseStoreChange: function () {
    var state = {
      loginState: KeybaseStore.getLoginState(),
      inProgress: false
    }
    this.setState(state)
    if(state.wrongUsername) {
        this.refs.username.getDOMNode().children[0].focus()
    } else if (state.wrongPassphrase) {
        this.refs.password.getDOMNode().children[0].focus()
    }
  },

  handleSignIn: function () {
    var username = this.refs.username.getValue().trim()
    var passphrase = this.refs.passphrase.getValue()
    if (!username || !passphrase) {
      return
    }
    this.setState({inProgress: true})
    LoginActions.login(username, passphrase)
  },

  handleCreateAccount: function () {
    throw 'Unimplemented'
  },

  render: function () {
    var loginState = this.state.loginState
    var inProgress = this.state.inProgress
    var spinner = inProgress ? (<img src='./img/spinner.gif' />) : null

    return (
    <div className='container'>
      <div className='row'>
        <div className='form-signin center-block text-center'>
          <img src='./img/black_rubik.svg' className='logo-img' />
          <h1 className='text-center'>Scramble</h1>
          <h3 className='text-center'>Login with Keybase</h3>
          <hr className='invis' />
          <BS.Input
            type='text'
            placeholder='Username'
            required=''
            autofocus=''
            bsStyle={loginState.wrongUsername ? 'error' : null}
            ref='username' />
          <br />
          <BS.Input
            type='password'
            placeholder='Passphrase'
            required=''
            bsStyle={loginState.wrongPassphrase ? 'error' : null}
            ref='passphrase' />
          <br />
          <button className='btn btn-lg btn-default btn-block' type='submit' onClick={this.handleSignIn} disabled={inProgress}>Sign in {spinner}</button>
          <br />
          <div className='text-danger'>{loginState.error}</div>
          <div className='strike'><hr/><span>or</span></div>
          <button className='btn btn-lg btn-primary btn-block' type='submit' onClick={this.handleCreateAccount} disabled={inProgress}>Create Account</button>
          <small>
            <hr className='invis'/>
            <p>
              <a href='http://dcposch.github.com/scramble'>How it works</a>
            </p>
            <p>
              Questions? Feedback? Just testing a new account?<br/>
              Send us a note! To: hello@scramble.io
            </p>
          </small>
        </div>
      </div>
    </div>
    )
  }
})
