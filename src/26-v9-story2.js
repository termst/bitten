/* src/26-v9-story2.js: v9: the second story, ONDER CURATELE (script). From v9. Lines 14695 to 14916 of the v13.7 script. */
/* =====================================================================
   Version 9: a second story. ONDER CURATELE.
   Alesen and Senale argue about nothing, overdramatically, for four
   floors. Every argument feeds the worms under Utrecht. You are the
   apple in the middle. Senale ends up under curatele, in the hands of
   his parents. Built from one week of real messages, 13 to 18 December.
   ===================================================================== */
const STORY_BUS = {
  name: 'Het Hokkie', sub: 'Ik zit in dat hokkie dus dan weet je dat.', rooms: 9, tier: 0, set: 'bus', boss: 'bus',
  dark: 0.7, darkClear: 0.42, venomSpeed: 148, hpMult: 1.05, light: 206,
  floor: '#2b3038', floor2: '#272c34', grout: '#14171c', wall: '#39434e', wallHi: '#6c7a8a', wallLo: '#181c22', void: '#07090c',
  rock: '#7c8794', rockHi: '#a8b2be', rockLo: '#3a414b', clay: '#2f6a3a', clayLo: '#1a3d22', deco: 'bus', decoCol: '#e8c84a', dirt: '#3a3f46',
  rockStyle: 'shelter', urnStyle: 'bin',
};
const STORY_MALL = {
  name: 'De Loop', sub: 'Hoelang duurt de loop? Dan missen we elkaar.', rooms: 10, tier: 1, set: 'market', boss: 'tellie',
  dark: 0.46, darkClear: 0.22, venomSpeed: 158, hpMult: 1.25, light: 216,
  floor: '#5a5f66', floor2: '#4c5157', grout: '#2a2d31', wall: '#2c4a62', wallHi: '#4f7896', wallLo: '#13202a', void: '#06080b', checker: true,
  rock: '#6a6e78', rockHi: '#8e939e', rockLo: '#33363d', clay: '#b08a56', clayLo: '#6e5230', deco: 'market', decoCol: '#8a9099', dirt: '#3a3d42',
  rockStyle: 'shelf', urnStyle: 'box', eggStyle: 'carton', candleStyle: 'sign', tubes: true,
};
const STORY_RAVE = {
  name: 'Rizzmas', sub: 'Ik kijk op jou neer. Jij kijkt op naar mij. Als een soort idool.', rooms: 10, tier: 2, set: 'rave', boss: 'manu',
  dark: 0.8, darkClear: 0.5, venomSpeed: 166, hpMult: 1.45, light: 200,
  floor: '#151018', floor2: '#1b1420', grout: '#08060a', wall: '#1c1224', wallHi: '#4a2a5a', wallLo: '#0a060e', void: '#050307',
  rock: '#2a2a32', rockHi: '#4a4a56', rockLo: '#121216', clay: '#d8262e', clayLo: '#7a1218', deco: 'rave', decoCol: '#ff3ad8', dirt: '#2a2030',
  rockStyle: 'speaker', urnStyle: 'cups',
};
const STORY_COURT = {
  name: 'De Rechtbank', sub: 'Nee. Is te laat om terug te krabbelen nu.', rooms: 11, tier: 3, set: 'court', boss: 'rechter',
  dark: 0.66, darkClear: 0.36, venomSpeed: 176, hpMult: 1.7, light: 205,
  floor: '#5a3a24', floor2: '#4e321f', grout: '#24170d', wall: '#3a2a20', wallHi: '#6a4a34', wallLo: '#1a120c', void: '#080605',
  rock: '#6a4a30', rockHi: '#8a6a48', rockLo: '#2a1a10', clay: '#c8b48a', clayLo: '#7a6a4a', deco: 'court', decoCol: '#8a1a20', dirt: '#3a2a1c',
  rockStyle: 'bench', urnStyle: 'files',
};
const STORY2_LEVELS = [STORY_BUS, STORY_MALL, STORY_RAVE, STORY_COURT];
const STORY2_BOSS = {
  bus: { title: 'Lijn 34', sub: 'Bus gaat 34. 36 zelfs. 31 pas bus. Nobody knows.', name: 'LIJN 34' },
  tellie: { title: 'De Tellie', sub: 'Heb nog maar 8 procent. Moet ik een uur mee doen.', name: 'DE TELLIE' },
  manu: { title: 'DJ Manu-Beau', sub: 'He was a big guy with a big sound. At midnight he is a big worm.', name: 'DJ MANU-BEAU' },
  rechter: { title: 'De Kantonrechter', sub: 'He has read the whole chat. All of it. Twice.', name: 'DE KANTONRECHTER' },
};

