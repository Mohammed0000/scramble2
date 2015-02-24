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
* Install node-gyp and aspm: `sudo npm install node-gyp aspm -g`
* Install node-sqlite3 `aspm install sqlite3 --tarball https://github.com/mapbox/node-sqlite3/archive/master.tar.gz --target 0.20.6 --arch x64`
  (Ignore the warnings.)
* Run `npm install`
* Create an `atom-shell` directory next to the scramble2 directory
* Download and unzip [atom-shell 0.20.6](https://github.com/atom/atom-shell/releases/tag/v0.20.6) into `atom-shell`
* From the scramble2 directory, run `../atom-shell/atom .`


