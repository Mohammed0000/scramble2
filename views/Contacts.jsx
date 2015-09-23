var React = require('react')
var SearchList = require('./SearchList')

module.exports = React.createClass({
  displayName: 'Contacts',

  propTypes: {
    contactsResult: React.PropTypes.object.isRequired,
    selectedContactID: React.PropTypes.string,
    selectedContact: React.PropTypes.object
  },

  renderContact: function (contact) {
    var styleFlex = {
      display: 'flex',
      flexFlow: 'row nowrap'
    }
    var styleAddress = {
      fontFamily: 'monospace'
    }
    var styleName = {
      fontSize: '0.9em'
    }
    var styleLockIcon = {
      marginLeft: 'auto'
    }

    var lockIcon = null
    if (contact.keys.length > 0) {
      lockIcon = (<span className="glyphicon glyphicon-lock" style={styleLockIcon}></span>)
    }
    return (
      <div>
        <div style={styleFlex}>
          <span style={styleAddress}>{contact.emailAddress}</span>
          {lockIcon}
        </div>
        <div style={styleName}>{contact.name}</div>
      </div>
    )
  },

  selectContact: function (contactID) {
    console.log('Unimplemented')
    // ContactActions.selectContact(contactID)
  },

  searchContacts: function () {
    console.log('Unimplemented')
  },

  getContactID: function (contact) {
    return contact.id
  },

  render: function () {
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-md-4'>
            <SearchList
              data={this.props.contactsResult}
              elementFunc={this.renderContact}
              keyFunc={this.getContactID}
              onSelect={this.selectContact}
              onSearch={this.searchContacts}/>
          </div>
          <div className='col-md-8'>
            Here's every address you've ever sent an email to or received one from.

            Select one for details.
          </div>
        </div>
      </div>
    )
  }
})
