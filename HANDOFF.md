# Bitten v14.0: handoff notes

Work follows the phase order of the v14 prompt. Item codes are used in commits and comments.

## Status

| Phase | State |
|---|---|
| 0 web release (T6 T7 T10 T11 M16) | done, tested (test/phase0.js) |
| 1 cleanup (T1 T2 T3 T4 T8 P1 P2 P3 P4 S1) | done, tested (bot.js, stats.js, hz.js, perf.js, contact.js, gradprof.js) |
| 2 local multiplayer | core done, partly tested (test/coop.js smoke: 3 apples, 20 s, 0 errors). Gaps listed below |
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

## Phase 2: done (src/81-v14-coop.js, helpers at the end of src/01-core.js)

M3 G.players/withPlayer/livePlayers14/mpPasses14 (hazards run once with dt, then dt 0 per extra apple),
seeds per owner, snakes run in their target's context plus body contact for the others, snake AI attacks
loop over apples (mpRest14). M4 input sources (KeyboardMouseSource, GamepadSource, P.input14).
T12 gamepads: sticks with dead zones 0.15/0.22, A/RB dash, X interact, Start pause (P1 only), rumble on hurt,
d-pad menu navigation, single player pad support. M15 Coop menu entry + Couch panel (slots, char, look, name).
T9 look per slot (P.look14). M7 door rule (70 px or 3 s countdown) + entry arc. M8 klokhuis ghost, ping,
3 s revive with 2 hp, run ends when all are ghosts. S7 colour ring, name tag, seed outline, light per apple.
M12 HUD rows (top left under the old HUD). B1 table (snake hp, extra snakes, boss hp, boss cycle, drops),
B2 threat average, B3 chests 1+(n-1), treasure +n-1, boss/mini/portal one pedestal per apple with block,
B4 natural (picker heals), B5 player blasts never hit others, B7 10 s team freeze cooldown.
F9 data only: per player damage by source, kills, damage taken, killer (B.coop14.stats()).

## Not done yet (next chat)

* F9 recap UI on game over and win screens (data exists; icon painters: drawItemIcon* in 06/07/08/20/43).
* B6 room wide effect team cap 1.5x; B8 room curses (darkness, fog) for everyone while carrier lives.
* M9 local modals still behave as single player (shared screen pauses). Votes and personal panels only make
  sense online: build them in phase 3.
* Multiplayer tab in How to play; achievements/guide text for coop.
* Phase 3 entirely: net.js, vendor/peerjs.min.js (peerjs@1.5.5 from npm, `dist/peerjs.min.js`), lobby
  (Online tab pane in #coop14 is an empty div, B.net14.paintLobby hook already called), snapshots, prediction,
  reconnect, T13 run snapshot. sw.js already lists net.js and vendor/peerjs.min.js.
* Phase 4 entirely: S2-S6, F1-F8, T14 (story 2 names, file 26/27), T15 renames (Creeper, Ender Wyrm, portal
  look, BP Tankstation and pumps, with old-name mapping like V10_OLD_NAMES).
* Low health prefetch of the Wals MP3 skipped: the death remix is synthesized, not the MP3.
* Tests to rerun after any change: phase0.js, bot.js (single player must match seeded numbers:
  apple 38.7 kills / 12.3 dmg / 192 s, lucif 60/19.3/351, lucky 58/17/288 with --runs 3), coop.js, hz.js.
