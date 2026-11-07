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
sw.js                 service worker, cache first, cache name bitten-v14.0
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
```

Other scripts in `test/` are described at the top of each file.

## Deploy

Copy everything except `ref/`, `test/`, `tools/` and `src/` (optional) into the Pages repo under `/bitten/`.
After changing game files, bump `CACHE` in `sw.js` so players get the new version.
