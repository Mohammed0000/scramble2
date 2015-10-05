/**
 * Stores contacts, contact search results, and keybase search results.
 */

var EventEmitter = require('events').EventEmitter
var objectAssign = require('object-assign')

module.exports = objectAssign([], EventEmitter.prototype, {
  getContactQuery: function () {
    return _contactQuery
  },

  getContactResults: function () {
  }
})
