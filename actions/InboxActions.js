var remote = require('remote') 
var InboxStore = require('../stores/InboxStore')
var remoteSearchAPI = remote.require('./apis/SearchApi')

module.exports = {
  queryThreads: function (emailAddress, queryString, page) {
    console.log('InboxActions.queryThreads')
    var threadQuery = {
      emailAddress: emailAddress,
      queryString: queryString,
      page: page
    }
    InboxStore.setThreadQuery(threadQuery)
    remoteSearchAPI.queryThreads(threadQuery)
  },

  selectThread: function (emailAddress, threadID) {
    InboxStore.setSelectedThreadID(threadID)
    remoteSearchAPI.loadThread(emailAddress, threadID)
  }
}

remoteSearchAPI.on('queryResult', function (queryResultJson) {
  var queryResult = JSON.parse(queryResultJson)
  InboxStore.setQueryResult(queryResult)
})

remoteSearchAPI.on('thread', function (threadResultJson) {
  var threadResult = JSON.parse(threadResultJson)
  InboxStore.setThreadResult(threadResult)
})