/* ---- the script. alesen, senale, ouders (his parents), apple = you, cap = narration ---- */
const AL = (face, text, extra) => Object.assign({ who: 'alesen', face, text }, extra || {});
const SE = (face, text, extra) => Object.assign({ who: 'senale', face, text }, extra || {});
const OU = (text, extra) => Object.assign({ who: 'ouders', text }, extra || {});
const TXT = (from, msgs, seen) => ({ phone: { from, msgs, seen } });
const SCRIPT2 = {
  intro: [
    CAP('UTRECHT. 13 DECEMBER. 11:03 PM.', { bg: 'room', v: 'night' }),
    CAP('Alesen has one apple, one plan, and one best friend. Two of those are about to fall apart.'),
    CAP('His phone lights up.', TXT('Senale', ['word wel een spannende dag morgen he', 'heb je al een film uitgekozen'], 'Read 23:04')),
    AL('proud', 'i picked a film. WAHED. four stars. i booked the seats. i booked the bus. i planned the breathing'),
    CAP('Senale approves, in his own way.', TXT('Senale', ['oke', 'weg issie', 'oh ziek', '4 ster'], 'Read 23:41')),
    AL('proud', 'tomorrow is going to be perfect. nothing can go wrong. i have a spreadsheet'),
    CAP('Midnight. The phone buzzes again. Nothing good has ever buzzed at midnight.'),
    CAP('', TXT('Senale', ['haa die alex uh je gaat boos worden', 'maar morgen ga ik dus blijkbaar naar mn opa en oma', '(wist ik niet)'], 'Read 00:01')),
    AL('shout', 'BLIJKBAAR??? WIST IK NIET???'),
    CAP('', TXT('Senale', ['alsof ik er iets aan kan doen', 'mn ouders waren op een kerst diner uitje ding dus ze reageerde niet', 'ging er vanuit dat het kon zegmaar want normaal doe ik nooit wat'], 'Read 00:05')),
    AL('cry', 'the tickets. i paid with KAART GELD. do u know how much kaart geld that is'),
    CAP('', TXT('Senale', ['hoe duur was het', 'oh kaart geld', 'het is heel kut', 'sorry zeggen voor iets waar ik niks aan kan doen'], 'Read 00:42')),
    ME('(you are an apple in a fruit bowl. you did not ask to be in this group chat)'),
    CAP('Deep under Utrecht, something feeds on every pointless argument. Tonight it eats very, very well.'),
    AL('whisper', 'appel. little guy. you are my witness'),
    AL('normal', 'tomorrow he is at the station. at four. or five. "het is een inschatting"'),
    AL('shout', 'GO. find him in the hokkie. drag him to that film. KAULO KOUD OR NOT', { bg: 'hokkie', v: 'dusk' }),
    CAP('He puts you in his coat pocket. The pocket has a hole. The hole goes a lot further down than a pocket should.'),
  ],
  end0: [
    CAP('Lijn 34 is down. It was 34. Then 36. Then 31. Nobody knows. Nobody will ever know.', { bg: 'hokkie', v: 'dusk' }),
    CAP('The next day. 14:03.', TXT('Senale', ['Broo', '31 pas bus', 'Je zegt pak d3z3 bus', 'Wat de f***', 'Sinds wanneer was dat het plan'], 'Read 14:06')),
    AL('shout', 'I SAID PAK DEZE BUS AS A SUGGESTION. A VIBE. NOT AN ORDER'),
    SE('angry', 'Anders was ik blijven lopen met jou'),
    SE('angry', 'Slaat echt weer nergens op'),
    AL('cry', 'it was ALWAYS the plan. you could easily come along and get food here'),
    SE('normal', 'Hoezo ben ik dan nu alleen haha'),
    ME('(they are both alone. together. four meters apart. typing)'),
    SE('angry', 'Je was kut tegen me'),
    SE('normal', 'Ik skip de mac denk ik'),
    AL('whisper', 'he skips the mac. HE SKIPS THE MAC. appel. follow the smell of fries'),
    CAP('The argument is so loud the worms below Utrecht build a second floor. It smells like a supermarket that never closes.', { bg: 'mall', v: 'day' }),
  ],
  end1: [
    CAP('De Tellie dies at 0 percent. The screen goes black. A single tear of lithium.', { bg: 'mall', v: 'day' }),
    SE('sad', 'We hebben het tenminste wel leuk gehad he'),
    SE('proud', 'Kunnen veel mensen niet zeggen'),
    AL('proud', 'that is actually so true. we did have fun. apart from all of it'),
    CAP('', TXT('Senale', ['ik sta in utrecht', 'thank you'], 'Read 16:27')),
    CAP('Two days of silence. In friendship years that is about a decade.', { bg: 'room', v: 'day' }),
    CAP('17 December. 11:55.', TXT('Senale', ['Alek', 'Leven we nog', 'Ik heb groot nieuws voor als je er bent', 'Kommop bro je bent wwkkur'], 'Read 12:48')),
    AL('shout', 'BIG NEWS??'),
    CAP('', TXT('Senale', ['Nee niks', 'Hadden elkaar gewoon lang niet gesproken'], 'Read 12:49')),
    AL('shout', 'IT HAS BEEN TWO DAYS'),
    CAP('18 December.', TXT('Senale', ['Als je nu naar hoci komt kan ik je nog ff zien', 'Maar daar heb je niet veel aan denk ik', 'rizzmas'], 'Read 15:54')),
    AL('proud', 'rizzmas. a party. a DJ. appel. we are going and we are being NORMAL'),
    CAP('The party is in a basement. The basement goes a lot further down than a basement should. The DJ is a big guy. At midnight he will be a big worm. That is how Rizzmas works.', { bg: 'club', v: 'night' }),
  ],
  end2: [
    CAP('DJ Manu-Beau plays his last drop. The bass stops. Somebody turns on the big lights. Everybody looks terrible.', { bg: 'club', v: 'night' }),
    SE('proud', 'ik kijk op jou neer'),
    SE('proud', 'jij kijkt op naar mij'),
    SE('proud', 'als een soort idool'),
    AL('proud', 'smile. i am taking a picture. for the memories'),
    CAP('Flash. This is where it goes wrong.'),
    SE('angry', '***** op'),
    CAP('(The court has asked us not to repeat what Senale said. He said it twice.)'),
    SE('angry', 'je kan het ook niet sturen'),
    SE('angry', 'dat witte haar is wel erg'),
    AL('normal', 'erm?'),
    SE('angry', 'omdat je onverwachte ****** fotos maakt'),
    AL('cry', 'it was a GOOD picture'),
    SE('angry', 'er is ook geen kappersfail'),
    SE('angry', 'niemand zegt er iets van. niemand zag iets'),
    SE('normal', 'toen ik zei wat het was zeiden ze nee'),
    SE('normal', 'de foto is schuin'),
    ME('(the photo is, in fairness, a little schuin)'),
    SE('angry', 'ik wil jou voor 81 weken niet meer spreken en of zien'),
    AL('shout', '81 WEEKS?? THAT IS NOT EVEN A NORMAL NUMBER'),
    SE('normal', 'nee is te laat om terug te krabbelen nu'),
    SE('normal', 'ik spreek je in 2026 weer'),
    CAP('Then the doorbell rings. It is his parents. They brought a lawyer. The lawyer brought a folder. The folder says CURATELE.', { bg: 'court', v: 'day' }),
    OU('Senale has been "not knowing" things for nineteen years. We have asked the kantonrechter to step in.'),
    SE('sad', 'Ik wist het niet'),
    OU('We know you did not know. That is the whole case.'),
    AL('whisper', 'appel. this is a courtroom. you are exhibit A. act natural'),
    ME('(you are an apple with a sticker on it that says A. you have never been more natural)'),
  ],
  ending: [
    CAP('The kantonrechter falls. His gavel rolls across the floor. It still finds somebody guilty of something.', { bg: 'court', v: 'day' }),
    CAP('But a ruling is a ruling.', { tv: { head: 'UITSPRAAK', text: 'Senale is placed under curatele. His parents are his curators.', tick: 'the court thanks exhibit A, an apple   ·   the court thanks exhibit A, an apple   ·   the court thanks exhibit A, an apple' } }),
    OU('Senale. Phone. Charger. Coat. We are going to opa and oma.'),
    SE('sad', 'Mijn fout'),
    OU('Your phone is at 8 percent. Give it here. We will charge it for you. Forever.'),
    AL('cry', 'can i at least see him sometimes'),
    OU('In 81 weeks. We have put it in the calendar.'),
    CAP('81 WEEKS LATER.', { bg: 'room', v: 'day' }),
    CAP('2026.', TXT('Senale', ['Heftig', 'Wollah meh'], 'Read 11:00')),
    AL('normal', 'hey. can you send me back the kaart geld for the film. from 2024'),
    CAP('', TXT('Senale', ['ik ga je geen geld sturen'], 'Read 13:57')),
    CAP('He cannot. His parents hold his money. That is what curatele means. The kantonrechter explained it for forty minutes.'),
    AL('normal', 'is goed'),
    CAP('', TXT('Senale', ['goe', 'jou', 'ik ook', 'roy!!!', 'zo ben ik'], 'Read 00:13')),
    ME('(four floors of worms. one crooked photo. it was worth it. probably)'),
    CAP('THE END. SEE YOU IN 81 WEEKS.'),
  ],
};

