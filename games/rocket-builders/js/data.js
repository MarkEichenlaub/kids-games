// Content: parts, crew, colors, words, videos, planets, the rocket-making story.
G.DATA = (function () {
  const D = {};

  // ---------- parts ----------
  D.parts = [
    { id: 'nose-cone', cat: 'nose', name: 'Pointy Nose Cone' },
    { id: 'nose-needle', cat: 'nose', name: 'Super Pointy Nose' },
    { id: 'nose-bubble', cat: 'nose', name: 'Bubble Top' },
    { id: 'nose-star', cat: 'nose', name: 'Star Top' },
    { id: 'nose-heart', cat: 'nose', name: 'Heart Top' },
    { id: 'nose-crown', cat: 'nose', name: 'Princess Crown' },
    { id: 'nose-owl', cat: 'nose', name: 'Snowy Owl Nose' },
    { id: 'nose-unicorn', cat: 'nose', name: 'Unicorn Horn' },
    { id: 'cap-basic', cat: 'capsule', name: 'Capsule' },
    { id: 'cap-big', cat: 'capsule', name: 'Big Window Capsule' },
    { id: 'cap-double', cat: 'capsule', name: 'Two-Seat Capsule' },
    { id: 'cap-dome', cat: 'capsule', name: 'Glass Dome Capsule' },
    { id: 'cap-lights', cat: 'capsule', name: 'Light City Capsule' },
    { id: 'body-plain', cat: 'body', name: 'Fuel Tank' },
    { id: 'body-stripes', cat: 'body', name: 'Stripy Tank' },
    { id: 'body-dots', cat: 'body', name: 'Polka Dot Tank' },
    { id: 'body-stars', cat: 'body', name: 'Starry Tank' },
    { id: 'body-rainbow', cat: 'body', name: 'Rainbow Stripe Tank' },
    { id: 'body-checker', cat: 'body', name: 'Checker Tank' },
    { id: 'body-zigzag', cat: 'body', name: 'Zigzag Tank' },
    { id: 'body-hearts', cat: 'body', name: 'Heart Tank' },
    { id: 'body-windows', cat: 'body', name: 'Window Tank' },
    { id: 'body-candy', cat: 'body', name: 'Candy Cane Tank' },
    { id: 'body-flag', cat: 'body', name: 'Name Tank' },
    { id: 'body-lights', cat: 'body', name: 'Light City Tank' },
    { id: 'eng-1', cat: 'engine', name: 'Little Engine', tier: 1 },
    { id: 'eng-2', cat: 'engine', name: 'Double Engine', tier: 2 },
    { id: 'eng-3', cat: 'engine', name: 'Triple Engine', tier: 3 },
    { id: 'eng-4', cat: 'engine', name: 'Mega Star Engine', tier: 4 },
    { id: 'fins-tri', cat: 'fins', name: 'Triangle Fins' },
    { id: 'fins-swept', cat: 'fins', name: 'Zoomy Fins' },
    { id: 'fins-round', cat: 'fins', name: 'Round Fins' },
    { id: 'fins-star', cat: 'fins', name: 'Star Fins' },
    { id: 'fins-butterfly', cat: 'fins', name: 'Butterfly Wings' },
    { id: 'fins-feather', cat: 'fins', name: 'Owl Feather Wings' },
    { id: 'fins-wing', cat: 'fins', name: 'Space Shuttle Wings' },
    { id: 'boost-basic', cat: 'booster', name: 'Boosters' },
    { id: 'boost-candy', cat: 'booster', name: 'Candy Cane Boosters' },
    { id: 'boost-rainbow', cat: 'booster', name: 'Rainbow Boosters' },
  ];
  D.partById = {}; D.parts.forEach(p => D.partById[p.id] = p);

  D.cats = [
    { id: 'nose', name: 'Nose', ic: '🔺', fact: 'The nose cone is pointy so the rocket can slice through the air, like a knife through butter.' },
    { id: 'capsule', name: 'Capsule', ic: '🪟', fact: 'The capsule is where the astronauts ride. It has a heat shield on the bottom so it does not burn up when it comes home.' },
    { id: 'body', name: 'Tank', ic: '🛢️', fact: 'Most of a rocket is fuel tanks! Rockets need lots and lots of fuel to get to space. Stack more tanks to make it taller!' },
    { id: 'fins', name: 'Fins', ic: '🪶', fact: 'Fins help the rocket fly straight, like the feathers on an arrow.' },
    { id: 'engine', name: 'Engine', ic: '🔥', fact: 'The engine burns fuel and shoots hot gas down, super fast. That pushes the rocket up! Bigger engines can fly farther.' },
    { id: 'booster', name: 'Boosters', ic: '🧨', fact: 'Boosters give an extra big push at the start. When their fuel runs out, they fall away. Some even fly back and land!' },
    { id: 'paint', name: 'Paint', ic: '🎨', fact: 'Pick a color! Real rockets are often white, so they stay cool in the hot sun.' },
    { id: 'sticker', name: 'Stickers', ic: '⭐', fact: 'Stickers! Drag them onto your rocket.' },
    { id: 'crew', name: 'Crew', ic: '👩‍🚀', fact: 'Who is riding in the rocket today?' },
  ];

  // what each station gives, in order
  D.pools = {
    engine: ['eng-2', 'boost-basic', 'eng-3', 'boost-candy', 'eng-4', 'boost-rainbow'],
    fuel: ['body-stripes', 'body-rainbow', 'body-dots', 'body-stars', 'body-hearts', 'body-checker', 'body-zigzag', 'body-windows', 'body-candy'],
    words: ['cap-big', 'cap-double', 'body-flag', 'cap-dome'],
    puzzle: ['nose-star', 'nose-bubble', 'nose-heart', 'nose-needle', 'nose-crown'],
    shapes: ['fins-swept', 'fins-star', 'fins-round', 'fins-butterfly'],
  };

  D.colors = ['#ff5d8f', '#ff5d5d', '#ff9f43', '#ffd93d', '#4cd97b', '#37c9d6', '#a7e3ff', '#4d8dff', '#9b6bff', '#ff9fce', '#f4f6ff', '#3a3f5c'];
  D.accents = ['#ffffff', '#ffd93d', '#ff4f9a', '#4d8dff', '#2d2250', '#4cd97b'];

  // decorating stickers: unlocked as stars add up
  D.stickerEmoji = [
    { e: '⭐', at: 0 }, { e: '❤️', at: 0 }, { e: '🌈', at: 0 }, { e: '🌙', at: 0 },
    { e: '🦄', at: 5 }, { e: '🦉', at: 10 }, { e: '🐵', at: 15 }, { e: '🌸', at: 20 }, { e: '🪐', at: 25 },
    { e: '🍦', at: 30 }, { e: '👑', at: 35 }, { e: '🦋', at: 40 }, { e: '☀️', at: 50 }, { e: '🐱', at: 60 },
    { e: '🍊', at: 70 }, { e: '🎂', at: 80 }, { e: '💎', at: 90 }, { e: '🚂', at: 100 }, { e: '👽', at: 120 }, { e: '🕷️', at: 140 },
  ];

  // ---------- videos (all verified embeddable, Sept 2026) ----------
  D.videos = [
    { id: 'WecvCGadcXE', topic: 'build', title: 'Building NASA\'s Moon Rocket', desc: 'Watch NASA\'s Moon rocket get built piece by piece, super fast!' },
    { id: '5n8AY-k-Su4', topic: 'build', title: 'Standing Up the Giant Rocket', desc: 'Giant cranes lift the biggest part of the Moon rocket and stand it up inside a huge building.' },
    { id: 'Q-Jjb_dGAkc', topic: 'build', title: 'The Chopstick Tower', desc: 'A giant robot tower with "chopstick" arms lifts Starship on top of its rocket.' },
    { id: 'hETalgrVTIc', topic: 'engine', title: 'Engine Test Fire!', desc: 'NASA holds the rocket down and turns on all four engines to make sure they work. Whoosh!' },
    { id: 'd3fxIs-6rZI', topic: 'engine', title: 'How a Rocket Steers', desc: 'The engine wiggles its nozzle while it fires. That\'s how a rocket steers!' },
    { id: 'mYTvg2abusc', topic: 'launch', title: 'Artemis I Blasts Off', desc: 'NASA\'s giant orange-and-white rocket launches at night on its way to the Moon.' },
    { id: 'A0FZIwabctw', topic: 'launch', title: 'Falcon Heavy and the Space Car', desc: 'A rocket with three boosters launches a red car into space, and two boosters land side by side!' },
    { id: 'NOQLSH4KyBs', topic: 'launch', title: 'Apollo 11 in Slow Motion', desc: 'The rocket that took the first people to the Moon lifts off, in slow motion.' },
    { id: 'LHqLz9ni0Bo', topic: 'landing', title: 'Rocket Lands on a Boat', desc: 'A rocket comes back from space and lands standing up on a boat in the ocean!' },
    { id: 'WLidfyD4eUM', topic: 'landing', title: 'Twin Boosters Land', desc: 'Two boosters land at the same time, like twins.' },
    { id: 'NfrLoG2CeNU', topic: 'landing', title: 'Chopsticks Catch a Rocket', desc: 'A giant tower catches a falling rocket with its big arms.' },
    { id: 'LdOcgZziD0I', topic: 'landing', title: 'The Rocket Splits in Two', desc: 'High in the sky, the rocket splits in two and the top part keeps going to space.' },
    { id: 'odC-bvvoRXg', topic: 'landing', title: 'Nose Cone Pops Open', desc: 'A camera on the nose cone shows it pop open in space, with Earth below.' },
    { id: '3bCoGC532p8', topic: 'iss', title: 'Brushing Teeth in Space', desc: 'How do you brush your teeth when the water floats away?' },
    { id: 'AZx0RIV0wss', topic: 'iss', title: 'The Space Kitchen', desc: 'An astronaut makes a snack in space, and the food floats!' },
    { id: 'UyFYgeE32f0', topic: 'iss', title: 'Sleeping in Space', desc: 'Astronauts sleep in sleeping bags on the wall so they don\'t float away.' },
    { id: 'w4wx_3XOrns', topic: 'moon', title: 'Walking on the Moon', desc: 'The first astronauts on the Moon bounce around and plant a flag.' },
    { id: 'joq-IUFNkrw', topic: 'planets', title: 'The Rocky Planets', desc: 'Jessi and Squeaks visit Mercury, Venus, Earth and Mars.' },
    { id: 'SeC22-94PMw', topic: 'planets', title: 'The Giant Planets', desc: 'Jessi and Squeaks visit Jupiter, Saturn, Uranus and Neptune.' },
    { id: '1OwmZYrTsGY', topic: 'train', title: 'Astronauts Practice Underwater', desc: 'Astronauts practice space walks in the biggest pool in the world.' },
    { id: 'QyH1XscdhDs', topic: 'train', title: 'The Floating Airplane', desc: 'A special airplane makes everyone inside float, just like in space.' },
    { id: '4czjS9h4Fpg', topic: 'mars', title: 'Landing a Rover on Mars', desc: 'A parachute opens, a jetpack lowers the rover on ropes, and it lands on Mars!' },
    { id: 'wMnOo2zcjXA', topic: 'mars', title: 'A Helicopter on Mars', desc: 'A tiny helicopter takes off, hovers, and lands on Mars.' },
  ];
  D.videoTopics = [
    { id: 'build', name: '🏭 Building Rockets' }, { id: 'engine', name: '🔥 Engine Tests' }, { id: 'launch', name: '🚀 Blast Off!' },
    { id: 'landing', name: '🛬 Rockets Coming Back' }, { id: 'iss', name: '🛰️ Living in Space' }, { id: 'moon', name: '🌙 The Moon' },
    { id: 'mars', name: '🔴 Mars' }, { id: 'planets', name: '🪐 Planets' }, { id: 'train', name: '🏊 Astronaut Training' },
  ];

  // ---------- crew ----------
  D.crew = [
    { id: 'kid', e: '👧', name: 'Me!' },
    { id: 'sis', e: '👧', name: 'My sister' },
    { id: 'me', e: '📷', name: 'My photo' },
    { id: 'astro', e: '🧑‍🚀', name: 'Astronaut' },
    { id: 'george', e: '🐵', name: 'Monkey' },
    { id: 'owl', e: '🦉', name: 'Snowy Owl' },
    { id: 'unicorn', e: '🦄', name: 'Unicorn' },
    { id: 'kitty', e: '🐱', name: 'Kitty' },
    { id: 'bear', e: '🧸', name: 'Teddy' },
    { id: 'mama', e: '👩', name: 'Mama' },
    { id: 'baba', e: '👨', name: 'Baba' },
    { id: 'beep', e: '🤖', name: 'Beep' },
  ];

  // ---------- words ----------
  D.words = {
    1: [['SUN', '☀️'], ['CAT', '🐱'], ['OWL', '🦉'], ['BUG', '🐞'], ['FOX', '🦊'], ['PIG', '🐷'], ['CUP', '🥤'], ['BED', '🛏️'], ['BOX', '📦'], ['JET', '✈️'], ['HAT', '👒'], ['BAT', '🦇'], ['EGG', '🥚'], ['ICE', '🧊'], ['VAN', '🚐'], ['MAP', '🗺️'], ['HOT', '🔥']],
    2: [['MOON', '🌙'], ['STAR', '⭐'], ['MARS', '🔴'], ['SHIP', '🚢'], ['FIRE', '🔥'], ['RING', '💍'], ['CAKE', '🎂'], ['BEAR', '🐻'], ['FROG', '🐸'], ['DUCK', '🦆'], ['KITE', '🪁'], ['LION', '🦁'], ['FISH', '🐟'], ['GOLD', '🥇'], ['MAMA', '👩'], ['BABA', '👨'], ['MIRA', '👧'], ['MAIA', '👧'], ['TRAIN', '🚂']],
    3: [['EARTH', '🌍'], ['SPACE', '🌌'], ['COMET', '☄️'], ['ROBOT', '🤖'], ['ALIEN', '👽'], ['PLANET', '🪐'], ['ROCKET', '🚀'], ['ORBIT', '🔄'], ['SNOWY', '❄️'], ['OWLET', '🦉'], ['CANDY', '🍬'], ['CROWN', '👑'], ['SATURN', '🪐'], ['UNICORN', '🦄'], ['FLOAT', '🎈']],
  };

  // ---------- how rockets are made ----------
  D.story = [
    { art: '🎈', text: 'How does a rocket go up? Let go of a balloon! The air rushes OUT the back, and the balloon zooms the other way. A rocket works the same way, with fire instead of air.', balloon: true },
    { art: '👩‍💻📐', text: 'First, engineers draw the rocket on computers. They figure out how big it has to be and how much fuel it needs.' },
    { art: '🛢️🛢️', text: 'Next, workers roll giant sheets of metal into big tubes. The tubes become the fuel tanks. They are as wide as a house!', video: 'WecvCGadcXE' },
    { art: '👷✨🔥', text: 'The pieces are welded together with super hot sparks. Welding melts the metal edges so they stick together.' },
    { art: '🔥💨', text: 'The engines get tested on the ground. People hold the rocket down tight and turn the engines on. Whoosh! It\'s so loud!', video: 'hETalgrVTIc' },
    { art: '🏗️🧱', text: 'Inside a gigantic building, cranes stack the parts one on top of another, like building blocks.', video: '5n8AY-k-Su4' },
    { art: '🐢➡️🚀', text: 'A huge machine called a crawler carries the rocket to the launch pad. It is slow like a turtle, even slower than you walk!' },
    { art: '❄️⛽', text: 'Then they fill the tanks with fuel. Some rocket fuel is so cold it would freeze your finger instantly!' },
    { art: '🧑‍🚀🧑‍🚀', text: 'The astronauts climb in the capsule at the very top and buckle up tight.' },
    { art: '🔟…1️⃣🚀', text: 'Ten, nine, eight, seven, six, five, four, three, two, one... LIFTOFF!', video: 'mYTvg2abusc' },
    { art: '🚀↘️🛬', text: 'When the boosters run out of fuel, they fall off. Some rockets can even fly back down and land standing up, so they can fly again!', video: 'LHqLz9ni0Bo' },
  ];
  return D;
})();
