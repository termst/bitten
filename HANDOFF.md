# Bitten v14.10: handoff notes

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

(v14.10 closed most of this list, see the v14.10 section at the end. Still open: S2-S6, F1-F8; rare floors as lazy chunks.)


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

## v14.5: De Drakenhemel (dragon sky floor)

* `src/88-v14-draken.js`: floor set `draken` (FLOOR10.draken), open sky terrace arena. Dragons: Muntdraak `)` (coin rain,
  missed coins drop as pickups), Neondraak `{` (sweeping neon breath, fire patches), Pareldraak `}` (bouncing pearl,
  heals nearby dragons while holding it), Toorndraak `|` (fire fan, flies up and dives, untouchable while flying), Drakenjong `:`.
  Boss De Zonnekeizer (`keizer14`, hp 380, stages Hofhouding, Middagzon, Eclips; beam stops at the first pillar).
  Hazard `storm14` (gusts). Effects in `room.dk14`. Exposed as `window.__bitten.DRAAK14`.
* Placement: `DRAAK14 = { force, odds 0.35 (arcade/daily, floor 2 to 4, never last), endlessOdds 0.18, itemOdds 0.07 }`.
  Seeded via mulberry32, no extra Math.random outside the dragon content. Code `DRAKEN()` toggles force.
* `src/89-v14-draken-reis.js`: boss exit before the dragon floor is a ladder; climb cut-away past every visited floor
  (`G.run.path14`). After the Zonnekeizer a hole in the sky; fall cut-away down to the next floor. Trans kinds `climb14`, `fall14`.
* `src/90-v14-draken-items.js`: 21 dragon powerups (`*_dk`). 45% of item rolls on the sky floor, elsewhere a 7% seeded swap.
* Tests: `test/draken.js` (climb, fight, storm, all items, boss stages, beam, fall), `test/draken-preview.js` (dkp-*.png).
  `test/bot.js --runs 3 --chars apple` with the dragon odds at 0 matches the build without these files (55.7/17.7/267).

## v14.6: one catalog, Custom Run and Map Maker complete, maps in coop, share a level

* `src/91-v14-catalog.js` loads after all content. `B.CAT14` lists floors, bosses, snakes, room types, modifiers and powerups
  from the registries (FLOOR10, RARE_STORY10, LEVELS, BOSS_INFO, KINDS, TPL/TPL10/CHAOS_ROOMS9, MOD_NAMES, ITEM_IDS).
  New content that registers there shows up in Custom Run and the Map Maker without edits.
* Custom Run (src/51): floors come from `rareSets()` (registries), bosses from BOSS_ORDER10 plus BOSS_INFO. Locked floors and
  bosses are listed, disabled. Per stage: a boss reward powerup (`rw`: exact found one, `rand`, `rare`) and a Knokpit toggle (`kn`).
  Rule `knok` (-1 never, 0 rare, 1 every floor). Start powerups 3 to 5. Runtime in 91 (`placeExtras9` wrapper, clearRoom layer).
* Map Maker (src/74 section 13): `refresh14()` fills SETS, SNAKES, MINIS, BOSSES, MODS, RTYPES in place (also on open).
  Room types from CHAOS_ROOMS9 it did not know (Knokpit `brawl`, Clini-Clown HQ `clownhq`) are fixed layout rooms built by
  `chaosRoom9` in a `generateLevel` wrapper. Snake pieces: colour variant `vr` (0 random) and health `hp`. Room powerup list
  `R.pl {m: only|ban, ids}` and floor boss reward `F.brw` (up to 3), both in the share code. Use `MK.cleanMapNow`/`compactNow`
  (the plain `MK.cleanMap`/`compact` are the v12.3 originals without later fields). The pool picker in 91 lets an "only" list
  roll dragon and space powerups off their floor.
* Coop maps: Game Maker mode `map` with a map picker (`gm14.map`, compact form, travels in the host save). RTM.back `coop`
  returns to the menu, not the editor. Extra apples get the map rules. Online, a note or choice freezes every peer in the same
  tick; only the apple that found it answers, through `B.net14.act` as an `act` event (NET.decider). If it leaves, the last answer is taken.
* Share level (net.js, PROTO bitten-net-14.6-1): lobby More, Share level sends a map (`{t:'map'}`, host relays guest shares,
  3 s rate limit, 240 KB cap). Receivers get a card: Save (to their maps, solo play later), host also Play together.
* Tests: `test/catalog.js`, `test/netmap.js [secs] [shotdir]`. `test/bot.js --runs 3 --a <main build>` identical 3/3 for every character.
  phase0 "first load under 3 MB" already failed on main (3.22 MB), now 3.25 MB.

