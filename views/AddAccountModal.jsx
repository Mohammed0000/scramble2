var React = require('react')
var BS = require('react-bootstrap')
var IMAPStore = require('../stores/IMAPStore')
var IMAPActions = require('../actions/IMAPActions')

module.exports = React.createClass({
  displayName: 'AddAccountModal',

  propTypes: {},

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
    this.setState({
      errorMessage: IMAPStore.getCombinedErrorMessage()
    })
  },

  onAddAccount: function () {
    var username = this.refs.gmailUsername.getValue()
    var password = this.refs.gmailPassword.getValue()

    console.log('Adding Gmail account: %s %s', username, password)
    this.setState({inProgress: true})
    IMAPActions.addGmailAccount(username, password)
  },

  onCancel: function () {
    //TODO: fire cancel event
  },

  render: function () {
    var errorMessage = this.state.errorMessage
    var inProgress = this.state.inProgress
    var spinner = inProgress ? (<img src='./img/spinner.gif' />) : null

    return (
      <BS.Modal bsStyle='primary' title='Add Account' animation={false} onRequestHide={this.onCancel}>
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
          <BS.Button onClick={this.onCancel} disabled={inProgress}>Cancel</BS.Button>
        </div>
      </BS.Modal>
    )
  }
})
