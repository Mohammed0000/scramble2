var React = require('react')
var BS = require('react-bootstrap')

module.exports = React.createClass({
  displayName: 'ComposePanel',

  propTypes: {},

  render: function () {
    var styleTo = {}
    var styleDoc = {}
    var styleCompose = {}

    return (
      <div>
        <BS.Input type='text' style={styleTo} ref='to' />
        <div style={styleDoc}>
          Uses <a href="https://help.github.com/articles/github-flavored-markdown/">Markdown</a>.
          Drag and drop pictures to embed.
        </div>
        <BS.Input type='textarea' style={styleCompose} ref='body' />
        <BS.Button type='default' onClick={this.onSend}>Send</BS.Button>
      </div>
    )
  }
})
