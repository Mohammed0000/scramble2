var React = require('react')
var ComposePanel = require('./ComposePanel')

module.exports = React.createClass({

  displayName: 'Outbox',

  propTypes: {},

  render: function () {
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-md-12'>
            <h1>Outbox</h1>
          </div>
        </div> 
        <div className='row'>
          <div className='col-md-12'>
            <ComposePanel />
          </div>
        </div>
      </div>
    )
  }
})
