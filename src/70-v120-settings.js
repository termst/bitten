/* src/70-v120-settings.js: v12.0: settings in tabs, description style, merge fixes. From v12.0. Lines 32955 to 33520 of the v13.7 script. */
/* ================================================================== Bitten v12.0: settings in tabs, description style, merge fixes */
(function () {
  const safe12 = (f) => { try { return f(); } catch (e) { console.warn('v12', e); } };
  const CLEAR12 = {
items: {
twin:'Two seeds per shot.',
cyanide:'Seeds poison snakes.',
toffee:'Blocks a bite, then recharges.',
worm:'A worm orbits you and bites snakes.',
cider:'Faster feet, shots and seeds.',
big:'Bigger, stronger, slower seeds.',
sling:'Seeds fly faster and farther.',
spread:'Extra seeds in a fan.',
thorn:'Seeds pierce through snakes.',
rubber:'Seeds bounce off walls.',
rain:'Much faster shots, weaker seeds.',
seeker:'Seeds home in on snakes.',
frost:'Seeds slow snakes down.',
fizzy:'Seeds splash nearby snakes.',
halo:'Orbiting seeds block spit.',
split:'Seeds split on hit.',
hungry:'Kills heal you over time.',
ember:'Seeds set snakes on fire.',
boomer:'Seeds come back like a boomerang.',
lucky:'Some seeds are golden and hit hard.',
static:'Hits zap a second snake.',
wiggle:'Wavy seeds, a bit stronger.',
quick:'Faster shots.',
sharp:'Stronger seeds.',
sniper:'Longer range, more damage far away.',
peel:'More health, less knockback.',
sprout:'Faster walking.',
spiky:'Biters get hurt.',
glow:'Light in dark rooms, more range.',
clover:'Some bites miss you.',
juice:'Slices heal more.',
magnet:'Slices fly to you.',
regrow:'Heal after a rough room.',
nova:'Sometimes shoots a seed ring.',
cannon:'Huge piercing seeds, slow fire.',
buddy:'A mini apple shoots with you.',
phoenix:'One extra life per run.',
storm:'Seeds rain down on snakes.',
crown:'More health and everything better.',
chrono:'All snakes move slower.',
mirror:'Also shoots backwards.',
vamp:'Damage heals you.',
pump:'Some seeds explode.',
capy:'A capybara calms snakes and brings snacks.',
chill:'Standing still means faster shots.',
brim:'Kills leave burning ground.',
coaster:'Looping seeds that hit harder.',
pick:'Seeds break rocks and pots.',
fuse:'You explode when bitten.',
pact:'Lose health, seeds burn and hit harder.',
dropper:'Cleared rooms drop powerups.',
bonus:'Cheaper shops, more coins.',
tag:'Tagged snakes take more damage.',
gratis:'Slices come in pairs.',
hagel:'Shots spray sprinkles.',
kroket:'More health and a full heal.',
klomp:'Walking stomps nearby snakes.',
motie:'Kills sometimes hit the whole room.',
hamer:'Seeds stagger, sometimes stun all.',
stroop:'Blocks the first bite per room.',
molen:'Wind clears spit and slows snakes.',
veto:'Stuns everything when you are almost dead.',
coalitie:'Two worms orbit and bite.',
deltaplan:'Waves hurt every snake.',
golden:'More health.',
compost:'Kills grow shooting sunflowers.',
graft:'Damage grows as you clear rooms.',
bruised:'More damage when hurt.',
sap:'Your trail slows snakes.',
seedbank:'More coins, more damage.',
pollen:'Pollen clouds stop bites.',
dash:'Dash to dodge.',
bass:'Bass waves push snakes back.',
rave:'Hits make snakes dance in place.',
vinyl:'Seeds skip to a second snake.',
kaas:'More health, a bit slower.',
bank:'Charges up bigger, stronger shots.',
ov:'Snakes wake up later, you walk faster.',
schaar:'Hits sometimes deal bonus damage.',
stok:'Close spit slows down.',
wheek:'Shoves away snakes that get close.',
perfect:'Clean rooms grow your damage.',
sticky:'Hit snakes are slowed and weaker.',
nitro:'Kills give a speed burst.',
horn:'Stuns nearby snakes now and then.',
bril:'See farther, some seeds crit.',
bezwaar:'Reflects the first spit per room.',
mandje:'Bigger shops, coins come to you.',
haring:'Powerups heal you.',
bitterbal:'Kills drop snacks: heal or throw.',
pinda:'Sticky seeds burst for extra damage.',
oliebol:'Some shots make no-bite clouds.',
verzoek:'Kills sometimes pay a coin.',
fiets:'A bell that flinches snakes and clears spit ahead.',
zonnebril:'Some spit misses you.',
koffie:'Slightly faster shots and feet.',
disco:'A disco ball zaps snakes.',
drop:'Now and then the whole room gets hit and stunned.',
speaker:'A speaker hurts snakes near it.',
remix:'Every shot gets a random effect.',
wheel:'Moving charges a giant rolling wheel.',
curator:'Survive one killing bite per floor.',
assseed:'Guards your back and shoots back.',
skyrain:'Extra seeds drop from the sky.',
flap:'A bit more health.',
vitamine:'A bit more health and speed.',
puntje:'Slightly stronger seeds.',
elastiek:'Slightly faster shots.',
verrekijker:'Seeds fly farther.',
dikkepit:'Bigger seeds.',
gympies:'Faster walking.',
vliegenmepper:'Sometimes swats snakes away.',
kaasschaaf:'First hit on each snake hits harder.',
rodestip:'First hit on each snake crits.',
knoflook:'Nearby snakes slowly take damage.',
tulp:'Kills sometimes plant healing tulips.',
paraplu:'Pops spit that gets close.',
helm:'Ignore the first bite each floor.',
nicotine:'Slow healing during fights.',
peuk:'Hits sometimes burn.',
rookgordijn:'Getting bitten hides you in smoke.',
koptelefoon:'No knockback, shorter slowdowns.',
hyperfocus:'Hitting the same snake ramps damage.',
special:'One snake type takes extra damage.',
patroon:'See spit paths, repeat hits crit.',
fidget:'A spinner cuts harder when you move.',
deken:'Clean rooms heal you.',
drone:'A drone bombs snakes.',
stofzuiger:'A robot grabs coins and bumps snakes.',
garantie:'Blocks a downgrade each floor.',
supermeter:'Hits charge a big piercing fan.',
powercube:'Kills drop small boosts for the floor.',
bosje:'Stand still to hide and ambush.',
pepernoot:'Shots also throw bouncing cookies.',
clownneus:'Honks stop nearby snakes.',
ballon:'Balloons pop and daze snakes.',
hypercharge:'Short bursts of everything faster.',
magnetron:'Cooks the closest snake.',
inzone:'No hits for a while: homing, stronger seeds.',
gasmasker:'Immune to gas, smoke and fire.',
meeuw:'Seagulls dive at snakes.',
beker:'Beating bosses makes you stronger.',
reuzenkracht:'Almost dead: big damage burst.',
haadee:'Damage swings up and down by room.',
linzen:'Random candy effect per seed.',
snoepzak:'Kills drop candy for faster shots.',
doomscroll:'Random boost every so often.',
viral:'Hits build views, then the room freezes and gets hit.',
reeks:'Rooms without bites stack power.',
duet:'A mirror copy shoots along.',
selfie:'Flashes stop bites, groups heal you.',
dagboek:'Snakes that bit you take more damage.',
reflectie:'Bounced seeds hit harder.',
kamhuid:'Stand still to turn invisible.',
kamtong:'Tongue pulls a snake in and hits it.',
kleurwissel:'Random bonus every room.',
eierschaal:'More damage until bites crack the shell.',
hoofdpersoon:'Full health makes you stronger.',
terugblik:'Undo the first bite each room.',
grotevala:'Survive one killing bite with a big blast.',
stamppot:'More health, heal each floor.',
veter:'Some seeds pierce and slow.',
fietspomp:'Now and then a big double hit seed.',
statiegeld:'More coins, better till prices.',
mosterd:'Repeat hits freeze and weaken a snake.',
schaatsen:'Faster, and moving makes seeds stronger.',
regenjas:'Ignore the first spit each room.',
frikandel:'Kills splash slowing sauce.',
automaat:'Cleared rooms sometimes drop a slice.',
kwartje:'Some seeds are coins that pay out.',
appelmoes:'Almost dead: faster and better healing.',
uitsmijter:'Biters get thrown back.',
koekoek:'Now and then a big hit on the closest snake.',
tegeltje:'A bit of everything.',
tosti:'Some shots are big burning tostis.',
elfsteden:'Grows stronger through the floor.',
koningsdag:'Fights open with a room-wide hit.',
pakjesavond:'More health, bosses drop extra loot.',
nachtwacht:'Kill streaks hit the whole room.',
appelboom:'Slices drop during fights.',
kernsplitsing:'Kills explode.',
koets:'Double coins, cheaper shops.',
drieling:'Three seeds per shot.',
zwartgat:'Black holes pull snakes in.',
kampvuur:'Stand still to light a healing fire.',
vuurwerk:'Some shots are exploding rockets.',
snelkookpan:'Damage builds up to a room-wide blast.',
zevendehemel:'Almost dead: untouchable and strong.',
koningsappel:'More health and better everything.',
tulpenmanie:'Kills in a room stack damage.',
tondeuse:'Hits sometimes deal bonus damage.',
spaarpas:'Cheaper pumps, tunes add damage.',
advocaat:'Wins court and blocks a curse.',
marktplaats:'Better prices at the till.',
stempas:'More damage, vote rooms pay.',
fiche:'Kills sometimes roll for loot.',
brandweer:'Burning snakes take more damage.',
ijsblokje:'Slowed snakes take more damage.',
loodgieter:'Diggers take more damage.',
trampoline:'Seeds bounce to a second snake.',
veerpont:'Safe and strong at fight start.',
pindasaus:'Hit snakes take more damage.',
megafoon:'Stuns snakes in front of you.',
rugzak:'More powerups, more damage.',
verjaardag:'A random gift every floor.',
rotting:'Seeds rot snakes, rot spreads on kill.',
fietsbel:'Rings daze and hurt nearby snakes.',
zoutedrop:'Downgrades give damage.',
melon:'Big bursting melons that stick and shove.',
mud:'Mud stacks slow and weaken snakes.'
},
curses: {
glass:'Huge damage, bites hurt a lot more.',
heavycore:'Stronger seeds, slower walking.',
overripe:'Faster, less health.',
greedy:'More coins, pricier shops.',
hangover:'Faster shots, shaky aim.',
stampede:'Faster snakes, more loot.',
blight:'Gold worms, more legendaries.',
wormy:'Extra grubs that drop coins.',
rotting:'Stronger seeds, lose health each floor.',
bitter:'Biters get hurt, slices heal less.',
curatele:'No shopping, coins boost damage.',
idool:'Stronger seeds, faster snakes.',
busje:'Fast but slippery floors.',
nacht:'Dark rooms, stronger glowing seeds.',
weken:'No healing at floor start, more slices.',
loud:'Bass waves, one more snake.',
ketting:'Faster shots, coughing fits.',
glimlach:'More coins, killer clowns.',
woede:'Stronger seeds, more rage worms.',
hyperactief:'Fast, but your aim never sits still.',
uitverkoop:'Half price, every buy brings a downgrade.',
narcist:'Stronger seeds, you pause to pose.',
aandacht:'Faster shots, shorter range.',
wankelei:'Stronger seeds, bites knock you down.',
schutkleur:'Some hits miss you, seeds weaker.',
suiker:'Faster shots, sugar crashes.',
belasting:'Stronger seeds, lose coins each floor.',
spitsuur:'You and the snakes are faster.',
hollandsweer:'Stronger seeds, slippery floors.',
gokschuld:'More coins, fights cost coins.',
delftsblauw:'Less health, much stronger seeds.',
tunnelvisie:'Better seeds, less light.',
bloedmaan:'Stronger and faster, one more snake.',
kortsluiting:'Faster shots that sometimes jam.',
gamer:'Faster shots, snakes spot you sooner.',
paparazzi:'Stronger seeds, flashes in your face.',
opdieet:'Less health, faster everything.',
lood:'Big heavy seeds, slow walking.',
pechvogel:'Some seeds fizzle, the rest hit harder.',
spiegel:'Stronger seeds, bites can bring downgrades.',
vroegevogel:'Fast early in fights, slow later.'
},
downs: {
dull:'Weaker seeds.',
stiff:'Slower shots.',
soggy:'Seeds slower and shorter.',
sluggish:'Slower walking.',
wormhole:'Less health.',
butter:'Wobbly aim.',
rattled:'Bites knock you farther.',
blurry:'Less light.',
lowbat:'Shots slow down in long fights.',
crooked:'Aim drifts left.',
cold:'Slow at the start of fights.',
kfail:'Smaller seeds.',
ghosted:'Some slices vanish.',
witharen:'Snakes wake up sooner.',
tinypit:'Smaller seeds.',
kortadem:'Shorter range.',
natlont:'Slower seeds.',
dunschil:'Shorter safety after a bite.',
hoest:'Coughing stops your shots.',
deuk:'A bit slower and weaker.',
lek:'You lose coins between rooms.',
maandag:'Slow start in fights.',
schermtijd:'Less light, slower seeds.',
kraakje:'Seeds a bit weaker and smaller.',
geenlikes:'Some coins never drop.',
verkleurd:'Wobbly aim, slower seeds.',
losveter:'You trip while walking.',
zerevoet:'Slower walking.',
beslagen:'Less light, wobbly aim.',
blaar:'Slow at the start of fights.',
roestig:'Slower shots and seeds.',
bonnetje:'Shops and pumps cost more.',
snotneus:'Sneezes send shots anywhere.',
kreukel:'Smaller, shorter seeds.',
klamme:'Weaker seeds.',
spierpijn:'Slower shots and walking.',
pukkel:'More knockback, less light.',
slaperig:'No shooting at fight start.',
tocht:'Aim drifts right.',
barst:'Less light, slower seeds.',
krommerug:'Shorter range, slower walking.'
},
pumps: {
super98:'Stronger seeds, slower walking.',
diesel:'More health, slower shots.',
lpg:'Faster shots, weaker seeds.',
euro95:'Faster walking, less health.',
adblue:'Longer range, weaker seeds.',
turbo:'Much stronger seeds, slower shots.',
nos:'Faster, shorter range.',
wash:'Removes downgrades, weaker seeds.',
xxl:'Bigger seeds, slower flight.',
vpower:'Much stronger seeds, less health.',
ultimate:'Stronger seeds, slower shots.',
hvo:'Faster and farther, weaker seeds.',
waterstof:'Faster shots, less light.',
kerosine:'Fast far seeds, but smaller.',
tweetakt:'Faster shots, more knockback.',
stookolie:'Stronger seeds, slower flight.',
laadpaal:'Fast start in fights.',
banden:'Faster, less knockback.',
olie:'Removes a curse, slower walking.',
wasstraat:'Full heal, slower shots.',
bpkoffie:'Faster, less light.',
kroketbp:'More health, slower walking.',
autogas:'Bigger stronger seeds, shorter range.',
premium:'More health and damage, slower shots.',
airmiles:'More coins, weaker seeds.'
}
};

  const S12 = () => Save.data.settings;
  let force12 = null;
  const descMode = () => force12 || (S12().info === false ? 'off' : (S12().desc12 === 'clear' ? 'clear' : 'full'));

  /* one description getter per entry: Clear swaps in the short line, everything that reads .desc follows */
  const install = (obj, map) => {
    if (!obj || !map) return 0; let n = 0;
    for (const k of Object.keys(obj)) {
      const o = obj[k]; if (!o || typeof o !== 'object') continue;
      const id = Array.isArray(obj) ? o.id : k;
      const d = Object.getOwnPropertyDescriptor(o, 'desc'); if (!d || d.get || !d.configurable) continue;
      let full = o.desc;
      Object.defineProperty(o, 'desc', {
        configurable: true, enumerable: true,
        get() { return descMode() === 'clear' && map[id] ? map[id] : full; },
        set(v) { full = v; },
      });
      Object.defineProperty(o, 'descFull', { configurable: true, enumerable: false, get() { return full; } });
      n++;
    }
    return n;
  };
  safe12(() => {
    install(ITEMS, CLEAR12.items); install(CURSES, CLEAR12.curses); install(DOWNS, CLEAR12.downs);
    if (typeof PUMPS !== 'undefined') install(PUMPS, CLEAR12.pumps);
    if (typeof PUMP_BY_ID !== 'undefined' && PUMP_BY_ID !== PUMPS) install(PUMP_BY_ID, CLEAR12.pumps);
  });
  /* exports always carry the full text */
  safe12(() => {
    if (typeof Texts === 'object' && Texts && typeof Texts.collect === 'function') {
      const c0 = Texts.collect;
      Texts.collect = function () { const f = force12; force12 = 'full'; try { return c0.apply(this, arguments); } finally { force12 = f; } };
    }
  });

  /* past the last floor (admin floor skip, chaos) fall back to a real floor instead of crashing */
  safe12(() => {
    const lb0 = Game.levelBase;
    Game.levelBase = function (i) { const r = lb0.apply(this, arguments); return r || LEVELS[Math.min(Math.max(0, i | 0), LEVELS.length - 1)]; };
  });
  /* merge fix: two powerups were both called Fietsbel */
  safe12(() => { if (ITEMS.fiets && ITEMS.fietsbel && ITEMS.fiets.name === ITEMS.fietsbel.name) ITEMS.fiets.name = 'Ouwe Bel'; });

  const refreshCards = () => safe12(() => { UI.buildItemCards(); if (UI.refresh) UI.refresh(); });

  /* ------------------------------------------------------------------ settings in tabs */
  safe12(() => {
    const sec = UI.el.settings, inner = sec && sec.querySelector('.sheet-inner'), box = UI.el.toggles;
    if (!inner || !box || inner.querySelector('.tabs12')) return;
    const TABS = [['sound', 'Sound'], ['screen', 'Screen'], ['play', 'Play'], ['save', 'Save']];
    const TAB_OF = { sound: 'sound', music: 'sound', party: 'sound', shake: 'screen', fx: 'screen', numbers: 'screen', assist: 'play', vibrate: 'play', info: 'play', contracts: 'play' };
    const OPT_TAB = { hud: 'screen', bossVol: 'sound', fps: 'screen' };
    const ORDER = ['sound', 'music', 'party', 'fx', 'shake', 'numbers', 'contracts', 'assist', 'vibrate', 'info'];
    let tab = 'sound';

    const css = document.createElement('style');
    css.textContent = `
#settings .tabs12{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;max-width:640px;margin:0 0 12px;position:sticky;top:0;z-index:3;background:var(--bg,#0c0807);padding:6px 0}
#settings .tabs12 button{all:unset;box-sizing:border-box;cursor:pointer;text-align:center;padding:10px 4px 9px;border:1px solid var(--line);border-radius:3px;font:700 12px/1 var(--ui);letter-spacing:.16em;text-transform:uppercase;color:var(--muted);background:rgba(255,255,255,.02)}
#settings .tabs12 button[aria-selected="true"]{background:rgba(215,38,61,.2);border-color:var(--apple);color:#fff4ec}
#settings .tabs12 button:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
#settings .tabs12 em{display:block;font:500 10px/1 var(--ui);letter-spacing:.06em;text-transform:none;color:var(--faint);margin-top:5px;font-style:normal}
#settings [data-t12].hid12{display:none!important}
#settings .toggles{gap:6px}
#settings .tog{padding:10px 12px}
#settings .tog b{font-size:16px}
#settings .tog small{font-size:13px}
#settings .tog.dim12,#settings .cr.dim12{opacity:.45}
#settings .tog small .why12{display:block;color:var(--apple-hi,#ff8a8a);margin-top:3px}
#settings .opt10{margin-top:6px}
#settings .opt10>h3{display:none}
#settings .row12{border:1px solid var(--line);border-radius:4px;padding:10px 12px;background:rgba(255,255,255,.02);display:flex;flex-direction:column;gap:8px}
#settings .row12>b{font:700 16px/1.1 var(--ui);letter-spacing:.04em}
#settings .row12>small{font-size:13px;color:var(--muted);line-height:1.3}
#settings .seg12{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:4px}
#settings .seg12 button{all:unset;box-sizing:border-box;cursor:pointer;text-align:center;padding:8px 6px;border:1px solid var(--line);border-radius:3px;font:600 13px/1 var(--ui);letter-spacing:.05em;color:var(--muted)}
#settings .seg12 button.on{background:rgba(215,38,61,.2);border-color:var(--apple);color:#fff4ec}
#settings .seg12 button:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
#settings .prev12{display:grid;grid-template-columns:44px 1fr;gap:10px;align-items:center;padding:8px;border:1px dashed rgba(236,226,212,.14);border-radius:3px;min-height:60px}
#settings .prev12 canvas{width:44px;height:44px}
#settings .prev12 b{display:block;font:700 14px/1.1 var(--ui);margin-bottom:3px}
#settings .prev12 span{font-size:13px;color:var(--muted);line-height:1.3}
#settings .prev12.off12{opacity:.5}
#settings .reset12{all:unset;box-sizing:border-box;cursor:pointer;align-self:flex-start;margin-top:10px;padding:8px 12px;border:1px solid var(--line);border-radius:3px;font:700 11px/1 var(--ui);letter-spacing:.16em;text-transform:uppercase;color:var(--faint)}
#settings .reset12:hover{color:var(--ink);border-color:rgba(236,226,212,.4)}
#settings .reset12.arm{color:#fff4ec;border-color:var(--apple);background:rgba(215,38,61,.2)}
#settings .resetwrap12{max-width:640px;display:flex}
#settings .preset12 .tag12{font:600 11px/1 var(--ui);letter-spacing:.1em;text-transform:uppercase;color:var(--faint)}
`;
    document.body.appendChild(css);

    /* tab bar */
    const bar = document.createElement('div'); bar.className = 'tabs12'; bar.setAttribute('role', 'tablist');
    for (const [id, lab] of TABS) {
      const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.tab = id;
      b.innerHTML = `${lab}<em></em>`;
      b.addEventListener('click', (e) => { e.preventDefault(); tab = id; paint(); safe12(() => { if (G.state !== 'pause') Sfx.blip(); }); });
      bar.appendChild(b);
    }
    inner.querySelector('.sheet-head').after(bar);

    /* order the switches, tag every row with its tab */
    for (const k of ORDER) { const t = box.querySelector(`.tog[data-set="${k}"]`); if (t) box.appendChild(t); }
    for (const t of box.querySelectorAll('.tog')) t.dataset.t12 = TAB_OF[t.dataset.set] || 'play';
    const opt = inner.querySelector('.opt10');
    if (opt) for (const r of opt.querySelectorAll('.cr')) { const c = r.querySelector('.chip'); r.dataset.t12 = (c && OPT_TAB[c.dataset.k]) || 'screen'; }
    const saveBox = inner.querySelector('.savebox'); if (saveBox) saveBox.dataset.t12 = 'save';
    const infoTog = box.querySelector('.tog[data-set="info"]'); if (infoTog) infoTog.dataset.t12 = 'none';

    const seg = (opts, onPick) => {
      const s = document.createElement('div'); s.className = 'seg12'; s.setAttribute('role', 'radiogroup');
      for (const [v, lab] of opts) {
        const b = document.createElement('button'); b.type = 'button'; b.dataset.v = v; b.textContent = lab; b.setAttribute('role', 'radio');
        b.addEventListener('click', (e) => { e.preventDefault(); onPick(v); safe12(() => { if (G.state !== 'pause') Sfx.blip(); }); UI.paintSettings(); });
        s.appendChild(b);
      }
      return s;
    };
    const setBool = (k, v) => {
      if (k === 'sound') { if (!!Save.data.sound !== v) UI.flip('sound'); return; }
      if (k === 'assist') { Save.data.assist = v; Save.store(); return; }
      if (UI.setting(k) !== v) UI.flip(k);
    };

    /* graphics preset */
    const PRE = { light: { fx: false, shake: false }, normal: { fx: false, shake: true }, full: { fx: true, shake: true } };
    const pre = document.createElement('div'); pre.className = 'row12 preset12'; pre.dataset.t12 = 'screen';
    pre.innerHTML = '<b>Graphics</b><small>Light runs on anything. Full turns on every effect. Change a switch below and it says Custom.</small>';
    const preSeg = seg([['light', 'Light'], ['normal', 'Normal'], ['full', 'Full']], (v) => {
      for (const [k, on] of Object.entries(PRE[v])) setBool(k, on);
      safe12(() => { if (typeof FX === 'object') { FX.low = false; FX.slow = 0; FX.n = 0; } if (G.map) for (const r of G.map.rooms) r.dirty = true; });
    });
    pre.appendChild(preSeg);
    const preTag = document.createElement('span'); preTag.className = 'tag12'; pre.appendChild(preTag);
    box.prepend(pre);

    /* description style: replaces the old Powerup details switch */
    const ds = document.createElement('div'); ds.className = 'row12'; ds.dataset.t12 = 'play';
    ds.innerHTML = '<b>Descriptions</b><small>Full: every number. Clear: one short line, no numbers. Off: no card when you walk up to things. The guide follows Full or Clear.</small>';
    ds.appendChild(seg([['full', 'Full'], ['clear', 'Clear'], ['off', 'Off']], (v) => {
      const s = S12();
      if (v === 'off') s.info = false; else { s.info = true; s.desc12 = v; }
      Save.store(); refreshCards();
    }));
    const prev = document.createElement('div'); prev.className = 'prev12';
    prev.innerHTML = '<canvas width="88" height="88" aria-hidden="true"></canvas><div><b></b><span></span></div>';
    ds.appendChild(prev);
    if (infoTog) infoTog.after(ds); else box.appendChild(ds);
    const PREV_IDS = ['melon', 'mud', 'rotting', 'thorn', 'cannon', 'nachtwacht', 'capy', 'remix'].filter((id) => ITEMS[id]);
    let prevI = 0;
    const paintPrev = () => safe12(() => {
      const id = PREV_IDS[prevI % PREV_IDS.length]; if (!id) return;
      const it = ITEMS[id], m = descMode();
      prev.querySelector('b').textContent = it.name;
      prev.querySelector('span').textContent = m === 'off' ? 'Nothing pops up in the room. The guide still lists it.' : it.desc;
      prev.classList.toggle('off12', m === 'off');
      const cv = prev.querySelector('canvas'), c = cv.getContext('2d');
      c.clearRect(0, 0, 88, 88); c.save(); c.translate(44, 44); drawItemIcon(c, id, 70, 0); c.restore();
    });
    prev.addEventListener('click', () => { prevI++; paintPrev(); });
    prev.style.cursor = 'pointer'; prev.title = 'Tap for another powerup';

    /* reset per tab */
    const DEF = { sound: true, music: false, party: true, shake: true, fx: true, numbers: true, assist: true, vibrate: true, contracts: true };
    const OPT_DEF12 = { hud: 'auto', bossVol: '0.75', fps: '0' };
    const rw = document.createElement('div'); rw.className = 'resetwrap12'; rw.dataset.t12 = 'reset';
    const rb = document.createElement('button'); rb.type = 'button'; rb.className = 'reset12'; rb.textContent = 'Reset this tab';
    let armT = 0;
    rb.addEventListener('click', (e) => {
      e.preventDefault();
      if (!rb.classList.contains('arm')) { rb.classList.add('arm'); rb.textContent = 'Tap again to reset'; clearTimeout(armT); armT = setTimeout(() => { rb.classList.remove('arm'); rb.textContent = 'Reset this tab'; }, 2500); return; }
      clearTimeout(armT); rb.classList.remove('arm'); rb.textContent = 'Reset this tab';
      for (const [k, v] of Object.entries(DEF)) if (TAB_OF[k] === tab) setBool(k, v);
      if (tab === 'play') { S12().info = true; S12().desc12 = 'full'; Save.store(); refreshCards(); }
      if (opt) for (const [k, v] of Object.entries(OPT_DEF12)) if (OPT_TAB[k] === tab) { const c = opt.querySelector(`.chip[data-k="${k}"][data-v="${v}"]`); if (c) c.click(); }
      UI.paintSettings();
    });
    rw.appendChild(rb);
    (opt || box).after(rw);

    /* live state: tabs, dependencies, summaries */
    const touch = () => { try { return matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window; } catch (e) { return false; } };
    const why = (t, txt) => {
      if (!t) return; const sm = t.querySelector('small'); if (!sm) return;
      let w = sm.querySelector('.why12');
      if (!txt) { if (w) w.remove(); t.classList.remove('dim12'); return; }
      if (!w) { w = document.createElement('span'); w.className = 'why12'; sm.appendChild(w); }
      w.textContent = txt; t.classList.add('dim12');
    };
    const paint = () => safe12(() => {
      sec.dataset.tab12 = tab;
      for (const b of bar.children) b.setAttribute('aria-selected', b.dataset.tab === tab ? 'true' : 'false');
      for (const el of inner.querySelectorAll('[data-t12]')) el.classList.toggle('hid12', el.dataset.t12 === 'reset' ? tab === 'save' : el.dataset.t12 !== tab);
      const st = (k) => UI.setting(k);
      // dependencies
      why(box.querySelector('.tog[data-set="music"]'), st('sound') ? '' : 'Sound is off, so this stays quiet.');
      why(box.querySelector('.tog[data-set="party"]'), !st('sound') ? 'Needs Sound on.' : !st('music') ? 'Needs Music on.' : '');
      why(box.querySelector('.tog[data-set="assist"]'), touch() ? '' : 'No touch screen found. Does nothing here.');
      why(box.querySelector('.tog[data-set="vibrate"]'), (navigator && 'vibrate' in navigator) ? '' : 'This device cannot buzz.');
      const wr = opt && opt.querySelector('.cr[data-t12="sound"]'); if (wr) wr.classList.toggle('dim12', !st('sound'));
      // preset
      const cur = Object.keys(PRE).find((p) => Object.entries(PRE[p]).every(([k, v]) => st(k) === v));
      for (const b of preSeg.children) b.classList.toggle('on', b.dataset.v === cur);
      preTag.textContent = cur ? '' : 'Custom';
      // descriptions
      const m = descMode();
      for (const b of ds.querySelector('.seg12').children) b.classList.toggle('on', b.dataset.v === m);
      paintPrev();
      // little summaries under the tabs
      const sum = {
        sound: !st('sound') ? 'Muted' : st('music') ? 'Remix' : 'Music box',
        screen: cur ? cur[0].toUpperCase() + cur.slice(1) : 'Custom',
        play: m === 'off' ? 'No cards' : m === 'clear' ? 'Clear text' : 'Full text',
        save: 'Backup',
      };
      for (const b of bar.children) b.querySelector('em').textContent = sum[b.dataset.tab] || '';
    });
    const ps0 = UI.paintSettings;
    UI.paintSettings = function () {
      const r = ps0.apply(this, arguments);
      safe12(() => { for (const b of sec.querySelectorAll('.tog')) b.setAttribute('aria-checked', this.setting(b.dataset.set) ? 'true' : 'false'); });
      paint();
      return r;
    };
    const os0 = UI.openSettings;
    UI.openSettings = function () { const r = os0.apply(this, arguments); paint(); return r; };
    // chips in the opt rows change state too
    if (opt) opt.addEventListener('click', () => setTimeout(paint, 0));
    // the old info switch can no longer be reached, but keep it in sync for anything else that reads it
    paint();
    window.__bitten.V12 = { CLEAR12, descMode, paint, setTab: (t) => { tab = t; paint(); }, install };
  });
})();


