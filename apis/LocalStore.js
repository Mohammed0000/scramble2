var mkdirp = require('mkdirp')
var path = require('path')
var fs = require('fs')
var sqlite3 = require('sqlite3')

var _appDir = initAppDir() // eg "/home/foo/.scramble/"
var _db = initDatabase(path.join(_appDir, 'scramble.sqlite3'))

/**
 * Responsible for metadata stored on local disk, like settings and IMAP account credentials.
 *
 * TODO: passphrase protection
 */
module.exports = {
  /**
   * Gets the local directory where Scramble will store data, including
   * downloaded mail and the search index.
   */
  getAppDir: function () {
    return _appDir
  },

  /**
   * Loads IMAP accounts. Takes a callback(err, accounts). The accounts are in the form
   * {type, emailAddress, username, password, host, port}
   * ...where type is either 'GMAIL' or 'IMAP'. See IMAPStore.
   */
  loadAccounts: function (cb) {
    _db.all('select * from IMAPAccount', function (err, rows) {
      if (err) {
        return cb(err)
      }

      console.log('loadAccounts finished ' + JSON.stringify(rows))
      cb(null, rows)
    })
  },

  /**
   * Adds a new IMAP account. See loadAccounts for the format.
   */
  saveAccount: function (account) {
    // TODO: call back with an error if the user tries to add a connection for an email addr that already exists
    _db.run('insert or ignore into IMAPAccount (emailAddress, type, username, password, host, port) ' +
      'values (?, ?, ?, ?, ?, ?)',
      account.emailAddress,
      account.type,
      account.username,
      account.password,
      account.host,
      account.port)
  }
}

/**
 * Creates the app dir if needed. See getAppDir()
 * Returns an absolute path, eg "/home/foo/.scramble"
 */
function initAppDir () {
  var mailDir
  if (process.env.APPDATA) {
    // Use C:\Users\<name>\AppData\Roaming\Scramble on Windows
    mailDir = path.join(process.env.APPDATA, 'Scramble')
  } else if (process.env.HOME) {
     // Use ~/.scramble on Linux and OSX
    mailDir = path.join(process.env.HOME, '.scramble')
  } else {
    throw new Error('Can\'t find home directory')
  }
  mkdirp.sync(mailDir)
  return mailDir
}

/**
 * Creates and migrates the SQLite3 settings DB.
 * Returns a node-sqlite3 DB handle.
 */
function initDatabase (dbFilename) {
  var db = new sqlite3.Database(dbFilename)

  // Create any new tables, or create all tables if DB was newly created
  var schemaFile = path.join(__dirname, '../schema.sql')
  var schemaSql = fs.readFileSync(schemaFile, {encoding: 'utf8'})

  // Don't run any other queries until the DB is initialized
  db.serialize(function () {
    db.exec(schemaSql, function (err) {
      if (err === null) {
        console.log('Created the settings sqlite DB successfully')
      } else {
        console.error('Error creating sqlite DB ' + dbFilename, err)
      }
    })
  })

  return db
}
