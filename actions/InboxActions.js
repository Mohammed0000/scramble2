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
  }
}

remoteSearchAPI.on('queryResult', function (queryResultJson) {
  var queryResult = JSON.parse(queryResultJson)
  InboxStore.setQueryResult(queryResult)
})

