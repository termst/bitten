# Bitten v14.0: handoff notes

Work follows the phase order of the v14 prompt. Item codes are used in commits and comments.

## Status

| Phase | State |
|---|---|
| 0 web release (T6 T7 T10 T11 M16) | done, tested (test/phase0.js) |
| 1 cleanup (T1 T2 T3 T4 T8 P1 P2 P3 P4 S1) | done, tested (bot.js, stats.js, hz.js, perf.js, contact.js, gradprof.js) |
| 2 local multiplayer | core done, partly tested (test/coop.js smoke: 3 apples, 20 s, 0 errors). Gaps listed below |
| 3 online | done: net.js, tested (test/net.js, bot driven, 1 and 3 guests, lockstep hashes match) |
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
* `node test/update.js` release path: old cached release to new build in one visit, later push live on next load, offline.
* `node test/exitfx.js [outdir]` frames of the hole and light exit animations (src/86-v14-exitfx.js) in a 2 apple couch run; `node test/net.js 15 2 --exit` runs both exits online and checks lockstep.
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

## Phase 3: done (net.js)

Lockstep, host owns the clock. `NET14` (01-core.js) is the hook: frame() calls `NET14.pump` while an online run
is live. Bundles `[tick, inputs per slot, events, repair]`, inputs `[mx, my, ax, ay, touch, dashes, pings, mouseX, mouseY]`.
Determinism rules learned the hard way, keep them when adding code:
* gameplay timers: `setTimeout` inside a tick becomes a tick timer (net.js `inSim`); real timers would land on
  different ticks per peer (the contract panel closed 820 ms after signing: desync).
* audio random: Sfx/DJ use the real random while online, so muted and loud peers draw the same G.rng.
* shared step-off flags (till, pumps, pedestals, Jaude plates, gym): `armed14`/`setArmed14`, one per apple.
* run start draws from a seeded Math.random on every peer; mode, save and OPTS7 come from the host.
Tests: `node test/net.js [secs] [guests] [--bot]`.
v14.0.1 fixes (online did not work outside the local test transport):
* PeerJS json mode refused messages over 16 KB and closed the link: the start message (host save) and repairs.
  Now raw mode plus our own framing in `makeLink` (5000 character pieces). PROTO bumped to -2.
* Relay fallback (MQTT over wss, `RelayNet`, `AutoNet`), resend of missed bundles (`rs`, `NET.ring`), guest retries
  for 30 s while the host is away (sharing the link from another app).
* Phone: Coop opens on Online on touch devices without a gamepad, one join tile, padding under the fixed Start bar.
* `node test/netreal.js [peer|relay|fallback]`: real transports, local brokers, 60 KB save, forced repairs.

## More icon free content (src/78-v14-more-text.js)

31 BP pumps, 22 kapsalon cuts, 13 eiser and 14 gedaagde rulings. These categories show text only, so they need no icon painters.
* Pumps and cuts are written as percentages in `PUMP_SPECS` and `CUT_SPECS`; `build()` makes the mod numbers, the description and
  the Clear line from them. Add a line to a spec table and it works everywhere (texts file, Clear mode, guide counts).
* Pump extras beyond the old ones: `heal14` (half apples, after the fill) and `rot14` (a downgrade). Both run in an `updateTank9` wrapper.
* `stock9` wrapper: the original three pump draw runs on the old pool (same Math.random calls, so seeded bot runs stay identical:
  apple 38.7 / 12.3 / 192, lucif 60 / 19.3 / 351, lucky 58 / 17 / 288), then the three pumps are dealt again from all pumps with a
  generator seeded from run seed and floor. Do not shuffle the full `PUMPS` list with Math.random: it shifts every seeded run.
* Fight rulings set `room.taak22` and pay out in a `clearRoom9` wrapper. Banner texts live in `TX` and are added to TEXT_LIT9.messages.
* Test hook: `window.__bitten.MORE14`.

## De Ruimte, a space floor (src/82-v14-ruimte.js)

