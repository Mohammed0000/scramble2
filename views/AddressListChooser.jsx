var React = require('react')
var BS = require('react-bootstrap')

/**
 * Gives you typeahead search for email addresses.
 * You can enter multiple addresses. As soon as they're entered, they turn into pellets.
 * Each pellet shows whether that recipient has a key or not.
 *
 * This component has it's own state.
 * The component gives you the currently entered address list. You supply a callback for search.
 */
module.exports = React.createClass({
  displayName: 'AddressListChooser',

  getInitialState: function () {
    return {
      items: [{'name': 'Swag', 'address': 'swag@swag.com'}],
      typeahead: ''
    }
  },

  onTypeahead: function (e) {
    var text = e.target.value
    var trimmedText = text.trim()
    if (text !== trimmedText) {
      // space or tab inserted, add the text before as a new email address
      var newAddress = {'address': trimmedText}
      this.setState({
        items: this.state.items.concat([newAddress]),
        typeahead: ""
      })
    } else {
      // TODO: use a search callback, show typeahead results dropdown
      this.setState({typeahead: trimmedText})
    }
  },

  onTypeaheadKey: function (e) {
    // on backspace, delete the last email address in the list
    if (this.state.typeahead === '' && e.keyCode === 8) {
      this.setState({items: this.state.items.slice(0, -1)})
    }
  },

  render: function () {
    var styleContainer = {
      width: '100%',
    }
    var styleTypeahead = {
      border: 'none',
      outline: 'none',
      resize: 'none'
    }
    var styleAddress = {
      display: 'inline-block',
      border: '1px solid #aaa',
      borderRadius: '3px',
      padding: '2px 5px',
      marginRight: '5px',
      verticalAlign: 'top'
    }

    var itemElems = this.state.items.map(function (item, index) {
      var text = item.name || item.address
      var deleteButtonElem = (<BS.Button bsSize='xsmall' className='close'><span>&nbsp;&times;</span></BS.Button>)
      return (<span style={styleAddress} key={index}>{text} {deleteButtonElem}</span>)
    })
    return (
      <div style={styleContainer}>
         {itemElems}
         <span>
           <textarea
             key='typeahead'
             ref='typeahead'
             style={styleTypeahead}
             rows='1'
             spellCheck='false'
             autoComplete='false'
             value={this.state.typeahead}
             onChange={this.onTypeahead} 
             onKeyDown={this.onTypeaheadKey} />
        </span>
      </div>
    )
  }
})
