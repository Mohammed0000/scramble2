# Scramble 2

This is my second attempt at making an encrypted email client.

The original, scramble.io, is still around. I still use it every day. Not a lot of people are using it, though. Here's what I've learned:
* People want to keep their existing email address. Many already have several, and don't want another that ends in `@scramble.io` 
* For a good experience with end-to-end encrypted email, you need a local install.
  A web app won't cut it. Search needs to happen on the client, so you need to store and index on the order of gigabytes of emails, while web apps only get a few megabytes and even that disappears every time you clear your browser! 
  Scramble 2 is a local install.
* Key exchange is hard. The notary system from the original `scramble.io`, while cool, is not as transparent or easy to understand as Keybase. So this time around, I'm integrating with Keybase. You'll be able to type 'mo' in the To box and it'll typeahead search and show you 'moot (Chris Poole)'. If it's your first time emailing him, Scramble will show you the public key fingerprint and links to the Keybase proofs so you can verify. (Those proofs are simply a Twitter post or FB post, etc, by moot, essentially saying "This fingerprint is my PGP public key: <...>".) After that, any correspondence will just be encrypted and signed automatically with no further effort.
  
 
## Running

The process to run from source in Atom-Shell is still a bit janky.

* Install node and npm
* (If you're on Ubuntu, `sudo apt-get install libgnome-keyring-dev`)
* Install node-gyp, aspm, and apm: `sudo npm install -g node-gyp aspm atom-package-manager@0.130.0`
* Install node-sqlite3 `aspm install sqlite3 --tarball https://github.com/mapbox/node-sqlite3/archive/master.tar.gz --target 0.20.0 --arch x64`
  (Ignore the warnings.)
* Run `apm install`
* Create an `atom-shell` directory next to the scramble2 directory
* Download and unzip [atom-shell 0.20.0](https://github.com/atom/atom-shell/releases/tag/v0.20.0) into `atom-shell`
* From the scramble2 directory, run `../atom-shell/atom .`