/* the group chat while you play: A: is Alesen, S: is Senale */
const CHAT2 = {
  fightFirst: ['S:Ik ben er nu. Dus 3uh', 'A:i am IN the supermarket. where are u. WHERE ARE U', 'S:rizzmas', 'A:objection. OBJECTION. that worm is leading the witness'],
  fight: [
    ['S:Kaulo koud', 'S:Ik zit in dat hokkie dus dan weet je dat', 'S:Bus gaat 34', 'S:36 zelfs', 'S:Het is ook weer niet normaal koud', 'S:Niet als je net uit warme auto kruipt', 'S:En stil zit', 'A:which hokkie. there are FOUR hokkies', 'S:Jij komt er zo aan toch?'],
    ['S:Hoelang duurt de loop', 'S:Heb je goed gepland alex', 'S:Wat heb je besteld', 'S:Ben benieuwd alex', 'A:a kaasburger. od klassiek. i deserve it', 'S:Flinke trek', 'S:Doe je goed', 'S:Kommop. Ff leuk doen', 'S:Dus je laat me nu hangen'],
    ['S:ik zei het al', 'S:da kan je me nog ff zien', 'A:the DJ is a WORM. is nobody else seeing this', 'S:ben ik ook volgensmij hoor', 'S:klopt', 'A:i am being so normal right now', 'S:als een soort idool'],
    ['S:Ik dacht dat het moest', 'S:Niet duidelijk voor mij', 'A:your honour he took bus 31. THIRTY ONE', 'S:alsof ik er iets aan kan doen', 'A:i would like the photo entered as evidence', 'S:de foto is schuin', 'A:he said 81 weeks. in writing. EIGHTY ONE'],
  ],
  clear: ['S:Doe je goed', 'A:W. huge W. putting it in the spreadsheet', 'S:Zo he', 'A:that one was for the kaart geld', 'S:Ja precies', 'S:Haha daarom'],
  hurt: ['S:Dom', 'A:APPEL. the worms are not part of the plan', 'S:Mijn fout', 'A:do not let them bite u. that is ur whole job', 'S:Tering'],
  item: ['A:a powerup. finally something goes to plan', 'S:oh ziek', 'S:4 ster', 'A:upgrade. still a better plan than bus 31'],
  secret: ['A:why does it smell like a warm car in there', 'S:Wat dan'],
  rotHunt: ['S:Ik zie het. RUN'],
  boss: ['S:Bus gaat 34. 36 zelfs. 31 pas bus', 'S:Tellie is ook bijna leeg joh', 'A:the DJ. HE IS THE WORM. HE WAS ALWAYS THE WORM', 'A:all rise. except you appel. you roll'],
  bossDown: ['S:Ik dacht ik had geen keus', 'S:Heb nog maar 8 procent. Kutzooi', 'S:rizzmas is over', 'A:the court is adjourned. by an APPLE'],
  low: ['A:appel ur health is like his battery. 8 percent', 'S:Moet ik een uur mee doen'],
  challenge: ['A:a test. i love a test. i made a spreadsheet for this', 'S:Ben je er of niet'],
  offering: ['S:hoe duur was het', 'A:it costs a piece of you. like every plan with him'],
  goal: ['S:Wollah', 'A:CALCULATED'],
  pantry: ['A:snacks. eat. you look peeled'],
  dark: ['S:Ik zie het niet', 'A:who turned the lights off. the worms. it is always the worms'],
  elite: ['S:Heftig', 'A:that one is gold. like my plans used to be'],
  tetra: ['A:that worm is made of blocks. who planned this'], rocket: ['S:Wat de f***'], fuel: ['S:Niet als je net uit warme auto kruipt'],
  stok: ['A:a meerkat worm. it stands up and snitches. like his parents'],
  stroopw: ['S:Od klassiek', 'A:a stroopwafel worm. do not step in the syrup'],
  bril: ['A:that one wears glasses. it calculates where you will be. shoot the glasses'],
  handel: ['S:ik ga je geen geld sturen', 'A:that worm wants your coins. it is literally him in 2026'],
  pantser: ['A:armored. wait until it unrolls. like senale in the morning'],
  driekop: ['A:three heads. three opinions. still none of them knew'],
  sloper: ['A:it breaks the room. it breaks the plan. it breaks ME'],
  kameleon: ['A:where did it go. WHERE DID IT GO', 'S:niemand zag iets'],
  raver: ['S:rizzmas', 'A:tiny ravers. they dance on the beat. dodge on the beat'],
};
const DEATH2 = ['S:alsof ik er iets aan kan doen', 'A:appel?? APPEL?? ok. new apple. same plan', 'S:Mijn fout', 'S:Dom', 'A:that was not in the spreadsheet', 'S:Haha ik wist het niet'];
const NEWBIE9 = { stok: 1, stroopw: 1, bril: 1, handel: 1, pantser: 1, driekop: 1, sloper: 1, kameleon: 1, raver: 1 };

