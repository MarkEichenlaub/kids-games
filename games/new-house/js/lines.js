// Every line Beep says. {name} is the kid playing, {sis} her sister.
// tools/build-voice.mjs reads this file to record the voice, so keep all spoken text here.
(() => {
  const T = {
    // getting started
    title: 'Welcome to our new house! Who is playing?',
    pickCostume: 'Who do you want to be today, {name}?',
    intro1: 'Hi {name}! This is our new house! Walk to the front door and ring the doorbell.',
    introMove: 'Tap where you want to go.',
    intro2: 'Ding dong! Come on in!',
    intro3: 'Mama says: Welcome home, {name}!',
    intro4: 'Every room has a stamp. Can you find all the rooms? Mama and Baba are working upstairs. Go ask them for a job!',
    askJob: 'Ask Mama or Baba for a job! Mama works at the desk at the top of the stairs. Baba works in his office.',
    realPhoto: 'This is what it really looks like!',
    praise: ['Great job!', 'You did it!', 'Awesome!', 'Wow, nice!', 'Super!', 'Beep boop, hooray!'],
    followStar: 'Follow the star!',
    upstairsHint: 'Go up the stairs! They are next to the kitchen.',
    downstairsHint: 'Go down the stairs!',
    // stamps
    allStamps: 'You found every room! You know the whole house now. Pick a pet to live here with you!',
    petLine: { puppy: 'A puppy! It will follow you everywhere.', kitten: 'A kitten! It will follow you everywhere.', bunny: 'A bunny! It will follow you everywhere.', owl: 'A baby owl! It will follow you everywhere.', dragon: 'A baby dragon! It will follow you everywhere.', unicorn: 'A baby unicorn! It will follow you everywhere.' },
    // packages
    pkgCome: 'Ding dong! A package came! Go to the front door.',
    pkgOpen: 'You got new things for your room! Tap the paint button in a room to use them.',
    pkgNone: 'You have everything already! Here are five stars.',
    // decorating
    decorHi: 'Let\'s decorate! Drag things to move them. Tap a picture to add something new. The flag is for obstacle courses.',
    decorDone: 'It looks great!',
    boxPop: 'Surprise!',
    // the three views
    view: { '2d': 'Back to the map!', tilt: 'Here is our house in three D! Tap the arrows to turn it around.', walk: 'Now you are walking inside the house!' },
    // obstacle courses
    course: {
      found: 'An obstacle course! Tap the flag button to run it.',
      ready: 'Ready, set, go!',
      next: { cCones: 'Zigzag around the cones!', cHurdle: 'Jump over the hurdle!', cTunnel: 'Crawl through the tunnel!', cBeam: 'Walk along the balance beam!', cStones: 'Hop on every stepping stone!',
        cHoop: 'Hop into the hoop!', cTramp: 'Bounce on the bouncer!', cPillows: 'Climb over the pillow mountain!', cSpin: 'Stand on the spinner and spin!' },
      toFinish: 'Now run to the finish line!',
      done: ['You finished the obstacle course!', 'What a run!', 'You made it to the finish line!'],
      best: 'That is your fastest time ever!',
      missed: 'Not yet! Follow the star to the next obstacle.',
      lava: 'Hot, hot, hot! The floor is lava!',
      bonk: 'Oops! Tap the jump button to jump over it.',
      beamOff: 'Whoa, you slipped off! Try the beam again.',
      needStart: 'Your course needs a green start flag.', needFinish: 'Your course needs a checkered finish line.', needMore: 'Put an obstacle between the flags.',
      buildOk: 'Your course is ready! Tap the flag button to run it.',
      surprise: 'Ta-da! A surprise course!',
      buildHi: 'Build an obstacle course! Put down a start flag, some obstacles, and a finish line. Or tap the dice for a surprise.',
    },
    // tiny friends
    friendFound: 'You found a tiny friend!',
    allFriends: 'You found all the tiny friends! They love living in our house.',
    // things in the house, said the first time you touch them
    act: {
      toilet: 'Flush!', fridge: 'The fridge keeps our food cold.', fire: 'A cozy fire!', stove: 'The stove is hot. Only grown-ups cook here.',
      oven: 'Mmm, cookies!', car: 'Beep beep!', volvo: 'This is Snake, our silver Volvo. Beep beep!', ioniq: 'This is Elly, our blue Ioniq. She runs on electricity, so she is very quiet!', volvoHi: ['Hi, Snake!', 'Beep beep, Snake!', 'Snake is ready to go!'], ioniqHi: ['Hi, Elly!', 'Elly is so quiet!', 'Elly is charged up and ready!'], rocket: 'Look! Your rocket from Rocket Builders is parked in the garage!', opener: 'This button opens the big garage door.',
      closet: 'Time to dress up!', closetBig: 'So many clothes!', truck: 'That is the moving truck. It carried all our things to the new house!', heater: 'This tank keeps our water warm. It has its own little nook.',
      panel: 'This box has the switches for all the lights.', ac: 'The air conditioner hides in this white box. It keeps the house cool.', tub: 'Bubble bath!', washer: 'The washer makes our clothes clean.',
      dryer: 'The dryer makes our clothes warm and dry.', stones: 'Hop, hop, hop along the stepping stones!', linen: 'Towels and sheets live in this cabinet.', desk: 'A desk for drawing!', nook: 'This is where Mama works!', shower: 'The shower makes rain!',
      bins: 'Trash goes in the black bin. Recycling goes in the blue bin.', bike: 'Ring ring! Bikes and scooters live in the garage.', pantry: 'A snack!', island: 'Crunch! An apple.',
      books: 'So many books to read!', sit: 'A nice place to sit outside.', town: 'Let\'s go explore the neighborhood!',
      seed: 'You planted a seed! Now give it water.', bloom: 'Splash! Look, a flower!', gardenAll: 'All the flowers are blooming! The butterflies love them.',
      garageOpen: 'The garage door is open!', garageShut: 'The garage door is closed.',
    },
    // jobs from Mama and Baba
    mamaChat: ['Mama says: I love our new house!', 'Mama says: Go explore, {name}!', 'Mama says: Did you find all the rooms yet?'],
    babaChat: ['Baba says: Hi {name}! I love you!', 'Baba says: Our new kitchen is so nice!', 'Baba says: Have you seen the courtyard?'],
    busy: 'Finish your job first! Follow the star.',
    q: {
      unpack: { start: 'Mama says: The moving boxes need unpacking! Find a box and take what is inside to the right room.', next: 'Find the next box!', done: 'All the boxes are unpacked! Thank you, {name}!' },
      hide: { start: 'Mama says: Oh no, the stuffed animals are hiding! Can you find them all?', next: 'Keep looking! More are hiding.', done: 'You found them all! They were so sneaky.', up: 'One is hiding upstairs.', down: 'One is hiding downstairs.' },
      socks: { start: 'Mama says: The laundry is done! Go upstairs to the dryer and match the socks.', game: 'Tap two socks that match.', away: 'They all match! Now put the socks away in a bedroom closet.', done: 'The socks are put away. Thank you!' },
      bedtime: { start: 'Mama says: It\'s bedtime! First, brush your teeth in the kids\' bathroom.', brush: 'Scrub away all the germs!', pjs: 'So shiny! Now put on pajamas. Go to a bedroom closet.', bed: 'Cozy pajamas! Now hop into bed.', night: 'Good night, {name}. Sweet dreams in our new house.', done: 'Good morning! The sun is up.' },
      course: { start: 'Baba says: Let\'s build an obstacle course! Go to the courtyard and tap the paint button. Then tap the flag.', startLittle: 'Baba says: I built an obstacle course in the courtyard! Go there and tap the flag button.', run: 'What a course! Now tap the flag button and run it.', done: 'You are an obstacle course champion!' },
      pancakes: { start: 'Baba says: Let\'s make pancakes! First, get eggs from the fridge.', flour: 'Now get flour from the pantry.', cook: 'Now cook them on the stove!', flip: 'Tap each pancake when it turns golden!', carry: 'Yum! Carry the pancakes to the dining table.', done: 'Pancakes for everyone! Delicious!' },
      garden: { start: 'Baba says: Let\'s plant flowers! Go to the pots in the courtyard.', done: 'What a beautiful garden!' },
      lights: { start: 'Baba says: Uh oh! The lights went out! Take your flashlight to the gray box in the garage.', game: 'Watch the lights, then tap them in the same order.', again: 'Not quite. Watch again!', done: 'You fixed the lights! Everything is bright again.' },
      swim: { start: 'Baba says: It\'s a sunny day! Let\'s go to the pool. Walk to the sign on the sidewalk.', done: 'What a fun swim!' },
    },
    count: { eggs: 'Tap the eggs to put them in the bowl.', flour: 'Tap the cups of flour to put them in the bowl.', tooMany: 'Oops, that is too many! Tap one in the bowl to take it out.', need: n => `We need ${n}.`, mira: (a, b) => `We need ${a} for you and ${b} for Maia. How many is that?`, right: n => `Yes! ${n}!` },
    // unpacking
    unpackAsk: thing => `${thing}! Where does it go?`,
    unpackHint: room => `It goes in the ${room}.`,
    unpackYes: 'Yes! That is the right room!',
    foundToy: toy => `You found the ${toy}!`,
    // the neighborhood
    town: {
      map: 'Where do you want to go?', home: 'Back home we go!', drive: 'Let\'s get in the car! Maia\'s school is a short drive away.',
      pool: 'This is our pool! Tap the pool toys to swim to them.', poolDone: 'You are a great swimmer!',
      play: 'This is the little park right by our house! Tap the slide or the swing. There is a sandbox and a seesaw too.', playDone: 'Wheee! That was fun!',
      park: 'This is the big park up the street. Can you catch the butterflies?', parkDone: 'You caught them all! Now they fly away home.',
      school: 'This is Mira\'s new school! Mira starts kindergarten here in January. Find the door with the big K!',
      schoolK: 'This is the kindergarten room! This is where Mira will learn and play. Let\'s go inside!',
      schoolIn: 'This is Mira\'s kindergarten classroom! Tap things to play. Can you try everything?',
      schoolInDone: 'You tried everything in the classroom! Mira is going to love kindergarten.',
      today: { d0: 'Calendar time! Today is Sunday.', d1: 'Calendar time! Today is Monday.', d2: 'Calendar time! Today is Tuesday.', d3: 'Calendar time! Today is Wednesday.', d4: 'Calendar time! Today is Thursday.', d5: 'Calendar time! Today is Friday.', d6: 'Calendar time! Today is Saturday.' },
      grade1: 'That is a first grade room. Try another door!', grade2: 'That is a second grade room. Try another door!', grade3: 'That is a third grade room. Try another door!',
      kinder: 'This is Maia\'s new school! First, tap the backpack to hang it up. Or tap the red door to go inside.', kinderPlay: 'Now let\'s play! Tap the slide.', kinderDone: 'Wheee! Maia\'s new school has a great playground. Tap the red door to see inside!',
      kinderIn: 'This is Maia\'s classroom! Tap things to play. Can you try everything?',
      cubby: { maia: 'This is Maia\'s cubby. Her backpack and her coat go in here.', mira: 'This is Mira\'s cubby. Her backpack and her coat go in here.' },
      kinderTeacher: ['Good morning! I am so happy you are here.', 'Hi friend! Do you want to paint a picture?', 'Remember to wash your hands before snack!'],
      kinderEasel: 'Paint a picture! Every tap adds a new color.',
      kinderTank: 'Sprinkle some food for the fish. Look, they swim up to eat it!',
      kinderRug: 'Circle time! Let\'s sit on the rug and sing the good morning song.',
      kinderBlocks: 'Build a tower! Tap to add a block. How tall can it go?', kinderCrash: 'Crash! Let\'s build it again.',
      kinderSink: 'Wash your hands with soap and water. Scrub, scrub, scrub!',
      kinderNap: 'Rest time. Shh! Close your eyes.', kinderWake: 'Time to wake up!',
      kinderInDone: 'You tried everything in the classroom! Maia is going to love it here.',
      sandDig: 'Dig in the sandbox! What can you find?',
      sand: { shell: 'A seashell!', bone: 'A dinosaur bone!', coin: 'A shiny coin!', gem: 'A sparkly jewel!', car: 'A little toy car!', duck: 'A rubber duck!', shovel: 'Somebody\'s lost shovel!' },
      bubbles: 'Bubbles! Tap them to pop them.', seesaw: 'Up and down on the seesaw with {sis}!', squirrel: 'A squirrel! It is looking for acorns.',
      kite: 'Up, up, up goes the kite!', ducks: 'Quack, quack! The ducks are hungry.', goal: 'Kick! Goal!', dog: 'A friendly dog! Woof, woof!', flowers: 'What a pretty bunch of flowers!',
      dive: 'One, two, three, cannonball!', iceCream: 'A cold ice cream on a hot day. Yum!', lifeguard: 'The lifeguard keeps everyone safe in the pool.',
      checkout: 'Beep! You checked out a book. Bring it back in three weeks.', checkoutFirst: 'Read a book first. Then bring it here to check it out.',
      puppets: 'Puppet show! Roar, says the dragon. Hello, says the princess.',
      library: 'This is the library. It is a short walk from our house. Tap the doors to go inside!',
      libraryIn: 'Pick a book, and I will read it to you! Tap the arrow to turn the page.', libraryDone: 'What great books! You can borrow books here with a library card.',
    },
    // the big dollhouse in the play corner, with the Moana friends
    doll: {
      intro: 'This is our big dollhouse! Drag Moana and her family and friends into any room. Tap the elevator to make it go up and down.',
      back: ['Dollhouse time!', 'Who wants to play in the dollhouse?', 'Let\'s play with Moana and her friends!'],
      doors: 'The garage doors are open! Close them to hide someone inside.',
      fig: {
        moana: ['Moana says: Let\'s explore every room!', 'Moana says: I love the ocean, but I love this house too!', 'Moana says: Who wants to ride the elevator with me?'],
        maui: ['Maui says: Hey! This house is almost as big as me!', 'Maui says: Watch me flex!', 'Maui says: Where is my fishhook? Oh, here it is!'],
        simea: ['Simea says: Moana! Moana! Play with me!', 'Simea says: Can we have a sleepover up in the loft?', 'Simea says: I want to ride the elevator!'],
        moni: ['Moni says: This is the best adventure ever!', 'Moni says: Look, I drew a picture of Maui!'],
        loto: ['Loto says: I can fix anything. Even this elevator!', 'Loto says: Look at the little boat I made!'],
        sina: ['Sina says: Welcome home, everybody!', 'Sina says: Who wants to help me make dinner?', 'Sina says: Moana, Simea, time to wash your hands!'],
        kitty: ['Meow! The kitty wants a pat.', 'Purr, purr. The kitty is sleepy.'],
      },
      spot: {
        hottub: 'Splash! Swimming in the pool on the roof!', tub: 'Bubble bath time!', bed: 'Time for a nap. Shh!', sofa: 'Ahh, a comfy sofa.', mill: 'Tap the treadmill to make it go!',
        garage: 'Into the garage! Close the doors to hide.', elev: 'Tap the elevator to go for a ride!', kitchen: 'Something yummy is cooking in the kitchen!',
        balcony: 'Barbecue time! Tap the grill.', loft: 'Up in the loft bedroom!', spa: 'Up on the roof by the pool!', chair: 'A comfy gold chair.', office: 'Time to work at the desk.',
      },
      elev: { up: 'Ding! The top floor!', mid: 'Ding! The kitchen floor!', down: 'Ding! The bottom floor!' },
    },
    // picture books: the library shelf, and the book corner at Maia's school
    theEnd: 'The end!',
    books: {
      owl: { title: 'Little Owl Stays Up', pages: [
        'Little Owl lives in a big oak tree.',
        'When the sun comes up, everyone wakes up. But Little Owl yawns a big yawn.',
        'When the moon comes up, everyone goes to sleep. But Little Owl opens her big round eyes.',
        'Hoot, hoot! She flies over the dark houses and counts the stars. One, two, three!',
        'In the morning, she tucks her head under her wing. Good night, Little Owl!',
      ] },
      rocket: { title: 'Rocket to the Moon', pages: [
        'Five, four, three, two, one. Blast off!',
        'The rocket zooms up past the birds and the clouds.',
        'Up, up, up into the dark sky, where the stars twinkle.',
        'The rocket lands on the moon. Boing! Everything is bouncy up here.',
        'Look! There is our home, far away on the big blue Earth. Time to fly back for dinner.',
      ] },
      unicorn: { title: 'Sparkle\'s Rainbow', pages: [
        'Sparkle the unicorn had a rainbow mane.',
        'One day it rained and rained, and all her colors washed away.',
        'A red strawberry, an orange fox, and the yellow sun each gave her a color.',
        'A green frog, a blue bird, and some purple grapes gave her a color too.',
        'Now Sparkle has a rainbow mane again. Thank you, friends!',
      ] },
      panda: { title: 'Panda Moves House', pages: [
        'Panda is moving to a new house.',
        'She puts her toys and her blanket into a big box.',
        'The moving truck drives down the long road. Beep beep!',
        'The new house is very quiet. Panda feels a little bit shy.',
        'Then she finds a sunny window, a soft bed, and a new friend next door.',
        'Now the new house feels like home.',
      ] },
      dino: { title: 'Dino Brushes His Teeth', pages: [
        'Little Dino has lots and lots of teeth.',
        'After dinner, Dino says, I do not want to brush my teeth!',
        'Mama Dino says, Let\'s count them while we brush.',
        'Brush, brush, brush. One tooth, two teeth, three teeth, all the way to fifty!',
        'Now Dino\'s teeth are shiny and white. He gives a big dinosaur smile. Rawr!',
      ] },
      moon: { title: 'Where Did the Moon Go?', pages: [
        'Every night, the moon peeks in my window.',
        'Some nights it is big and round, like a ball.',
        'Some nights it is thin and curvy, like a banana.',
        'Some nights I cannot find it at all. Where did you go, moon?',
        'The moon is still there. It is just hiding in the dark. Good night, moon. See you soon!',
      ] },
      bug: { title: 'Caterpillar\'s Big Nap', pages: [
        'A tiny caterpillar hatched from a tiny egg on a leaf.',
        'She munched leaves all day long and grew bigger and bigger.',
        'Then she felt very sleepy. She wrapped herself up in a cozy case called a chrysalis.',
        'She slept and slept for two whole weeks.',
        'When she woke up, she had wings! Now she is a butterfly.',
      ] },
      crown: { title: 'The Princess Who Made Pancakes', pages: [
        'Princess Poppy lived in a castle with a very big kitchen.',
        'One morning, the cook was sick. Who will make breakfast?',
        'I will! said Poppy. She cracked the eggs, poured the milk, and stirred and stirred.',
        'Flip! The pancake flew up so high that it stuck to the ceiling!',
        'Everyone laughed. Then Poppy made a tall stack of pancakes for the whole castle.',
      ] },
      school: { title: 'A Day at School', pages: [
        'In the morning, we hang our backpacks in our cubbies.',
        'We sit on the rug for circle time and sing a song.',
        'We paint pictures, build towers, and play outside.',
        'After lunch, we rest on our mats. Shh!',
        'Then Mama or Baba comes to pick us up. See you tomorrow, school!',
      ] },
      bear: { title: 'Bear Says Hello', pages: [
        'Bear is new at school. He holds his blanket tight.',
        'Bunny is building a tower. Bear wants to play, but he feels shy.',
        'Bear takes a big breath and says, Hello! Can I play too?',
        'Yes! says Bunny. Together they build the tallest tower ever.',
        'Now Bear has a friend at school.',
      ] },
    },
  };
  // first visit to each room
  const ROOMS = {
    yard: 'This is the front yard. Our house is the yellow one with the blue door. The path goes along the trees.',
    porch: 'This is the front porch. You can sit here and watch the street.',
    living: 'This is the living room. The play corner is right by the fireplace!',
    dining: 'This is the dining room. We eat dinner together here.',
    kitchen: 'This is the kitchen. Look at the big island with three stools!',
    pantry: 'This is the pantry. Snacks live in here!',
    powder: 'This is the little bathroom downstairs. It is next to the garage door.',
    garage: 'This is the garage. Our two cars, Snake and Elly, sleep in here, and the big door opens to the alley.',
    courtyard: 'This is the courtyard. It goes all along the side of the house. You can play outside here!',
    alley: 'This is the alley behind the house. The car drives in this way, and the moving truck is here!',
    landing: 'You are upstairs! Mama works at the little desk at the top of the stairs.',
    kidsbath: 'This is the kids\' bathroom. Brush your teeth here!',
    laundry: 'This is the laundry room. The washer and dryer are upstairs!',
    bigcloset: 'This is Mama and Baba\'s big closet.',
    bigbath: 'This is the big bathroom. It has a bathtub!',
    sunhall: 'This is the sunny hall. Look at all the shelves under the windows.',
    primary: 'This is Mama and Baba\'s room.',
    den: 'This is Baba\'s office. Baba works here.',
  };
  const ROOM_SAY = { star: 'This is the Star Bedroom.', moon: 'This is the Moon Bedroom.', mira: 'This is Mira\'s room.', maia: 'This is Maia\'s room.', both: 'This is Mira and Maia\'s room.', play: 'This is the playroom.', guest: 'This is the guest room.' };
  const BED_MORE = { bedA: 'It has a closet with sliding doors. You can decorate it!', bedB: 'It has a little closet you can walk into. You can decorate it!' };
  // short room names for "It goes in the ..."
  const ROOM_SHORT = { kitchen: 'kitchen', pantry: 'pantry', dining: 'dining room', living: 'living room', garage: 'garage', courtyard: 'courtyard', kidsbath: 'kids\' bathroom', laundry: 'laundry room', bigcloset: 'big closet', bigbath: 'big bathroom', primary: 'big bedroom', den: 'office', bedA: 'bedroom', bedB: 'bedroom', powder: 'little bathroom' };
  // tiny friends hiding in things around the house
  G.FRIENDS = [
    { id: 'dot', fx: 'flowerpot', icon: '🐞', name: 'Dot the ladybug' }, { id: 'pip', fx: 'tree', icon: '🐦', name: 'Pip the bird' }, { id: 'shelly', fx: 'stones', icon: '🐌', name: 'Shelly the snail' },
    { id: 'gigi', fx: 'banana', icon: '🦎', name: 'Gigi the gecko' }, { id: 'buzz', fx: 'bistro', icon: '🐝', name: 'Buzz the bee' }, { id: 'spike', fx: 'builtin', icon: '🦔', name: 'Spike the hedgehog' },
    { id: 'nibbles', fx: 'pshelf', icon: '🐭', name: 'Nibbles the mouse' }, { id: 'chilly', fx: 'fridge', icon: '🐧', name: 'Chilly the penguin' }, { id: 'nutty', fx: 'shelf', icon: '🐿️', name: 'Nutty the squirrel' },
    { id: 'zorp', fx: 'rocket', icon: '👽', name: 'Zorp the alien' }, { id: 'hoppy', fx: 'tub', icon: '🐸', name: 'Hoppy the frog' }, { id: 'shelby', fx: 'shower', icon: '🐢', name: 'Shelby the turtle' },
    { id: 'fluffy', fx: 'dryer', icon: '🐥', name: 'Fluffy the chick' }, { id: 'hoot', fx: 'nook', icon: '🦉', name: 'Hoot the owl' }, { id: 'bun', fx: 'closetA', icon: '🐰', name: 'Bun the bunny' },
    { id: 'mittens', fx: 'closetB', icon: '🐱', name: 'Mittens the kitten' }, { id: 'flutter', fx: 'lowshelf', icon: '🦋', name: 'Flutter the butterfly' },
  ];
  // what is in the moving boxes, and the rooms each belongs in
  G.UNPACK = [
    { icon: '🍳', name: 'A frying pan', rooms: ['kitchen'] }, { icon: '🪥', name: 'A toothbrush', rooms: ['kidsbath'] }, { icon: '🧸', name: 'A teddy bear', rooms: ['bedA', 'bedB'] },
    { icon: '📚', name: 'A stack of books', rooms: ['den'] }, { icon: '🧺', name: 'A laundry basket', rooms: ['laundry'] }, { icon: '🚲', name: 'A bike helmet', icon2: '⛑️', rooms: ['garage'] },
    { icon: '🪴', name: 'A plant', rooms: ['courtyard'] }, { icon: '🦆', name: 'A rubber duck', rooms: ['bigbath'] }, { icon: '👗', name: 'A dress', rooms: ['bigcloset'] },
    { icon: '🥫', name: 'A can of soup', rooms: ['pantry'] }, { icon: '🍽️', name: 'A stack of plates', rooms: ['dining'] }, { icon: '🛋️', name: 'A sofa pillow', rooms: ['living'] }, { icon: '🧻', name: 'A roll of toilet paper', rooms: ['powder'] },
  ];
  G.HIDERS = [['🧸', 'teddy bear'], ['🦉', 'snowy owl'], ['🦄', 'unicorn'], ['🐼', 'panda'], ['🐰', 'bunny'], ['🦖', 'dinosaur']];

  const fill = (s, kid) => s.replace(/\{name\}/g, kid.name).replace(/\{sis\}/g, G.KIDS[kid.sis].name);
  const get = key => key.split('.').reduce((o, k) => o && o[k], T);
  // G.T('q.unpack.start') or G.T('count.need', 3)
  G.T = (key, ...args) => {
    let v = get(key); if (v == null) { console.warn('no line', key); return ''; }
    if (typeof v === 'function') v = v(...args);
    if (Array.isArray(v)) v = G.pick(v);
    return fill(v, G.kid());
  };
  G.hasLine = key => get(key) != null;
  G.book = id => { const b = T.books[id], k = G.kid(); return { title: fill(b.title, k), pages: b.pages.map(p => fill(p, k)) }; };
  G.roomShort = id => ROOM_SHORT[id] || id;
  G.roomLine = r => r.kids ? (ROOM_SAY[G.save.house.roomNames[r.id]] || ROOM_SAY.star) + ' ' + BED_MORE[r.id] : (ROOMS[r.id] || '');
  G.friendLine = f => T.friendFound + ' It is ' + f.name + '.';

  // every sentence that might be spoken, for the recording tool
  G.voiceLines = () => {
    const out = new Set();
    const add = s => { if (typeof s === 'string') for (const kid of Object.values(G.KIDS)) out.add(fill(s, kid)); };
    const walk = o => { if (typeof o === 'string') add(o); else if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') Object.values(o).forEach(walk); };
    walk(T); walk(ROOMS); walk(ROOM_SAY); walk(BED_MORE);
    for (let n = 1; n <= 8; n++) { add(T.count.need(n)); add(T.count.right(n)); }
    for (let a = 1; a <= 4; a++) for (let b = 1; b <= 4; b++) add(T.count.mira(a, b));
    for (const u of G.UNPACK) { add(T.unpackAsk(u.name)); for (const r of u.rooms) add(T.unpackHint(ROOM_SHORT[r])); }
    for (const h of G.HIDERS) add(T.foundToy(h[1]));
    for (const f of G.FRIENDS) add('It is ' + f.name + '.');
    for (const c of G.COSTUMES) add(c.say);
    return [...out];
  };
})();
