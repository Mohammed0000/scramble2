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