## v14.7: SIX SEVEN, a hidden rhythm boss (src/90-v14-zz67.js)

* Room type `hype67` hung off a fight room from floor 2 (`H67.CFG`: odds 0.14, chaos 0.3, endless 0.1; own mulberry32 from
  run seed and floor, so floors without it draw nothing extra). Codes `67` and `SIXSEVEN` toggle `force`. `CFG.next` (tests)
  turns the fight room next to the start into the stage. Also a boss in Custom Run, Boss Rush chaos and the Map Maker (`BOSS_TPL10.six67`).
* Boss `six67` (hp 240, 85 stage rules via its own `DEF` entry and wrap): DOOT DOOT 140 BPM, HANDS UP (66%) 150 BPM, SIX SEVEEEN (33%) 164 BPM.
* Beat clock `room.h67.beat` advances in `updateRoom9` (simulation, dt > 0 only). Every attack lands on a beat: hand slams
  (`H.hands[i].s`, shadow for 2 beats), row and column lasers (`H.lines`, 4 beat warning), 67 meteors (`H.rocks`), digit venom
  (`kind 'g67'`). Gold pads (`H.pads`): stand on one when the beat hits for hype. Hits give a little hype.
  Outside SIX SEVEN MODE the boss takes 60% (`HURT10.six67`); full hype starts the mode: 6.7 s, 2.2x, boss dances.
* Screen effects in a `renderRoom` wrapper (`post`): beat zoom, camera rock in stage 3 and the mode (off with reduced motion or
  screen shake off), rainbow wash, intro countdown, hype meter. Music: `Doot67` (same file), live trap track from the beat clock
  with a formant robot voice. Audio and drawing use no game random.
* Tests: `test/six67.js` (intro, pads, mode, all stages, win, loot), `test/six67-clip.js outdir` (preview mp4).
## v14.4 difficulty curve (src/92-v14-curve.js)

Problem: floors 1 and 2 were the wall (full rooms, no powerups yet), from floor 3 a stacked apple melted bosses before their stages.
* Early relief (arcade, daily, endless, story; not rush, chaos, custom or map maker floors): snake HP x0.75 floor 1, x0.85 floor 2,
  one snake less per fight and per wave (never below 2 on floor 1, 3 on floor 2), max 1 trait on floor 1, venom x0.9 / x0.96,
  the first won fight on floor 1 and on floor 2 drops a powerup. Floor 1 boss HP x0.85, floor 2 boss at least x0.9.
* Power meter: damage to normal snakes per second of fighting, 12 s moving average (`G.run.c14.ema`). Floor 1 is the yardstick,
  R = meter / floor 1 average. Snakes from floor 3: HP x clamp(sqrt(R / expect[floor]), 1, 1.5), expect = 1, 1.6, 3, 4.5, 6.
  `enemyPowerK` carries it, `bossHpK` keeps the old threat only.
* Bosses: at first sight their HP is lifted to meter x 1.2 x target seconds (30, 34, 38, 42 on floors 2 to 5, minis half), max 3x.
* Sim state only, lockstep safe (`test/net.js 15 2 --bot` PASS). Flags: `window.__bitten.CURVE14.CFG`, `CURVE14.state()`.
* Report: `node test/curve.js --runs 12 --par 5 [--cfg '{"on":false}']`. 3 chars x 3 difficulties, pooled (off 72 runs, on 108 runs):
  floor 1 damage 2.5 to 1.5 apples, floor 1 boss 34 s to 25 s, boss fight floor 3 21 to 35 s, floor 4 18 to 31 s, floor 5 17 to 43 s.

## v14.8: every content piece in every feature (src/99-v14-sync.js)
Rule from the owner: a new room, boss, snake or floor must show up at once in the Admin panel, Map Maker, Custom Run,
Game Maker and the guide. Register content once, at its source, and the features follow:
- floors `FLOOR10` / `RARE_STORY10`; bosses `BOSS_INFO` + `BOSS_ORDER10` + `CHAOS_BOSSES9`; snakes `KINDS`
  (guide card text in `KINDS[k].guide14 = [size, text]`); fight modifiers `MOD_NAMES`.
- room types `CHAOS_ROOMS9` (or `TPL`) plus `window.__bitten.ROOMINFO14[type] = { name, code, col, desc, hung, nolink, guide }`.
  `CAT14.build(room, type, def, rng)` (src/91) builds any type, Admin and Map Maker both use it.
