// Family details: who plays, and the hidden places in space made just for Mira and Maia.
G.FAMILY = {
  kids: [
    { id: 'mira', name: 'Mira', face: '👧', color: '#9b6bff', little: false, age: 5,sis: 'Maia', blurb: 'Big rocket builder' },
    { id: 'maia', name: 'Maia', face: '👧', color: '#ff6fb1', little: true, age: 3,sis: 'Mira', blurb: 'Little rocket builder' },
  ],
  kid(id) { return this.kids.find(k => k.id === id); },
  // true on (or the week after) a kid's birthday
  birthdayNow(id) {
    // birthdays are entered in the grown-up settings and stay on this device
    const md = ((G.save.settings.birthdays || {})[id] || '').split('-').map(Number);
    if (md.length !== 2 || !md[0]) return false;
    const now = new Date(), b = new Date(now.getFullYear(), md[0] - 1, md[1]);
    const diff = (now - b) / 86400000;
    return diff >= 0 && diff < 7;
  },
  // said once, the first time a kid opens the game each day
  hellos: {
    mira: ['Hi Mira! Ready to build a rocket?', 'Welcome back, Captain Mira!', 'Mira! Mission Control is ready for you.', 'Hi Mira! Did you know I love snowy owls too?'],
    maia: ['Hi Maia! Let\'s build a rocket!', 'Maia is here! Yay!', 'Hi Maia! Want to go to space?', 'Hi Maia! Beep boop! Let\'s dance!'],
  },
};

