var ipc = require("ipc");
var remote = require("remote");
var path = require("path");
var React = require("react");
var Login = require("./Login");
var Inbox = require("./Inbox");

// Remoted APIs
var ScrambleMailRepo = remote.require("scramble-mail-repo");
var mailRepo = new ScrambleMailRepo(path.join(process.env.HOME, "scramble-test-dir"));

var inbox = (<Inbox searchMessages={searchMessages} loadMessageCleanHTML={loadCleanHTML}/>);
React.render(inbox, document.body);

// TODO: remove
ipc.on('inbox', function(data) {
  console.log("Renderer received "+data.length+" messages");
});

var messages = [];
function searchMessages(query, cb){
  mailRepo.search(query, function(err, msgs){
    messages = msgs;
    cb(err, msgs);
  });
}

function loadCleanHTML(scrambleMailId){
  // TODO: read from disk, use MailParser, than use CAJA to sanitize HTML
  // TODO: refactor to use a callback rather than returning directly
  for(var i = 0; i < messages.length; i++){
    var message = messages[i];
    if(message.scrambleMailId === scrambleMailId){
      return "<pre> "+message.snippet+ " </pre>";
    }
  }
  return "<div class='text-error'>Not found</div>";
}

