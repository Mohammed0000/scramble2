var React = require('react')
var BS = require('react-bootstrap')

module.exports = React.createClass({
  displayName: 'ComposePanel',

  render: function () {
    var styleTo = {}
    var styleDoc = {}
    var styleCompose = {}

    return (<div>
      <BS.Input style={styleTo}>
      <div style={styleDoc}>
        Uses <a href="https://help.github.com/articles/github-flavored-markdown/">Markdown</a>.
        Drag and drop pictures to embed.
      </div>
      <BS.TextArea style={styleCompose}>
      <BS.Button onClick={this.onSend}>Send</BS.Button>
    </div>)
  }
})
