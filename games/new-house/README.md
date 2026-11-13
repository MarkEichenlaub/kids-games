# Our New House

A game for Mira and Maia to get to know the new house before moving day. The house in the
game follows the real floor plan, room for room.

- Pick who is playing, then a costume (the closets change it later).
- Walk by tapping, or with the arrow keys. Space touches the nearest thing. A second
  player can move the sister with W, A, S, D.
- Every room gives a stamp the first time you walk in. All 20 stamps earn a pet.
- The paint button in a bedroom, the living room, the dining room, the den or the
  courtyard opens decorating: drag furniture, add things from the drawer, paint.
- Mama and Baba hand out jobs (unpack boxes, find the hiding stuffed animals, match
  socks, bedtime, pancakes, plant flowers, fix the lights, go to the pool). Each job
  ends with a package on the porch that adds two new things to the drawer.
- 17 tiny friends hide inside things around the house.
- The sign on the sidewalk leads to the pool, the playground, the park, the school and
  the library.

Progress is saved in the browser, per kid; the furniture and paint are shared.

## Privacy

This repo is public, so nothing here says where the house is. The real photos of the
rooms are AES-encrypted in `data/` with the same family key as What's Hiding?; a device
that has opened Dad's link for that game shows them here too (the camera button, the
passport, and a snapshot the first time you enter a room). Without the key the game
plays the same, minus the photos. The key can also be pasted under Grown-ups.

## Rebuilding

    node tools/build-voice.mjs && python tools/render_voice.py   # after changing js/lines.js
    python tools/build_photos.py                                  # after changing the photo list

`render_voice.py` needs `pip install edge-tts` and ffmpeg. `build_photos.py` reads the
originals and the key from `G:\My Drive\kids-games-private`.

## Files

`js/map.js` is the floor plan (feet, north up). `js/art.js` and `js/people.js` draw
everything. `js/items.js` is the furniture. `js/lines.js` holds every sentence Beep
says. `js/world.js` is walking and the camera, `js/acts.js` what things do when
touched, `js/decor.js` decorating, `js/quests.js` the jobs and their little games,
`js/town.js` the neighborhood, `js/screens.js` the title, costumes, passport and
grown-ups page.