A rare floor (tier 4, `set: 'ruimte'`, boss `galaxy`). Every room is open space: a baked starfield and nebula
(`spaceFloor14`), live twinkle and shooting stars (`twinkle14`), asteroids (`ROCK9.asteroid14`) and comet ice pots
(`URN9.comet14`). No torches, no bones, no floor grain or contact shadows (`noGrain` flag, read in 63-v112-bloom.js).
* Planet worms, spawn characters `E` Aarde (moon that blocks seeds and bumps you, 3 hits to break), `^` Mars (dust, then a
  straight charge), `0` Neptunus (ice fan, slows you via `P.syrupT`), `?` Pluto (fades when far, `AI.grub` movement),
  `(` Saturnus (ring boomerang). Grub, hood and lamprey spawns on this floor are remapped to planets; eggs hatch Plutos.
* De Galaxyworm: phase 1 star spirals, star fans, planet births. Below 66%: hostile black holes that pull every apple, meteor
  showers. Below 33%: supernova every 12 to 15 s, a room wide shockwave that an asteroid blocks (`clearLine`).
* Room mod `supernova` (32% of fights here, also in Chaos): a dying star grows 6.5 to 8 s and blows. Hits apples and snakes
  in the open. Shared effects live in `room.fx14` (shocks, holes, meteors, rings) and update once per frame in the first
  `mpPasses14` pass; every apple is checked inside (`livePlayers14`, `withPlayer`).
* Eight powerups (ids end in 14, two legendary): only in the pool on this floor (`itemOk9`), and 45% of rolls there are space ones.
* Placement: Arcade and Daily run the normal plan first, then a generator of its own from the run seed puts De Ruimte on
  floor 3, 4 or 5 in 35% of runs. Endless: 20% from floor 3 on. No extra Math.random draws, so runs that never reach it are
  identical: `test/bot.js --runs 3` with the odds at 0 gives identical 3/3 for apple, lucif and lucky against v14.1.
* Code `RUIMTE` (Code tab): the next offline Arcade run gets De Ruimte as floor 2. Ignored online (every peer plans itself).
* Also in Custom Run, Boss Rush (before the Ender Wyrm), the Map Maker floor list, Admin unlock, the guide and two achievements.
* Test: `node test/ruimte.js` (forced floor, fight, supernova room, all powerups, boss phases, icons and guide pictures).

## v14.2: Game Maker, Coop and Coop Plus, leaner online traffic

* `src/83-v14-gamemaker.js`: the Game Maker panel (Coop screen, Couch tab and Online lobby). Mode and difficulty (same
  settings as the Play menu), coop style, run rules for every mode (the Custom Run rules; a Custom Run uses its own
  builder, moved into the panel), team rules (`CO14`: revive time, revive health, door wait, team scaling, coin drops),
  room (max apples, fixed seed). Stored in `Save.data.gm14`; guests get it with the host save. Guests see it read only.
* Coop styles (`coopStyle14()`, `G.run.coop14`): `split` (Coop) own coins (`P.coins14` behind a `G.run.coins` accessor),
  own clean room count, own contract and offer (`P.ct14` in 61), own pump/chair/gym flags (`perApple14`), gym sets timed
  on `MP14.dt`, 1.5x coins per extra apple (Auto). `plus` (Coop Plus) one purse, `collectItem` gives every apple the powerup,
  `coopLoot14()` deals chests, treasure and boss loot as for one apple.
* Fixed: Custom Run rules only reached apple 1 in coop. Couch sell and contract panels now act for the apple that opened them.
* net.js PROTO -3: slots that repeat the previous tick travel as `1`, trailing nulls and zeros are cut, inputs at 1/100,
  guests send input only on change (250 ms keep alive), bundle `[tick, slots(, events, repair)]`. `test/netbytes.js`:
  host to guest 6.2 to 2.6 KB/s, guest to host 2.2 to 1.1 KB/s (bot, 1 guest).
* Tests: `test/gm.js` (couch styles and panel), `test/netgm.js [secs] [split|plus]` (lobby sync, max apples, seed, lockstep),
  `test/netbytes.js`. `test/net.js` now also fails on counted game errors.
* Open: per apple sell till balance check in couch is not covered by a test; contract offers in split open one panel per
  apple in a row; the Custom Run summary guests see updates on the next lobby change.

## v14.2.1: online freeze fix

* Online, the sell till and contract panels froze the whole run (G.state left 'play') until that one player chose; in Coop every
  apple gets its own offer, so it froze twice per offer, and for good when that player dropped. Now they are personal:
  `G.panel14 = {k, slot, t0}` (net.js state setter), G.state stays 'play', only the owner sees the panel, stands still and
  cannot be bitten; one panel at a time; an away owner's panel closes; a contract signed after the fight ended is declined.
  Couch keeps the old shared pause (one screen). PROTO -4.
