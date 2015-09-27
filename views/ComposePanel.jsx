var React = require('react')
var BS = require('react-bootstrap')
var AddressListChooser = require('./AddressListChooser')

module.exports = React.createClass({
  displayName: 'ComposePanel',

  propTypes: {},

  render: function () {
    var styleDoc = {}
    var styleCompose = {}

    return (
      <div>
        <h3>Compose</h3>

        <p>
          <AddressListChooser ref='to' />
        </p>

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