- a rare hidden room hung off a fight room: also push `{ id, sk, rk, label, title, cfg }` to `window.__bitten.HIDDEN14`.
  Custom Run then gets a per stage toggle (`sk`) and a Never/Rare/Every floor rule (`rk`), the Game Maker the same rule.
- src/99 loads last (keep it the highest number) and fills Admin room types and modifiers, the Custom Run rules,
  guide cards and room entries, and the Map Maker catalog. `B.SYNC14.audit()` lists anything still missing.
- Test: `node test/sync.js` (audit empty, new content flows in, Admin builds every room, a map with every extra room plays,
  SIX SEVEN per stage and rules, Unlock everything opens every floor).

## v14.9: Map Maker Pro (src/74 section 14)
All in section 14 at the end of src/74 (it wraps internal functions, so it lives inside the same IIFE). Test hook `B.MK123.PRO`.
* Tools: Line (L), Outline (O), Circle (C, Shift filled), Area (M), brush size 1 to 3 (S, wraps `applyAt`; not in Fill or Box).
  Area: copy, cut, delete, fill, flip, drag or arrow keys to move, Ctrl A whole room, Save as stamp.
  Stamps: Ctrl V after an area copy, or Paint > Stamps (10 built in `ST_IN`, own stamps in localStorage `bitten.mkStamps14`, max 30).
  In stamp mode X / Y flip and R turns (H is the help key). Escape leaves area and stamp mode before it leaves the editor.
* Snake piece param `wv` (wave 1 to 3). Fight and guarded rooms spawn wave 1; a `Game.clearRoom` layer spawns the next wave 0.9 s
  after the last one dies instead of clearing.
* Room fields in map and share code: `ev` (up to 6 events {w, n, d, a, k, txt}, each fires once, only for the room you are in),
  `dk` room darkness (-1 floor), `sh` snake health scale, `tb` beat the clock seconds (prize: a powerup). Runtime in `buildRoom`,
  `spawnMapSnakes`, `updateRoomExtras` (dt > 0 only), `darkTarget` wrappers; sim state only, no timers.
* Floor pane Quick build: `genFloor(F, GEN)` (seeded mulberry32: branches, loops, line; extras incl. vault plus key and a cracked
  secret room) and Fill empty rooms. Map pane Overview (threat per floor). Gear next to Test: can not die, coins, keys
  (localStorage `bitten.mkTest14`, applied only when `RTM.back === 'editor'`).
* Test: `node test/mapmaker2.js [shotdir]` (tools via real mouse and keys, share code, waves, events, rules, 108 generated floors
  validated, a generated floor played). catalog, sync and netmap still pass.

## v14.10: cleanup release (closes the open items) and core feel

### Build, chunks, size
* `npm install` once (dev dependencies only: esbuild, espree, eslint-scope), then `node build.mjs --check`. `--no-minify` for a
  readable local build (do not commit it). The game itself still has no npm dependencies.
* `bitten.js` is minified (esbuild) and must stay under 2 MB (`--check` fails above it). It was 3.26 MB; now about 1.95 MB.
  First load in phase0: 3.41 MB to 2.2 MB.
* Lazy chunks (`src/01-chunks.js`, `CHUNKS14`). A file with `@chunk <name>` in its first three lines goes into `chunks/<name>.js`.
  At its old place bitten.js keeps `CHUNKS14.place(file, slots, hooks)`: build.mjs lists every global and `Global.prop` the file
  assigns and every `Hooks.layer` name. place() puts a forwarder there; when the chunk loads, begin()/end() run the file against
  the inner functions and hook the result into the forwarder, so every wrapper sits where it sat before (later files stay outside).
  Nothing to list by hand. `CHUNKS14.load(name)`, `loadAll()`, `onLoad(name, fn)`; tests call `loadAll()` after load.
* Chunk `maker`: the Map Maker (src/74-mapmaker/01..20). `00-prelude.js` stays in bitten.js: menu button, How to play tab, achievements,
  texts lists, `MK123.ensure()/ready()`, `inMap()` false until loaded, and a `Game.startRun` gate for map runs. The coop screen and a
  shared map in the lobby load it; net.js `beginRun` waits for it on a guest (fallback). bot.js runs never load it: identical 3/3.
* Not done: rare floors (82, 86-knokpit, 88-90) as chunks. Their placement code (seeded, at run start) and registries (items, achievements,
  catalog) live in those files, so they would have to load before every run anyway; the save also lists their powerups. Music engines:
  BittenRemix BPM/BAR are read by sim code (snake AI, bosses), so the engine stays in core. Room left under 2 MB: about 55 KB.

