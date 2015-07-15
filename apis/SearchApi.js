var IMAPApi = require('./IMAPApi')
var EventEmitter = require('events').EventEmitter
var objectAssign = require('object-assign')

/**
 * Lets you search and retrieve mail from local disk.
 */
module.exports = objectAssign({}, EventEmitter.prototype, {
  queryThreads: function (threadQuery) {
    var mailRepo = IMAPApi.getMailRepo(threadQuery.emailAddress)
    if (!mailRepo) {
      var errMsg = getErrorMessage(threadQuery.emailAddress)
      return emitQueryResult.call(this, threadQuery, errMsg, [])
    }
    mailRepo.searchThreads(threadQuery.queryString, emitQueryResult.bind(this, threadQuery))
  },

  loadThread: function (emailAddress, threadID) {
    var mailRepo = IMAPApi.getMailRepo(emailAddress)
    if (!mailRepo) {
      var errMsg = getErrorMessage(emailAddress)
      return emitThreadResult.call(this, emailAddress, threadID, errMsg, null)
    }

    mailRepo.getThread(threadID, emitThreadResult.bind(this, emailAddress, threadID))
  },

  loadCleanHTML: function (emailAddress, scrambleMailId) {
    // TODO: read from disk, use MailParser, then use CAJA to sanitize HTML
    // TODO: refactor to use a callback rather than returning directly
  }
})

EventEmitter.call(module.exports)

function getErrorMessage (emailAddress) {
  return 'Can\'t find email database for ' + emailAddress
}

function emitQueryResult (threadQuery, err, msgs) {
  this.emit('queryResult', JSON.stringify({
    threadQuery: threadQuery,
    error: err,
    threads: msgs // TODO: threads, not messages
  }))
}

function emitThreadResult (emailAddress, threadID, err, thread) {
  // `thread` contains scrambleThreadId and sanitizedMessages
  this.emit('thread', JSON.stringify({
    emailAddress: emailAddress,
    threadID: threadID,
    err: err,
    thread: thread
  }))
}
