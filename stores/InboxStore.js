/**
 * Stores the current search query, the currently displayed thread,
 * and the decrypted, HTML-sanitized (SanitizedMessage) objects in that in thread.
 *
 * TODO: assumes inbox. Parameterize by box so we can handle Outbox, Sent, etc
 */

var EventEmitter = require('events').EventEmitter
var objectAssign = require('object-assign')
var deepEquals = require('deep-equal')

var _threadQuery = null
var _threads = []
var _selectedThreadID = null
var _threadResult = null
var _queryError = null

module.exports = objectAssign({}, EventEmitter.prototype, {
  getThreadQuery: function () {
    return _threadQuery
  },

  getThreads: function () {
    return _threads
  },

  getSelectedThreadID: function () {
    return _selectedThreadID
  },

  getQueryError: function () {
    return _queryError
  },

  getThreadResult: function () {
    return _threadResult
  },

  setThreadQuery: function (threadQuery) {
    if (deepEquals(threadQuery, _threadQuery)) {
      return
    }
    _threadQuery = threadQuery
    _threads = []
    emitChange.apply(this)
  },

  setSelectedThreadID: function (threadID) {
    if (_selectedThreadID === threadID) {
      return
    }
    _selectedThreadID = threadID
    emitChange.apply(this)
  },

  /**
   * Expects a result in the form {threadQuery, error, threads}
   */
  setQueryResult: function (queryResult) {
    // Ignore results that come in late for what is no
    // longer the current query and page
    if (!deepEquals(queryResult.threadQuery, _threadQuery)) {
      return
    }
    _queryError = queryResult.error
    _threads = queryResult.threads
    emitChange.apply(this)
  },

  /**
   * Expects a result in the form {threadID, messages}
   */
  setThreadResult: function (threadResult) {
    _threadResult = threadResult
    emitChange.apply(this)
  }
})

function emitChange () {
  this.emit('change')
}
