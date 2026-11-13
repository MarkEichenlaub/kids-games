# Our New House

A game for Mira and Maia to get to know the new house before moving day.

The house in the game is traced from the listing's two floor plan drawings: every wall,
window and door in `js/map.js` is given in pixels on those drawings and converted to feet,
so the rooms are the real rooms at the real sizes. What is built in (kitchen, bathrooms,
laundry, fireplace and shelves, closets, the desk at the top of the stairs, the courtyard
and porch) is placed from the listing photos. The furniture on day one is our own, drawn
from photos of the old house (the rainbow rug, the blue rug, the black and white sofas,
the piano, the dinner table, the white shelves, the dollhouse, the beds); where each piece
really goes is a first guess, and the kids can move all of it. The play corner is in the
living room by the fireplace; the den off the big bedroom is Baba's office, and Mama works
at the built-in desk at the top of the stairs, which is where the kids find them for jobs.

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
- The sign on the sidewalk opens the neighborhood. With the family key it is the real map
  (the streets around our house, sealed in `data/town.bin`): the pool, the little park, the
  big park, Mira's school, the library, and Maia's school a car ride away. Without the key it
  is a made-up little town with the same places. Each place is a scene drawn to look like
  the real one, with something to do (swim to the pool toys, slide and swing, catch
  butterflies, find the kindergarten door, hang up a backpack and slide, read three books).
- Maia's school has an inside: tap its red door for her classroom (her own cubby, the teacher,
  the sink, an easel to paint, a fish tank to feed, nap mats, the circle rug, a block tower that
  falls over, and a book corner). Trying all nine earns a star.
- The books at the library (eight) and in the classroom's book corner (two) are real picture
  books: each opens full screen and Beep reads every page aloud. The words live in `js/lines.js`
  (`books`) so they get recorded with the rest of Beep's voice; the pictures are in `js/town.js`.