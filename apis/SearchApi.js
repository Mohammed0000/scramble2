var IMAPApi = require('.IMAPApi')

/**
 * Lets you search and retrieve mail from local disk.
 */
module.exports = {
  searchMessages: function (emailAddress, query, cb) {
    var mailRepo = IMAPApi.getMailRepo(emailAddress)
    mailRepo.search(query, function (err, msgs) {
      // TODO
      cb(err, msgs)
    })
  },

  loadCleanHTML: function (emailAddress, scrambleMailId) {
    // TODO: read from disk, use MailParser, then use CAJA to sanitize HTML
    // TODO: refactor to use a callback rather than returning directly
  }
}
