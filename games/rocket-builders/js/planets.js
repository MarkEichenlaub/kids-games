// The universe: every place you can fly to, and what happens when you land there.
G.WORLD = (function () {
  const W = {};
  const emojiDraw = (e, scale = 2) => (ctx, x, y, r, t) => { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t) * 0.2); ctx.font = `${r * scale}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e, 0, 0); ctx.restore(); };

  const real = [
    {
      id: 'sun', name: 'Sun', kind: 'star', x: 0, y: 0, r: 420, tier: 2, sticker: '☀️', mapColor: '#ffd23d',
      colors: ['#fff6b0', '#ffb000'], glow: 'rgba(255,190,40,.55)', isStar: true, face: true,
      draw: (ctx, x, y, r, t) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.1);
        ctx.fillStyle = 'rgba(255,200,60,.35)';
        for (let i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); ctx.beginPath(); ctx.moveTo(-r * 0.15, -r); ctx.lineTo(0, -r * (1.35 + 0.08 * Math.sin(t * 3 + i))); ctx.lineTo(r * 0.15, -r); ctx.fill(); }
        ctx.restore();
        G.art.drawPlanet(ctx, W.byId.sun, x, y, r, t);
      },
      hello: 'That\'s the Sun! It\'s a star, and it\'s super hot!',
      facts: ['The Sun is a star! It\'s the closest star to us.', 'The Sun is so big that about a million Earths could fit inside it!', 'Never look right at the Sun. It can hurt your eyes. We\'re wearing special space sunglasses! 😎'],
      activity: { type: 'tap', emoji: '🔥', n: 5, prompt: 'The Sun shoots out big loops of fire called flares! Tap them!' },
      sky: ['#ff7a00', '#ffd23d'], noGround: true, props: ['😎', '🔥', '☀️'], videos: [],
    },
    {
      id: 'mercury', name: 'Mercury', kind: 'planet', x: 1150, y: -420, r: 55, tier: 2, sticker: '🪨', colors: ['#d6cec6', '#8a7f76'], craters: true, orbitLine: true,
      hello: 'That\'s Mercury, the smallest planet!',
      facts: ['Mercury is the smallest planet, and the closest one to the Sun.', 'A year on Mercury is only 88 days! You would have a birthday four times every Earth year.', 'Mercury is covered with craters, just like our Moon.'],
      activity: { type: 'count', emoji: '🕳️', min: 3, max: 8, prompt: 'How many craters?' },
      sky: ['#1a1030', '#3a2a50'], ground: '#a39a92', props: ['🪨', '🕳️'], videos: ['joq-IUFNkrw'],
    },
    {
      id: 'venus', name: 'Venus', kind: 'planet', x: 1700, y: 650, r: 95, tier: 2, sticker: '🟡', colors: ['#fff0c0', '#e0a84a'], clouds: true, bands: ['#f5d58a', '#e8bb66', '#f5d58a'], orbitLine: true,
      hello: 'That\'s Venus! It\'s the hottest planet!',
      facts: ['Venus is the hottest planet. It\'s even hotter than Mercury!', 'Thick yellow clouds cover Venus like a giant blanket and keep the heat in.', 'Venus spins backwards, so the Sun comes up in the west!'],
      activity: { type: 'quiz', q: () => ({ prompt: 'Is Venus hot or cold?', choices: ['🔥', '🧊'], answer: '🔥', after: 'Hot! Hot enough to melt metal!' }) },
      sky: ['#e8a33a', '#ffe08a'], ground: '#c7803a', props: ['🌋', '🔥', '☁️'], videos: ['joq-IUFNkrw'],
    },
    {
      id: 'earth', name: 'Earth', kind: 'planet', x: 2800, y: -150, r: 120, tier: 1, sticker: '🌍', colors: ['#6fc3ff', '#1f5fbf'], land: '#4cb050', clouds: true, orbitLine: true,
      hello: 'That\'s Earth, our home!',
      facts: ['Earth is our home! It\'s the only planet where we know there is life.', 'Most of Earth is covered with water. That\'s why it looks blue from space!', 'Look down there! It\'s Little Forest, our blue house in the woods!'],
      activity: { type: 'deer' },
      sky: ['#6fc3ff', '#d6f0ff'], ground: '#63b85a', props: ['🌲', '🌳', '🌲', '🌼'], videos: ['joq-IUFNkrw'], home: true,
    },
    {
      id: 'moon', name: 'Moon', kind: 'moon', x: 0, y: 0, r: 34, tier: 1, sticker: '🌙', colors: ['#f4f4f4', '#9a9a9a'], craters: true, orbit: { around: 'earth', dist: 360, speed: 0.06, phase: 1 },
      hello: 'There\'s the Moon! Let\'s land on it!',
      facts: ['The Moon goes all the way around the Earth about once a month.', 'The Moon has no air, so astronauts need spacesuits to breathe.', 'Twelve astronauts have walked on the Moon. Their footprints are still there, because there\'s no wind to blow them away!'],
      activity: { type: 'jump' },
      sky: ['#000010', '#101030'], ground: '#cfcfcf', props: ['🪨', '🕳️', '🌍'], videos: ['w4wx_3XOrns'],
    },
    {
      id: 'iss', name: 'Space Station', kind: 'station', x: 0, y: 0, r: 30, tier: 1, sticker: '🛰️', mapColor: '#cfd8ff', orbit: { around: 'earth', dist: 210, speed: 0.35, phase: 0 },
      draw: (ctx, x, y, r, t) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(0.3);
        ctx.fillStyle = '#c9d1f5'; ctx.fillRect(-r * 1.6, -r * 0.08, r * 3.2, r * 0.16);
        ctx.fillStyle = '#e8ecff'; ctx.fillRect(-r * 0.35, -r * 0.3, r * 0.7, r * 0.6);
        ctx.fillStyle = '#3f78ff'; ctx.strokeStyle = '#ffd93d'; ctx.lineWidth = 1;
        [-1.5, -1.05, 0.6, 1.05].forEach(k => { ctx.fillRect(r * k, -r * 0.9, r * 0.4, r * 0.75); ctx.fillRect(r * k, r * 0.15, r * 0.4, r * 0.75); });
        ctx.restore();
      },
      hello: 'It\'s the International Space Station! Astronauts live there!',
      facts: ['The Space Station zooms all the way around the Earth every hour and a half!', 'Astronauts live here for months. They float all the time, so they do flips, just like in gymnastics!', 'They sleep in sleeping bags tied to the wall, so they don\'t float away. Space Shuttles helped build it!'],
      activity: { type: 'tap', emoji: ['🍎', '🪥', '🧸', '🧃', '🌮'], n: 5, float: true, prompt: 'Oh no, everything is floating away! Catch it!' },
      prize: ['fins-wing'], sky: ['#0b0a2a', '#1f3a7a'], noGround: true, inside: true, props: ['🧑‍🚀', '💻', '🔧'], videos: ['3bCoGC532p8', 'AZx0RIV0wss', 'UyFYgeE32f0', 'QyH1XscdhDs', '1OwmZYrTsGY'],
    },
    {
      id: 'jwst', name: 'Webb Telescope', kind: 'station', x: 3300, y: -1050, r: 50, tier: 2, sticker: '🔭', mapColor: '#ffcf4d',
      draw: (ctx, x, y, r, t) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 0.3) * 0.1);
        ctx.fillStyle = '#b48ad8'; ctx.beginPath(); ctx.moveTo(-r * 1.8, r * 0.6); ctx.lineTo(0, r * 0.2); ctx.lineTo(r * 1.8, r * 0.6); ctx.lineTo(0, r * 1.1); ctx.fill();
        ctx.fillStyle = '#ffcf4d'; ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 1.5;
        const hx = r * 0.28;
        [[0, 0], [1, 0], [-1, 0], [0.5, -0.87], [-0.5, -0.87], [0.5, 0.87], [-0.5, 0.87], [1.5, -0.87], [-1.5, -0.87], [1, -1.73], [-1, -1.73], [0, -1.73]].forEach(([a, b]) => {
          ctx.beginPath(); for (let i = 0; i < 6; i++) { const an = Math.PI / 3 * i + Math.PI / 6; ctx.lineTo(a * hx * 1.75 + Math.cos(an) * hx, b * hx * 1.75 - r * 0.2 + Math.sin(an) * hx); } ctx.closePath(); ctx.fill(); ctx.stroke();
        });
        ctx.restore();
      },
      hello: 'It\'s the James Webb Space Telescope! It has golden mirrors!',
      facts: ['This is the James Webb Space Telescope. It\'s a giant camera in space!', 'Its mirrors are covered with a thin layer of real gold.', 'It takes pictures of stars and galaxies so far away that their light has been traveling for billions of years.'],
      activity: { type: 'tap', emoji: ['🌌', '✨', '🌠'], n: 5, photo: true, prompt: 'Tap the galaxies to take their pictures!' },
      sky: ['#05031a', '#1d1150'], noGround: true, props: ['🔭', '📸', '🌌'], videos: [],
    },
    {
      id: 'mars', name: 'Mars', kind: 'planet', x: 4100, y: 800, r: 80, tier: 2, sticker: '🔴', colors: ['#ff9a6b', '#b8401c'], craters: true, spots: [[0, -0.88, 0.4, '#fff4f0', 0.35]], orbitLine: true,
      hello: 'That\'s Mars, the red planet!',
      facts: ['Mars is red because its dirt has rust in it!', 'Mars has the tallest volcano in the whole solar system. It\'s called Olympus Mons.', 'Robots called rovers drive around Mars and take pictures. A little helicopter even flew there!'],
      activity: { type: 'tap', emoji: '🪨', n: 6, prompt: 'Help the rover collect Mars rocks! Tap them!' },
      sky: ['#e8a07a', '#f5d0b0'], ground: '#c4552a', props: ['🌋', '🚙', '🪨', '🚁'], videos: ['4czjS9h4Fpg', 'wMnOo2zcjXA'],
    },
    {
      id: 'ceres', name: 'Ceres', kind: 'planet', x: 5600, y: -1900, r: 42, tier: 3, sticker: '🌑', colors: ['#c5bdb2', '#6e665d'], craters: true,
      hello: 'That\'s Ceres, the biggest thing in the asteroid belt!',
      facts: ['Between Mars and Jupiter there\'s a belt full of space rocks called asteroids.', 'Ceres is the biggest one. It\'s a dwarf planet!', 'Some asteroids are as small as a pebble, and some are as big as a city.'],
      activity: { type: 'count', emoji: '🪨', min: 4, max: 12, prompt: 'How many asteroids?' },
      sky: ['#0b0a2a', '#2b2050'], ground: '#8b8378', props: ['🪨', '🪨', '✨'], videos: [],
    },
    {
      id: 'jupiter', name: 'Jupiter', kind: 'planet', x: 7700, y: -1600, r: 280, tier: 3, sticker: '🟠', colors: ['#f3d9b1', '#c08b5c'], orbitLine: true,
      bands: ['#d9a066', '#f5e0c0', '#b9774a', '#f0d5a8', '#c98c5a', '#e8c9a0', '#b9774a'], spots: [[0.35, 0.3, 0.2, '#d0553a', 0.6]],
      hello: 'Wow, Jupiter! It\'s the biggest planet of all!',
      facts: ['Jupiter is the biggest planet. More than a thousand Earths could fit inside it!', 'See the red spot? It\'s a giant storm, and it\'s bigger than the whole Earth!', 'Jupiter has lots and lots of moons, more than ninety! We can\'t land here, because Jupiter is made of gas.'],
      activity: { type: 'count', emoji: '🌑', min: 4, max: 4, prompt: 'Jupiter\'s four biggest moons are Io, Europa, Ganymede, and Callisto. How many moons do you see?' },
      sky: ['#c98c5a', '#f3d9b1'], noGround: true, props: ['🌪️', '🌑'], videos: ['SeC22-94PMw'],
    },
    {
      id: 'saturn', name: 'Saturn', kind: 'planet', x: 10400, y: 2300, r: 230, tier: 4, sticker: '🪐', colors: ['#f7e3a8', '#c9a15a'], rings: '#e6cd96', bands: ['#e8cf8a', '#f7e3a8', '#d9b877', '#f2dca0'], orbitLine: true,
      hello: 'Look at those rings! That\'s Saturn!',
      facts: ['Saturn has beautiful rings made of chunks of ice and rock.', 'Saturn is so light that it would float in a gigantic bathtub!', 'Saturn\'s biggest moon, Titan, has lakes. But they aren\'t water!'],
      activity: { type: 'tap', emoji: '🧊', n: 7, prompt: 'The rings are made of ice! Tap the ice chunks!' },
      sky: ['#d9b877', '#fff3d0'], noGround: true, props: ['🧊', '🪐', '✨'], videos: ['SeC22-94PMw'],
    },
    {
      id: 'uranus', name: 'Uranus', kind: 'planet', x: 13300, y: -2700, r: 160, tier: 4, sticker: '🩵', colors: ['#d8fdff', '#5fc9d6'], rings: 'rgba(200,240,255,.55)', ringTilt: 1.35, orbitLine: true,
      hello: 'That\'s Uranus! It rolls around on its side!',
      facts: ['Uranus spins on its side, like a ball rolling across the floor!', 'It\'s an ice giant, and it\'s very, very cold.', 'It\'s blue-green because of a gas called methane.'],
      activity: { type: 'quiz', q: () => ({ prompt: 'Which planet rolls on its side?', choices: [{ html: '🔵↪️', v: 'u' }, { html: '🌍', v: 'e' }, { html: '🔴', v: 'm' }], answer: 'u', after: 'Uranus! Roll, roll, roll!' }) },
      sky: ['#5fc9d6', '#d8fdff'], noGround: true, props: ['❄️', '🧊'], videos: ['SeC22-94PMw'],
    },
    {
      id: 'neptune', name: 'Neptune', kind: 'planet', x: 15800, y: 2100, r: 155, tier: 5, sticker: '🔵', colors: ['#8fb6ff', '#2446c8'], spots: [[-0.2, 0.2, 0.18, '#1a2f8a', 0.6]], clouds: true, orbitLine: true,
      hello: 'That\'s Neptune, the farthest planet!',
      facts: ['Neptune is the farthest planet from the Sun.', 'It has the fastest winds in the whole solar system. Whoosh!', 'It takes Neptune 165 years to go around the Sun just once!'],
      activity: { type: 'quiz', q: () => ({ prompt: 'Which planet is farthest from the Sun?', choices: [{ html: '🔵 Neptune', v: 'n' }, { html: '🌍 Earth', v: 'e' }, { html: '🔴 Mars', v: 'm' }], answer: 'n', after: 'Neptune! It\'s so far away!' }) },
      sky: ['#2446c8', '#8fb6ff'], noGround: true, props: ['💨', '🌀'], videos: ['SeC22-94PMw'],
    },
    {
      id: 'pluto', name: 'Pluto', kind: 'planet', x: 18500, y: -800, r: 45, tier: 5, sticker: '🤍', colors: ['#f0e0d0', '#b09080'], heart: true, craters: true,
      hello: 'That\'s Pluto! Look, it has a heart on it!',
      facts: ['Pluto is a dwarf planet. It\'s even smaller than our Moon.', 'Pluto has a giant heart shape on it, made of ice!', 'A spacecraft called New Horizons flew past Pluto and took its picture.'],
      activity: { type: 'tap', emoji: '🤍', n: 5, prompt: 'Tap the icy hearts!' },
      sky: ['#101030', '#403050'], ground: '#e8d8c8', props: ['❄️', '🤍', '🏔️'], videos: [],
    },
    {
      id: 'voyager', name: 'Voyager 1', kind: 'probe', x: 21000, y: -4200, r: 40, tier: 5, sticker: '📡', mapColor: '#ffd93d',
      draw: (ctx, x, y, r, t) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(-0.5 + Math.sin(t * 0.4) * 0.05);
        ctx.strokeStyle = '#ccc'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r * 2.2, r * 0.4); ctx.moveTo(0, 0); ctx.lineTo(-r * 1.4, r * 1.2); ctx.stroke();
        ctx.fillStyle = '#eee'; ctx.beginPath(); ctx.ellipse(0, -r * 0.5, r, r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8a7a5a'; ctx.fillRect(-r * 0.4, -r * 0.3, r * 0.8, r * 0.6);
        ctx.fillStyle = '#ffcf4d'; ctx.beginPath(); ctx.arc(r * 0.1, 0, r * 0.22, 0, 7); ctx.fill();
        ctx.restore();
      },
      hello: 'That\'s Voyager 1! It\'s the farthest thing people ever made!',
      facts: ['Voyager 1 is the farthest thing people have ever sent into space.', 'It launched almost fifty years ago and it\'s still flying!', 'It carries a golden record with music, pictures, and hellos from Earth, in case aliens ever find it.'],
      activity: { type: 'tap', emoji: '🎵', n: 4, music: true, prompt: 'Play the golden record! Tap the music notes!' },
      sky: ['#05031a', '#1d1150'], noGround: true, props: ['📀', '🎵', '👋'], videos: [],
    },
    {
      id: 'blackhole', name: 'Black Hole', kind: 'blackhole', x: 23500, y: 5200, r: 170, tier: 5, sticker: '⚫', mapColor: '#6a2aa0',
      draw: (ctx, x, y, r, t) => {
        const g = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3); g.addColorStop(0, 'rgba(255,150,40,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, 7); ctx.fill();
        ctx.save(); ctx.translate(x, y);
        for (let i = 0; i < 3; i++) { ctx.rotate(t * (0.6 + i * 0.2)); ctx.strokeStyle = ['#ff9f43', '#ffd93d', '#ff4f9a'][i]; ctx.lineWidth = r * 0.12; ctx.beginPath(); ctx.ellipse(0, 0, r * (1.6 + i * 0.25), r * (0.5 + i * 0.08), 0.3, 0, Math.PI * 1.4); ctx.stroke(); }
        ctx.restore();
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, 7); ctx.fill();
      },
      hello: 'Uh oh, a black hole! It pulls on everything! Hold on!',
      facts: ['A black hole pulls so hard that not even light can get out. That\'s why it looks black!', 'Things swirl around it really fast, and they glow.', 'Don\'t worry! If it pulls us in, Beep\'s wormhole button will zoom us home.'],
      activity: { type: 'tap', emoji: '🌀', n: 4, prompt: 'Tap the swirls before they spin away!' },
      sky: ['#000000', '#2a0a3a'], noGround: true, props: ['🌀', '✨'], videos: [],
    },
    {
      id: 'galaxy', name: 'Swirly Galaxy', kind: 'galaxy', x: 27000, y: -7000, r: 420, tier: 5, sticker: '🌌', mapColor: '#c9a0ff',
      draw: (ctx, x, y, r, t) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.05);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.4); g.addColorStop(0, 'rgba(255,240,200,.9)'); g.addColorStop(1, 'rgba(255,200,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 0.4, 0, 7); ctx.fill();
        for (let arm = 0; arm < 3; arm++) for (let i = 0; i < 90; i++) {
          const k = i / 90, a = arm * 2.09 + k * 5, d = k * r;
          ctx.fillStyle = `hsla(${260 + k * 80},90%,${80 - k * 20}%,${1 - k * 0.6})`;
          ctx.beginPath(); ctx.arc(Math.cos(a) * d + Math.sin(i * 7) * 12, Math.sin(a) * d + Math.cos(i * 5) * 12, 2 + (1 - k) * 4, 0, 7); ctx.fill();
        }
        ctx.restore();
      },
      hello: 'Whoa! A whole galaxy, far, far away!',
      facts: ['A galaxy is a giant swirl of billions and billions of stars.', 'We live in a galaxy too! It\'s called the Milky Way.', 'Light from other galaxies takes millions of years to get to us.'],
      activity: { type: 'tap', emoji: '⭐', n: 8, prompt: 'Count the stars as you tap them!' },
      sky: ['#1a0a3a', '#6a2aa0'], noGround: true, props: ['🌌', '✨', '⭐'], videos: [],
    },
    // decorations: plain comets
    { id: 'comet1', decor: true, name: '', kind: 'comet', x: 0, y: 0, r: 22, tier: 9, moving: { cx: 3000, cy: -3500, rx: 6000, ry: 1600, speed: 0.03 }, draw: null },
    { id: 'comet2', decor: true, name: '', kind: 'comet', x: 0, y: 0, r: 18, tier: 9, moving: { cx: -3000, cy: 5000, rx: 5000, ry: 2600, speed: -0.025 }, draw: null },
  ];

  // comet drawing (tail always points away from the Sun)
  const cometDraw = (rainbow, rider) => (ctx, x, y, r, t) => {
    const pl = { x, y };
    const sunS = W._sunScreen || { x: x - 1, y: y };
    let dx = x - sunS.x, dy = y - sunS.y; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const L = r * 9;
    const grad = ctx.createLinearGradient(x, y, x + dx * L, y + dy * L);
    if (rainbow) { ['#ff5d5d', '#ff9f43', '#ffd93d', '#4cd97b', '#4d8dff', '#9b6bff'].forEach((c, i) => grad.addColorStop(i / 6, c)); grad.addColorStop(1, 'rgba(155,107,255,0)'); }
    else { grad.addColorStop(0, 'rgba(200,230,255,.9)'); grad.addColorStop(1, 'rgba(200,230,255,0)'); }
    ctx.fillStyle = grad; ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.moveTo(x - dy * r, y + dx * r); ctx.lineTo(x + dx * L - dy * r * 2.5, y + dy * L + dx * r * 2.5); ctx.lineTo(x + dx * L + dy * r * 2.5, y + dy * L - dx * r * 2.5); ctx.lineTo(x + dy * r, y - dx * r); ctx.fill();
    ctx.globalAlpha = 1;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 1.6); g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, 7); ctx.fill();
    if (rider) { ctx.font = `${r * 2.2}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(rider, x, y - r * 1.4); }
  };
  real.find(p => p.id === 'comet1').draw = cometDraw(false);
  real.find(p => p.id === 'comet2').draw = cometDraw(false);

  // family places get their drawings here
  const fam = G.FAMILY.places.map(p => Object.assign({}, p));
  fam.forEach(p => {
    if (p.id === 'unicorn-comet') p.draw = cometDraw(true, '🦄');
    if (p.emoji) p.draw = emojiDraw(p.emoji, 2.4);
    if (p.id === 'owl-nebula') p.draw = (ctx, x, y, r, t) => {
      for (let i = 0; i < 9; i++) {
        const a = i / 9 * Math.PI * 2 + t * 0.05, rr = r * (0.9 + 0.2 * Math.sin(t + i));
        const g = ctx.createRadialGradient(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.4, 0, x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.4, rr);
        g.addColorStop(0, i % 2 ? 'rgba(210,225,255,.35)' : 'rgba(170,150,255,.3)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.4, rr, 0, 7); ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.beginPath(); ctx.ellipse(x, y + r * 0.1, r * 0.75, r * 0.9, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - r * 0.65, y - r * 0.4); ctx.lineTo(x - r * 0.75, y - r * 0.95); ctx.lineTo(x - r * 0.3, y - r * 0.65); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + r * 0.65, y - r * 0.4); ctx.lineTo(x + r * 0.75, y - r * 0.95); ctx.lineTo(x + r * 0.3, y - r * 0.65); ctx.fill();
      const blink = (t % 4) > 3.85 ? 0.15 : 1;
      [[-1], [1]].forEach(([s]) => { ctx.fillStyle = '#ffd93d'; ctx.beginPath(); ctx.ellipse(x + s * r * 0.3, y - r * 0.25, r * 0.22, r * 0.22 * blink, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#2d2250'; ctx.beginPath(); ctx.ellipse(x + s * r * 0.3, y - r * 0.25, r * 0.1, r * 0.1 * blink, 0, 0, 7); ctx.fill(); });
      ctx.fillStyle = '#ff9f43'; ctx.beginPath(); ctx.moveTo(x - r * 0.08, y - r * 0.05); ctx.lineTo(x + r * 0.08, y - r * 0.05); ctx.lineTo(x, y + r * 0.12); ctx.fill();
      ctx.fillStyle = 'rgba(120,110,160,.5)'; [[-0.3, 0.3], [0.2, 0.4], [-0.1, 0.6], [0.35, 0.65], [-0.4, 0.55]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(x + a * r, y + b * r, r * 0.05, 0, 7); ctx.fill(); });
      ctx.fillStyle = '#fff'; for (let i = 0; i < 12; i++) { const a = i * 2.4, d = r * (1 + 0.3 * Math.sin(i)); ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3 + i); ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 3, 0, 7); ctx.fill(); } ctx.globalAlpha = 1;
    };
    if (p.id === 'lightcity') p.draw = (ctx, x, y, r, t) => {
      ctx.save(); ctx.translate(x, y);
      ctx.strokeStyle = '#8a93b8'; ctx.lineWidth = r * 0.14; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke();
      const cols = ['#ff4f9a', '#ffd93d', '#6ff0ff', '#4cd97b', '#9b6bff'];
      for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 + t * 0.2; ctx.fillStyle = cols[(i + Math.floor(t * 3)) % cols.length]; ctx.beginPath(); ctx.arc(Math.cos(a) * r, Math.sin(a) * r, r * 0.06, 0, 7); ctx.fill(); }
      [[-0.35, 0.9], [-0.1, 1.3], [0.15, 1.0], [0.38, 0.7]].forEach(([bx, h], i) => {
        ctx.fillStyle = '#1d2150'; ctx.fillRect(bx * r - r * 0.1, r * 0.35 - h * r * 0.6, r * 0.2, h * r * 0.6);
        for (let k = 0; k < 5; k++) { ctx.fillStyle = cols[(i + k + Math.floor(t * 2)) % cols.length]; ctx.fillRect(bx * r - r * 0.06, r * 0.35 - h * r * 0.6 + k * r * 0.1 + r * 0.04, r * 0.12, r * 0.05); }
      });
      ctx.fillStyle = '#ff4f9a'; ctx.beginPath(); ctx.arc(-r * 0.1, r * 0.35 - r * 0.78 - r * 0.08, r * 0.08, 0, 7); ctx.fill();
      ctx.restore();
    };
    if (p.id === 'icecream') p.draw = (ctx, x, y, r, t) => {
      G.art.drawPlanet(ctx, p, x, y, r, t);
      const sp = ['#ff4f9a', '#ffd93d', '#4d8dff', '#4cd97b', '#9b6bff'];
      for (let i = 0; i < 26; i++) { const a = i * 2.39, d = r * 0.85 * Math.sqrt((i + 1) / 26); ctx.save(); ctx.translate(x + Math.cos(a) * d, y + Math.sin(a) * d); ctx.rotate(i); ctx.fillStyle = sp[i % 5]; ctx.fillRect(-r * 0.05, -r * 0.015, r * 0.1, r * 0.03); ctx.restore(); }
      ctx.fillStyle = '#e8233c'; ctx.beginPath(); ctx.arc(x, y - r * 1.05, r * 0.16, 0, 7); ctx.fill();
      ctx.strokeStyle = '#3a8a2a'; ctx.lineWidth = r * 0.04; ctx.beginPath(); ctx.moveTo(x, y - r * 1.2); ctx.quadraticCurveTo(x + r * 0.1, y - r * 1.45, x + r * 0.25, y - r * 1.4); ctx.stroke();
    };
    if (p.id === 'cake') p.draw = (ctx, x, y, r, t) => {
      ctx.save();
      ctx.fillStyle = '#ffd6ec'; ctx.beginPath(); ctx.ellipse(x, y + r * 0.2, r, r * 0.75, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(x, y - r * 0.2, r, r * 0.4, 0, 0, 7); ctx.fill();
      for (let i = 0; i < 9; i++) { const dx = -r * 0.85 + i * r * 0.21; ctx.beginPath(); ctx.ellipse(x + dx, y + r * 0.05, r * 0.07, r * 0.18, 0, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#ff6fb1'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.85, y + r * 0.35 + Math.sin(a) * r * 0.5, r * 0.06, 0, 7); ctx.fill(); }
      const n = 8;
      for (let i = 0; i < n; i++) {
        const cx = x - r * 0.6 + i * r * 1.2 / (n - 1), cy = y - r * 0.25 + Math.sin(i) * r * 0.08;
        ctx.fillStyle = i < 5 ? '#9b6bff' : '#ff6fb1'; ctx.fillRect(cx - r * 0.035, cy - r * 0.35, r * 0.07, r * 0.35);
        ctx.fillStyle = '#ffd93d'; ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.42 + Math.sin(t * 10 + i) * r * 0.01, r * 0.05, r * 0.09, 0, 0, 7); ctx.fill();
      }
      ctx.restore();
    };
    if (p.id === 'star-train') p.draw = (ctx, x, y, r, t) => {
      const o = p.orbit, c = W.byId[o.around]; const ang = (t * o.speed + (o.phase || 0));
      ctx.font = `${r * 2}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const zoomK = r / p.r;
      ['🚃', '🚃', '🚃'].forEach((e, i) => { const a = ang - (i + 1) * 0.28; const cx = x + (Math.cos(a) - Math.cos(ang)) * o.dist * zoomK, cy = y + (Math.sin(a) - Math.sin(ang)) * o.dist * zoomK; ctx.fillText(e, cx, cy); });
      ctx.fillText('🚂', x, y);
    };
  });

  W.places = real.concat(fam.filter(p => !p.hidden));
  W.byId = {}; W.places.forEach(p => W.byId[p.id] = p);
  W.tiers = [0, 800, 2900, 6300, 11300, 40000];
  W.mapMax = 29000;
  W.nebulae = [
    { x: -4000, y: -3000, r: 3200, c: 'rgba(120,60,200,.2)' }, { x: 9000, y: 3500, r: 4200, c: 'rgba(255,80,160,.12)' },
    { x: 16000, y: -4500, r: 3800, c: 'rgba(60,160,255,.13)' }, { x: 3000, y: 4200, r: 2600, c: 'rgba(60,220,180,.1)' },
    { x: 24000, y: 2000, r: 5200, c: 'rgba(255,160,60,.1)' }, { x: 1300, y: -3600, r: 1200, c: 'rgba(180,200,255,.18)' },
  ];
  W.update = (t) => {
    W.places.forEach(p => {
      if (p.orbit) { const c = W.byId[p.orbit.around]; const a = t * p.orbit.speed + (p.orbit.phase || 0); p.x = c.x + Math.cos(a) * p.orbit.dist; p.y = c.y + Math.sin(a) * p.orbit.dist; }
      if (p.moving) { const m = p.moving, a = t * m.speed; p.x = m.cx + Math.cos(a) * m.rx; p.y = m.cy + Math.sin(a) * m.ry; }
    });
  };
  // nearest place you can reach and haven't visited yet
  W.suggest = (ship, power, prof) => {
    let best = null, bd = 1e9;
    W.places.forEach(p => { if (p.decor || p.tier > power || prof.visited[p.id]) return; const d = Math.hypot(p.x - ship.x, p.y - ship.y); if (d < bd) { bd = d; best = p; } });
    return best;
  };
  return W;
})();

// the comet tails need to know where the Sun is on screen
(function () {
  const orig = G.WORLD.byId.sun.draw;
  G.WORLD.byId.sun.draw = (ctx, x, y, r, t) => { G.WORLD._sunScreen = { x, y }; orig(ctx, x, y, r, t); };
})();

// ---------- landing on a place ----------
G.screens.visit = {
  enter(root, id) {
    const pl = G.WORLD.byId[id], p = G.P();
    const little = G.isLittle();
    const first = !p.visited[id];
    p.visited[id] = (p.visited[id] || 0) + 1; G.persist();
    const [sky1, sky2] = pl.sky || ['#0b0a2a', '#2b1f6b'];
    const ground = pl.noGround ? '' : `<div class="ground" style="background:linear-gradient(180deg, ${pl.ground || '#999'}, ${G.art.shade(pl.ground || '#999999', -0.25)})"></div>`;
    root.innerHTML = `<div class="visit">
      <div class="sky" style="background:linear-gradient(180deg, ${sky1}, ${sky2})"></div>
      ${/#0|#1|#2|#3|#4/.test(sky1.slice(0, 2)) ? G.starBg(60) : ''}
      <canvas class="big-body" width="600" height="600" style="position:absolute;right:-4%;top:10%;width:min(46vw,56vh);height:min(46vw,56vh);pointer-events:none;opacity:.95"></canvas>
      ${ground}
      <div class="props"></div>
      <div class="parked"></div>
      <div class="astro">${G.art.crewFor(p.rocket)[0].img ? `<img src="${G.art.crewFor(p.rocket)[0].img}" style="width:84px;height:84px;border-radius:50%;border:6px solid #fff;box-shadow:0 0 0 4px #c9d1f5">` : '🧑‍🚀'}</div>
      <div class="play"></div>
      <div class="visit-panel"><h2>${pl.sticker || ''} ${pl.name}</h2><div class="fact"></div>
        <div class="visit-actions">
          <button class="big-btn small blue" data-a="fact">➡️ Next fact</button>
          ${pl.activity ? '<button class="big-btn small pink" data-a="mission">🎯 Mission</button>' : ''}
          ${pl.videos && pl.videos.length ? '<button class="big-btn small" data-a="video">📺 Watch</button>' : ''}
          <button class="big-btn small green" data-a="fly">🚀 Blast off</button>
        </div></div>
    </div>`;
    G.topbar(root, { onBack: () => G.go('space', { at: id }), backIcon: '🚀' });
    G.showBeep(true, true); G.music(null);
    const S = this; S.alive = true; S.busy = false;
    // big view of the place
    const bc = root.querySelector('.big-body'), bctx = bc.getContext('2d');
    const drawBig = (t) => { bctx.clearRect(0, 0, 600, 600); const rr = pl.rings ? 120 : pl.kind === 'galaxy' || pl.kind === 'nebula' ? 170 : pl.kind === 'comet' ? 60 : 190; if (pl.kind === 'comet') G.WORLD._sunScreen = { x: 600, y: 600 }; if (pl.draw) pl.draw(bctx, 300, 300, rr, t); else G.art.drawPlanet(bctx, pl, 300, 300, rr, t); };
    const loop = (now) => { if (!S.alive) return; drawBig(now / 1000); S.raf = requestAnimationFrame(loop); };
    if (pl.noGround) S.raf = requestAnimationFrame(loop); else { bc.style.top = '14%'; bc.style.width = bc.style.height = 'min(26vw,30vh)'; bc.style.right = '4%'; drawBig(0); bc.style.opacity = '.0'; }
    // parked rocket
    const parked = root.querySelector('.parked');
    parked.innerHTML = G.art.rocket(p.rocket).svg;
    if (pl.noGround) { parked.style.bottom = '12%'; parked.style.transform = 'rotate(-12deg)'; }
    // props
    const props = root.querySelector('.props');
    (pl.props || []).forEach((e, i) => {
      const el = G.html(`<div class="prop" style="left:${28 + i * 17 + G.rand(-4, 4)}%;bottom:${pl.noGround ? 20 + G.rand(0, 40) : 22 + G.rand(0, 8)}%;font-size:${48 + G.rand(0, 30)}px">${e}</div>`);
      el.onclick = () => { G.sfx.boop(); el.style.transform = 'scale(1.4) rotate(15deg)'; setTimeout(() => el.style.transform = '', 300); };
      props.appendChild(el);
    });
    if (id === 'earth') G.visitExtras.littleForest(root);
    if (id === 'moon') { root.querySelector('.astro').style.transition = 'transform 1.4s cubic-bezier(.2,.8,.4,1)'; }
    // astronaut hop (low gravity on small worlds)
    const astro = root.querySelector('.astro');
    astro.onclick = () => { G.sfx.boop(); const h = pl.kind === 'moon' || (pl.r < 60) ? 260 : 60; astro.style.transform = `translateY(-${h}px)`; setTimeout(() => astro.style.transform = '', pl.kind === 'moon' ? 1400 : 400); };

    // facts
    let fi = 0;
    const factEl = root.querySelector('.fact');
    const showFact = () => { const f = pl.facts[fi % pl.facts.length]; factEl.textContent = f; G.beep(f); fi++; };
    const intro = first ? `We landed on ${pl.name}! ` : '';
    factEl.textContent = pl.facts[0];
    G.beep(intro + pl.facts[0]).then(() => { if (S.alive && first && pl.activity) setTimeout(() => { if (S.alive) root.querySelector('[data-a=mission]')?.classList.add('glow'); }, 200); });
    fi = 1;
    let missionDone = false;
    root.querySelectorAll('.visit-actions [data-a]').forEach(b => b.onclick = async () => {
      G.sfx.tap();
      const a = b.dataset.a;
      if (a === 'fact') showFact();
      if (a === 'video') G.playVideo(G.pick(pl.videos));
      if (a === 'fly') G.go('space', { at: id });
      if (a === 'mission') {
        b.classList.remove('glow');
        if (S.busy) return; S.busy = true;
        await G.visitExtras.run(root, pl, S);
        if (!S.alive) return;
        const logWord = G.PHONICS.placeWords[id];
        if (logWord && (!p.stickers[id] || Math.random() < 0.4)) await G.PHONICS.run({ word: logWord, intro: "Captain's log!", lines: [`Let's write in the captain's log! Today's word is ${logWord}.`, logWord] });
        S.busy = false;
        if (!S.alive) return;
        const firstMission = !p.stickers[id];
        p.stickers[id] = 1; G.persist();
        if (firstMission) {
          G.addStars(3);
          const pid = (pl.prize || []).find(x => !p.parts.includes(x));
          if (pid) {
            G.ch.givePart(pid);
            const act = await G.ch.showReward(root, pid, { title: `A present from ${pl.name}!`, again: false, doneLabel: '🚀 Keep exploring' });
            if (act === 'build') G.go('workshop', { highlight: pid });
            else root.querySelector('.reward')?.remove();
          } else {
            G.confetti(70); G.sfx.great();
            G.beep(`Mission complete! You got the ${pl.name} sticker for your sticker book!`);
            G.floatText(pl.sticker || '⭐', innerWidth / 2, innerHeight / 2);
          }
        } else { G.addStars(1); G.beep(C_PRAISE()); }
        missionDone = true;
      }
    });
    function C_PRAISE() { return G.ch.praise() + ' Mission complete again!'; }
  },
  leave() { this.alive = false; cancelAnimationFrame(this.raf); G.$$('.tap-target').forEach(e => e.remove()); },
};

// ---------- missions on planets ----------
G.visitExtras = (function () {
  const X = {};
  const numWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  const playArea = (root) => root.querySelector('.play');
  const inModal = (title) => { const m = G.modal(`<h2>${title}</h2><div class="ch-card" style="min-height:380px;box-shadow:none;margin:0"></div>`, { noClose: true }); return [m, m.querySelector('.ch-card')]; };

  // tap targets scattered on screen
  X.tap = (root, act, S) => new Promise(resolve => {
    const n = G.isLittle() ? Math.min(act.n, 5) : act.n;
    G.beep(act.prompt);
    let got = 0;
    const play = playArea(root);
    for (let i = 0; i < n; i++) {
      const e = Array.isArray(act.emoji) ? act.emoji[i % act.emoji.length] : act.emoji;
      const el = G.html(`<div class="tap-target" style="left:${10 + Math.random() * 75}%;top:${34 + Math.random() * 40}%;animation-delay:${i * 0.08}s">${e}</div>`);
      if (act.float) { el.style.transition = 'left 4s ease-in-out, top 4s ease-in-out'; const mv = () => { if (!el.isConnected || el.classList.contains('got')) return; el.style.left = 10 + Math.random() * 75 + '%'; el.style.top = 30 + Math.random() * 45 + '%'; setTimeout(mv, 4000); }; setTimeout(mv, 100); }
      el.onclick = () => {
        if (el.classList.contains('got')) return;
        el.classList.add('got'); got++;
        if (act.music) [523, 587, 659, 784, 880].slice(0, 3).forEach((f, k) => setTimeout(() => G.sfx.count(f / 30 - 10), k * 90));
        else G.sfx.chime();
        if (act.photo) { const fl = G.html('<div style="position:absolute;inset:0;background:#fff;z-index:95;transition:opacity .4s"></div>'); root.appendChild(fl); requestAnimationFrame(() => fl.style.opacity = 0); setTimeout(() => fl.remove(), 450); }
        G.say(String(got), { rate: 1.15 });
        setTimeout(() => el.remove(), 500);
        if (got === n) setTimeout(() => G.beep(`${n}! You got them all!`).then(() => resolve()), 500);
      };
      play.appendChild(el);
    }
  });

  X.count = async (root, act) => {
    const n = G.rand(act.min, G.isLittle() ? Math.min(act.max, 5) : act.max);
    const [m, card] = inModal('🔢 Count them!');
    await G.ch.ask(card, { prompt: act.prompt, visual: G.ch.objs(n, act.emoji), choices: G.shuffle([...new Set([n, n + 1, Math.max(1, n - 1), n + 2])]).slice(0, G.isLittle() ? 3 : 4).concat([]).filter((v, i, a) => a.indexOf(v) === i), answer: n });
    m.close();
  };
  // make sure count choices include the answer
  const origCount = X.count;
  X.count = async (root, act) => origCount(root, act);

  X.quiz = async (root, act) => {
    const q = act.q();
    const [m, card] = inModal('❓ Space question');
    await G.ch.ask(card, Object.assign({ visual: '' }, q));
    m.close();
  };

  // Moon: low-gravity jumps, then plant a flag
  X.jump = (root, act, S) => new Promise(resolve => {
    const astro = root.querySelector('.astro');
    let jumps = 0;
    G.beep('On the Moon, you can jump super high! Tap the astronaut to jump three times!');
    astro.style.animation = 'glow 1.2s infinite'; astro.style.borderRadius = '50%';
    const old = astro.onclick;
    astro.onclick = () => {
      old && old(); jumps++;
      G.say(String(jumps), { rate: 1.1 });
      if (jumps === 3) {
        astro.onclick = old; astro.style.animation = '';
        setTimeout(async () => {
          await G.beep('On the Moon, you can jump six times higher than on Earth! Now tap the ground to plant your flag!');
          const g = root.querySelector('.ground');
          const plant = (e) => {
            g.removeEventListener('click', plant);
            const flag = G.html(`<div style="position:absolute;left:${e.clientX - 20}px;top:${e.clientY - 90}px;font-size:80px;animation:pop .4s;z-index:4">🚩<div style="position:absolute;left:44px;top:12px;font-size:16px;font-weight:700;color:#fff;text-shadow:0 1px 3px #000">${G.kidName()}</div></div>`);
            root.appendChild(flag); G.sfx.great();
            G.beep(`${G.kidName()}'s flag is on the Moon!`).then(resolve);
          };
          g.addEventListener('click', plant);
        }, 1500);
      }
    };
  });

  // Earth: Little Forest, count the deer
  X.littleForest = (root) => {
    const house = G.html(`<svg viewBox="0 0 200 170" style="position:absolute;right:12%;bottom:24%;width:min(30vw,260px);z-index:1">
      <rect x="30" y="70" width="140" height="95" fill="#a7e3ff" stroke="#2d2250" stroke-width="4"/>
      <path d="M18 76 L100 14 L182 76 Z" fill="#6b7a99" stroke="#2d2250" stroke-width="4" stroke-linejoin="round"/>
      <rect x="86" y="110" width="30" height="55" fill="#fff" stroke="#2d2250" stroke-width="3"/><circle cx="110" cy="138" r="3" fill="#2d2250"/>
      <rect x="44" y="92" width="30" height="26" fill="#fff9c4" stroke="#2d2250" stroke-width="3"/><rect x="128" y="92" width="30" height="26" fill="#fff9c4" stroke="#2d2250" stroke-width="3"/>
      <rect x="24" y="155" width="152" height="10" fill="#8a6a4a" stroke="#2d2250" stroke-width="2"/>
      <text x="100" y="60" font-size="16" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" fill="#fff">Little Forest</text></svg>`);
    root.querySelector('.visit').appendChild(house);
  };
  X.deer = (root, act, S) => new Promise(resolve => {
    const n = G.isLittle() ? G.rand(2, 4) : G.rand(3, 7);
    G.beep('Deer are visiting Little Forest! Tap each deer to count them!');
    let got = 0;
    const play = playArea(root);
    for (let i = 0; i < n; i++) {
      const el = G.html(`<div class="tap-target" style="left:${6 + i * (70 / n) + Math.random() * 5}%;top:${60 + Math.random() * 14}%;font-size:64px">🦌</div>`);
      el.onclick = () => { if (el.dataset.c) return; el.dataset.c = 1; got++; el.style.filter = 'drop-shadow(0 0 12px #ffd93d)'; el.insertAdjacentHTML('beforeend', `<div style="position:absolute;top:-30px;left:20px;font-size:28px;font-weight:700;color:#fff;text-shadow:0 2px 4px #000">${got}</div>`); G.sfx.chime(); G.say(String(got)); if (got === n) setTimeout(() => G.beep(`${n} deer! Hi, deer!`).then(resolve), 400); };
      play.appendChild(el);
    }
  });

  // Ice Cream Planet: build a sundae
  X.sundae = (root) => new Promise(resolve => {
    const little = G.isLittle();
    const have = little ? 0 : G.rand(1, 4), target = little ? G.rand(2, 4) : have + G.rand(2, 5);
    const [m, card] = inModal('🍨 Make a sundae!');
    let n = have;
    card.innerHTML = `<div class="ch-prompt"><button class="say-btn">🔊</button><span>${little ? `Put ${target} scoops in the bowl!` : `The bowl has ${have}. Make it ${target} scoops!`}</span></div>
      <div class="sundae" style="display:flex;flex-direction:column-reverse;align-items:center;min-height:240px;font-size:56px;line-height:.8"></div>
      <div class="choices"><button class="choice" data-f="#ff9fce">🍓</button><button class="choice" data-f="#8b5a3c">🍫</button><button class="choice" data-f="#b7ffcb">🌿</button></div>`;
    const sd = card.querySelector('.sundae');
    const draw = () => { sd.innerHTML = '<div>🥣</div>' + Array.from({ length: n }, (_, i) => `<div style="width:80px;height:50px;border-radius:50%;background:${i < have ? '#fff3c4' : card.dataset['c' + i] || '#ff9fce'};border:3px solid #2d2250;margin-bottom:-14px"></div>`).join(''); };
    const say = () => G.beep(card.querySelector('.ch-prompt span').textContent);
    card.querySelector('.say-btn').onclick = say; say(); draw();
    card.querySelectorAll('.choice').forEach(b => b.onclick = async () => {
      if (n >= target) return;
      card.dataset['c' + n] = b.dataset.f; n++; draw(); G.sfx.pop(); G.say(String(n), { rate: 1.1 });
      if (n === target) {
        sd.insertAdjacentHTML('beforeend', '<div style="font-size:44px;animation:pop .4s">🍒</div>'); G.sfx.great();
        await G.wait(600);
        if (!little) await G.ch.ask(card, { prompt: `${have} + ? = ${target}`, say: `You had ${have} scoops and made ${target}. How many did you add?`, visual: '🍨', choices: G.shuffle([...new Set([target - have, target - have + 1, Math.max(1, target - have - 1), target])]).slice(0, 4), answer: target - have });
        else await G.beep(`${target} scoops! Yum yum!`);
        m.close(); resolve();
      }
    });
  });

  // Light City: Chinese words with Nini the alien
  X.chinese = async (root) => {
    const words = G.shuffle(G.FAMILY.chinese).slice(0, 3);
    const [m, card] = inModal('🐙 Nini teaches Chinese!');
    for (const w of words) {
      card.innerHTML = `<div style="font-size:110px">${w.e}</div><div style="font-size:80px;font-weight:700">${w.zh}</div><div style="font-size:34px">${w.py}</div><div style="font-size:26px;color:#6b5a99">${w.en}</div><button class="big-btn blue">🔊 Say it again</button>`;
      const speak = async () => { await G.say(w.zh, { lang: 'zh-CN', rate: 0.8 }); await G.beep(`${w.py} means ${w.en}!`); };
      card.querySelector('button').onclick = speak;
      await speak(); await G.wait(900);
    }
    const w = G.pick(words);
    await G.ch.ask(card, { prompt: `Which one is ${w.py}?`, say: `Which one is ${w.py}?`, visual: `<div style="font-size:60px">${w.zh}</div>`, choices: G.shuffle(words.map(x => ({ html: x.e, v: x.en }))), answer: w.en, after: `Yes! ${w.py}! Xièxie! That means thank you!` });
    m.close();
  };

  // Orange Moon: stack oranges into triangles (triangle numbers)
  X.triangle = (root) => new Promise(resolve => {
    const little = G.isLittle();
    const rows = little ? 3 : 4;
    const [m, card] = inModal('🍊 Orange triangles');
    let placed = 0; const total = rows * (rows + 1) / 2;
    card.innerHTML = `<div class="ch-prompt"><button class="say-btn">🔊</button><span>Tap to stack the oranges!</span></div><div class="tri" style="display:flex;flex-direction:column-reverse;align-items:center;gap:0;min-height:260px;font-size:54px"></div><div style="font-size:30px;font-weight:700" class="tri-n"></div><button class="big-btn">🍊 Add an orange</button>`;
    const tri = card.querySelector('.tri');
    const draw = () => {
      tri.innerHTML = ''; let k = 0;
      for (let r = rows; r >= 1; r--) { let s = ''; for (let i = 0; i < r; i++) { s += `<span style="opacity:${k < placed ? 1 : 0.15}">🍊</span>`; k++; } tri.insertAdjacentHTML('beforeend', `<div style="line-height:1">${s}</div>`); }
      card.querySelector('.tri-n').textContent = placed ? placed + ' oranges' : '';
    };
    const say = () => G.beep('Stack the oranges into a triangle! Tap the button to add one.');
    card.querySelector('.say-btn').onclick = say; say(); draw();
    card.querySelector('.big-btn').onclick = async () => {
      if (placed >= total) return;
      placed++; draw(); G.sfx.pop(); G.say(String(placed), { rate: 1.15 });
      const rowEnds = []; let acc = 0; for (let r = rows; r >= 1; r--) { acc += r; rowEnds.push(acc); }
      if (placed === total) {
        G.sfx.great();
        await G.wait(500);
        if (little) { await G.beep(`${total} oranges make a triangle! Yay!`); }
        else {
          await G.beep('Triangle numbers go 1, 3, 6, 10!');
          await G.ch.ask(card, { prompt: 'How many oranges for 5 rows?', say: 'Four rows took ten oranges. How many oranges would five rows take?', visual: '🍊'.repeat(5), choices: G.shuffle([15, 14, 11, 16]), answer: 15, hint: 'Ten oranges, plus a new bottom row of five!' });
        }
        m.close(); resolve();
      }
    };
  });

  // Birthday Cake Planet: light the candles
  X.candles = (root) => new Promise(resolve => {
    const little = G.isLittle();
    const [m, card] = inModal('🎂 Birthday candles');
    const kids = G.FAMILY.kids;
    const me = G.FAMILY.kid(G.P().id) || kids[0];
    const n = little ? me.age : kids[0].age + kids[1].age;
    let lit = 0;
    card.innerHTML = `<div class="ch-prompt"><button class="say-btn">🔊</button><span>${little ? `${me.name} is ${me.age}! Light ${me.age} candles!` : `Mira is ${kids[0].age} and Maia is ${kids[1].age}. Light a candle for every year!`}</span></div>
      <div class="cands" style="display:flex;gap:8px;font-size:40px;min-height:80px;align-items:flex-end"></div><div style="font-size:120px;line-height:1">🎂</div><div class="tri-n" style="font-size:28px;font-weight:700"></div>`;
    const cands = card.querySelector('.cands');
    for (let i = 0; i < n; i++) {
      const c = G.html(`<button style="background:none;font-size:44px;display:flex;flex-direction:column;align-items:center;line-height:.9"><span class="fl" style="visibility:hidden">🔥</span><span style="display:inline-block;width:14px;height:50px;border-radius:4px;background:${!little && i >= kids[0].age ? '#ff6fb1' : '#9b6bff'}"></span></button>`);
      c.onclick = () => { if (c.dataset.l) return; c.dataset.l = 1; c.querySelector('.fl').style.visibility = 'visible'; lit++; G.sfx.chime(); G.say(String(lit)); card.querySelector('.tri-n').textContent = lit; if (lit === n) done(); };
      cands.appendChild(c);
    }
    const say = () => G.beep(card.querySelector('.ch-prompt span').textContent);
    card.querySelector('.say-btn').onclick = say; say();
    const done = async () => {
      await G.wait(500);
      if (!little) await G.ch.ask(card, { prompt: '5 + 3 = ?', say: 'Five purple candles for Mira, and three pink candles for Maia. How many candles in all?', visual: '🎂', choices: G.shuffle([8, 7, 9, 53]), answer: 8 });
      await G.beep('Now make a wish and blow them out! Happy birthday!'); G.confetti(90);
      cands.querySelectorAll('.fl').forEach(f => f.style.visibility = 'hidden');
      await G.wait(900); m.close(); resolve();
    };
  });

  // Star Train: which car number is missing?
  X.train = async (root) => {
    const little = G.isLittle();
    const [m, card] = inModal('🚂 The Star Train');
    if (little) {
      const n = G.rand(2, 5);
      await G.ch.ask(card, { prompt: 'How many train cars?', visual: '🚂' + '🚃'.repeat(n), choices: G.shuffle([n, n + 1, n - 1 || 6]), answer: n });
    } else {
      const step = G.pick([1, 1, 2, 5, 10]), start = step === 1 ? G.rand(1, 12) : step;
      const nums = Array.from({ length: 5 }, (_, i) => start + i * step), hole = G.rand(1, 3);
      const vis = '🚂' + nums.map((v, i) => `<span style="display:inline-flex;flex-direction:column;align-items:center">🚃<b style="font-size:22px">${i === hole ? '?' : v}</b></span>`).join('');
      await G.ch.ask(card, { prompt: 'Which number is missing?', say: 'Some train car numbers fell off! Which number is missing?', visual: `<div style="display:flex;align-items:flex-start">${vis}</div>`, choices: G.shuffle([...new Set([nums[hole], nums[hole] + 1, nums[hole] - 1, nums[hole] + step])]).slice(0, 4), answer: nums[hole] });
    }
    await G.beep('Choo choo! Thanks for fixing the train!');
    m.close();
  };

  X.run = (root, pl, S) => {
    const act = pl.activity || {};
    const fn = X[act.type];
    if (!fn) return Promise.resolve();
    return fn(root, act, S);
  };
  return X;
})();
