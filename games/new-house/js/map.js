// The house, traced from the listing's two floor plan drawings. Every wall, window and door
// below is given in pixels on those drawings and turned into feet here, so the game's rooms
// are the real rooms. Up is the alley and the garage door, the front porch is at the bottom,
// and the courtyard is on the left. (In real life "up" is west and the porch faces east.)
(() => {
  const M = G.MAP = {};
  M.CELL = 0.25;     // walking grid, feet
  M.R = 0.4;         // how much room a kid needs around her feet
  const r2 = v => Math.round(v * 100) / 100;
  // pixels per foot on each drawing, and where its top-left wall corner is
  const plan = (x0, y0, s) => {
    const X = x => r2((x - x0) / s), Y = y => r2((y - y0) / s);
    return {
      X, Y,
      seg: a => [X(a[0]), Y(a[1]), X(a[2]), Y(a[3])].concat(a.slice(4)),
      rect: a => [X(a[0]), Y(a[1]), X(a[2]), Y(a[3])],
      door: a => [X(a[0]), Y(a[1]), r2(a[2] / s), a[3], a[4]],
      fix: (t, x1, y1, x2, y2, more) => Object.assign({ t, x: X(x1), y: Y(y1), w: r2((x2 - x1) / s), h: r2((y2 - y1) / s) }, more),
      item: (t, x, y, r) => [t, X(x), Y(y), r || 0],
      pt: (x, y, floor) => [floor, X(x), Y(y)],
    };
  };
  const A = plan(587.5, 38, 16.35);      // downstairs drawing
  const B = plan(568.35, 38.5, 16.5);    // upstairs drawing
  const SIDE = -8.6;                     // the neighbor's wall on the far side of the courtyard

  // ---------- rooms ----------
  // rects are [x1, y1, x2, y2]; earlier rooms win where rects overlap. deco: kids may rearrange it.
  M.rooms = [
    // downstairs
    { id: 'pantry', floor: 1, icon: '🥫', name: 'Pantry', rects: [A.rect([901, 420, 983, 498])] },
    { id: 'powder', floor: 1, icon: '🚽', name: 'Little Bathroom', rects: [A.rect([639, 396, 729, 509]), A.rect([689, 358, 729, 396])] },
    { id: 'garage', floor: 1, icon: '🚗', name: 'Garage', rects: [A.rect([639, 40, 983, 356]), A.rect([639, 356, 687, 394])] },
    { id: 'kitchen', floor: 1, icon: '🍳', name: 'Kitchen', rects: [A.rect([729, 356, 983, 714.5])] },
    { id: 'dining', floor: 1, icon: '🍽️', name: 'Dining Room', deco: true, rects: [A.rect([843, 714.5, 983, 933.5])] },
    { id: 'living', floor: 1, icon: '🛋️', name: 'Living Room', deco: true, rects: [A.rect([589, 714.5, 843, 974.5]), A.rect([552, 762, 589, 910])] },
    { id: 'porch', floor: 1, icon: '🏡', name: 'Front Porch', rects: [[-0.3, 57.28, 24.5, 62.9], [15.63, 54.77, 24.5, 57.28]] },
    { id: 'courtyard', floor: 1, icon: '🌴', name: 'Courtyard', deco: true, rects: [[SIDE, 0.4, 3.06, 28.9], [SIDE, 28.9, 8.65, 41.38], [SIDE, 41.38, 0, 57.9]], decoRects: [[-6.9, 1.2, 2.6, 28.9], [-6.9, 28.9, 8.2, 41]] },
    { id: 'alley', floor: 1, icon: '🚙', name: 'Back Alley', rects: [[-11, -12, 29, 0.4]] },
    { id: 'yard', floor: 1, icon: '🌳', name: 'Front Yard', rects: [[-11, 57.9, 29, 78]] },
    // upstairs
    { id: 'bedA', floor: 2, icon: '⭐', name: 'Star Bedroom', deco: true, kids: true, rects: [B.rect([618, 40, 791.5, 221.5]), B.rect([618, 221.5, 731.5, 259.5])] },
    { id: 'bedB', floor: 2, icon: '🌙', name: 'Moon Bedroom', deco: true, kids: true, rects: [B.rect([791.5, 40, 968, 221.5]), B.rect([882.5, 221.5, 968, 314])] },
    { id: 'kidsbath', floor: 2, icon: '🪥', name: 'Kids\' Bathroom', rects: [B.rect([618, 259.5, 700.5, 398.5])] },
    { id: 'laundry', floor: 2, icon: '🧺', name: 'Laundry Room', rects: [B.rect([618, 398.5, 710.5, 544.5])] },
    { id: 'bigcloset', floor: 2, icon: '👗', name: 'Big Closet', rects: [B.rect([801.5, 450.5, 968, 567.5])] },
    { id: 'bigbath', floor: 2, icon: '🛁', name: 'Big Bathroom', rects: [B.rect([801.5, 567.5, 968, 753])] },
    { id: 'sunhall', floor: 2, icon: '☀️', name: 'Sunny Hall', rects: [B.rect([710.5, 543, 801.5, 753])] },
    { id: 'primary', floor: 2, icon: '💜', name: 'Mama and Baba\'s Room', deco: true, rects: [B.rect([567, 753, 797, 952])] },
    { id: 'den', floor: 2, icon: '📚', name: 'Den', deco: true, rects: [B.rect([797, 753, 968, 974.5])] },
    { id: 'landing', floor: 2, icon: '🪜', name: 'Upstairs Hall', rects: [B.rect([700.5, 221.5, 968, 472]), B.rect([737, 472, 801.5, 543])] },
  ];
  M.room = id => M.rooms.find(r => r.id === id);
  M.roomAt = (floor, x, y) => {
    for (const r of M.rooms) if (r.floor === floor) for (const q of r.rects) if (x >= q[0] && x <= q[2] && y >= q[1] && y <= q[3]) return r;
    return null;
  };
  M.roomCenter = id => { const q = M.room(id).rects[0]; return [(q[0] + q[2]) / 2, (q[1] + q[3]) / 2]; };
  // where furniture may stand in a room
  M.decoRects = r => r.decoRects || [r.rects[0]];
  // names the grown-ups can give the two kids' bedrooms
  M.ROOM_NAMES = {
    star: ['⭐', 'Star Bedroom'], moon: ['🌙', 'Moon Bedroom'], mira: ['🦉', 'Mira\'s Room'], maia: ['🦄', 'Maia\'s Room'],
    both: ['👭', 'Mira and Maia\'s Room'], play: ['🧸', 'Playroom'], guest: ['🛏️', 'Guest Room'],
  };
  M.roomName = r => { const k = r.kids && G.save.house.roomNames[r.id]; return k && M.ROOM_NAMES[k] ? M.ROOM_NAMES[k][1] : r.name; };
  M.roomIcon = r => { const k = r.kids && G.save.house.roomNames[r.id]; return k && M.ROOM_NAMES[k] ? M.ROOM_NAMES[k][0] : r.icon; };

  // ---------- downstairs ----------
  // wall kinds: none = inside wall, t = tan stucco, y = yellow siding (the front), c = cream siding
  const F1 = {
    bounds: [-11, -12, 29, 78],
    // where feet may go (walls and furniture are cut out of these)
    areas: [
      A.rect([639, 40, 983, 356]), A.rect([639, 356, 687, 394]), A.rect([689, 358, 729, 396]), A.rect([639, 396, 729, 509]), A.rect([729, 356, 983, 714.5]),
      A.rect([589, 714.5, 983, 933.5]), A.rect([589, 933.5, 843, 974.5]), A.rect([552, 762, 589, 910]),
      [SIDE, 0.4, 3.06, 28.9], [SIDE, 28.9, 8.65, 41.38], [SIDE, 41.38, 0, 57.9],
      [-0.3, 57.28, 24.5, 62.9], [15.63, 54.77, 24.5, 57.28],
      [SIDE, 57.9, 26, 73], [-11, 73, 29, 77], [-11, -11, 27, 0.4],
    ],
    walls: [
      // garage
      [634, 38, 690, 38, 't'], [948, 38, 990, 38, 't'], [637.5, 34, 637.5, 215, 't'], [637.5, 264, 637.5, 515, 't'], [985, 34, 985, 938, 't'],
      [683, 356, 739, 356], [789, 356, 985, 356], [687, 356, 687, 394], [637.5, 394, 687, 394],
      // little bathroom and the tiny hall in front of it
      [730.5, 356, 730.5, 459], [637.5, 453.5, 683, 453.5], [722, 453.5, 730.5, 453.5], [637.5, 510.5, 730.5, 510.5, 't'],
      // kitchen wall onto the courtyard
      [729, 503, 729, 594, 't'], [729, 641, 729, 718, 't'],
      // stairs and pantry (the pantry door sits across its corner)
      [816, 418, 985, 418], [818.5, 418, 818.5, 438], [899.5, 418, 899.5, 468], [899.5, 468, 904, 473], [931, 496, 935, 499.5], [935, 499.5, 985, 499.5],
      // between the kitchen and the living room
      [584, 714.5, 729, 714.5, 'c'], [729, 714.5, 762, 714.5], [827, 714.5, 985, 714.5],
      // living room and the fireplace bump
      [587.5, 711, 587.5, 760, 't'], [550, 760, 587.5, 760, 't'], [550, 760, 550, 911.5, 't'], [550, 911.5, 587.5, 911.5, 't'], [587.5, 911.5, 587.5, 979, 't'],
      // the front of the house
      [584, 974.5, 766, 974.5, 'y'], [821, 974.5, 847, 974.5, 'y'], [843, 933.5, 843, 979, 'y'], [839, 933.5, 990, 933.5, 'y'],
    ].map(A.seg),
    windows: [
      [613, 714.5, 690, 714.5], [641, 974.5, 711, 974.5], [866, 933.5, 928, 933.5], [985, 764, 985, 790], [985, 816, 985, 842], [985, 858, 985, 883],
      [729, 545, 729, 592], [729, 642, 729, 687], [690, 510.5, 722, 510.5], [866, 714.5, 933, 714.5, 'pass'],
    ].map(A.seg),
    doors: [ // just the picture of an open door: hinge x, y, length, swing angle (degrees), kind
      [637.5, 264, 49, 335], [789, 356, 50, 97], [683, 453.5, 39, 282], [729, 594, 47, 200, 'glass'], [904, 473, 36, 115], [821, 974.5, 55, 255, 'front'],
    ].map(A.door),
    fences: [
      // the neighbor's house wall closes the far side of the courtyard; wood fences close its two ends
      [SIDE, 0.4, SIDE, 57.9, 'neighbor'], [SIDE, 0.4, 0.3, 0.4, 'wood'], [-8.6, 57.9, -6.9, 57.9, 'wood'], [-3.9, 57.9, -0.3, 57.9, 'wood'],
      // porch railings
      [-0.3, 57.5, -0.3, 62.75, 'rail'], [-0.3, 62.75, 9.9, 62.75, 'rail'], [15.4, 62.75, 24.5, 62.75, 'rail'], [24.5, 54.77, 24.5, 62.75, 'rail'],
      // edges of the yard
      [26, 62.9, 26, 73, 'hedge'], [SIDE, 57.9, SIDE, 73, 'hedge'],
    ],
    stairs: { zone: A.rect([814, 361, 983, 414]), arrive: [A.X(782), A.Y(428)], run: [[A.X(818), A.Y(388)], [A.X(950), A.Y(388)]] },
    fixtures: [
      // garage
      A.fix('garagedoor', 690, 33, 948, 43, { id: 'gdoor' }),
      // our two cars, real size, parked nose-in: the Volvo XC40 (14.6 x 6.1 ft) and the Ioniq 5 (15.2 x 6.2 ft)
      { t: 'car', model: 'volvo', id: 'volvo', x: 4.9, y: 1.3, w: 6.1, h: 14.6, solid: 1, act: 'volvo' },
      { t: 'car', model: 'ioniq', id: 'ioniq', x: 15.0, y: 1.0, w: 6.2, h: 15.2, solid: 1, act: 'ioniq' },
      A.fix('shelf', 966, 190, 981, 340, { act: 'shelf' }),
      A.fix('panel', 641.5, 152, 650, 190, { id: 'panel', act: 'panel' }),
      A.fix('heater', 646, 358, 681, 390, { solid: 1, act: 'heater' }),
      A.fix('opener', 795, 342, 806, 352, { act: 'opener' }),
      { t: 'bikes', x: 18.4, y: 16.6, w: 3.8, h: 2.6, act: 'bike' },
      { t: 'rocket', x: 6.4, y: 16.4, w: 2.6, h: 2.8, solid: 1, act: 'rocket' },
      // little bathroom
      A.fix('toilet', 694, 361, 725, 397, { r: 0, solid: 1, act: 'toilet' }),
      A.fix('vanity', 641.5, 402, 674, 446, { r: 3, solid: 1, act: 'sink' }),
      // kitchen
      A.fix('ovens', 946, 503, 981, 539, { solid: 1, act: 'oven' }),
      A.fix('fridge', 940, 540, 981, 592, { id: 'fridge', solid: 1, act: 'fridge' }),
      A.fix('counter', 946, 593, 981, 711, { solid: 1 }),
      A.fix('cooktop', 950, 612, 978, 660, { id: 'stove', act: 'stove' }),
      A.fix('counter', 831, 678, 946, 711, { solid: 1 }),
      A.fix('ksink', 878, 683, 922, 707, { id: 'ksink', act: 'ksink' }),
      A.fix('island', 838, 556, 888, 664, { id: 'island', solid: 1, act: 'island' }),
      A.fix('stool', 812, 566, 830, 584, { act: 'stool' }), A.fix('stool', 812, 601, 830, 619, { act: 'stool' }), A.fix('stool', 812, 636, 830, 654, { act: 'stool' }),
      A.fix('kdesk', 823, 421, 896, 450, { solid: 1, act: 'desk' }),
      A.fix('pshelf', 906, 421, 981, 440, { id: 'pantry', solid: 1, act: 'pantry' }),
      A.fix('pshelf', 960, 441, 981, 496, { solid: 1, act: 'pantry' }),
      A.fix('stairs1', 783, 360, 981, 415, { flat: 1 }),
      // living room: the fireplace and the built-in shelves share the bump in the side wall
      A.fix('fireplace', 554, 764, 591, 844, { id: 'fire', solid: 1, act: 'fire' }),
      A.fix('builtin', 554, 847, 590, 908, { solid: 1, act: 'books' }),
      A.fix('fan', 665, 800, 755, 890, { flat: 1 }),
      // porch
      { t: 'mat', x: 10.95, y: 57.75, w: 2.7, h: 1.4, flat: 1 },
      { t: 'doorbell', id: 'doorbell', x: 9.95, y: 57.5, w: 0.6, h: 0.6, act: 'doorbell' },
      { t: 'plaque', x: 7.75, y: 57.55, w: 1.9, h: 0.75, flat: 1 },
      { t: 'flowerpot', x: 9.1, y: 58.3, w: 1.2, h: 1.2, solid: 1, act: 'flower' }, { t: 'flowerpot', x: 14.25, y: 57.7, w: 1.2, h: 1.2, solid: 1, act: 'flower' },
      { t: 'column', x: -0.25, y: 62.3, w: 0.85, h: 0.85, solid: 1 }, { t: 'column', x: 9.5, y: 62.3, w: 0.85, h: 0.85, solid: 1 },
      { t: 'column', x: 14.95, y: 62.3, w: 0.85, h: 0.85, solid: 1 }, { t: 'column', x: 23.8, y: 62.3, w: 0.85, h: 0.85, solid: 1 },
      { t: 'steps', x: 10.35, y: 62.9, w: 4.6, h: 1.2, flat: 1 },
      { t: 'walk', x: 10.9, y: 64.1, w: 3.5, h: 8.9, flat: 1 },
      // front yard: bark beds with bushes, then lawn, then the path along the green belt
      { t: 'mulch', x: SIDE, y: 62.9, w: 18.6, h: 3.6, flat: 1 }, { t: 'mulch', x: 15.3, y: 62.9, w: 10.7, h: 3.6, flat: 1 },
      { t: 'bush', x: 0.6, y: 63.3, w: 3.2, h: 2.4, solid: 1 }, { t: 'bush', x: 4.6, y: 63.3, w: 4, h: 2.4, solid: 1 }, { t: 'bush', x: 15.9, y: 63.3, w: 3.4, h: 2.4, solid: 1 }, { t: 'bush', x: 19.8, y: 63.3, w: 3.8, h: 2.4, solid: 1 },
      { t: 'tree', x: -6.4, y: 63.2, w: 3.2, h: 3.2, solid: 1, act: 'tree' }, { t: 'tree', x: 22.6, y: 66, w: 3.2, h: 3.2, solid: 1, act: 'tree' },
      { t: 'sign', id: 'sign', x: -7.2, y: 73.6, w: 1.6, h: 1.6, act: 'town' },
      // courtyard
      { t: 'acbox', x: 0.5, y: 6.6, w: 2.4, h: 3.2, solid: 1, act: 'ac' },
      { t: 'bistro', x: 1.4, y: 38.2, w: 5.4, h: 2.7, solid: 1, act: 'sit' },
      { t: 'planter', id: 'pot1', x: 3.4, y: 29.3, w: 1.6, h: 1.6, solid: 1, act: 'plant' }, { t: 'planter', id: 'pot2', x: 5.6, y: 29.3, w: 1.6, h: 1.6, solid: 1, act: 'plant' },
      { t: 'planter', id: 'pot3', x: -0.4, y: 39.3, w: 1.6, h: 1.6, solid: 1, act: 'plant' }, { t: 'planter', id: 'pot4', x: 7, y: 36.4, w: 1.6, h: 1.6, solid: 1, act: 'plant' },
      { t: 'banana', x: -8.4, y: 24.4, w: 2.8, h: 2.8, solid: 1, act: 'tree' },
      { t: 'plantbed', x: SIDE, y: 41.6, w: 1.9, h: 16.1, solid: 1 },
      { t: 'stones', id: 'stones', x: -5.6, y: 43.2, w: 2.2, h: 13.6, flat: 1, act: 'stones' },
      { t: 'gate', x: 0.3, y: 0.4, w: 2.76, h: 0.3, dir: 1 }, { t: 'gate', x: -6.9, y: 57.9, w: 3, h: 0.3, dir: -1 },
      // alley
      { t: 'bush', x: -8.4, y: -2.3, w: 4, h: 2.4, solid: 1 }, { t: 'bush', x: -4, y: -2.3, w: 3.6, h: 2.4, solid: 1 },
      { t: 'tree', x: -8.6, y: -5, w: 3, h: 3, solid: 1, act: 'tree' },
      { t: 'bins', x: 22.6, y: -3, w: 2.8, h: 2.6, solid: 1, act: 'bins' },
      { t: 'plaque', x: 3.95, y: -1.05, w: 1.9, h: 0.75, flat: 1 },
      { t: 'truck', id: 'truck', x: -4.5, y: -11.2, w: 13, h: 5.4, solid: 1, act: 'truck' },
    ],
    spots: { mama: [A.X(772), A.Y(800)], baba: [A.X(918), A.Y(612)], start: [12.65, 70.5], pkg: [12.65, 60.6], bell: [11.6, 59], inside: [A.X(700), A.Y(900)] },
  };

  // ---------- upstairs ----------
  const F2 = {
    bounds: [-4, -3, 28, 60],
    areas: [B.rect([618, 40, 968, 545]), B.rect([710.5, 545, 968, 753]), B.rect([567, 753, 968, 952]), B.rect([797, 952, 968, 974.5])],
    walls: [
      [612, 38.5, 975, 38.5, 't'], [616.5, 34, 616.5, 549, 't'], [970, 34, 970, 979, 't'],
      // the two kids' bedrooms and their closets
      [791.5, 38.5, 791.5, 225], [612, 221.5, 632, 221.5], [718, 221.5, 742, 221.5], [787, 221.5, 798, 221.5], [844, 221.5, 892, 221.5], [931, 221.5, 975, 221.5],
      [731.5, 221.5, 731.5, 259.5], [612, 259.5, 735, 259.5], [882.5, 221.5, 882.5, 314], [880, 314, 975, 314], [840, 314, 880, 314, 'pony'],
      // kids' bathroom and laundry
      [700.5, 259.5, 700.5, 264], [700.5, 306, 700.5, 398.5], [612, 398.5, 714, 398.5], [710.5, 398.5, 710.5, 411], [710.5, 455, 710.5, 548], [612, 544.5, 714, 544.5, 't'],
      // the hall of shelves, the big closet, the big bathroom
      [710.5, 548, 710.5, 757, 't'], [784, 543, 801.5, 543], [801.5, 447, 801.5, 642], [801.5, 683, 801.5, 757], [797, 450.5, 975, 450.5],
      [858.5, 525, 858.5, 588], [858.5, 588, 853, 594], [824, 619, 806, 633], [857, 567.5, 869, 567.5], [909, 567.5, 975, 567.5],
      // Mama and Baba's room and the den
      [562, 753, 735, 753, 'c'], [779, 753, 975, 753], [565.5, 748, 565.5, 957, 't'], [562, 952, 803, 952, 'y'], [798.5, 909, 798.5, 979], [795, 974.5, 975, 974.5, 'y'], [797, 753, 797, 800],
    ].map(B.seg),
    windows: [
      [665, 38.5, 746, 38.5], [838, 38.5, 919, 38.5], [616.5, 310, 616.5, 345], [664, 544.5, 695, 544.5], [970, 353, 970, 377], [970, 387, 970, 412], [970, 715, 970, 740],
      [970, 817, 970, 845], [970, 850, 970, 877], [970, 887, 970, 915], [710.5, 604, 710.5, 645], [710.5, 650, 710.5, 695], [594, 753, 665, 753],
      [565.5, 767, 565.5, 799], [565.5, 898, 565.5, 930], [637, 952, 677, 952], [685, 952, 725, 952], [865, 974.5, 905, 974.5],
    ].map(B.seg),
    doors: [
      [787, 221.5, 45, 262], [798, 221.5, 46, 280], [931, 221.5, 39, 258], [700.5, 306, 42, 200], [710.5, 411, 44, 160],
      [784, 543, 45, 100], [801.5, 642, 41, 20], [869, 567.5, 40, 290], [853, 594, 38, 150],
    ].map(B.door),
    fences: [[805, 388, 876, 388, 'banister'], [805, 388, 805, 450, 'banister'], [876, 374, 876, 388, 'banister']].map(B.seg),
    stairs: { zone: B.rect([886, 318, 968, 447]), arrive: [B.X(846), B.Y(346)], run: [[B.X(886), B.Y(346)], [B.X(940), B.Y(346)]] },
    blocked: [B.rect([806, 389, 886, 448])],
    fixtures: [
      B.fix('stairs2', 805, 318, 966, 448, { flat: 1 }),
      B.fix('block', 703, 472, 737, 545, { solid: 1 }), B.fix('block', 805, 503, 863, 525, { solid: 1 }), B.fix('block', 705, 726, 735, 757, { solid: 1 }), B.fix('block', 779, 726, 806, 757, { solid: 1 }),
      // bedrooms
      B.fix('closet', 622, 227, 728, 255, { id: 'closetA', solid: 1, act: 'closet' }),
      B.fix('sliders', 632, 217, 718, 226, { flat: 1 }),
      B.fix('closet', 948, 228, 966, 310, { id: 'closetB', solid: 1, act: 'closet' }), B.fix('closet', 888, 293, 948, 310, { solid: 1, act: 'closet' }),
      B.fix('doorsign', 753, 232, 775, 254, { room: 'bedA', flat: 1 }), B.fix('doorsign', 810, 232, 832, 254, { room: 'bedB', flat: 1 }),
      B.fix('fan', 668, 92, 742, 166, { flat: 1 }), B.fix('fan', 843, 92, 917, 166, { flat: 1 }),
      // kids' bathroom
      B.fix('vanity', 621, 263, 655, 302, { id: 'kidsink', r: 3, solid: 1, act: 'sink' }),
      B.fix('toilet', 621, 306, 662, 339, { r: 3, solid: 1, act: 'toilet' }),
      B.fix('shower', 621, 346, 697, 395, { act: 'shower' }),
      // laundry: sink, dryer, washer in a row along the outside wall
      B.fix('lsink', 621, 402, 659, 448, { solid: 1, act: 'sink' }),
      B.fix('dryer', 621, 452, 663, 493, { id: 'dryer', solid: 1, act: 'dryer' }),
      B.fix('washer', 621, 496, 663, 537, { id: 'washer', solid: 1, act: 'washer' }),
      // hall: linen cabinet, and the desk nook beside the top of the stairs
      B.fix('linen', 704, 318, 740, 377, { solid: 1, act: 'linen' }),
      B.fix('nook', 846, 228, 879, 309, { solid: 1, act: 'nook' }),
      // hall of shelves, big closet, big bathroom
      B.fix('lowshelf', 714, 590, 735, 700, { solid: 1, act: 'books' }),
      B.fix('closet', 808, 454, 964, 474, { id: 'closetBig', solid: 1, act: 'closetBig' }), B.fix('closet', 946, 476, 966, 562, { solid: 1, act: 'closetBig' }),
      B.fix('toilet', 808, 528, 853, 566, { r: 0, solid: 1, act: 'toilet' }),
      B.fix('vanity2', 932, 584, 966, 700, { solid: 1, act: 'sink' }),
      B.fix('tub', 866, 702, 966, 750, { id: 'tub', solid: 1, act: 'tub' }),
      B.fix('shower', 806, 692, 862, 750, { act: 'shower' }),
      B.fix('fan', 640, 808, 724, 892, { flat: 1 }),
    ],
    spots: {},
  };
  M.floors = { 1: F1, 2: F2 };
  for (const n of [1, 2]) M.floors[n].fixtures.forEach(f => { f.floor = n; });

  // places the jobs use: [floor, x, y]
  M.spots = {
    boxes: [A.pt(690, 772, 1), A.pt(772, 640, 1), A.pt(765, 400, 1), A.pt(800, 185, 1), A.pt(915, 760, 1), [1, 1, 34], [1, 19.5, 59.6],
      B.pt(770, 300, 2), B.pt(760, 650, 2), B.pt(720, 185, 2), B.pt(860, 185, 2), B.pt(885, 900, 2), B.pt(650, 915, 2), B.pt(765, 430, 2)],
    hides: [A.pt(828, 732, 1), A.pt(970, 916, 1), A.pt(745, 700, 1), A.pt(968, 58, 1), [1, -4.5, 50], A.pt(652, 494, 1), A.pt(916, 484, 1), [1, 23.2, 59.8], [1, -7.4, 3],
      B.pt(632, 60, 2), B.pt(955, 60, 2), B.pt(955, 958, 2), B.pt(582, 936, 2), B.pt(935, 550, 2), B.pt(696, 530, 2), B.pt(784, 736, 2), B.pt(752, 455, 2)],
  };

  // The furniture on moving day is our own, drawn from photos of the old house. Where each
  // piece will really go is not decided yet, so this is a first guess the kids can rearrange:
  // [type, x, y, quarter-turns]
  M.defaults = {
    living: [A.item('ourRugNavy', 700, 852, 1), A.item('ourSofaBlack', 676, 938, 2), A.item('ourCouchWhite', 636, 760), A.item('ourChairWhite', 806, 852, 1), A.item('ourPiano', 728, 750), A.item('ourStarLamp', 606, 955)],
    dining: [A.item('ourRugTrellis', 913, 824), A.item('ourDining', 913, 824)],
    courtyard: [['ball', 2, 34, 0]],
    bedA: [B.item('ourBedIron', 664, 100), B.item('ourNightYellow', 722, 60), B.item('ourRugStar', 730, 170), B.item('box', 765, 120)],
    bedB: [B.item('ourBedTent', 934, 99), B.item('ourDresser', 812, 128, 3), B.item('box', 860, 190)],
    primary: [B.item('ourBedBig', 630, 850, 3), B.item('ourDesk', 760, 925, 2), B.item('box', 730, 790)],
    den: [B.item('ourRugRainbow', 880, 862), B.item('ourShelfWhite', 950, 860, 1), B.item('ourShelfTall', 836, 962, 2), B.item('ourDollhouse', 830, 775), B.item('ourLoveseat', 818, 868, 3), B.item('ourCoffee', 884, 868, 1), B.item('ourPlayKitchen', 930, 958, 2), B.item('ourBasket', 936, 780)],
  };

  // ---------- walking grid ----------
  // grid[floor] = { w, h, x0, y0, cells: Uint8Array } with 1 = blocked
  M.grid = {};
  const segDist = (px, py, x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
    const t = l2 ? G.clamp(((px - x1) * dx + (py - y1) * dy) / l2, 0, 1) : 0;
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  };
  M.buildGrid = floor => {
    const F = M.floors[floor], [bx1, by1, bx2, by2] = F.bounds, C = M.CELL;
    const w = Math.ceil((bx2 - bx1) / C), h = Math.ceil((by2 - by1) / C);
    const cells = new Uint8Array(w * h).fill(1);
    const each = (x1, y1, x2, y2, fn) => {
      const i1 = Math.max(0, Math.floor((x1 - bx1) / C)), i2 = Math.min(w - 1, Math.floor((x2 - bx1) / C));
      const j1 = Math.max(0, Math.floor((y1 - by1) / C)), j2 = Math.min(h - 1, Math.floor((y2 - by1) / C));
      for (let j = j1; j <= j2; j++) for (let i = i1; i <= i2; i++) fn(i, j, bx1 + (i + 0.5) * C, by1 + (j + 0.5) * C);
    };
    for (const a of F.areas) each(a[0], a[1], a[2] - 0.01, a[3] - 0.01, (i, j, cx, cy) => { if (cx > a[0] && cx < a[2] && cy > a[1] && cy < a[3]) cells[j * w + i] = 0; });
    const blockSeg = (s, pad) => each(Math.min(s[0], s[2]) - pad, Math.min(s[1], s[3]) - pad, Math.max(s[0], s[2]) + pad, Math.max(s[1], s[3]) + pad, (i, j, cx, cy) => { if (segDist(cx, cy, s[0], s[1], s[2], s[3]) < pad) cells[j * w + i] = 1; });
    for (const s of F.walls) blockSeg(s, 0.22 + M.R);
    for (const s of F.fences) blockSeg(s, 0.12 + M.R);
    for (const f of F.fixtures) {
      if (f.t === 'garagedoor') { if (!G.save.house.garageOpen) blockSeg([f.x, 0, f.x + f.w, 0], 0.22 + M.R); continue; }
      if (!f.solid) continue;
      const p = M.R * 0.7;
      each(f.x - p, f.y - p, f.x + f.w + p, f.y + f.h + p, (i, j, cx, cy) => { if (cx > f.x - p && cx < f.x + f.w + p && cy > f.y - p && cy < f.y + f.h + p) cells[j * w + i] = 1; });
    }
    for (const q of F.blocked || []) each(q[0], q[1], q[2], q[3], (i, j) => { cells[j * w + i] = 1; });
    M.grid[floor] = { w, h, x0: bx1, y0: by1, cells };
  };
  M.free = (floor, x, y) => {
    const g = M.grid[floor]; if (!g) return false;
    const i = Math.floor((x - g.x0) / M.CELL), j = Math.floor((y - g.y0) / M.CELL);
    return i >= 0 && j >= 0 && i < g.w && j < g.h && !g.cells[j * g.w + i];
  };
  M.inRect = (q, x, y) => x >= q[0] && x <= q[2] && y >= q[1] && y <= q[3];
  // nearest open spot to (x, y), searching outward
  M.nearestFree = (floor, x, y, max = 5) => {
    if (M.free(floor, x, y)) return [x, y];
    for (let r = M.CELL; r <= max; r += M.CELL) {
      let best = null, bd = 1e9;
      for (let a = 0; a < 16; a++) {
        const px = x + Math.cos(a / 16 * Math.PI * 2) * r, py = y + Math.sin(a / 16 * Math.PI * 2) * r;
        if (M.free(floor, px, py)) { const d = G.dist(px, py, x, y); if (d < bd) { bd = d; best = [px, py]; } }
      }
      if (best) return best;
    }
    return null;
  };
  M.clear = (floor, ax, ay, bx, by) => {
    const d = G.dist(ax, ay, bx, by), n = Math.ceil(d / 0.2);
    for (let k = 0; k <= n; k++) { const t = n ? k / n : 0; if (!M.free(floor, ax + (bx - ax) * t, ay + (by - ay) * t)) return false; }
    return true;
  };
  // A* over the grid; returns a short list of points to walk through, or null
  M.path = (floor, ax, ay, bx, by) => {
    const g = M.grid[floor]; if (!g) return null;
    const s = M.nearestFree(floor, ax, ay, 2), e = M.nearestFree(floor, bx, by, 6);
    if (!s || !e) return null;
    if (M.clear(floor, s[0], s[1], e[0], e[1])) return [e];
    const C = M.CELL, w = g.w, h = g.h, cells = g.cells;
    const ci = (x, y) => [Math.floor((x - g.x0) / C), Math.floor((y - g.y0) / C)];
    const [si, sj] = ci(s[0], s[1]), [ei, ej] = ci(e[0], e[1]);
    const N = w * h, gs = new Float32Array(N).fill(1e9), from = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
    const heap = []; // [f, index]
    const push = (f, i) => { heap.push([f, i]); let c = heap.length - 1; while (c > 0) { const p = (c - 1) >> 1; if (heap[p][0] <= heap[c][0]) break; [heap[p], heap[c]] = [heap[c], heap[p]]; c = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let c = 0; for (;;) { let l = c * 2 + 1, r = l + 1, m = c; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === c) break; [heap[m], heap[c]] = [heap[c], heap[m]]; c = m; } } return top; };
    const hh = (i, j) => { const dx = Math.abs(i - ei), dy = Math.abs(j - ej); return Math.max(dx, dy) + 0.414 * Math.min(dx, dy); };
    const start = sj * w + si, goal = ej * w + ei;
    gs[start] = 0; push(hh(si, sj), start);
    let found = false, guard = 0;
    while (heap.length && guard++ < 400000) {
      const [, cur] = pop();
      if (closed[cur]) continue; closed[cur] = 1;
      if (cur === goal) { found = true; break; }
      const ci_ = cur % w, cj = (cur / w) | 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue;
        const ni = ci_ + di, nj = cj + dj;
        if (ni < 0 || nj < 0 || ni >= w || nj >= h) continue;
        const n = nj * w + ni;
        if (cells[n] || closed[n]) continue;
        if (di && dj && (cells[cj * w + ni] || cells[nj * w + ci_])) continue;
        const ng = gs[cur] + (di && dj ? 1.414 : 1);
        if (ng < gs[n]) { gs[n] = ng; from[n] = cur; push(ng + hh(ni, nj), n); }
      }
    }
    if (!found) return null;
    const pts = [];
    for (let c = goal; c !== -1 && c !== start; c = from[c]) pts.push([g.x0 + ((c % w) + 0.5) * C, g.y0 + (((c / w) | 0) + 0.5) * C]);
    pts.reverse();
    if (pts.length) pts[pts.length - 1] = e;
    // pull the string tight
    const out = []; let px = s[0], py = s[1], i = 0;
    while (i < pts.length) {
      let k = pts.length - 1;
      while (k > i && !M.clear(floor, px, py, pts[k][0], pts[k][1])) k--;
      out.push(pts[k]); px = pts[k][0]; py = pts[k][1]; i = k + 1;
    }
    return out;
  };
  // the other floor's stairs, as a place to walk to
  M.stairGoal = floor => { const r = M.floors[floor].stairs.run; return [r[0][0] + (r[1][0] - r[0][0]) * 0.3, r[0][1]]; };
  M.fixture = id => { for (const n of [1, 2]) { const x = M.floors[n].fixtures.find(q => q.id === id); if (x) return x; } return null; };
})();
