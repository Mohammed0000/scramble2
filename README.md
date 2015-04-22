# Scramble 2

![screenshot](http://i.imgur.com/hG0OTSK.png)

This is my second attempt at making an encrypted email client.

The original, scramble.io, is still around. I still use it every day. It could be better, though. Here's what I've learned:
* People want to keep their existing email address. Many already have several, and don't want another that ends in `@scramble.io` 
* For a good experience with end-to-end encrypted email, you need a local install.
  A web app won't work well. Search needs to happen on the client, so you need to store and index on the order of gigabytes of text. 
  Finally, with an installed app, we have better options to ensure you're running an untampered copy of the program. Scramble 2 is a local install.
* Key exchange is hard. The notary system from the original `scramble.io`, while cool, is not as transparent or easy to understand as Keybase. So this time around, I'm integrating with Keybase. You'll be able to type 'mo' in the To box and it'll typeahead search and show you 'moot (Chris Poole)'. If it's your first time emailing him, Scramble will show you the public key fingerprint and links to the Keybase proofs so you can verify. (Those proofs are simply a Twitter post or FB post, etc, by moot, essentially saying "This fingerprint is my PGP public key: <...>".) After that, any correspondence will just be encrypted and signed automatically with no further effort.
  
 
## Quick start

The process to run from source in Atom-Shell is still a bit janky.

* Clone scramble2
* Install node and npm
* (If you're on Ubuntu, `sudo apt-get install libgnome-keyring-dev`)
* Install jsx, node-gyp, aspm, and apm: `sudo npm install -g react-tools node-gyp aspm atom-package-manager@0.130.0`
* Create an `atom-shell` directory next to the scramble2 directory
* Download and unzip [atom-shell 0.20.0](https://github.com/atom/atom-shell/releases/tag/v0.20.0) inside of `atom-shell`

From inside the scramble2 directory:
* Install node-sqlite3 `aspm install sqlite3 --tarball https://github.com/mapbox/node-sqlite3/archive/master.tar.gz --target 0.20.0 --arch x64`
  (Ignore the warnings.)
* Run `apm install`
* Run `npm install`
* Run `../atom-shell/atom .`


## The Code

* Uses [Javascript Standard Style](https://github.com/feross/standard)
* Uses Atom Shell. That means there are two separate JS processes: the main process and the client (aka "renderer") process. Check out the Atom Shell docs for an explanation of how this works.
* Uses React and the Flux pattern. One-directional data flow. Scramble2 uses a simplified variant of Flux: it has actions, stores, and views, but no dispatcher. It also differs from a typical web app in that actions do RPC calls to the main process rather than REST API requests to a server. Here's what that looks like:


        Internet       |  Main process   |  Renderer process
                       |                 | 
                       |                 |              stores
        Keybase      <---              <---         -->       | 
        IMAP           |       apis      |  actions           |
        ...          --->              --->         <--       V
                       |                 |              views 
                       |                 |


* All dependencies between files are managed by npm
* Building is done via `npm` and `apm`. Everything is defined in `package.json`. No gulps, grunts, or yeomen.
* Module expose their public interface *only*. No methods start with an underscore. Instead, private methods are kept local (not part of `module.exports`) and, if necessary, called via `bind` and `apply`. Check out `apis/IMAPAPI.js` to see how this works.
* All the heavy lifting happens in the main process. The renderer process doesn't do any cryptography or access the internet directly.

## Troubleshooting

##### aspm fails with `gyp_main.py: error: no such option: --no-parallel`

The Ubuntu repos have an obsolete version of `node-gyp` that overrides the one you installed with npm. Run `sudo apt-get purge gyp`, then the npm version should kick in.

##### Error opening app

    Error opening app
    The app provided is not a valid atom-shell app, please read the docs on how to write one:
    https://github.com/atom/atom-shell/tree/master/docs

This cryptic error message is atom-shell's way of saying that `require()` failed--in other words, one or more modules couldn't be loaded. For `scramble2`, you can get this error if you have the wrong binary version of `node-sqlite3` installed. Make sure you run that `aspm` command under Quick Start. If you're developing `scramble-mail-repo` locally, run the same command from that directory instead of the `scramble2` directory.
