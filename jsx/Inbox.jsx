var React = require("react");
var ScrambleUI = require("scramble-ui");
var Tabs = ScrambleUI.Tabs;
var SearchList = ScrambleUI.SearchList;

module.exports = React.createClass({
  getInitialState: function(){
    return {messages:[], selectedMessage:null};
  },
  render: function() {
    var msgs = this.state.messages;
    var selectedMsg = this.state.selectedMessage;

    return (
    <div>
      <Tabs tabs={["Inbox", "Outbox", "Contacts"]} /> 
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <SearchList searchFunc={this.searchMessages} elementFunc={this.messageToElem} onSelect={this.onSelect} />
          </div>
          <div className="col-md-8">
            <pre>
              {JSON.stringify(selectedMsg)}
            </pre>
          </div>
        </div>
      </div>
    </div>);
  }
});
