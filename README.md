# Scramble 2

This is my second attempt at making an encrypted email client.

The original, scramble.io, is still around. I still use it every day. Not a lot of people are using it, though. Here's what I've learned:
* People want to keep their existing email address.
  Scramble
* For a good experience with end-to-end encrypted email, you need a local install.
  A web app won't cut it. Search needs to happen on the client, so you need to store and index on the order of gigabytes of emails, while web apps only get a few megabytes and even that disappears every time you clear your browser! 
  Scramble 2 is a local install.
  
 
## Running

The process to run from source in Atom-Shell is still a bit janky.

* Install node and npm
* Install node-gyp: `sudo npm install node-gyp -g`
* Download aspm
* Install node-sqlite3 `aspm install sqlite3 --tarball https://github.com/mapbox/node-sqlite3/archive/master.tar.gz --target 0.20.6 --arch x64`
* Run `npm install`
* Run `npm start`
* Download [atom-shell](https://github.com/atom/atom-shell) to the directory next to scramble2
* From the scramble2 directory, run `../atom-shell/atom .`


