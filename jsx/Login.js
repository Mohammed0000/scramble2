var React = require("react");
var BS = require("react-bootstrap");
var Keybase = require("node-keybase");

module.exports = React.createClass({
  displayName: "Login",

  propTypes: {
    onLogin: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      wrongUsername:false,
      wrongPassphrase:false,
      error:""
    };
  },

  handleSignIn: function() {
    var username = this.refs.username.getValue().trim();
    var passphrase = this.refs.passphrase.getValue();
    if(!username || !passphrase){
      return;
    }

    var keybase = new Keybase();
    keybase.login(username, passphrase, function(err, result) {
      if(err) {
        console.error(err);
        var isUnknown = /^error: an error occured/.test((""+err).toLowerCase());
        var msg = isUnknown ? "Unknown error" : "Can't connect to Keybase. Are you offline?";
        this.setState({
          wrongUsername: false,
          wrongPassphrase: false,
          error: msg
        });
      } else if(result.status.name === 'OK') {
        // Successfully logged in
        this.props.onLogin(result);
      } else if (result.status.name === 'BAD_LOGIN_USER_NOT_FOUND') {
        this.setState({
          wrongUsername: true,
          wrongPassphrase: false,
          error: "User not found"
        });
        this.refs.username.getDOMNode().children[0].focus();
      } else if (result.status.name === 'BAD_LOGIN_PASSWORD') {
        this.setState({
          wrongUsername: false,
          wrongPassphrase: true,
          error: "Wrong passphrase, try again"
        });
        this.refs.passphrase.getDOMNode().children[0].focus();
      } else {
        this.setState({
          wrongUsername: false,
          wrongPassphrase: false,
          error: "Error: "+result.state.name
        });
      }
    }.bind(this));
  },
  handleCreateAccount: function(){
    //TODO: show Keybase signup modal
  },
  render: function() {
    return (
    <div className="container">
      <div className="row">
        <div className="form-signin center-block text-center">
          <img src="./img/black_rubik.svg" className="logo-img" />
          <h1 className="text-center">Scramble</h1>
          <h3 className="text-center">Login with Keybase</h3>
          <hr className="invis" />
          <BS.Input 
            type="text" 
            placeholder="Username" 
            required="" 
            autofocus="" 
            bsStyle={this.state.wrongUsername ? 'error' : null}
            ref="username" />
          <br />
          <BS.Input 
            type="password"
            placeholder="Passphrase"
            required=""
            bsStyle={this.state.wrongPassphrase ? 'error' : null}
            ref="passphrase" />
          <br />
          <button className="btn btn-lg btn-default btn-block" type="submit" onClick={this.handleSignIn}>Sign in</button>
          <br />
          <div className="text-danger">{this.state.error}</div>
          <div className="strike"><hr/><span>or</span></div>
          <button className="btn btn-lg btn-primary btn-block" type="submit" onClick={this.handleCreateAccount}>Create Account</button>
          <small>
            <hr className="invis"/>
            <p>
              <a href="http://dcposch.github.com/scramble">How it works</a>
            </p>
            <p>
              Questions? Feedback? Just testing a new account?<br/>
              Send us a note! To: hello@scramble.io 
            </p>  
          </small>
        </div>
      </div>
    </div>
    );
  }
});
