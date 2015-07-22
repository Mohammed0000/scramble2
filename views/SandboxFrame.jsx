var React = require('react')

// Renders HTML to a sandboxed iframe
// Adjusts the <iframe> height to match the content inside
// This turns out to be hard.
//
// See https://developer.zendesk.com/blog/2014/05/13/rendering-to-iframes-in-react/
// See also https://github.com/facebook/react/issues/1718
module.exports = React.createClass({
  displayName: 'SandboxFrame',

  propTypes: {
    sanitizedHtml: React.PropTypes.string.isRequired
    // any additional props are passed thru to the <iframe>
  },

  render: function () {
    return (<iframe
        srcDoc={this.props.sanitizedHtml}
        {...this.props} />)
  },

  componentDidMount: function () {
    this.renderFrameContents()
  },

  renderFrameContents: function () {
    var iframe = this.getDOMNode()
    var tick = iframe.tick || 0

    if (iframe.contentDocument.readyState === 'complete') {
      var newHeight = iframe.contentDocument.body.scrollHeight
      iframe.height = newHeight + 'px'
      iframe.tick = tick + 1
    }
    // This hack is necessary due to a bug in Chromium, where the readyState
    // is initially 'complete' on an iframe with srcdoc instead of src
    // Only later does it change to incomplete, then to complete again
    if (tick < 5) {
      setTimeout(this.renderFrameContents, 0)
    }
  },

  componentDidUpdate: function () {
    this.renderFrameContents()
  }
})
