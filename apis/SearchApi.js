var IMAPApi = require('./IMAPApi')
var EventEmitter = require('events').EventEmitter
var objectAssign = require('object-assign')

/**
 * Lets you search and retrieve mail from local disk.
 */
module.exports = objectAssign({}, EventEmitter.prototype, {
  queryThreads: function (threadQuery) {
    var mailRepo = IMAPApi.getMailRepo(threadQuery.emailAddress)
    if (mailRepo === null) {
      var error = "Can't find email database for " + threadQuery.emailAddress
      emitQueryResult.apply(this, threadQuery, error, [])
    } else {
      mailRepo.search(query, emitQueryResult.bind(this, threadQuery))
    }
  },

  loadCleanHTML: function (emailAddress, scrambleMailId) {
    // TODO: read from disk, use MailParser, then use CAJA to sanitize HTML
    // TODO: refactor to use a callback rather than returning directly
  }
})

EventEmitter.call(module.exports)

function emitQueryResult(threadQuery, err, msgs) {
  this.emit('queryResult', JSON.stringify({
    threadQuery: threadQuery,
    error: err,
    threads: msgs // TODO: threads, not messages
  }))
}
