// What happens when you touch things in the house.
(() => {
  const W = G.W, M = G.MAP;
  const pulse = (o, secs) => { o.on = true; clearTimeout(o._t); o._t = setTimeout(() => { o.on = false; }, secs * 1000); };
  const mid = f => [f.x + f.w / 2, f.y + f.h / 2];
  const puff = (f, ch, n = 4) => { const [x, y] = mid(f); W.puff(x, y - 0.5, ch, n, f.floor); };
  const FLOWERS = ['🌷', '🌻', '🌹', '🌸', '🌺', '🌼'];
  const SNACKS = ['🍪', '🥨', '🍎', '🍌', '🧃', '🥜', '🍿'];

  const ACT = {
    toilet: f => { pulse(f, 1.8); G.sfx.flush(); },
    sink: f => { pulse(f, 2.5); G.sfx.water(); },
    ksink: f => { pulse(f, 2.5); G.sfx.water(); },
    spigot: f => { pulse(f, 2.5); G.sfx.water(); },
    shower: f => { pulse(f, 4); G.sfx.rain(); setTimeout(G.sfx.rain, 1400); },
    tub: f => { f.on = !f.on; f.duck = f.on; if (f.on) { G.sfx.water(); for (let i = 0; i < 6; i++) setTimeout(G.sfx.bubble, 300 + i * 180); } else G.sfx.flush(); },
    washer: f => { pulse(f, 4); G.sfx.spin(); },
    dryer: f => { pulse(f, 4); G.sfx.spin(); },
    fridge: f => { f.on = !f.on; f.on ? G.sfx.open() : G.sfx.close(); },
    stove: f => { f.on = !f.on; if (f.on) G.sfx.sizzle(); else G.sfx.click(); },
    oven: f => { pulse(f, 3); G.sfx.chime(); },
    fire: f => { f.on = !f.on; if (f.on) { G.sfx.crackle(); setTimeout(G.sfx.crackle, 700); } else G.sfx.whoosh(); },
    island: f => { G.sfx.pop(); puff(f, '🍎', 2); },
    stool: f => { W.player.hopV = 6; G.sfx.boing(); },
    sit: f => { W.player.hopV = 5; G.sfx.pop(); puff(f, '☕', 1); },
    rocker: f => { pulse(f, 3); G.sfx.squeak(); },
    desk: f => { G.sfx.brush(); puff(f, G.pick(['✏️', '🖍️', '🌈', '⭐']), 3); },
    nook: f => { G.sfx.brush(); puff(f, G.pick(['✏️', '🖍️', '🌈', '🦄']), 3); },
    books: f => { G.sfx.tap(); puff(f, G.pick(['📖', '📕', '📗', '📘']), 2); },
    pantry: f => { G.sfx.pop(); puff(f, G.pick(SNACKS), 2); },
    shelf: f => { G.sfx.thump(); puff(f, '📦', 2); },
    heater: f => { G.sfx.click(); puff(f, '♨️', 2); },
    ac: f => { G.sfx.whoosh(); puff(f, '💨', 4); },
    bins: f => { G.sfx.thump(); },
    car: f => { pulse(f, 1); G.sfx.honk(); },
    bike: f => { G.sfx.chime(); puff(f, '🔔', 1); },
    rocket: f => { pulse(f, 2.2); G.sfx.whoosh(); puff(f, '⭐', 5); },
    doorbell: f => { pulse(f, 0.6); G.sfx.doorbell(); },
    flower: f => { pulse(f, 1); G.sfx.sparkle(); puff(f, '🌼', 3); },
    tree: f => { pulse(f, 0.7); G.sfx.whoosh(); puff(f, G.pick(['🍃', '🦋', '🍂']), 4); },
    mail: f => { pulse(f, 1.2); G.sfx.squeak(); },
    truck: f => { G.sfx.honk(); },
    town: f => { G.town.open(); },
    closet: f => { G.sfx.open(); G.costumes(); },
    closetBig: f => { G.sfx.sparkle(); puff(f, G.pick(['👒', '🎩', '👗', '👔', '🧣']), 4); },
    panel: f => { f.on = !f.on; G.sfx.click(); },
    opener: f => {
      const h = G.save.house; h.garageOpen = !h.garageOpen; G.persist(); G.sfx.motor(); W.rebuild();
      G.beep(G.T(h.garageOpen ? 'act.garageOpen' : 'act.garageShut'));
    },
    plant: f => {
      const h = G.save.house, st = h.flowers[f.id] || (h.flowers[f.id] = { stage: 0 });
      if (st.stage === 0) { st.stage = 1; G.sfx.pop(); puff(f, '🌱', 2); say('seed'); }
      else if (st.stage === 1) { st.stage = 2; st.kind = G.pick(FLOWERS); f.wet = true; setTimeout(() => { f.wet = false; }, 1500); G.sfx.water(); G.sfx.sparkle(); puff(f, st.kind, 4); say('bloom'); }
      else { G.sfx.sparkle(); puff(f, st.kind, 3); }
      G.persist();
      if (G.acts.gardenFull() && !G.P().done.gardenAll) { G.P().done.gardenAll = 1; G.persist(); setTimeout(() => { G.beep(G.T('act.gardenAll'), { queue: true }); W.celebrate(); }, 900); }
      G.Q.onGarden && G.Q.onGarden();
    },
  };
  // say a thing's line the first time this kid touches it
  function say(key) {
    const P = G.P(), k = 'say_' + key;
    if (P.done[k]) return false;
    if (!G.hasLine('act.' + key)) return false;
    const line = G.T('act.' + key);
    P.done[k] = 1; G.persist(); G.beep(line); return true;
  }
  G.acts = {
    gardenFull: () => ['pot1', 'pot2', 'pot3', 'pot4'].every(id => (G.save.house.flowers[id] || {}).stage >= 2),
    run(f) {
      if (G.Q.onAct && G.Q.onAct(f)) return;
      const fn = ACT[f.act]; if (fn) fn(f);
      // a tiny friend may be hiding here
      const P = G.P(), fr = G.FRIENDS.find(q => (q.fx === f.id || q.fx === f.t) && !P.glims[q.id]);
      if (fr && P.intro) {
        P.glims[fr.id] = 1; G.persist();
        const [x, y] = mid(f);
        W.puff(x, y - 1, fr.icon, 1, f.floor); W.puff(x, y - 0.5, '✨', 8, f.floor);
        W.addProp({ id: 'friend', floor: f.floor, x, y: y + 0.2, icon: fr.icon, size: 1.5, glow: 1, wiggle: 1 });
        setTimeout(() => W.removeProp('friend'), 4500);
        G.sfx.gift(); G.addStars(2, ...W.screenOf(W.player));
        const n = Object.keys(P.glims).length;
        G.beep(G.friendLine(fr)).then(() => { if (n === G.FRIENDS.length) { G.beep(G.T('allFriends')); G.confetti(80); G.Q.reward(); } });
        return;
      }
      if (!['plant', 'opener', 'town', 'closet'].includes(f.act)) say(f.act);
      else if (f.act === 'closet') say('closet');
    },
    // furniture and toys the kids placed
    item(it, roomId) {
      const d = G.ITEMS[it.t]; if (!d) return;
      if (G.Q.onItem && G.Q.onItem(it, roomId)) return;
      if (d.box) {
        const toys = Object.values(G.ITEMS).filter(q => q.cat === 'toys' && !q.box && G.hasItem(q.id));
        it.t = G.pick(toys).id; G.sfx.gift(); W.puff(it.x, it.y - 0.5, '🎉', 6); W.puff(it.x, it.y - 0.5, '✨', 6);
        if (!G.P().done.say_box) { G.P().done.say_box = 1; G.beep(G.T('boxPop')); }
        G.persist(); return;
      }
      if (d.sfx) { it.hop = 1; setTimeout(() => { it.hop = 0; }, 900); const n = G.rand(0, 7); d.sfx === 'note' ? G.sfx.note(n) : G.sfx[d.sfx](); return; }
      switch (d.tap) {
        case 'lamp': it.on = !it.on; G.sfx.click(); G.persist(); break;
        case 'tv': it.on = !it.on; G.sfx.click(); break;
        case 'chest': it.on = !it.on; it.on ? G.sfx.open() : G.sfx.close(); break;
        case 'piano': { pulse(it, 1.6); const s = G.rand(0, 4); [0, 2, 4, 2].forEach((n, i) => setTimeout(() => G.sfx.note(s + n), i * 260)); break; }
        case 'book': G.sfx.tap(); W.puff(it.x, it.y - 0.5, G.pick(['📖', '📕', '📗']), 2); break;
        case 'tent': G.sfx.squeak(); W.puff(it.x, it.y - 0.5, G.pick(['🙈', '👻', '😄']), 2); break;
        case 'sizzle': G.sfx.sizzle(); W.puff(it.x, it.y - 0.5, G.pick(['🍳', '🥞', '🍲']), 2); break;
        case 'art': G.sfx.brush(); W.puff(it.x, it.y - 0.5, G.pick(['🎨', '🌈', '🖌️']), 3); break;
        case 'train': G.sfx.honk(); W.puff(it.x, it.y - 0.5, '💨', 3); break;
        case 'bubble': for (let i = 0; i < 4; i++) setTimeout(G.sfx.bubble, i * 140); W.puff(it.x, it.y - 0.5, '🫧', 4); break;
        case 'pop': for (let i = 0; i < 3; i++) setTimeout(G.sfx.pop, i * 110); W.puff(it.x, it.y - 0.3, G.pick(['🔴', '🟡', '🟢', '🔵']), 5); W.player.hopV = 5; break;
        case 'dig': G.sfx.thump(); W.puff(it.x, it.y - 0.3, G.pick(['🏖️', '🐚', '⭐']), 3); break;
        case 'rock': pulse(it, 2.5); G.sfx.squeak(); break;
        case 'spin': pulse(it, 2); G.sfx.whoosh(); break;
        case 'slide': {
          // climb to the top, then whoosh down
          const q = G.itemRect(it), p = W.player, r = it.r || 0;
          const top = r === 0 ? [it.x, q[1] + 0.8] : r === 2 ? [it.x, q[3] - 0.8] : r === 1 ? [q[2] - 0.8, it.y] : [q[0] + 0.8, it.y];
          const bot = r === 0 ? [it.x, q[3] + 0.6] : r === 2 ? [it.x, q[1] - 0.6] : r === 1 ? [q[0] - 0.6, it.y] : [q[2] + 0.6, it.y];
          p.x = top[0]; p.y = top[1]; p.path = [M.nearestFree(p.floor, bot[0], bot[1], 5) || top]; p.then = () => { W.puff(p.x, p.y - 1, '⭐', 4); }; G.sfx.whoosh(); p.hopV = 3;
          break;
        }
      }
    },
  };
})();
