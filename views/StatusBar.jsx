var React = require('react')
var IMAPStore = require('../stores/IMAPStore')
var objectAssign = require('object-assign')

// Component-specific styles applied as inline style & defined in JS.
// Rationale described here: https://speakerdeck.com/vjeux/react-css-in-js
// If needed, things like the colors could be turned into props.
var styles = {
  footer: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    height: 35,
    backgroundColor: '#f8f8f8',
    borderTop: '1px solid #e7e7e7'
  },
  label: {
    padding: '10px 15px',
    margin: 0,
    fontSize: '0.8em',
    color: '#666'
  },
  progressLine: {
    backgroundColor: '#337ab7',
    position: 'absolute',
    top: -1, // should be -(border width), see above
    left: 0,
    height: 3
  }
}

/**
 * Status bar shows IMAP sync state, # unread messages, and so on
 */
module.exports = React.createClass({

  displayName: 'StatusBar',

  propTypes: {},

  getInitialState: getIMAPSummary,

  componentDidMount: function () {
    IMAPStore.addListener('change', this.onIMAPStoreChange)
  },

  componentWillUnmount: function () {
    IMAPStore.removeListener('change', this.onIMAPStoreChange)
  },

  onIMAPStoreChange: function () {
    this.setState(getIMAPSummary())
  },

  render: function () {
    var numAccounts = this.state.numAccounts
    var totals = this.state.syncStateTotals
    var totalToSync = totals.numToDownload + totals.numToUpload
    var totalSynced = totals.numDownloaded + totals.numUploaded

    // Compute the status bar text and the progress percentage
    // (Progress is displayed as a thicker line over the top border of the footer)
    var contents
    var percent = 0
    if (numAccounts === 0) {
      contents = 'No accounts yet'
    } else if (totalSynced >= totalToSync) {
      contents = 'All synced :)'
    } else {
      percent = totalSynced / totalToSync * 100
      percent = Math.max(percent, 2)
      contents = totals.numUploaded < totals.numToUpload ?
        (totals.numUploaded + ' / ' + totals.numToUpload + ' sent') :
        (totals.numDownloaded + ' / ' + totals.numToDownload + ' downloaded' +
          ' (' + totals.numIndexed + ' indexed)')
    }

    var progressLineStyle = objectAssign({}, styles.progressLine, {width: (percent + '%')})

    return (
      <footer style={styles.footer}>
        <div className="progress-line" style={progressLineStyle} />
        <p style={styles.label}>{contents}</p>
      </footer>
    )
  }

})

/**
 * Returns {syncStateTotals: {numToDownload, numDownloaded, ..., errors}, numAccounts}
 */
function getIMAPSummary () {
  return {
    syncStateTotals: IMAPStore.getSyncStateTotals(),
    numAccounts: IMAPStore.getAccounts().length
  }
}
