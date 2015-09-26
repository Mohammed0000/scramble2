var React = require('react')
var BS = require('react-bootstrap')
var SandboxFrame = require('./SandboxFrame')
var Stringers = require('./Stringers')

/**
 * Renders a single email thread.
 *
 * Lets the user expand and collapse messages, reply to the thread,
 * or reply to an individual message. When that happens, it embeds ComposeReply.
 *
 * To render HTML, it embeds SandboxFrame.
 */
module.exports = React.createClass({
  displayName: 'Thread',

  propTypes: {
    thread: React.PropTypes.object
  },

  render: function () {
    var thread = this.props.thread
    var sanitizedMessage = thread.sanitizedMessages[0]
    var subject = sanitizedMessage.subject
    var messageElems = thread.sanitizedMessages.map(function (message) {
      if (message.from.length !== 1) {
        console.warn('Expected message.from to be an array of one element, found ' +
          JSON.stringify(message.from))
      }
      var fromElem = this.renderNameAddress(message.from[0])
      var recipients = [].concat(message.to, message.cc || [], message.bcc || [])
      var toElems = recipients.map(this.renderNameAddress)
      var toListElems = new Array(toElems.length * 2 - 1)
      for (var i = 0; i < toElems.length; i++) {
        toListElems[i * 2] = toElems[i]
        if (i === toElems.length - 2) {
          toListElems[i * 2 + 1] = (<span key={'to-delimiter-' + i}> and </span>)
        } else if (i < toElems.length - 2) {
          toListElems[i * 2 + 1] = (<span key={'to-delimiter-' + i}>, </span>)
        }
      }
      var dateString = Stringers.timestampToString(message.timestamp)

      // You can't use external CSS to style an iframe, and as an added layer of
      // security on top of CAJA I want to sandbox the email body in an <iframe>
      // So: here's a hack to set the font inline
      var sanitizedFrameHtml = ('<html>' +
        '<head><style>body{font-family:sans-serif; color:#333; margin: 30px 0}</style></head>' +
        '<body>' + message.sanitizedHtmlBody)

      // TODO: standardize on either external or JS styles
      // If JS, find a good way to encapsulate
      var styleFlex = {
        display: 'flex',
        flexFlow: 'row nowrap'
      }
      var styleDate = {
        fontSize: '0.9em'
      }
      var styleButtons = {
        fontSize: '0.9em',
        marginLeft: 'auto'
      }

      return (
        <div key={message.scrambleMailId} className='message'>
          <div style={styleFlex}>
            <span style={styleDate}>{dateString}</span>
            <span style={styleButtons}>
              <BS.ButtonGroup>
                <BS.Button onClick={this.onReply}>Reply</BS.Button>
              </BS.ButtonGroup>
            </span>
          </div>
          <div className='message-from-to'>from {fromElem}</div>
          <div className='message-from-to'>to {toListElems}</div>
          <SandboxFrame className='message-body' sanitizedHtml={sanitizedFrameHtml} />
        </div>)
    }.bind(this))

    return (
      <div className='thread'>
        <h1 key="header" className='thread-subject'>{subject}</h1>
        {messageElems}
      </div>)
  },

  renderNameAddress: function (nameAddress, i) {
    return (<BS.Label key={'to-' + i}>{nameAddress.name || nameAddress.address}</BS.Label>)
  }
})
