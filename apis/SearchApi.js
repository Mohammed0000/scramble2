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
      return emitQueryResult.call(this, threadQuery, getErrorMessage(threadQuery.emailAddress), [])
    }
    mailRepo.search(threadQuery.queryString, emitQueryResult.bind(this, threadQuery))
  },

  loadThread: function (emailAddress, threadID) {
    var mailRepo = IMAPApi.getMailRepo(emailAddress)
    if (!mailRepo) {
      return emitThreadResult.call(this, emailAddress, threadID, getErrorMessage(emailAddress), null)
    }

    //TODO: threads, not messages
    //mailRepo.getThread(threadID, emitThreadResult.bind(this, emailAddress, threadID))
    mailRepo.getMessage(threadID, emitThreadResult.bind(this, emailAddress, threadID))
  },

  loadCleanHTML: function (emailAddress, scrambleMailId) {
    // TODO: read from disk, use MailParser, then use CAJA to sanitize HTML
    // TODO: refactor to use a callback rather than returning directly
  }
})

EventEmitter.call(module.exports)

function getErrorMessage(emailAddress) {
  return 'Can\'t find email database for ' + emailAddress
}

function emitQueryResult(threadQuery, err, msgs) {
  this.emit('queryResult', JSON.stringify({
    threadQuery: threadQuery,
    error: err,
    threads: msgs // TODO: threads, not messages
  }))
}

// TODO: take a thread, not a message
function emitThreadResult(emailAddress, threadID, err, message) {
  var thread = {
    messages: [message] 
  }

  this.emit('thread', JSON.stringify({
    emailAddress: emailAddress,
    threadID: threadID,
    err: err,
    thread: thread
  }))
}

