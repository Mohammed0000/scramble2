var Keybase = require("node-keybase");
var App = require("app");
var BrowserWindow = require("browser-window");
//TODO: difficult because MailRepo relies on native modules for sqlite3,
// and atom-shell runs a different version of V8 than standard Node: https://github.com/atom/atom-shell/issues/533
//var ScrambleMailRepo = require("scramble-mail-repo"); 

var mainWindow = null;

// Quit when all windows are closed, even on Darwin
App.on("window-all-closed", App.quit.bind(App));

// Wait for atom-shell to initialize
App.on("ready", function() {
  console.log(process.version);
  console.log(process);
  mainWindow = new BrowserWindow({"width":1000,"height":700});
  mainWindow.loadUrl("file://" + __dirname + "/build/index.html");
  mainWindow.openDevTools();

  demoMailRepo();
  demoKeybase();
});



// Demo: searchable mail repo
function demoMailRepo() {
  var mailRepo = new ScrambleMailRepo("~/scramble-test-dir");
  mailRepo.search("hello", function(err, msgs){
    //inbox.setState("messages", msgs);
    mailWindow.webContents.send("test", msgs);
  });
};

// Demo: Keybase
function demoKeybase() {
  var keybaseUser = process.argv[2];
  var keybasePassphrase = process.argv[3];
  if(!keybaseUser || !keybasePassphrase){
    console.log("To test Keybase: node <...> <keybase user> <keybase passphrase>");
  } else {
    var keybase = new Keybase(keybaseUser, keybasePassphrase);
    keybase.login(function(err, result){
      if(err){
        console.log("Keybase login error", err);
        return;
      }
      console.log("Keybase login: ", result.status.name);
    });
  }
}

