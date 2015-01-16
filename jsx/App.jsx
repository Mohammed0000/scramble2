var React = require("react");
var Login = require("./Login.jsx");
var Inbox = require("./Inbox.jsx");
var ScrambleMailRepo = require("scramble-mail-repo");

var inbox = (<Inbox />);
var mailRepo = new ScrambleMailRepo("~/scramble-test-dir");
mailRepo.search("hello", function(err, msgs){
  inbox.setState("messages", msgs);
});
React.render(inbox, document.body);

