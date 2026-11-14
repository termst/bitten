# Bitten

You are an apple. You shoot seeds at snakes. Single file roguelike turned into a small static website.

## Layout

```
index.html            markup and CSS, loads the scripts
bitten.js             the game, built from src/ (do not edit)
net.js                online coop (PeerJS transport, snapshots)
vendor/peerjs.min.js  PeerJS, pinned and vendored
assets/wals.mp3       the De Wals track, fetched on first use
fonts/                Barlow Condensed and Grenze Gotisch, woff2, SIL OFL 1.1
icons/                app icons 192 and 512
manifest.webmanifest  install as an app
sw.js                 service worker: code network first, fonts and audio cache first, build id from build.mjs
src/                  the game source, one file per feature, in load order
build.mjs             concatenates src/ into bitten.js
tools/                one-time tools used to make this layout from v13.7
test/                 Playwright checks (not needed to play)
ref/                  Bitten_v13.7.html, the single file original, for regression tests (not needed to play)
```

## Build

```
node build.mjs           # writes bitten.js
node build.mjs --check   # and runs node --check on bitten.js and net.js
```

No npm packages needed. Files in `src/` are concatenated in name order into one plain script, so the
game still opens by double clicking `index.html` (single player; the De Wals track and online play need http).

## Test

Needs Playwright with Chromium (`npm i -g playwright` or a local install).

```
NODE_PATH=$(npm root -g) node test/phase0.js     # web layout: http, file://, phone, fonts, downloads
NODE_PATH=$(npm root -g) node test/net.js 60 3 --bot   # online: host + 3 guests, lockstep check
```

Other scripts in `test/` are described at the top of each file.

## Online play

Coop menu, Online tab. One player hosts and gets a five letter room code plus an invite link (`?join=CODE`);
up to three others join with the code. The host picks the mode (any mode except Story and Daily) and starts.

* Model: host driven lockstep. Every peer runs the same seeded simulation at fixed 60 Hz ticks. The host
  bundles every apple's input per tick and sends it out; nobody simulates a tick without its bundle.
  Panel choices (sell, contract) and players leaving travel inside the bundles, so they land on the same tick.
* Guests play on the host's save and game options for that run (same powerup pool and rules); their own
  save is untouched and comes back after the run. Progress from an online run is not stored for guests.
* Every 60 ticks the peers compare a state hash. A guest that drifts gets the host's state at a later
  checkpoint (rng, apples, snakes, seeds, pickups). The Debug counter (Settings) shows repairs as errors.
* Transport: PeerJS 1.5.5 (`vendor/peerjs.min.js`, MIT, loaded only when you host or join) over WebRTC,
  with the public PeerJS broker (0.peerjs.com) for the handshake and Google STUN. There is no TURN server:
  two players both behind strict (symmetric) NAT may not connect. Set `window.BITTEN_NET_CONFIG` (PeerJS
  options, e.g. your own broker or TURN in `config.iceServers`) before net.js loads to change that.
* Not supported: joining a run that already started (wait for the next one), Story and Daily online.
* `?net=local` swaps the network for a BroadcastChannel: two tabs of one browser, no internet (tests).

## Deploy

Copy everything except `ref/`, `test/`, `tools/` and `src/` (optional) into the Pages repo under `/bitten/`.
After changing game files run `node build.mjs --check` and commit the result (bitten.js and sw.js).
Players get the new version on their next load; the service worker asks the server first and only
falls back to its cache offline. GitHub Pages must deploy from `main` (Settings, Pages, Branch).