// Special places tucked into the universe. They use the same fields as the real planets in planets.js.
G.FAMILY.places = [
  {
    id: 'owl-nebula', name: 'Snowy Owl Nebula', kind: 'nebula', x: 1300, y: -3600, r: 190, tier: 3, sticker: '🦉',
    colors: ['#eef4ff', '#a9b8ff'], glow: 'rgba(200,215,255,.5)', owl: true,
    hello: 'Whoa! A nebula shaped like a snowy owl!',
    facts: [
      'A nebula is a giant cloud of gas and dust. New stars are born inside it!',
      'This one looks like a snowy owl. Snowy owls have white feathers so they can hide in the snow.',
      'Mira made a whole poster about snowy owls! Snowy owls eat little animals called lemmings, and they build their nests right on the ground.',
    ],
    activity: { type: 'tap', emoji: '✨', n: 6, prompt: 'Baby stars are being born! Tap them all!' },
    prize: ['nose-owl', 'fins-feather'], sky: ['#1b1f5c', '#7c8ae0'], ground: '#dfe6ff', props: ['🦉', '❄️', '✨', '🌟'],
  },
  {
    id: 'unicorn-comet', name: 'Sugar Horn Comet', kind: 'comet', x: 6400, y: 3600, r: 45, tier: 3, sticker: '🦄', moving: { cx: 5200, cy: 2600, rx: 2600, ry: 1400, speed: 0.02 },
    colors: ['#ffffff', '#ffd1ec'], unicorn: true,
    hello: 'It\'s the Sugar Horn Comet! There\'s a unicorn riding on it!',
    facts: [
      'A comet is like a giant dirty snowball flying through space.',
      'When a comet gets close to the Sun, it melts a little and grows a long, glowing tail.',
      'This comet has a rainbow tail, and it sparkles like the five unicorn candles on Mira\'s birthday cake!',
    ],
    activity: { type: 'tap', emoji: '🌈', n: 5, prompt: 'Catch the five rainbow sparkles!' },
    prize: ['nose-unicorn'], sky: ['#ffb6e1', '#b39bff'], ground: '#ffffff', props: ['🦄', '🌈', '🍭', '✨'],
  },
  {
    id: 'lunchbox', name: 'Floating Lunch Box', kind: 'thing', x: 3700, y: 1350, r: 34, tier: 2, sticker: '🍱', emoji: '🍱',
    hello: 'Hey! Is that Mira\'s outer space lunch box? It floated all the way up here!',
    facts: [
      'Astronauts eat tortillas instead of bread, because bread makes crumbs, and crumbs float everywhere!',
      'They drink from pouches with straws. Water in space floats in wobbly balls!',
      'Astronauts can put salt and pepper in water, so it does not float away like dust.',
    ],
    activity: { type: 'tap', emoji: '🌮', n: 4, prompt: 'Catch the floating snacks!' },
    sky: ['#0b0a2a', '#2b1f6b'], ground: '#5b5b7a', props: ['🍎', '🧃', '🌮', '🥕'],
  },
  {
    id: 'icecream', name: 'Ice Cream Planet', kind: 'planet', x: 8600, y: -4300, r: 120, tier: 4, sticker: '🍦',
    colors: ['#fff3e0', '#f7c6a3'], spots: [[-0.3, -0.3, 0.3, '#ff9fce'], [0.35, 0.2, 0.28, '#8b5a3c'], [-0.1, 0.5, 0.25, '#b7ffcb']], face: true,
    hello: 'An Ice Cream Planet! Maia says: I no want ice cream Sunday. I want ice cream TO-DAY!',
    facts: [
      'Astronauts on the space station have had real ice cream! It came up in a special freezer.',
      'In space, a scoop of ice cream would float right off your cone!',
      'This planet is strawberry, chocolate, and mint. Yum!',
    ],
    activity: { type: 'sundae' },
    sky: ['#ffe0f0', '#ffd6a5'], ground: '#fff3e0', props: ['🍦', '🍨', '🍒', '🧁'],
  },
  {
    id: 'lightcity', name: 'Light City Station', kind: 'station', x: -2200, y: 2600, r: 110, tier: 3, sticker: '🏙️', lights: true,
    hello: 'Nǐ hǎo! Welcome to Light City! The lights look like the big buildings in Shanghai!',
    facts: [
      'In Shanghai, the tall buildings by the river are covered with lights. They all work together like one giant TV!',
      'Nǐ hǎo means hello in Chinese.',
      'Our friend Nini the alien is going to teach us some space words in Chinese!',
    ],
    activity: { type: 'chinese' },
    prize: ['body-lights', 'cap-lights'], sky: ['#0a0a2e', '#3a1c71'], ground: '#1d2150', props: ['🏙️', '🏮', '✨', '👽'],
  },
  {
    id: 'orange-moon', name: 'Orange Moon', kind: 'planet', x: 5900, y: -500, r: 60, tier: 3, sticker: '🍊',
    colors: ['#ffc36b', '#ff8a00'], craters: true, face: true,
    hello: 'An orange moon! Let\'s stack space oranges into triangles!',
    facts: [
      'Mira loves stacking oranges into triangles!',
      'One orange, then three, then six, then ten. Those are called triangle numbers!',
      'Each new row has one more orange than the row before.',
    ],
    activity: { type: 'triangle' },
    sky: ['#ffcf8a', '#ff7b54'], ground: '#ff9f43', props: ['🍊', '🍊', '🌟'],
  },
  {
    id: 'cake', name: 'Birthday Cake Planet', kind: 'planet', x: 9200, y: 5400, r: 130, tier: 4, sticker: '🎂', cake: true,
    colors: ['#ffe6f2', '#ff9fce'],
    hello: 'A Birthday Cake Planet! Happy birthday to everybody!',
    facts: [
      'Mira is five and Maia is three. That\'s a lot of candles!',
      'Maia had a princess cake for her birthday!',
      'On the space station, astronauts have had birthday parties in space. The candles can\'t be real fire, though!',
    ],
    activity: { type: 'candles' },
    sky: ['#ffd6ec', '#c9b6ff'], ground: '#fff0f7', props: ['🎂', '🎈', '🎁', '🎉'],
  },
  {
    id: 'star-train', name: 'Star Train', kind: 'thing', x: 4100, y: 800, r: 30, tier: 2, sticker: '🚂', emoji: '🚂', orbit: { around: 'mars', dist: 240, speed: 0.25 },
    hello: 'Choo choo! All aboard the Star Train!',
    facts: [
      'Choo choo! This train goes around and around Mars.',
      'Trains on Earth run on tracks. In space, things go around planets on paths called orbits.',
      'The Star Train is like the train museum, but in space!',
    ],
    activity: { type: 'train' },
    sky: ['#0b0a2a', '#4a2a8a'], ground: '#7a5a3a', props: ['🚂', '🚃', '🚃', '⭐'],
  },
  {
    id: 'little-forest', name: 'Little Forest', kind: 'secret', hidden: true,
  },
];

// Aliens who float in space and ask a question
G.FAMILY.aliens = [
  { id: 'zib', name: 'Zib', e: '👾', x: 3500, y: 1700, tier: 2, color: '#4cd97b' },
  { id: 'blorp', name: 'Blorp', e: '👽', x: 7000, y: -300, tier: 3, color: '#37c9d6' },
  { id: 'nini', name: 'Nini', e: '🐙', x: -1500, y: 2000, tier: 3, color: '#ff9fce' },
  { id: 'glim', name: 'Glim', e: '🦑', x: 14800, y: 400, tier: 4, color: '#9b6bff' },
  { id: 'pip', name: 'Pip', e: '🐛', x: 2000, y: -1300, tier: 2, color: '#ffd93d' },
];

G.FAMILY.chinese = [
  { zh: '火箭', py: 'huǒjiàn', en: 'rocket', e: '🚀' },
  { zh: '月亮', py: 'yuèliang', en: 'moon', e: '🌙' },
  { zh: '星星', py: 'xīngxing', en: 'star', e: '⭐' },
  { zh: '太阳', py: 'tàiyáng', en: 'sun', e: '☀️' },
  { zh: '地球', py: 'dìqiú', en: 'Earth', e: '🌍' },
  { zh: '猫头鹰', py: 'māotóuyīng', en: 'owl', e: '🦉' },
];
