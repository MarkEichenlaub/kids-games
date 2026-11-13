// The house, measured in feet from the real floor plan. North is up: the alley and garage
// door are at the top, the front porch and the street at the bottom, the courtyard on the left.
(() => {
  const M = G.MAP = {};
  M.CELL = 0.5;      // walking grid, feet
  M.R = 0.5;         // how much room a kid needs around her feet

  // ---------- rooms ----------
  // rects are [x1, y1, x2, y2]; earlier rooms win where rects overlap. deco: kids may rearrange it.
  M.rooms = [
    // downstairs
    { id: 'pantry', floor: 1, icon: '🥫', name: 'Pantry', rects: [[18.7, 22.6, 23.8, 27.7]] },
    { id: 'powder', floor: 1, icon: '🚽', name: 'Little Bathroom', rects: [[3, 19.2, 8.4, 28.3]] },
    { id: 'garage', floor: 1, icon: '🚗', name: 'Garage', rects: [[3, 0, 23.8, 19.2]] },
    { id: 'kitchen', floor: 1, icon: '🍳', name: 'Kitchen', rects: [[8.4, 19.2, 23.8, 40.8]] },
    { id: 'dining', floor: 1, icon: '🍽️', name: 'Dining Room', deco: true, rects: [[15.4, 40.8, 23.8, 54]] },
    { id: 'living', floor: 1, icon: '🛋️', name: 'Living Room', deco: true, rects: [[0, 40.8, 15.4, 56.3]] },
    { id: 'porch', floor: 1, icon: '🏡', name: 'Front Porch', rects: [[0, 56.3, 23.8, 61], [15.4, 54, 23.8, 56.3]] },
    { id: 'courtyard', floor: 1, icon: '🌴', name: 'Courtyard', deco: true, rects: [[-7, 0, 3, 28.3], [-7, 28.3, 8.4, 40.8], [-7, 40.8, 0, 61]] },
    { id: 'alley', floor: 1, icon: '🚙', name: 'Back Alley', rects: [[-9, -8, 27, 0]] },
    { id: 'yard', floor: 1, icon: '🌳', name: 'Front Yard', rects: [[-9, 61, 30, 72]] },
    // upstairs
    { id: 'bedA', floor: 2, icon: '⭐', name: 'Star Bedroom', deco: true, kids: true, rects: [[3, 0, 13.35, 10.8], [3, 10.8, 9.8, 13.2]] },
    { id: 'bedB', floor: 2, icon: '🌙', name: 'Moon Bedroom', deco: true, kids: true, rects: [[13.35, 0, 23.8, 10.8], [18.9, 10.8, 23.8, 16.3]] },
    { id: 'kidsbath', floor: 2, icon: '🪥', name: 'Kids\' Bathroom', rects: [[3, 13.2, 8, 21.6]] },
    { id: 'laundry', floor: 2, icon: '🧺', name: 'Laundry Room', rects: [[3, 21.6, 8, 30.4]] },
    { id: 'bigcloset', floor: 2, icon: '👗', name: 'Big Closet', rects: [[13.8, 24.8, 23.8, 31.8]] },
    { id: 'bigbath', floor: 2, icon: '🛁', name: 'Big Bathroom', rects: [[13.8, 31.8, 23.8, 43.2]] },
    { id: 'sunhall', floor: 2, icon: '☀️', name: 'Sunny Hall', rects: [[8.4, 30.4, 13.8, 43.2]] },
    { id: 'primary', floor: 2, icon: '💜', name: 'Mama and Baba\'s Room', deco: true, rects: [[0, 43.2, 13.7, 56]] },
    { id: 'den', floor: 2, icon: '📚', name: 'Den', deco: true, rects: [[13.7, 43.2, 23.8, 56]] },
    { id: 'landing', floor: 2, icon: '🪜', name: 'Upstairs Hall', rects: [[8, 10.8, 23.8, 26], [9.8, 26, 13.8, 30.4]] },
  ];
  M.room = id => M.rooms.find(r => r.id === id);
  M.roomAt = (floor, x, y) => {
    for (const r of M.rooms) if (r.floor === floor) for (const q of r.rects) if (x >= q[0] && x <= q[2] && y >= q[1] && y <= q[3]) return r;
    return null;
  };
  M.roomCenter = id => { const q = M.room(id).rects[0]; return [(q[0] + q[2]) / 2, (q[1] + q[3]) / 2]; };
  // names the grown-ups can give the two kids' bedrooms
  M.ROOM_NAMES = {
    star: ['⭐', 'Star Bedroom'], moon: ['🌙', 'Moon Bedroom'], mira: ['🦉', 'Mira\'s Room'], maia: ['🦄', 'Maia\'s Room'],
    both: ['👭', 'Mira and Maia\'s Room'], play: ['🧸', 'Playroom'], guest: ['🛏️', 'Guest Room'],
  };
  M.roomName = r => { const k = r.kids && G.save.house.roomNames[r.id]; return k && M.ROOM_NAMES[k] ? M.ROOM_NAMES[k][1] : r.name; };
  M.roomIcon = r => { const k = r.kids && G.save.house.roomNames[r.id]; return k && M.ROOM_NAMES[k] ? M.ROOM_NAMES[k][0] : r.icon; };

  // ---------- floors ----------
  const F1 = {
    bounds: [-9, -8, 30, 72],
    // where feet may go (walls and furniture are cut out of these)
    areas: [
      [3, 0, 23.8, 19.2], [3, 19.2, 8.4, 28.3], [8.4, 19.2, 23.8, 40.8], [0, 40.8, 23.8, 54], [0, 54, 15.4, 56.3],
      [-7, -0.3, 3, 28.3], [-7, 28.3, 8.4, 40.8], [-7, 40.8, 0, 61],
      [0, 56.3, 23.8, 61], [15.4, 54, 23.8, 56.3],
      [-7, 61, 27, 68], [-9, 68, 30, 71.6], [-9, -8, 27, -0.3],
    ],
    walls: [
      [3, 0, 6, 0], [21.8, 0, 23.8, 0], [3, 0, 3, 10.5], [3, 13.5, 3, 28.3], [23.8, 0, 23.8, 54],
      [3, 19.2, 9.2, 19.2], [12.2, 19.2, 23.8, 19.2],
      [8.4, 19.2, 8.4, 25], [8.4, 28.3, 8.4, 33.1], [8.4, 36.1, 8.4, 40.8], [3, 28.3, 8.4, 28.3],
      [14.8, 22.6, 23.8, 22.6], [18.7, 22.6, 18.7, 27.7], [21.6, 27.7, 23.8, 27.7],
      [0, 40.8, 10.5, 40.8], [14.3, 40.8, 23.8, 40.8], [0, 40.8, 0, 56.3],
      [0, 56.3, 10.5, 56.3], [13.9, 56.3, 15.4, 56.3], [15.4, 54, 15.4, 56.3], [15.4, 54, 23.8, 54],
    ],
    fences: [
      [-7, -0.3, -7, 61, 'wood'], [-7, -0.3, -3.6, -0.3, 'wood'], [-0.4, -0.3, 3, -0.3, 'wood'],
      [-7, 61, -5.2, 61, 'wood'], [-2, 61, 0, 61, 'wood'],
      [0, 56.3, 0, 61, 'rail'], [0, 61, 9.4, 61, 'rail'], [15, 61, 23.8, 61, 'rail'], [23.8, 54, 23.8, 61, 'rail'],
      [27, 0, 27, 68, 'hedge'], [23.8, 61, 27, 61, 'none'],
    ],
    windows: [
      [1.2, 40.8, 6, 40.8], [3, 56.3, 7.6, 56.3], [16.6, 54, 20.6, 54],
      [23.8, 43.4, 23.8, 44.6], [23.8, 46.3, 23.8, 47.5], [23.8, 49.2, 23.8, 50.4],
      [8.4, 29.4, 8.4, 32.6], [8.4, 36.6, 8.4, 39.8], [5, 28.3, 6.6, 28.3], [17.4, 40.8, 21.8, 40.8, 'pass'],
    ],
    doors: [ // just the picture of an open door: hinge x, y, length, swing angle (degrees)
      [9.2, 19.2, 3, 250], [8.4, 25, 3, 160], [8.4, 33.1, 3, 200], [10.5, 56.3, 3.4, 290], [3, 10.5, 3, 20], [18.9, 27.7, 2.7, 60],
    ],
    stairs: { zone: [14.4, 19.45, 23.8, 22.35], arrive: [12.7, 23.2], run: [[14.5, 20.9], [22, 20.9]] },
    fixtures: [
      // garage
      { t: 'garagedoor', id: 'gdoor', x: 6, y: -0.3, w: 15.8, h: 0.6 },
      { t: 'car', x: 15.4, y: 3, w: 6.6, h: 13.6, solid: 1, act: 'car' },
      { t: 'shelf', x: 3.3, y: 0.5, w: 1.7, h: 6, solid: 1, act: 'shelf' },
      { t: 'panel', id: 'panel', x: 3.26, y: 7.2, w: 0.5, h: 2, act: 'panel' },
      { t: 'heater', x: 12.8, y: 16.9, w: 2, h: 2, solid: 1, act: 'heater' },
      { t: 'opener', x: 8.3, y: 18.55, w: 0.7, h: 0.45, act: 'opener' },
      { t: 'bikes', x: 4, y: 14.4, w: 3.6, h: 4, act: 'bike' },
      { t: 'rocket', x: 8.4, y: 1.4, w: 3, h: 3.4, solid: 1, act: 'rocket' },
      // little bathroom
      { t: 'toilet', x: 3.4, y: 19.55, w: 1.9, h: 2.4, r: 0, solid: 1, act: 'toilet' },
      { t: 'vanity', x: 3.3, y: 22.6, w: 2.6, h: 1.9, r: 3, solid: 1, act: 'sink' },
      // kitchen
      { t: 'ovens', x: 21.5, y: 28, w: 2.05, h: 2.2, solid: 1, act: 'oven' },
      { t: 'fridge', id: 'fridge', x: 21, y: 30.3, w: 2.55, h: 3.1, solid: 1, act: 'fridge' },
      { t: 'counter', x: 21.6, y: 33.5, w: 1.95, h: 7.05, solid: 1 },
      { t: 'cooktop', id: 'stove', x: 21.75, y: 34.6, w: 1.6, h: 2.8, act: 'stove' },
      { t: 'counter', x: 15.2, y: 38.55, w: 6.4, h: 2, solid: 1 },
      { t: 'ksink', id: 'ksink', x: 18.2, y: 38.8, w: 2.6, h: 1.5, act: 'ksink' },
      { t: 'island', id: 'island', x: 14.2, y: 29.8, w: 3.4, h: 7, solid: 1, act: 'island' },
      { t: 'stool', x: 12.95, y: 30.5, w: 1.1, h: 1.1, act: 'stool' }, { t: 'stool', x: 12.95, y: 32.75, w: 1.1, h: 1.1, act: 'stool' }, { t: 'stool', x: 12.95, y: 35, w: 1.1, h: 1.1, act: 'stool' },
      { t: 'kdesk', x: 15, y: 22.85, w: 3.5, h: 1.8, solid: 1, act: 'desk' },
      { t: 'pshelf', id: 'pantry', x: 19, y: 22.85, w: 4.55, h: 1.3, solid: 1, act: 'pantry' },
      { t: 'pshelf', x: 22.25, y: 24.2, w: 1.3, h: 3.2, solid: 1, act: 'pantry' },
      { t: 'stairs1', x: 13.6, y: 19.45, w: 10, h: 2.9, flat: 1 },
      // living room
      { t: 'fireplace', id: 'fire', x: 0.25, y: 44.6, w: 1.8, h: 6.4, solid: 1, act: 'fire' },
      { t: 'builtin', x: 0.25, y: 52, w: 1.6, h: 4, solid: 1, act: 'books' },
      // porch and front yard
      { t: 'mat', x: 10.9, y: 56.75, w: 2.6, h: 1.4, flat: 1 },
      { t: 'doorbell', id: 'doorbell', x: 14.05, y: 56.55, w: 0.6, h: 0.6, act: 'doorbell' },
      { t: 'flowerpot', x: 9.5, y: 56.8, w: 1.2, h: 1.2, solid: 1, act: 'flower' }, { t: 'flowerpot', x: 14.8, y: 56.8, w: 1.2, h: 1.2, solid: 1, act: 'flower' },
      { t: 'column', x: 0.3, y: 60.3, w: 0.8, h: 0.8, solid: 1 }, { t: 'column', x: 9, y: 60.3, w: 0.8, h: 0.8, solid: 1 },
      { t: 'column', x: 14.6, y: 60.3, w: 0.8, h: 0.8, solid: 1 }, { t: 'column', x: 22.8, y: 60.3, w: 0.8, h: 0.8, solid: 1 },
      { t: 'rocker', x: 18.6, y: 56.6, w: 2.3, h: 2.3, act: 'rocker' },
      { t: 'walk', x: 10.6, y: 61, w: 3.2, h: 7, flat: 1 },
      { t: 'bush', x: 1, y: 61.5, w: 3, h: 2.4, solid: 1 }, { t: 'bush', x: 4.6, y: 61.5, w: 3.6, h: 2.4, solid: 1 }, { t: 'bush', x: 15.6, y: 61.5, w: 3.4, h: 2.4, solid: 1 }, { t: 'bush', x: 19.6, y: 61.5, w: 3.6, h: 2.4, solid: 1 },
      { t: 'tree', x: 1.6, y: 64.4, w: 3, h: 3, solid: 1, act: 'tree' }, { t: 'tree', x: 21.5, y: 64.2, w: 3.2, h: 3.2, solid: 1, act: 'tree' },
      { t: 'mailbox', id: 'mailbox', x: 14.6, y: 66.4, w: 1.1, h: 1.1, solid: 1, act: 'mail' },
      { t: 'truck', id: 'truck', x: 15, y: 72.2, w: 13, h: 5.6, act: 'truck' },
      { t: 'sign', id: 'sign', x: -8.3, y: 68.6, w: 1.6, h: 1.6, act: 'town' },
      // courtyard
      { t: 'bistro', x: 3.8, y: 36.6, w: 3.8, h: 3.2, solid: 1, act: 'sit' },
      { t: 'planter', id: 'pot1', x: -6.5, y: 29.6, w: 1.7, h: 1.7, solid: 1, act: 'plant' }, { t: 'planter', id: 'pot2', x: -6.5, y: 32.4, w: 1.7, h: 1.7, solid: 1, act: 'plant' },
      { t: 'planter', id: 'pot3', x: -6.5, y: 35.2, w: 1.7, h: 1.7, solid: 1, act: 'plant' }, { t: 'planter', id: 'pot4', x: -6.5, y: 38, w: 1.7, h: 1.7, solid: 1, act: 'plant' },
      { t: 'banana', x: -6.5, y: 23.6, w: 2.6, h: 2.6, solid: 1, act: 'tree' },
      { t: 'acbox', x: 0.3, y: 20.4, w: 2.5, h: 3, solid: 1, act: 'ac' },
      { t: 'spigot', id: 'spigot', x: 7.55, y: 29, w: 0.7, h: 0.7, act: 'spigot' },
      { t: 'gate', x: -3.6, y: -0.3, w: 3.2, h: 0.3, r: 0 }, { t: 'gate', x: -5.2, y: 61, w: 3.2, h: 0.3, r: 0 },
      // alley
      { t: 'bins', x: 23.9, y: -3.4, w: 2.8, h: 2.6, solid: 1, act: 'bins' },
    ],
    spots: { mama: [12.4, 47], baba: [19.6, 32.2], start: [11.8, 69.6] },
  };

  const F2 = {
    bounds: [-3, -3, 27, 59],
    areas: [
      [3, 0, 23.8, 30.4], [8.4, 30.4, 23.8, 43.2], [0, 43.2, 23.8, 56],
    ],
    walls: [
      [3, 0, 23.8, 0], [3, 0, 3, 30.4], [3, 30.4, 9.8, 30.4], [8.4, 30.4, 8.4, 43.2], [0, 43.2, 9.8, 43.2], [0, 43.2, 0, 56], [0, 56, 23.8, 56], [23.8, 0, 23.8, 56],
      [13.35, 0, 13.35, 10.8],
      [3, 10.8, 3.6, 10.8], [8.8, 10.8, 10.2, 10.8], [13, 10.8, 13.7, 10.8], [16.5, 10.8, 19.2, 10.8], [21.7, 10.8, 23.8, 10.8],
      [3, 13.2, 9.8, 13.2], [9.8, 10.8, 9.8, 13.2], [18.9, 10.8, 18.9, 16.3], [18.9, 16.3, 23.8, 16.3],
      [8, 13.2, 8, 13.7], [8, 16.6, 8, 22.2], [8, 25.1, 8, 30.4], [3, 21.6, 8, 21.6],
      [8, 26, 9.8, 26], [9.8, 26, 9.8, 30.4], [9.8, 30.4, 10.2, 30.4], [13.2, 30.4, 13.8, 30.4],
      [13.8, 24.8, 23.8, 24.8], [13.8, 24.8, 13.8, 36.1], [13.8, 39, 13.8, 43.2],
      [12.6, 43.2, 23.8, 43.2], [13.7, 43.2, 13.7, 45.3], [13.7, 52.6, 13.7, 56],
      [13.8, 31.8, 17.8, 31.8], [20.5, 31.8, 23.8, 31.8], [17.2, 31.8, 17.2, 36], [13.8, 36, 14.4, 36], [16.9, 36, 17.2, 36],
    ],
    fences: [[14.3, 20.6, 20.5, 20.6, 'banister'], [14.3, 20.6, 14.3, 24.8, 'banister']],
    windows: [
      [5.6, 0, 9.6, 0], [16.2, 0, 20.2, 0], [3, 16.8, 3, 18.4], [5.2, 30.4, 6.8, 30.4], [23.8, 20.8, 23.8, 23.4],
      [8.4, 32.6, 8.4, 35.4], [8.4, 37, 8.4, 39.8], [0, 46, 0, 49], [0, 51.4, 0, 54], [4.2, 56, 8.2, 56], [1.8, 43.2, 6.4, 43.2],
      [23.8, 46.4, 23.8, 47.6], [23.8, 48.8, 23.8, 50], [23.8, 51.2, 23.8, 52.4], [17, 56, 21, 56], [23.8, 40.4, 23.8, 42],
    ],
    doors: [
      [10.2, 10.8, 2.8, 60], [16.5, 10.8, 2.8, 120], [19.2, 10.8, 2.5, 300], [8, 13.7, 2.9, 200], [8, 22.2, 2.9, 200],
      [10.2, 30.4, 3, 70], [13.8, 36.1, 2.9, 340], [17.8, 31.8, 2.7, 300], [14.4, 36, 2.5, 50],
    ],
    stairs: { zone: [19.1, 16.5, 23.8, 24.8], arrive: [17.2, 18.4], run: [[19.5, 18.4], [22, 18.4]] },
    blocked: [[14.3, 20.6, 19, 24.8]],
    fixtures: [
      { t: 'stairs2', x: 14.3, y: 16.5, w: 9.5, h: 8.3, flat: 1 },
      { t: 'block', x: 8, y: 26, w: 1.8, h: 4.4, solid: 1 },
      { t: 'closet', id: 'closetA', x: 3.3, y: 11.3, w: 6.2, h: 1.6, solid: 1, act: 'closet' },
      { t: 'closet', id: 'closetB', x: 19.2, y: 13.9, w: 4.35, h: 2.1, solid: 1, act: 'closet' },
      { t: 'doorsign', room: 'bedA', x: 11, y: 11.25, w: 1.2, h: 1.2 }, { t: 'doorsign', room: 'bedB', x: 15.6, y: 11.25, w: 1.2, h: 1.2 },
      // kids' bathroom
      { t: 'vanity', id: 'kidsink', x: 3.3, y: 13.5, w: 2.6, h: 1.9, r: 3, solid: 1, act: 'sink' },
      { t: 'toilet', x: 3.3, y: 16.3, w: 2.4, h: 1.9, r: 3, solid: 1, act: 'toilet' },
      { t: 'shower', x: 3.25, y: 18.6, w: 4.5, h: 2.75, act: 'shower' },
      // laundry
      { t: 'washer', id: 'washer', x: 3.3, y: 22, w: 2.5, h: 2.5, solid: 1, act: 'washer' },
      { t: 'dryer', id: 'dryer', x: 3.3, y: 24.6, w: 2.5, h: 2.5, solid: 1, act: 'dryer' },
      { t: 'lsink', x: 3.3, y: 27.4, w: 2.2, h: 2.7, solid: 1, act: 'sink' },
      // hall
      { t: 'nook', x: 8.3, y: 17.3, w: 2, h: 4.4, solid: 1, act: 'nook' },
      { t: 'lowshelf', x: 8.65, y: 31.4, w: 1.3, h: 11, solid: 1, act: 'books' },
      // big closet, big bathroom
      { t: 'closet', id: 'closetBig', x: 14.2, y: 25.1, w: 9.3, h: 1.5, solid: 1, act: 'closetBig' },
      { t: 'toilet', x: 14.25, y: 32.1, w: 1.9, h: 2.4, r: 0, solid: 1, act: 'toilet' },
      { t: 'vanity2', x: 21.6, y: 32.5, w: 1.95, h: 6.6, solid: 1, act: 'sink' },
      { t: 'tub', id: 'tub', x: 18.5, y: 39.8, w: 5.05, h: 3.1, solid: 1, act: 'tub' },
      { t: 'shower', x: 14.1, y: 39.7, w: 4, h: 3.2, act: 'shower' },
    ],
    spots: {},
  };
  M.floors = { 1: F1, 2: F2 };

  // furniture that is in the house on moving day (kids can move all of it)
  // [type, x, y, quarter-turns]
  M.defaults = {
    living: [['rugGeo', 7.4, 48.6, 0], ['sofa', 7.2, 54.2, 2], ['armchair', 4.4, 43.4, 0], ['armchair', 9.4, 43.4, 0], ['coffee', 7.3, 48.4, 0], ['plant', 2.9, 54.6, 0], ['piano', 13.6, 49.5, 1]],
    dining: [['rugBeige', 19.7, 47.3, 0], ['dtable', 19.7, 47.3, 0]],
    courtyard: [['ball', 1.2, 33, 0]],
    bedA: [['bedPink', 5.2, 4.2, 0], ['dresser', 11.6, 4.5, 1], ['box', 9.2, 8.6, 0]],
    bedB: [['bedPurple', 21.2, 4.2, 0], ['dresser', 15, 4.5, 3], ['box', 17.8, 8.6, 0]],
    primary: [['rugGray', 5.6, 50.6, 0], ['bigbed', 5.6, 47.1, 0], ['nightstand', 1.5, 44.6, 0], ['nightstand', 9.7, 44.6, 0]],
    den: [['armchair', 21.6, 45.6, 0], ['bookshelf', 18.8, 54.9, 2], ['box', 16, 50, 0]],
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
    for (const s of F.walls) blockSeg(s, 0.25 + M.R);
    for (const s of F.fences) blockSeg(s, 0.15 + M.R);
    for (const f of F.fixtures) {
      if (f.t === 'garagedoor') { if (!G.save.house.garageOpen) blockSeg([f.x, 0, f.x + f.w, 0], 0.25 + M.R); continue; }
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
    while (heap.length && guard++ < 60000) {
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
  M.stairGoal = floor => { const z = M.floors[floor].stairs.zone; return floor === 1 ? [z[0] + 1.2, (z[1] + z[3]) / 2] : [z[0] + 1, 18.4]; };
  for (const n of [1, 2]) M.floors[n].fixtures.forEach(f => { f.floor = n; });
  M.fixture = id => { for (const n of [1, 2]) { const x = M.floors[n].fixtures.find(q => q.id === id); if (x) return x; } return null; };
})();