### Code structure
* `src/74-mapmaker/` and `src/62-skins/`: the two big files split by section with `tools/split-iife.mjs`. Shared names travel in
  `window.__bitten.M74` / `S62`: a name reassigned anywhere (`compact = function ...`) is always read as `M74.name`; others are
  exported where declared and destructured at the top of later sections. build.mjs reads `src/NN-name/` folders in order.
* Map Maker `ROOM_FIELDS` (02-map.js): one entry per room field `{ k, init, clean, out }` (rw, rg, pl, ev, dk, sh, tb). newRoom,
  cleanRoom and compact read it. `MK.cleanMap` / `MK.compact` / `MK.cleanRoom` now follow the current wrapped functions.
  Test: `test/mkfields.js` (every field through a share code; fails when a ROOM_FIELDS entry has no sample).

### Tests and CI
* `.github/workflows/tests.yml`: build --check (and the committed build must equal a fresh one), sync, catalog, mapmaker2, mkfields,
  bot.js --runs 3 against `test/ref.json`, phase0. On every PR and push to main.
* `test/ref.json`: seeded bot numbers per character (means and every seed). `node test/bot.js --runs 3 --chars apple,lucif,lucky --a none --ref test/ref.json`
  fails on drift beyond the margins (kills 15%, damage 25%, time 15%, floor 0.34). After an intended gameplay change: `--write-ref`.
* New: `test/coop1410.js`, `test/netrejoin.js`, `test/core1410.js`, `test/mkfields.js`.

### Open items closed (src/93-v1410-coop.js unless noted)
* F9 recap on game over and win in coop: per apple kills, damage dealt (top sources), damage taken, what bit last, powerup icons.
* B6: room wide effects (`ROOMWIDE14`: air horn, the drop, bass waves, stomp, gust, motion, veto, gavel, sky rain) with k carriers of a
  blast-tagged powerup hit at 1.5 / k each, so the team total is at most 1.5x one apple. Seeds and orbits are not capped.
* B8: `teamFlag14(flag)` in 01-core.js. Darkness (nacht), gold worm (blight), extra grub (wormy), extra snake (loud), clown and rage
  rolls count for the team while a carrier lives. Single player reads the apple's own flag, as before (bot identical).
* M9 couch: the till and the contract panel show which apple chooses (owner chip). The shared screen still pauses (one screen).
* Multiplayer tab in How to play; achievements Better Together (coop win), Back On Your Stem (10 revives), Long Distance (5 online floors).
* Reconnect (net.js, PROTO bitten-net-14.10-1): the host keeps every bundle of the run (up to 30 minutes). A player whose apple is
  away can join the same room again: the host sends the start message and the log, the guest replays it (deterministic) at up to
  360 ticks a frame, an event `back` unfreezes the apple on every peer in the same tick. `test/netrejoin.js`: lockstep after the return.
  No full state serializer (T13) was needed. Over 30 minutes of run the log is dropped and a return is refused.
* Guest progress: `keepProgress(mine, base, run)` in net.js adds what changed in the run copy of the host save (stats, found, seen,
  achievements, unlocks, bests) to the guest's own save when the run ends.
* T15 renames (ids unchanged, saves unaffected): Creeper is the Knaller, the Ender Wyrm is the Rift Wyrm, the Minecraft portal is a
  rift (roots and a turning vortex, 06-draw.js), BP Tankstation and pumps are PIT. T14: story 2's Alesen and Senale are Jorik and Mels
  (ids `alesen`/`senale` unchanged). Old texts files: `T15_OLD` in 44-v10-sounds-achs.js maps the old names to the new ones.

### Core feel (src/94-v1410-core.js, `B.CORE1410`)
* Sim (lockstep safe): charged shot (0.6 s of fire, then a piercing 1.5x seed, 2.4 s cooldown), perfect dash (venom in the first 80 ms
  of a dash: dash back, time at 45% for 0.2 s), knockback by weight on every seed hit (`kbW`: small 1.6x, bosses 0.08x), overheat for
  builds at 0.16 s per shot or faster (full heat: 1 s without seeds).
* Screen only: death replay (last 3 s, every second update recorded, drawn with renderRoom on game over), damage numbers (setting,
  off), hit stop (2 to 4 frames on big kills and boss stage lines, off with reduced motion or shake off), interact rings, seed type row
  (normal, pierce, split, bounce with the number of powerups that give it), heat and charge arcs.
* Auto aim (76) skips snakes under 40% visible (fade or cloak). Touch auto fire (setting, off): keeps shooting along the last aim
  while snakes are in the room; a quick tap on the aim side dashes.
* The sim features change the seeded bot numbers: test/ref.json was rewritten after them.
