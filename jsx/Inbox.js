var React = require("react");
var ScrambleUI = require("scramble-ui");
var Tabs = ScrambleUI.Tabs;
var SearchList = ScrambleUI.SearchList;

module.exports = React.createClass({
  displayName: "Inbox",

  propTypes: {
    accounts: React.PropTypes.array.isRequired,
    searchMessages: React.PropTypes.func.isRequired,
    loadMessageCleanHTML: React.PropTypes.func.isRequired
  },

  getInitialState: function(){
    return {
      selectedAccount: this.props.accounts[0] || null,
      messages: [],
      selectedMessageCleanHTML: null
    };
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

    var contentElem = this.selectedAccount === null ? renderWelcome() : renderInboxState();
    var keybaseUsername = "bob";

    return (
      <div>
        <Tabs tabs={["Inbox", "Outbox", "Contacts"]} /> 
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <p>Welcome, {keybaseUsername}!</p>
              <SearchList 
                data={this.state.messages} 
                elementFunc={this.renderMessage} 
                keyFunc={this.getMessageID} 
                onSelect={this.selectMessage}
                onSearch={this.searchMessages}/>
              <p>Add Account</p>
            </div>
            <div className="col-md-8">
              {contentElem}
            </div>
          </div>
        </div>
      </div>);
  },
  renderWelcome: function() {
    return (
      <div>
        <h1>Welcome to Scramble!</h1>
        <p>To get started, click Add Account.</p>
      </div>);
  },
  renderInboxState: function() {
    return (
      <div>
        <h1>Inbox Zero. Congrats!</h1>
        <p>TODO: check whether it is actually inbox zero. Display stats.</p>
      </div>);
  }
});

