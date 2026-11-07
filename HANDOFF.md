# Bitten v14.0: handoff notes

Work follows the phase order of the v14 prompt. Item codes are used in commits and comments.

## Status

| Phase | State |
|---|---|
| 0 web release (T6 T7 T10 T11 M16) | done, tested (test/phase0.js) |
| 1 cleanup (T1 T2 T3 T4 T8 P1 P2 P3 P4 S1) | done, tested (bot.js, stats.js, hz.js, perf.js, contact.js, gradprof.js) |
| 2 local multiplayer | see below |
| 3 online | see below |
| 4 polish | see below |

## Where things are

* `src/01-core.js` end: `saveFile14` (T10), `Hooks` (T1), `ERR14`/`errNote14` (T2), `Sched` (T3), `RAND14`/`gameRandOn`/`vrnd` (T8), `renderQ14` (P4), `GLOW14` (S1), `SPR14` (P2).
* `src/44-v10-sounds-achs.js` `frame()`: the only rAF loop (T3), G.rng swap (T8).
* Hook installs: `src/10-actors.js` after class Player (Player.hurt), `src/30-v91-texts.js` after `const Game` (Game.update, startRun, loadLevel, enterRoom, clearRoom). Layers: grep `Hooks.layer`.
* `src/62-v111-skins.js` GN135: buffer clear fix and glow capture (S1), `cached14` (P1).
* `src/10-actors.js` addP/burst/addDecal: particle ring, pool and per player share `PART14` (P3).
* `src/80-v14-core.js`: Debug and Render quality settings rows, error counter.

## Tests (all offline, Playwright from `NODE_PATH=$(npm root -g)`)

* `node test/phase0.js` web layout checks (29 checks).
* `node test/bot.js --runs 20` seeded bot runs, v13.7 vs index.html; `node test/stats.js test/out/bot.json` Welch t-test.
  `--a index.html --b index.html` checks determinism; `--render 1` keeps render on; `--hz 120`.
* `node test/hz.js` 60 vs 120 Hz typing and game speed.
* `node test/perf.js [file] [chars]` render ms, original vs Arcade.
* `node test/contact.js tag` contact sheet of all looks into test/out.
