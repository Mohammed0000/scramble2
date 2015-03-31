var ipc = require('ipc')
var React = require('react')
var AppFrame = require('./views/AppFrame')
try {
  require('atom-watcher')()
} catch (e) {
  // Watcher in development only, not in the release
}

React.render(React.createElement(AppFrame, null), document.body)

// TODO: remove
ipc.on('inbox', function (data) {
  console.log('Renderer received ' + data.length + ' messages')
})
