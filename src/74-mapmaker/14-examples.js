/* 74.js section 14: examples. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. @chunk maker */
(function (M74) {
  'use strict';
  const { EMPTY, MK, safe } = M74;
  M74.EXAMPLES = EXAMPLES;
  /* ================================================================== 9. three maps to start from */
  const E_ = (t, c, r, p) => Object.assign({ t, c, r }, p || {});
  const SN = (k, c, r, g, tr) => ({ t: 'sn', c, r, k, g: g ? 1 : 0, tr: tr || '' });
  const RM = (x, y, t, rows, e, extra) => Object.assign({ x, y, t, g: rows ? rows.join('') : EMPTY, e: e || [] }, extra || {});
  let EXCACHE = null;
  function EXAMPLES() {
    if (EXCACHE) return EXCACHE;
    const chestT = TPL.chest, vaultT = TPL.vault, shopT = TPL.shop;
    const raw = [
      {
        id: 'expinball', name: 'Pinball Cellar', author: 'Bitten', desc: 'Bumpers, powder kegs and a fire bar in the corridor. The Grub Mother waits at the end. Same as always.',
        floors: [{
          name: 'Flipperkelder', sub: 'Everything bounces down here. You too.', set: 'cellar', boss: 'auto', dark: -1, rooms: [
            RM(4, 4, 'start', ['c.........c', '...........', '...........', '...........', '...........', '...........', '...........', '.#.......#.', 'c.........c'],
              [E_('sg', 3, 6, { txt: 'Bumpers kick, kegs blow, the fire bar does not care. The lair is west.' }), E_('cn', 8, 2, { n: 3 })]),
            RM(4, 3, 'fight', ['#.........#', '...........', '...........', '...........', '...........', '...........', '...........', '...........', '#.........#'],
              [E_('bm', 2, 2, { st: 0 }), E_('bm', 8, 2, { st: 1 }), E_('bm', 5, 4, { st: 2 }), E_('bm', 2, 6, { st: 1 }), E_('bm', 8, 6, { st: 0 }),
                SN('grub', 3, 4), SN('grub', 7, 4), SN('hood', 5, 2), SN('splitter', 5, 6, 1)]),
            RM(5, 3, 'chest', chestT, [E_('cn', 2, 4, { n: 5 })]),
            RM(4, 5, 'fight', ['...........', '.u.......u.', '...........', '...#...#...', '...........', '...#...#...', '...........', '.u.......u.', '...........'],
              [E_('bx', 4, 2), E_('bx', 6, 2), E_('bx', 2, 6), E_('bx', 8, 6), E_('bx', 5, 4), SN('grub', 3, 2), SN('grub', 7, 2), SN('grub', 3, 6), SN('grub', 7, 6), SN('hood', 5, 6)]),
            RM(3, 4, 'hall', ['HHHHHHHHHHH', 'HHHHHHHHHHH', '...........', '...........', '...........', '...........', '...........', 'HHHHHHHHHHH', 'HHHHHHHHHHH'],
              [E_('fb', 3, 4, { n: 3, s: 1, w: 1, a: 0 }), E_('fb', 7, 4, { n: 3, s: 2, w: -1, a: 4 }), E_('cn', 5, 2, { n: 5 }), E_('sg', 9, 2, { txt: 'Time it. The bars do not stop for anybody.' })]),
            RM(2, 4, 'boss', ['c.........c', '...........', '...........', '...........', '...........', '...........', '...........', '...........', 'c.........c']),
          ],
        }],
      },
      {
        id: 'exgates', name: 'Levers and Gates', author: 'Bitten', desc: 'Pull a lever, a gate opens somewhere. A key, a vault and a pad back to the start. The Lamprey Queen sits behind the blue gates.',
        floors: [{
          name: 'De Sluis', sub: 'Everything here opens. Eventually.', set: 'halls', boss: 'auto', dark: -1, rooms: [
            RM(4, 4, 'start', ['...........', '.#.......#.', '...........', '...........', '...........', '...........', '...........', '.#.......#.', '...........'],
              [E_('lv', 2, 4, { ch: 0 }), E_('gt', 10, 4, { ch: 0, o: 0 }), E_('gt', 10, 3, { ch: 0, o: 0 }), E_('gt', 10, 5, { ch: 0, o: 0 }), E_('tp', 8, 2, { ch: 2 }),
                E_('sg', 3, 6, { txt: 'Red lever, red gates. Shoot it or walk into it. The green pad is a way back, later.' })]),
            RM(5, 4, 'fight', ['...........', '...........', '...........', '.##.....##.', '...........', '.##.....##.', '...........', '...........', '...........'],
              [E_('sw', 2, 1, { ax: 'h', s: 2 }), E_('sw', 8, 7, { ax: 'h', s: 1 }), E_('tt', 5, 8, { d: 6, s: 2, on: 'f', b: 1 }), E_('ky', 9, 6),
                SN('grub', 3, 6), SN('grub', 7, 6), SN('sniper', 8, 2), SN('hood', 2, 2), SN('lamprey', 5, 4, 1)]),
            RM(5, 3, 'vault', vaultT),
            RM(6, 4, 'hall', ['...........', '.c.......c.', '...........', '...........', '...........', '...........', '...........', '.c.......c.', '...........'],
              [E_('lv', 8, 6, { ch: 1 }), E_('gt', 10, 3, { ch: 1, o: 0 }), E_('gt', 10, 4, { ch: 1, o: 0 }), E_('gt', 10, 5, { ch: 1, o: 0 }), E_('tp', 8, 2, { ch: 2 }),
                E_('sg', 2, 6, { txt: 'Blue opens the lair. The vault up north wants the key from the saw room.' })]),
            RM(7, 4, 'boss'),
          ],
        }],
      },
      {
        id: 'exsaws', name: 'The Saw Mill', author: 'Bitten', desc: 'Nests, acid, saws and a floor that gives way. No lair, a hatch. Mind your step.',
        rules: { co: 15 },
        floors: [{
          name: 'Zaagmolen', sub: 'Open late. The machines never stop.', set: 'market', boss: 'auto', dark: -1, rooms: [
            RM(3, 4, 'start', ['...........', '.##.....##.', '...........', '...........', '...........', '...........', '...........', '.##.....##.', '...........'],
              [E_('sp', 6, 4, { d: 0 }), E_('sp', 7, 4, { d: 0 }), E_('sp', 8, 4, { d: 0 }), E_('sp', 9, 4, { d: 0 }),
                E_('sg', 3, 6, { txt: 'No lair on this floor. Find the hatch. Mind the floor, it is old.' })]),
            RM(4, 4, 'fight', ['u.........u', '...........', '...........', '...........', '...........', '...........', '...........', '...........', 'u.........u'],
              [E_('ns', 8, 2, { k: 'grub', n: 3, s: 2 }), E_('ns', 2, 6, { k: 'bonus', n: 1, s: 1 }), E_('ac', 4, 3), E_('ac', 5, 3), E_('ac', 6, 3), E_('ac', 4, 5), E_('ac', 5, 5), E_('ac', 6, 5),
                SN('discount', 8, 6)]),
            RM(4, 5, 'shop', shopT, [], { st: 'yellow' }),
            RM(5, 4, 'hall', ['HHHHHHHHHHH', 'HHHHHHHHHHH', '...........', '...........', '...........', '...........', '...........', 'HHHHHHHHHHH', 'HHHHHHHHHHH'],
              [E_('wk', 2, 3), E_('wk', 3, 3), E_('wk', 4, 3), E_('wk', 6, 3), E_('wk', 7, 3), E_('wk', 8, 3), E_('wk', 2, 5), E_('wk', 3, 5), E_('wk', 4, 5), E_('wk', 6, 5), E_('wk', 7, 5), E_('wk', 8, 5),
                E_('sw', 5, 2, { ax: 'v', s: 2 }), E_('jp', 1, 4, { d: 0, f: 1 }), E_('pd', 9, 2, { id: 'rand', c: 10 }), E_('cn', 9, 6, { n: 3 })]),
            RM(6, 4, 'fight', ['...........', '.#.......#.', '...........', '...........', '...........', '...........', '...........', '.#.......#.', '...........'],
              [E_('fb', 5, 4, { n: 4, s: 1, w: 1, a: 6 }), E_('ex', 9, 4), E_('tt', 1, 1, { d: 8, s: 1, on: 'f', b: 1 }), SN('rocket', 5, 2), SN('stroopw', 8, 6), SN('grub', 2, 6)]),
          ],
        }],
      },
      {
        id: 'extalk', name: 'Small Talk', author: 'Bitten', desc: 'A cellar that will not shut up. Notes, a shrine with a deal, a plate that opens the lair, and snakes with something to say.',
        it: 'Somebody built this place to talk at you. Read the notes, answer the shrine, stand on the plate. Or skip all of it and find out the hard way.',
        ot: 'You read everything. Nobody reads everything.',
        floors: [{
          name: 'Kletskelder', sub: 'The walls have opinions.', set: 'cellar', boss: 'auto', dark: -1,
          it: 'Floor one. Damp, loud, full of notes from the last guy. He did not make it, but his handwriting did.',
          rooms: [
            RM(4, 4, 'start', ['c.........c', '...........', '...........', '...........', '...........', '...........', '...........', '...........', 'c.........c'],
              [E_('tx', 5, 2, { txt: 'WELCOME', sz: 3, cl: 2, fx: 2 }), E_('tx', 5, 3, { txt: 'mind the snakes', sz: 1, cl: 0, fx: 0 }),
                E_('nt', 3, 5, { ti: 'Jens', txt: 'yo where r u | the cellar thing started without u | dont touch the shrine. or do. idk', ty: 3, on: 'o' }),
                E_('nt', 7, 5, { ti: 'House rules', txt: 'Notes stop the game while you read. The gold thing east asks a question. The plate east opens the lair. North is a fight with a lot to say.', ty: 0, on: 'a' })],
              { ie: 'The door locks behind you. Classic.' }),
            RM(4, 3, 'fight', ['#.........#', '...........', '..u.....u..', '...........', '...........', '...........', '..u.....u..', '...........', '#.........#'],
              [SN('grub', 3, 3), SN('grub', 7, 3), Object.assign(SN('hood', 5, 2), { say: 'Oh. A visitor. We do not get visitors.', die: 'Fair enough.' }),
                Object.assign(SN('splitter', 5, 5), { say: 'Two of us, soon.', die: 'Told you.' }),
                E_('sh', 5, 7, { txt: 'Quiet now', s: 'They did warn you. Several times.', on: 'c', st: 'legend' }),
                E_('tx', 5, 4, { txt: 'NO TALKING', sz: 2, cl: 1, fx: 3 })],
              { ic: 'Well. That settles the conversation.' }),
            RM(5, 4, 'hall', ['HHH.....HHH', '.........H.', '.........H.', '...........', '...........', '...........', '.........H.', '.........H.', 'HHH.....HHH'],
              [E_('cq', 5, 2, { ti: 'The shrine', txt: 'It wants an apple. It offers something shiny. It does not do refunds.', a: 'Pay an apple', ae: 'deal', b: 'Keep walking', be: 'none', ch: 1, hd: 0 }),
                E_('pl', 2, 2, { ch: 1, m: 't' }), E_('tx', 2, 3, { txt: 'STEP', sz: 1, cl: 4, fx: 1 }),
                E_('gt', 9, 3, { ch: 1, o: 0 }), E_('gt', 9, 4, { ch: 1, o: 0 }), E_('gt', 9, 5, { ch: 1, o: 0 }),
                E_('nt', 7, 6, { ti: 'Careful', txt: 'The lair is behind the bars. The plate in the corner flips them. Step on it again and they shut. Do not do that.', ty: 1, on: 'o' }),
                E_('sh', 5, 7, { txt: 'Decisions', s: 'One shrine, one plate, no refunds.', on: 'e', st: '' })],
              { ie: 'A shrine, a plate, a row of bars. Somebody planned this.' }),
            RM(6, 4, 'boss', null, [], { ie: 'The last room. It has been waiting all day and it is not happy about it.' }),
            RM(3, 4, 'chest', chestT, [E_('nt', 5, 6, { ti: 'Page 14', txt: 'The chest is real. I checked. Probably. The last chest was not, and that is why this page is torn.', ty: 2, on: 'o' })]),
          ],
        }],
      },
    ];
    EXCACHE = raw.map((m) => { const M = safe(() => M74.cleanMap(m)); if (M) M.id = m.id; return M; }).filter(Boolean);
    return EXCACHE;
  }
  MK.EXAMPLES = EXAMPLES;

})(window.__bitten.M74 || (window.__bitten.M74 = {}));
