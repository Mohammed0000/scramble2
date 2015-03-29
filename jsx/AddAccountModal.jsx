var React = require('react')
var BS = require('react-bootstrap')

module.exports = React.createClass({
  displayName: 'AddAccountModal',
  propTypes: {
    onRequestHide: React.PropTypes.func
  },
  onAddAccount: function() {
    var username = this.refs.gmailUsername.value
    var password = this.refs.gmailPassword.value

    console.log("Adding user: %s %s", username, password)
  },
  render: function () {
    return (
      <BS.Modal {...this.props} bsStyle='primary' title='Add Account' animation={false}>
        <div className='modal-body'>
          <h4>Connect to an email account via IMAP</h4>
          <hr />

          <p>
            <BS.ButtonGroup>
              <BS.Button>Gmail</BS.Button>
              <BS.Button>Other IMAP</BS.Button>
            </BS.ButtonGroup>
          </p>

          <form className='form-horizontal'>
            <BS.Input type='text' ref='gmailUsername' label='Email address' labelClassName='col-sm-2' wrapperClassName='col-sm-10' />
            <BS.Input type='password' ref='gmailPassword' label='Password' labelClassName='col-sm-2' wrapperClassName='col-sm-10' />
            <small className='col-sm-10 col-sm-offset-2'>
              You credentials will only ever be sent to Google over HTTPS and are only used to sync messages. 
              Google won't be able to read your encrypted mail.
            </small>
            <BS.Button bsStyle='primary' onClick={this.onAddAccount}>Add Account</BS.Button>
          </form>
        </div>
        <div className='modal-footer'>
          <BS.Button onClick={this.props.onRequestHide}>Close</BS.Button>
        </div>
      </BS.Modal>
    )
  }
})
