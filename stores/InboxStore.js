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
var _selectedThread = null

module.exports = objectAssign({}, EventEmitter.prototype, {
  getThreadQuery: function () {
    return _query
  },

  getThreads: function () {
    return _threads
  },

  getSelectedThread: function () {
    return _selectedThread
  },

  setThreadQuery: function (threadQuery) {
    _threadQuery = threadQuery
    _threads = []
    emitChange.apply(this)
  }

  setQueryResults: function (threadQuery, threads) {
    // Ignore results that come in late for what is no
    // longer the current query and page
    if (deepEquals(threadQuery, _threadQuery)) {
      _threads = threads
      emitChange.apply(this)
    }
  }

  setSelectedThread: function (thread) {
    _selectedThread = thread
    emitChange.apply(this)
  }
})

function emitChange() {
  this.emit('change')
}
