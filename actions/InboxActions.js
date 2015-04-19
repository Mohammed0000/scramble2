var remote = require('remote') 
var InboxStore = require('../stores/InboxStore')
var remoteInboxAPI = require('./apis/IMAPApi')

module.exports = {
  queryThreads: function (query, page) {
    InboxStore.setQuery(query, page)
    remoteInboxAPI.queryThreads(query, page)
  }
}

remoteInboxAPI.on('queryResult', function (queryResultJson) {
  var queryResult = JSON.parse(queryResultJson)
  InboxStore.setQueryResults(queryResult.query, queryResults.page, threads)
})