const STORIES9 = {
  lockdown: { id: 'lockdown', title: 'STOP DE LOCKDOWN', tag: 'Jensbabba has a plan.', blurb: 'Day 47 of the lockdown. Jensbabba read one post too many and now the worms are behind everything. Three chapters.', levels: STORY_LEVELS, script: SCRIPT, boss: STORY_BOSS, chat: CHAT_LINES, death: DEATH_LINES, deathWho: 'Jensbabba', winStat: 'storyWins', winText: ['The end?', 'Jensbabba is now staring at the bananas.', 'Play the story again'], speaker: 'jens' },
  curatele: { id: 'curatele', title: 'ONDER CURATELE', tag: 'Alesen and Senale argue about nothing.', blurb: 'One week of messages. One film, three buses, one crooked photo, one court case. Senale ends up in the hands of his parents. Four chapters.', levels: STORY2_LEVELS, script: SCRIPT2, boss: STORY2_BOSS, chat: CHAT2, death: DEATH2, deathWho: null, winStat: 'story2Wins', winText: ['See you in 81 weeks', 'Senale is under curatele. His parents hold the money. He still says roy.', 'Play the story again'], speaker: 'senale', needs: 'lockdown' },
};
const STORY_ORDER9 = ['lockdown', 'curatele'];
function curStory() { return STORIES9[G.storyId] || STORIES9.lockdown; }
function storyDone9(id) { return Meta.value(STORIES9[id].winStat) > 0; }
function storyOpen9(id) { const S = STORIES9[id]; return !S.needs || storyDone9(S.needs); }
function storyDeath9() {
  const S = curStory(), line = pick(S.death);
  const m = /^([AS]):(.*)$/.exec(line);
  if (m) return `${m[1] === 'A' ? 'Alesen' : 'Senale'}: "${m[2]}"`;
  return `${S.deathWho || 'Jensbabba'}: "${line}"`;
}
const WHO9 = { jens: 'JENSBABBA', apple: 'YOU (THE APPLE)', alesen: 'ALESEN', senale: 'SENALE', ouders: "SENALE'S PARENTS" };

// the voices of the second story
(() => {
  const blip0 = Sfx.blip;
  Sfx.blip = function (who) {
    if (who === 'alesen') this.tone(210 + Math.random() * 60, 0.05, { type: 'square', vol: 0.022, lp: 1500 });
    else if (who === 'senale') this.tone(300 + Math.random() * 70, 0.045, { type: 'triangle', vol: 0.026 });
    else if (who === 'ouders') this.tone(140 + Math.random() * 30, 0.06, { type: 'sine', vol: 0.03 });
    else blip0.call(this, who);
  };
})();

// in-game chat lines carry who said them
function chatWho9(text) {
  const m = /^([AS]):(.*)$/.exec(text);
  const who = m ? (m[1] === 'A' ? 'alesen' : 'senale') : 'jens';
  const nameEl = document.getElementById('chatName');
  if (nameEl) nameEl.textContent = WHO9[who];
  if (UI._chatWho !== who) { UI._chatWho = who; paintAvatar(UI.el.chatFace, who); }
  return m ? m[2] : text;
}

