/**
 * Stores Keybase login state, account creation state, and account info.
 */

var EventEmitter = require('events').EventEmitter
var objectAssign = require('object-assign')

var loginState = {
  wrongUsername: false,
  wrongPassphrase: false,
  error: null
}

var keybaseSession = null

module.exports = objectAssign({}, EventEmitter.prototype, {
  emitChange: function () {
    this.emit('change')
  },

  /**
   * Returns the login state, in the form {loggedInAs, wrongUsername, wrongPassword, error}
   * where the first two are boolean and `error` is a clean error message.
   *
   * If getKeybaseAccount() is not null, then the login was successful.
   */
  getLoginState: function () {
    return loginState
  },

  /**
   *  Here's an excerpt of the interesting things in the Keybase login result:
   *
   * .me - a Keybase user object https://keybase.io/docs/api/1.0/user_objects
   * .me.id
   * .me.basics.username
   * .me.profile.full_name
   * .me.emails.primary.email
   * .me.public_keys.primary.kid
   * .me.public_keys.primary.key_fingerprint
   * .me.public_keys.primary.bundle
   * .me.private_keys.primary
   * .me.invitation_stats.available
   *
   * .session
   * .csrf_token
   * .guest_id
   */
  getKeybaseSession: function () {
    return keybaseSession
  },

  setSuccessfulLogin: function (keybaseLoginResult) {
    loginState = {
      wrongUsername: false,
      wrongPassphrase: false,
      error: null
    }
    keybaseSession = keybaseLoginResult
    this.emitChange()
  },

  setWrongUsername: function () {
    loginState = {
      wrongUsername: true,
      wrongPassphrase: false,
      error: 'User not found'
    }
    this.emitChange()
  },

  setWrongPassphrase: function () {
    loginState = {
      wrongUsername: false,
      wrongPassphrase: true,
      error: 'Wrong passphrase, try again'
    }
    this.emitChange()
  },

  setOtherLoginError: function (message) {
    loginState = {
      wrongUsername: false,
      wrongPassphrase: false,
      error: message
    }
    this.emitChange()
  }
})

EventEmitter.call(module.exports)