* A hidden host tab (no rAF) stopped every guest: a worker clock (`bgStart`) pumps the host ticks while `document.hidden`.
* Tests: `test/netfreeze.js [secs] [split|plus] [guests]` fails on any 6 s stall in play, `test/nethidden.js` hidden host.
  `test/bot.js` handles personal panels (signs every other contract).

## Not done yet (next chat)

* F9 recap UI on game over and win screens (data exists; icon painters: drawItemIcon* in 06/07/08/20/43).
* B6 room wide effect team cap 1.5x; B8 room curses (darkness, fog) for everyone while carrier lives.
* M9 local modals still behave as single player (shared screen pauses). Votes and personal panels only make
  sense online: build them in phase 3.
* Multiplayer tab in How to play; achievements/guide text for coop.
* Phase 3 left over: reconnect into a running run and T13 run snapshot (needs a full state serializer; the
  lockstep model only repairs drift, it cannot rebuild a run from scratch). No client prediction: a guest feels
  its own input one round trip late (fine for coop at normal ping). Guest progress is not saved for online runs.
* Phase 4 entirely: S2-S6, F1-F8, T14 (story 2 names, file 26/27), T15 renames (Creeper, Ender Wyrm, portal
  look, BP Tankstation and pumps, with old-name mapping like V10_OLD_NAMES).
* Low health prefetch of the Wals MP3 skipped: the death remix is synthesized, not the MP3.
* Tests to rerun after any change: phase0.js, bot.js (single player must match seeded numbers:
  apple 38.7 kills / 12.3 dmg / 192 s, lucif 60/19.3/351, lucky 58/17/288 with --runs 3), coop.js, hz.js.

## v14.3: boss stages, Starlight Remix

* `src/85-v14-stages.js`: every boss fights in stages by health (`DEF[kind]`: `at` lines, names, per stage speed, `enter`, `tick`).
  Each boss has its own stage names and attacks (strikes, rings, trails, pulls, partner shields, the Price War monopoly).
  Shared rules: a stage line holds (damage stops at the line, 1.1 s shield, venom cleared), one hit takes at most 6%,
  past 15% a second (more per apple) damage counts at 45%, long opening cooldowns are cut so no boss idles at the start.
  Grub Mother 64 to 80 hp, Jaude 70 to 90. Stage state lives on the snake (`stage14`, `sc14`), strikes in `room.st14`.
* De Galaxyworm: 4 stages (70/40/15%), hp 400. New: constellations (`fx14.cons`), comet dash, pulsar beams (a rock blocks),
  the event horizon (`fx14.horizon`, stage 4). `galaxyStage14` sets each stage up.
* `src/00-music-starwaltz.js` `StarWaltz`: the Rotten Waltz melody as a live scheduled boss track, 4 arrangements
  (112 BPM 3/4 waltz up to 156 BPM). `src/84-v14-galaxy-track.js` drives it from the boss (stage, nova riser and impact,
  finale on death). Audio only, no Math.random. Music tab card "Starlight Remix" with a part per stage.
* Tests: `test/stages.js` (every boss, heavy fire, stages in order), `test/starwaltz.js` (level per stage), `test/ruimte.js` (4 stages).
  `test/bot.js --runs 3` after this change: apple 54.3/19.0/253, lucif 66/21/358, lucky 45/14/186 (new reference numbers).

## Snake looks (src/87-v14-looks.js)

`LOOK14` gives each kind a body segment shape (`seg`: oval, flat, bead, plate, hex, diamond), one pattern (`pat`),
optional parts (`ridge`, `legs`, `leaves`, `wings`), a `tail`, head parts (`head`: horns, antennae, collar, ears, crown),
`glow` and colour variants (`vars`: hue `v`, lightness `l`, saturation `s`; `keys` lists extra K colours to shift).
Variants pick from blinkSeed at spawn (no new random draws). Colours are hex, `$key` for a K colour, `$dark` or `$light`.
One clear idea per kind, every part outlined. A new look is one table row.
drawSnake in 06-draw.js calls `seg14` for every body circle. Visual only, no Math.random.
Sheet of every kind: `node test/snakes.js [tag]` writes test/out/snakes-<tag>.png. Blocky kinds and V9_BODY kinds (bus, tellie, tvboss, jaude) keep their own draw.
