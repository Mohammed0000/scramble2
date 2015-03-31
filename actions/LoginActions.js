var Keybase = require('node-keybase')
var KeybaseStore = require('../stores/KeybaseStore')

var keybase = new Keybase()

/**
 * All actions related to logging in with Keybase or creating a Keybase account.
 */
module.exports = {

  login: function(username, passphrase) {
    // TODO: remove, just here to test without internet
    return KeybaseStore.setSuccessfulLogin({me:{id:username}})
    keybase.login(username, passphrase, function (err, result) {
      if (err) {
        console.error(err)
        var isUnknown = /^error: an error occured/.test(('' + err).toLowerCase())
        var msg = isUnknown ? 'Unknown error' : "Can't connect to Keybase. Are you offline?"
        KeybaseStore.setOtherLoginError(msg)
      } else if (result.status.name === 'OK') {
        // Successfully logged in
        KeybaseStore.setSuccessfulLogin(result)
      } else if (result.status.name === 'BAD_LOGIN_USER_NOT_FOUND') {
        KeybaseStore.setWrongUsername()
      } else if (result.status.name === 'BAD_LOGIN_PASSWORD') {
        KeybaseStore.setWrongPassphrase()
      } else {
        KeybaseStore.setOtherLoginError('Error: ' + result.state.name)
      }
    })
  }

}
