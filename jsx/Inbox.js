var React = require("react");
var ScrambleUI = require("scramble-ui");
var Tabs = ScrambleUI.Tabs;
var SearchList = ScrambleUI.SearchList;

module.exports = React.createClass({
  displayName: "Inbox",

  propTypes: {
    searchMessages: React.PropTypes.func.isRequired,
    loadMessageCleanHTML: React.PropTypes.func.isRequired
  },

  getInitialState: function(){
    return {messages:[],selectedMessageCleanHTML:null};
  },

  searchMessages: function(query) {
    var self = this;
    this.props.searchMessages(query, function(err, msgs){
      if(err){
        console.error("Could not load messages", err);
      }
      self.setState({
        messages: msgs
      });
    });
  },
  selectMessage: function(scrambleMailId) {
    this.setState({
      selectedMessageCleanHTML: this.props.loadMessageCleanHTML(scrambleMailId)
    });
  },
  getMessageID: function(message) {
    return message.scrambleMailId;
  },
  renderMessage: function(message) {
    return (<div>{message.subject}</div>);
  },
  render: function() {
    var msgs = this.state.messages;
    var cleanHTML = this.state.selectedMessageCleanHTML;

    return (
      <div>
        <Tabs tabs={["Inbox", "Outbox", "Contacts"]} /> 
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <SearchList 
                data={this.state.messages} 
                elementFunc={this.renderMessage} 
                keyFunc={this.getMessageID} 
                onSelect={this.selectMessage}
                onSearch={this.searchMessages}/>
            </div>
            <div className="col-md-8">
              <div 
                className="mail-body" 
                dangerouslySetInnerHTML={{__html: cleanHTML}}>
              </div>
            </div>
          </div>
        </div>
      </div>);
  }
});

