# Twin Pond — Spot the Difference

A complete, original spot-the-difference game that plays offline in a desktop
browser from its own static files. Three hand-drawn (procedurally painted, no
borrowed images) scenes, 10 fair differences each, with a timer, hints, streaks,
keyboard play and a win screen.

## Play

Open `game/index.html` in desktop Chrome (or serve the folder with
`node serve.ts` and open http://localhost:8080).

- **Click** a difference in either picture to circle it. Clicking the same spot
  in either panel counts — the pictures are twins, so a difference lives in
  both.
- **Arrow keys** move the crosshair, **Enter / Space** marks the spot under it.
- **H** asks for a hint (3 per level, costs 10 seconds). **P** pauses.
  **M** mutes. **R** restarts the level. **1 / 2 / 3** pick a scene on the title
  screen.
- A wrong click costs 5 seconds and breaks your streak. Find all 10 before the
  timer runs out to clear the level; clear all three scenes to win.

## Scenes

1. **Koi Pond at Dusk** — easy, 3:00. Lanterns, koi, a frog and a sleepy moon.
2. **The Clockmaker's Attic** — medium, 2:30. Clocks, gears, a cat and candles.
3. **Starlight Picnic Meadow** — hard, 2:00. A tent, a cake, an owl and fireflies.

## Files

- `game/index.html` — the page; `game/src/` holds one job per file:
  `config.js` (tuning), `scenes.js` (the three painted scenes and their
  differences), `world.js` (rules and state), `render.js` (drawing),
  `input.js` (keyboard + pointer), `audio.js` (WebAudio chimes),
  `shots.js` (the screenshot scenes), `main.js` (boot + loop), `random.js`.
- `main.ts` — the make.fun entrypoint: copies `game/` and `screenshots/` to
  `/output` and writes `dossier.json`.
- `screenshots/` — real renders of the game's own code, taken in headless
  Chrome from `?shot=play|play2|play3|end` (see `shots.json`).

## Screenshots

Taken with headless Chrome against the local server, one per `?shot=` scene,
then converted to JPEG (quality 82) with Pillow — no edits, no compositing.
