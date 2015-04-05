var React = require('react')
var BS = require('react-bootstrap')
var IMAPStore = require('../stores/IMAPStore')
var IMAPActions = require('../actions/IMAPActions')

module.exports = React.createClass({
  displayName: 'AddAccountModal',

  propTypes: {
    onRequestHide: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      inProgress: false,
      errorMessage: null
    }
  },

  componentDidMount: function () {
    IMAPStore.addListener('change', this.onIMAPStoreChange)
  },

  componentWillUnmount: function () {
    IMAPStore.removeListener('change', this.onIMAPStoreChange)
  },

  onIMAPStoreChange: function () {
    var errorMessage = IMAPStore.getAddAccountErrorMessage()
    var inProgress = this.state.inProgress
    this.setState({
      errorMessage: errorMessage,
      inProgress: false
    })
    if (inProgress && !errorMessage) {
      // Account added successfully
      console.log('Account added successfully, closing Add Account modal')
      this.props.onRequestHide()
    }
  },

  onAddAccount: function () {
    var username = this.refs.gmailUsername.getValue()
    var password = this.refs.gmailPassword.getValue()

    console.log('Adding Gmail account: %s %s', username, password)
    this.setState({inProgress: true})
    IMAPActions.addGmailAccount(username, password)
  },

  render: function () {
    var errorMessage = this.state.errorMessage
    var inProgress = this.state.inProgress
    var spinner = inProgress ? (<img src='./img/spinner.gif' />) : null

    return (
      <BS.Modal {...this.props} bsStyle='primary' title='Add Account' animation={false}>
        <div className='modal-body'>
          <p>
            <BS.ButtonGroup>
              <BS.Button>Gmail</BS.Button>
              <BS.Button>Other IMAP</BS.Button>
            </BS.ButtonGroup>
          </p>

          <form className='form-horizontal'>
            <BS.Input type='text' ref='gmailUsername' label='Email address' labelClassName='col-sm-3' wrapperClassName='col-sm-9' />
            <BS.Input type='password' ref='gmailPassword' label='Password' labelClassName='col-sm-3' wrapperClassName='col-sm-9' />
            <div className='form-group'>
              <div className='col-sm-9 col-sm-offset-2'>
                <small>
                  You credentials will only ever be sent to Google over HTTPS and are only used to sync messages.
                  Google won't be able to read your encrypted mail.

                  If you use two-factor auth, you'll need to <a href="https://security.google.com/settings/security/apppasswords">create an app password</a>.
                </small>
              </div>
            </div>
            <div className='form-group'>
              <div className='col-sm-9 col-sm-offset-2 text-danger'>
                <small>{errorMessage}</small>
              </div>
            </div>
          </form>
        </div>
        <div className='modal-footer'>
          <BS.Button bsStyle='primary' onClick={this.onAddAccount} disabled={inProgress}>Add Account {spinner}</BS.Button>
          <BS.Button onClick={this.props.onRequestHide} disabled={inProgress}>Cancel</BS.Button>
        </div>
      </BS.Modal>
    )
  }
})
