var React = require('react')
var ComposePanel = require('./ComposePanel')

module.exports = React.createClass({

  displayName: 'Outbox',

  propTypes: {},

  render: function () {
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-md-4'>
            <ul className='list-group'>
              <li className='list-group-item'><em>Draft</em></li>
              <li className='list-group-item'>Encrypted Message</li>
              <li className='list-group-item'>Encrypted Message</li>
              <li className='list-group-item'>Encrypted Message</li>
              <li className='list-group-item'>Encrypted Message</li>
            </ul>
          </div>
          <div className='col-md-8'>
            <ComposePanel />
          </div>
        </div>
      </div>
    )
  }
})
