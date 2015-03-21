var ipc = require('ipc')
var React = require('react')
var AppFrame = require('./AppFrame')

React.render(React.createComponent(AppFrame, null), document.body)

// TODO: remove
ipc.on('inbox', function (data) {
  console.log('Renderer received ' + data.length + ' messages')
})
