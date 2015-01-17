var Keybase = require("node-keybase");
var App = require("app");
var BrowserWindow = require("browser-window");

var mainWindow = null;

// Quit when all windows are closed, even on Darwin
App.on("window-all-closed", App.quit.bind(App));

// Wait for atom-shell to initialize
App.on("ready", function() {
  mainWindow = new BrowserWindow({"width":1000,"height":700});
  mainWindow.loadUrl("file://" + __dirname + "/build/index.html");
  mainWindow.openDevTools();
});

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

