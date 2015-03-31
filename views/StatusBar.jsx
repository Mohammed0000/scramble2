var React = require('react')
var IMAPStore = require('../stores/IMAPStore')
var BS = require('react-bootstrap')

/**
 * Status bar shows IMAP sync state, # unread messages, and so on
 */
module.exports = React.createClass({

  displayName: 'StatusBar',

  propTypes: {},

  getInitialState: function () {
    return {
      syncStateTotals: IMAPStore.getSyncStateTotals(),
      numAccounts: IMAPStore.getAccounts().length
    }
  },

  componentDidMount: function () {
    IMAPStore.addListener('change', this.onIMAPStoreChange)
  },

  componentWillUnmount: function () {
    IMAPStore.removeListener('change', this.onIMAPStoreChange)
  },

  onIMAPStoreChange: function() {
    this.setState(this.getInitialState())
  },

  render: function() {
    var totals = this.state.syncStateTotals
    var totalToSync = totals.numToDownload + totals.numToUpload
    var totalSynced = totals.numDownloaded + totals.numUploaded

    var contents
    if (this.state.numAccounts === 0) {
      contents = 'No accounts yet'
    } else if (totalSynced >= totalToSync) {
      contents = 'All synced :)'
    } else {
      var percent = totalSynced / totalToSync * 100
      var text = totals.numDownloaded < totals.numToDownload ?
        (totals.numDownloaded + '/' + totals.numToDownload + ' downloaded') :
        (totals.numUploaded + '/' + totals.numToUpload + ' sent')
      contents = (<BS.ProgressBar now={percent} label={text} />)
    }

    return (
      <footer className="status-footer">
        <div className="container">
          {contents}
        </div>
      </footer>
    )
  }

})
