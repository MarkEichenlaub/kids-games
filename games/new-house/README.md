# Our New House

A game for Mira and Maia to get to know the new house before moving day.

The house in the game is traced from the listing's two floor plan drawings: every wall,
window and door in `js/map.js` is given in pixels on those drawings and converted to feet,
so the rooms are the real rooms at the real sizes. What is built in (kitchen, bathrooms,
laundry, fireplace and shelves, closets, the desk at the top of the stairs, the courtyard
and porch) is placed from the listing photos. The furniture on day one is our own, drawn
from photos of the old house (the rainbow rug, the blue rug, the black and white sofas,
the piano, the dinner table, the white shelves, the dollhouse, the beds); where each piece
really goes is a first guess, and the kids can move all of it.

Three views, on the button at the top: the flat map, a 3D dollhouse you can turn and zoom,
and walking inside in 3D. Everything works in all three, including decorating and obstacle
courses. The 3D scene is built from the same map and drawings (`js/view3d.js`, with
three.js in `vendor/`, MIT license).

- Pick who is playing, then a costume (the closets change it later).
- Walk by tapping, or with the arrow keys. Space touches the nearest thing. A second
  player can move the sister with W, A, S, D.
- Every room gives a stamp the first time you walk in. All 20 stamps earn a pet.
- The paint button in a bedroom, the living room, the dining room, the den or the
  courtyard opens decorating: drag furniture, add things from the drawer, paint.
- Mama and Baba hand out jobs (an obstacle course, unpack boxes, find the hiding stuffed
  animals, match socks, bedtime, pancakes, plant flowers, fix the lights, go to the pool). Each job
  ends with a package on the porch that adds two new things to the drawer.
- Obstacle courses: the flag tab in the decorating drawer has a start flag, a finish line
  and ten kinds of obstacle (cones, hurdle, tunnel, balance beam, stepping stones, hoop,
  bouncer, pillow mountain, spinner, lava). The dice builds a surprise course. A room with
  a start, a finish and at least one obstacle shows a flag button: tap it to run the course
  against the clock, clearing the obstacles in order. Baba's first job is a course in the
  courtyard (Maia gets one built for her; Mira builds her own).
- 17 tiny friends hide inside things around the house.
- The sign on the sidewalk leads to the pool, the playground, the park, the school and
  the library.

Progress is saved in the browser, per kid; the furniture and paint are shared.

## Privacy

This repo is public, so nothing here says where the house is. The house number on the
plaques by the front door and the garage is sealed in `data/info.bin` and shows only
with the family key; without it the plaques are blank. The real photos of the
rooms are AES-encrypted in `data/` with the same family key as What's Hiding?; a device
that has opened Dad's link for that game shows them here too (the camera button, the
passport, and a snapshot the first time you enter a room). Without the key the game
plays the same, minus the photos. The key can also be pasted under Grown-ups.

## Changing the game

After changing any file in `js/` or `style.css`, raise the `?v=` number on the script and
stylesheet lines in `index.html`, so browsers that have the old files saved fetch the new
ones together.

## Rebuilding

    node tools/build-voice.mjs && python tools/render_voice.py   # after changing js/lines.js
    python tools/build_photos.py                                  # after changing the photo list

`render_voice.py` needs `pip install edge-tts` and ffmpeg. `build_photos.py` reads the
originals and the key from `G:\My Drive\kids-games-private`.

## Files

`js/map.js` is the floor plan (feet, north up). `js/art.js` and `js/people.js` draw
everything. `js/items.js` is the furniture. `js/lines.js` holds every sentence Beep
says. `js/world.js` is walking and the camera, `js/acts.js` what things do when
touched, `js/decor.js` decorating, `js/course.js` obstacle courses, `js/view3d.js` the 3D views, `js/quests.js` the jobs and their little games,
`js/town.js` the neighborhood, `js/screens.js` the title, costumes, passport and
grown-ups page.
