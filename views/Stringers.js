var moment = require('moment')

/**
 * Shared code for converting dates, email addresses, etc to user-friendly text.
 */
module.exports = {

  /**
   * Displays a timestamp, relative to current time.
   * For example, if it's 8am on Jan 1 2015 UTC, then:
   * - getDisplayNameForTimestamp("2014-12-31T10:00:00Z") returns "Yesterday"
   * - getDisplayNameForTimestamp("2013-12-31T10:00:00Z") returns "Dec 31, 2013"
   */
  timestampToString: function (timestamp) {
    return moment(timestamp).fromNow()
  },

  /**
   * Returns a display name for an RFC standard name-address pair.
   * For example get...("Loco Dice <loco@scramble.io>") returns "Loco Dice"
   * Also get...("<noname@scramble.io>") return "noname"
   */
  addressToString: function (address) {
    var parts = address.split(/\s+/)
    var endsWithAddress = parts[parts.length - 1].startsWith('<')
    if (parts.length > 1 && endsWithAddress) {
      // use name
      var name = parts.slice(0, parts.length - 1).join(' ')
      if (name.startsWith('"') && name.endsWith('"')) {
        name = name.slice(1, name.length - 1)
      }
      return name
    } else if (endsWithAddress) {
      // use first part of email address, eg "hello" for "<hello@scramble.io>"
      return parts[parts.length - 1].slice(1).split('@')[0]
    } else {
      // unknown format, just use the whole string
      console.warn('Couldn\'t parse RFC name-address pair "' + address + '"')
      return address
    }
  }
}
