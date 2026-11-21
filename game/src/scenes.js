// The three scenes. Each scene paints itself twice: variant 0 is the original,
// variant 1 is the twin, with exactly the scene's 10 differences applied. Every
// picture is drawn by this file's own code — no image files, no borrowed art.
// A difference is { x, y, r, label }: its spot in panel coordinates (592x440),
// the radius a click must land in, and the name the game announces when found.

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, width, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function star(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const a = (i * Math.PI) / 4;
    const rr = i % 2 === 0 ? r : r * 0.4;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function text(ctx, value, x, y, size, color, align) {
  ctx.font = `bold ${size}px system-ui, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

function sky(ctx, top, bottom, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, 300);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 592, 300);
  void top;
  void bottom;
}

function nightStars(ctx, list, twin, missingIndex) {
  for (let i = 0; i < list.length; i += 1) {
    if (twin && i === missingIndex) continue;
    star(ctx, list[i][0], list[i][1], list[i][2], '#ffe9a8');
  }
}

/** A koi fish: orange body, white belly patch, forked tail, facing `dir`. */
function koi(ctx, x, y, dir, twin) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  poly(ctx, [[-34, 0], [-52, -12], [-52, 12]], '#e8703a');
  ellipse(ctx, 0, 0, 34, 13, '#f08a3c');
  ellipse(ctx, 6, 3, 18, 7, '#fff3d6');
  circle(ctx, 26, -3, 3, '#1d2b36');
  ctx.fillStyle = '#e8703a';
  ctx.beginPath();
  ctx.ellipse(28, 0, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  void twin;
  ctx.restore();
}

/** A paper lantern hanging from a string at (x, y). */
function lantern(ctx, x, y, color) {
  line(ctx, x, y - 26, x, y - 12, 2, '#7a5a2e');
  ellipse(ctx, x, y, 17, 20, color);
  ctx.fillStyle = 'rgba(255,240,180,0.85)';
  ctx.fillRect(x - 3, y - 16, 6, 32);
  ellipse(ctx, x, y - 20, 7, 4, '#c9a227');
  ellipse(ctx, x, y + 20, 7, 4, '#c9a227');
}

/** A lily pad with an optional flower. */
function lilyPad(ctx, x, y, r, flowerColor) {
  ellipse(ctx, x, y, r, r * 0.55, '#3f8f4f');
  ellipse(ctx, x - r * 0.3, y - r * 0.1, r * 0.6, r * 0.35, '#57ab63');
  if (flowerColor) {
    for (let i = 0; i < 5; i += 1) {
      const a = (i * Math.PI * 2) / 5;
      circle(ctx, x + Math.cos(a) * 8, y - 6 + Math.sin(a) * 5, 5, flowerColor);
    }
    circle(ctx, x, y - 6, 5, '#ffd94d');
  }
}

function drawPond(ctx, twin) {
  // Dusk sky, hills, pond.
  sky(ctx, 0, 0, [[0, '#2b2a55'], [0.55, '#7a4a6e'], [1, '#e08a5a']]);
  nightStars(ctx, [[40, 30, 5], [150, 22, 4], [260, 40, 5], [380, 26, 4], [520, 44, 5], [470, 80, 4], [90, 90, 3]], twin, 4);
  // Moon: full in the original, a crescent in the twin.
  circle(ctx, 86, 58, 34, '#ffe9a8');
  if (twin) circle(ctx, 98, 52, 30, '#7a4a6e');
  ellipse(ctx, 70, 250, 260, 60, '#3d5c3a');
  ellipse(ctx, 520, 255, 220, 55, '#33502f');
  // Clouds.
  ellipse(ctx, 200, 90, 70, 16, 'rgba(255,210,180,0.55)');
  ellipse(ctx, 430, 120, 80, 15, 'rgba(255,210,180,0.45)');
  // Pond.
  const water = ctx.createLinearGradient(0, 240, 0, 440);
  water.addColorStop(0, '#3d7ea6');
  water.addColorStop(1, '#1d4e6e');
  ctx.fillStyle = water;
  ctx.beginPath();
  ctx.ellipse(296, 345, 292, 100, 0, 0, Math.PI * 2);
  ctx.fill();
  // Moon reflection.
  ellipse(ctx, 86, 330, 26, 8, 'rgba(255,233,168,0.5)');
  ellipse(ctx, 86, 352, 18, 6, 'rgba(255,233,168,0.35)');
  // Wooden bridge over the pond.
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(296, 300, 150, 46, 0, Math.PI, Math.PI * 2);
  ctx.strokeStyle = '#8a5a2e';
  ctx.lineWidth = 16;
  ctx.stroke();
  ctx.restore();
  for (let i = 0; i < 7; i += 1) {
    const x = 176 + i * 40;
    const y = 258 - Math.sin((i / 6) * Math.PI) * 26;
    rect(ctx, x - 3, y - 6, 6, 26, '#6e4522');
  }
  // One bridge post is missing in the twin.
  if (!twin) rect(ctx, 347, 196, 6, 26, '#6e4522');
  // Lanterns hang from the bridge; the middle one changes colour.
  lantern(ctx, 180, 168, '#e5534b');
  lantern(ctx, 296, 150, twin ? '#2fa8a0' : '#e5534b');
  lantern(ctx, 412, 168, '#e5534b');
  // Koi: one swims away in the twin.
  koi(ctx, 150, 300, 1);
  if (!twin) koi(ctx, 250, 340, -1);
  koi(ctx, 380, 300, -1);
  koi(ctx, 470, 350, 1);
  // Lily pads; the flower on the right pad changes colour.
  lilyPad(ctx, 120, 360, 30, null);
  lilyPad(ctx, 430, 330, 28, twin ? '#ffd94d' : '#ff7eb6');
  lilyPad(ctx, 520, 385, 24, null);
  // The frog sits on the left pad in the original only.
  if (!twin) {
    ellipse(ctx, 120, 352, 20, 14, '#57ab63');
    circle(ctx, 108, 340, 7, '#57ab63');
    circle(ctx, 132, 340, 7, '#57ab63');
    circle(ctx, 108, 338, 2.5, '#1d2b36');
    circle(ctx, 132, 338, 2.5, '#1d2b36');
  }
  // A dragonfly visits only the twin.
  if (twin) {
    line(ctx, 480, 170, 468, 158, 2, 'rgba(255,255,255,0.8)');
    line(ctx, 480, 170, 492, 158, 2, 'rgba(255,255,255,0.8)');
    ellipse(ctx, 480, 172, 3, 10, '#2fa8a0');
  }
  // Reeds and cattails at the edges; the twin grows one extra cattail.
  for (const [x, h] of [[18, 90], [40, 70], [556, 80]]) {
    line(ctx, x, 440, x, 440 - h, 3, '#3f8f4f');
    ellipse(ctx, x, 440 - h - 8, 5, 12, '#6e4522');
  }
  if (twin) {
    line(ctx, 566, 440, 566, 360, 3, '#3f8f4f');
    ellipse(ctx, 566, 352, 5, 12, '#6e4522');
  }
  // Stepping stones: the middle one changes colour.
  ellipse(ctx, 210, 400, 26, 10, '#8b93a3');
  ellipse(ctx, 250, 395, 26, 10, twin ? '#6ec6e8' : '#8b93a3');
  ellipse(ctx, 292, 400, 26, 10, '#8b93a3');
}

function drawAttic(ctx, twin) {
  // Wooden attic wall and floor.
  sky(ctx, 0, 0, [[0, '#5a3d24'], [1, '#7a5a38']]);
  for (let x = 0; x < 592; x += 74) rect(ctx, x, 0, 2, 300, 'rgba(0,0,0,0.25)');
  rect(ctx, 0, 300, 592, 140, '#4a3220');
  rect(ctx, 0, 300, 592, 8, '#6e4522');
  // Round window with the moon; one star is missing in the twin.
  circle(ctx, 80, 80, 52, '#2b2a55');
  circle(ctx, 80, 80, 46, '#1d2b4a');
  circle(ctx, 66, 66, 14, '#ffe9a8');
  nightStars(ctx, [[100, 60, 4], [60, 100, 3], [104, 96, 3]], twin, 0);
  line(ctx, 80, 34, 80, 126, 4, '#8a5a2e');
  line(ctx, 34, 80, 126, 80, 4, '#8a5a2e');
  // Shelf of books; one book changes colour.
  rect(ctx, 420, 96, 150, 10, '#6e4522');
  const books = ['#e5534b', '#4fc3c3', '#f2c94c', '#5ec97a', '#9b7ede', '#e5534b'];
  books.forEach((color, i) => {
    const x = 428 + i * 22;
    rect(ctx, x, 62, 18, 34, twin && i === 2 ? '#5ec97a' : color);
  });
  // Birdcage hanging from the ceiling; the bird is gone in the twin.
  line(ctx, 360, 0, 360, 44, 2, '#c9a227');
  ellipse(ctx, 360, 92, 30, 40, 'rgba(201,162,39,0.25)');
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(360, 92, 30, 40, 0, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = -2; i <= 2; i += 1) line(ctx, 360 + i * 11, 54, 360 + i * 11, 130, 1, '#c9a227');
  if (!twin) {
    ellipse(ctx, 360, 96, 12, 9, '#4fc3c3');
    circle(ctx, 370, 90, 6, '#4fc3c3');
    poly(ctx, [[376, 90], [382, 92], [376, 94]], '#f2c94c');
  }
  // The big clock: hands point to a different time in the twin, and XII is gone.
  circle(ctx, 296, 180, 96, '#f7f3e8');
  ctx.strokeStyle = '#6e4522';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(296, 180, 96, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 12; i += 1) {
    const a = (i * Math.PI) / 6;
    const x1 = 296 + Math.cos(a) * 82;
    const y1 = 180 + Math.sin(a) * 82;
    const x2 = 296 + Math.cos(a) * 88;
    const y2 = 180 + Math.sin(a) * 88;
    line(ctx, x1, y1, x2, y2, i % 3 === 0 ? 4 : 2, '#1d2b36');
  }
  if (!twin) text(ctx, 'XII', 296, 108, 18, '#1d2b36', 'center');
  text(ctx, 'VI', 296, 252, 18, '#1d2b36', 'center');
  text(ctx, 'III', 368, 180, 18, '#1d2b36', 'center');
  text(ctx, 'IX', 224, 180, 18, '#1d2b36', 'center');
  // Hands: 10:10 in the original, 4:40 in the twin.
  const [hA, mA] = twin ? [2.6, 4.6] : [5.2, 0.35];
  line(ctx, 296, 180, 296 + Math.cos(hA - Math.PI / 2 + Math.PI) * 0 + Math.sin(hA) * 48, 180 - Math.cos(hA) * 48, 6, '#1d2b36');
  line(ctx, 296, 180, 296 + Math.sin(mA) * 70, 180 - Math.cos(mA) * 70, 4, '#e5534b');
  circle(ctx, 296, 180, 6, '#1d2b36');
  // Gears under the clock; the right gear changes colour.
  function gear(cx, cy, r, color) {
    for (let i = 0; i < 8; i += 1) {
      const a = (i * Math.PI) / 4;
      rect(ctx, cx + Math.cos(a) * (r + 4) - 5, cy + Math.sin(a) * (r + 4) - 5, 10, 10, color);
    }
    circle(ctx, cx, cy, r, color);
    circle(ctx, cx, cy, r * 0.4, '#f7f3e8');
  }
  gear(110, 300, 42, '#c9a227');
  gear(480, 300, 38, twin ? '#2fa8a0' : '#c9a227');
  // Work table with candles, teapot and tools.
  rect(ctx, 90, 360, 412, 14, '#8a5a2e');
  rect(ctx, 100, 374, 12, 40, '#6e4522');
  rect(ctx, 480, 374, 12, 40, '#6e4522');
  for (const [x, lit] of [[150, true], [200, !twin], [250, true]]) {
    rect(ctx, x - 5, 330, 10, 30, '#f7f3e8');
    if (lit) {
      ellipse(ctx, x, 322, 5, 9, '#f2a541');
      ellipse(ctx, x, 324, 3, 5, '#ffe9a8');
    }
  }
  // Teapot and cups; the twin adds a second cup.
  ellipse(ctx, 520, 348, 24, 16, '#4fc3c3');
  poly(ctx, [[542, 344], [556, 336], [556, 352]], '#4fc3c3');
  circle(ctx, 520, 330, 6, '#4fc3c3');
  ellipse(ctx, 470, 352, 12, 8, '#f7f3e8');
  if (twin) ellipse(ctx, 440, 352, 12, 8, '#f7f3e8');
  // Hammer and wrench on the table.
  line(ctx, 300, 352, 340, 352, 4, '#8a5a2e');
  rect(ctx, 336, 344, 16, 16, '#8b93a3');
  line(ctx, 360, 352, 396, 352, 3, '#8b93a3');
  circle(ctx, 398, 352, 7, '#8b93a3');
  // The cat naps on the rug; its tail is gone in the twin.
  ellipse(ctx, 150, 415, 130, 16, '#9b3d4e');
  ellipse(ctx, 150, 415, 90, 10, '#c95a6e');
  if (twin) rect(ctx, 108, 410, 84, 10, '#c95a6e');
  ellipse(ctx, 150, 400, 46, 16, '#e8a33d');
  circle(ctx, 186, 392, 14, '#e8a33d');
  poly(ctx, [[176, 382], [180, 368], [188, 380]], '#e8a33d');
  poly(ctx, [[192, 380], [198, 368], [200, 382]], '#e8a33d');
  line(ctx, 196, 394, 206, 394, 2, '#1d2b36');
  if (!twin) {
    line(ctx, 106, 402, 84, 388, 5, '#e8a33d');
    circle(ctx, 82, 386, 4, '#e8a33d');
  }
}

function drawMeadow(ctx, twin) {
  // Night sky, moon, fireflies.
  sky(ctx, 0, 0, [[0, '#101c3a'], [0.6, '#274b63'], [1, '#3f6e5a']]);
  nightStars(ctx, [[60, 40, 5], [200, 30, 4], [330, 50, 5], [440, 36, 4], [520, 90, 4], [150, 90, 3], [280, 80, 3]], twin, 2);
  circle(ctx, 500, 70, 30, '#ffe9a8');
  circle(ctx, 490, 62, 6, 'rgba(0,0,0,0.12)');
  circle(ctx, 508, 78, 4, 'rgba(0,0,0,0.12)');
  // Fireflies; the twin has one extra.
  const flies = [[350, 90], [420, 140], [240, 120], [520, 200], [90, 200]];
  for (const [x, y] of flies) {
    circle(ctx, x, y, 7, 'rgba(255,233,120,0.25)');
    circle(ctx, x, y, 3, '#ffe978');
  }
  if (twin) {
    circle(ctx, 300, 60, 7, 'rgba(255,233,120,0.25)');
    circle(ctx, 300, 60, 3, '#ffe978');
  }
  // Rolling meadow.
  ellipse(ctx, 296, 470, 420, 110, '#2f6b3a');
  ellipse(ctx, 60, 460, 200, 70, '#3f8f4f');
  ellipse(ctx, 540, 465, 200, 70, '#357a44');
  // The owl on its branch; its eyes are open in the original, shut in the twin.
  line(ctx, 40, 130, 150, 118, 6, '#6e4522');
  ellipse(ctx, 90, 112, 22, 26, '#8a6a4a');
  circle(ctx, 78, 96, 8, '#8a6a4a');
  circle(ctx, 102, 96, 8, '#8a6a4a');
  if (twin) {
    line(ctx, 84, 104, 92, 104, 2, '#1d2b36');
    line(ctx, 100, 104, 108, 104, 2, '#1d2b36');
  } else {
    circle(ctx, 88, 104, 4, '#ffe9a8');
    circle(ctx, 104, 104, 4, '#ffe9a8');
    circle(ctx, 88, 104, 2, '#1d2b36');
    circle(ctx, 104, 104, 2, '#1d2b36');
  }
  poly(ctx, [[86, 118], [94, 118], [90, 126]], '#f2c94c');
  // The tent; its little flag is gone in the twin.
  poly(ctx, [[60, 330], [150, 210], [240, 330]], '#e5534b');
  poly(ctx, [[105, 330], [150, 270], [195, 330]], '#f7f3e8');
  poly(ctx, [[128, 330], [150, 292], [172, 330]], '#2b2a55');
  line(ctx, 150, 210, 150, 176, 3, '#6e4522');
  if (!twin) poly(ctx, [[150, 176], [176, 184], [150, 192]], '#f2c94c');
  // The picnic blanket, cake and basket.
  poly(ctx, [[240, 360], [380, 360], [400, 420], [220, 420]], '#f7f3e8');
  for (let i = 0; i < 4; i += 1) {
    for (let j = 0; j < 2; j += 1) {
      if ((i + j) % 2 === 0) rect(ctx, 245 + i * 35, 362 + j * 28, 35, 28, '#e5534b');
    }
  }
  // The cake; its candle is unlit — missing — in the twin.
  ellipse(ctx, 300, 372, 26, 12, '#ff9ec6');
  rect(ctx, 278, 350, 44, 22, '#fff3d6');
  ellipse(ctx, 300, 350, 22, 8, '#ff9ec6');
  if (!twin) {
    rect(ctx, 298, 336, 4, 12, '#f2c94c');
    ellipse(ctx, 300, 332, 4, 7, '#f2a541');
  }
  // Basket with an apple; the apple is gone in the twin.
  rect(ctx, 232, 372, 30, 20, '#8a5a2e');
  ellipse(ctx, 247, 372, 15, 6, '#6e4522');
  if (!twin) circle(ctx, 247, 364, 7, '#e5534b');
  // Balloons; one changes colour in the twin.
  for (const [x, y, color] of [[470, 110, '#e5534b'], [505, 135, '#4fc3c3'], [440, 150, '#f2c94c']]) {
    const c = twin && x === 505 ? '#9b7ede' : color;
    ellipse(ctx, x, y, 16, 20, c);
    line(ctx, x, y + 20, x - 6, y + 60, 1, 'rgba(255,255,255,0.6)');
  }
  // The kite in the tree; one tail bow is missing in the twin.
  line(ctx, 540, 210, 520, 250, 2, '#8b93a3');
  poly(ctx, [[540, 190], [566, 210], [540, 230], [516, 210]], '#f2c94c');
  if (!twin) poly(ctx, [[532, 240], [540, 232], [548, 240], [540, 248]], '#e5534b');
  poly(ctx, [[524, 258], [532, 250], [540, 258], [532, 266]], '#4fc3c3');
  // The rabbit and its carrot; the carrot is gone in the twin.
  ellipse(ctx, 180, 400, 24, 18, '#f7f3e8');
  circle(ctx, 200, 384, 12, '#f7f3e8');
  ellipse(ctx, 192, 364, 4, 12, '#f7f3e8');
  ellipse(ctx, 202, 364, 4, 12, '#f7f3e8');
  circle(ctx, 204, 382, 2, '#1d2b36');
  if (!twin) {
    poly(ctx, [[216, 402], [236, 396], [216, 408]], '#f08a3c');
    poly(ctx, [[234, 396], [240, 388], [238, 398]], '#57ab63');
  }
  // The telescope; it changes colour in the twin.
  line(ctx, 380, 400, 380, 420, 4, '#6e4522');
  line(ctx, 360, 420, 400, 420, 4, '#6e4522');
  const tc = twin ? '#2fa8a0' : '#c9a227';
  poly(ctx, [[372, 396], [420, 372], [428, 382], [380, 404]], tc);
  circle(ctx, 424, 377, 6, '#9fb3c8');
  // Mushrooms; one is missing in the twin.
  function mushroom(x, y, s) {
    rect(ctx, x - 4 * s, y, 8 * s, 12 * s, '#f7f3e8');
    poly(ctx, [[x - 16 * s, y + 2], [x, y - 14 * s], [x + 16 * s, y + 2]], '#e5534b');
    circle(ctx, x - 7 * s, y - 6 * s, 2.5, '#fff');
    circle(ctx, x + 6 * s, y - 8 * s, 2, '#fff');
  }
  mushroom(480, 405, 1);
  if (!twin) mushroom(516, 408, 0.8);
  mushroom(548, 404, 1.1);
  // Campfire glow at the blanket's edge.
  ellipse(ctx, 420, 396, 30, 10, 'rgba(242,165,65,0.35)');
  poly(ctx, [[420, 372], [432, 396], [408, 396]], '#f2a541');
  poly(ctx, [[420, 380], [428, 396], [412, 396]], '#ffe9a8');
}

export const SCENES = [
  {
    id: 'pond',
    name: 'Koi Pond at Dusk',
    tagline: 'Lanterns, koi and a sleepy moon',
    difficulty: 'Easy',
    timeLimit: 180,
    draw: drawPond,
    diffs: [
      { x: 86, y: 58, r: 36, label: 'The moon changed' },
      { x: 520, y: 44, r: 20, label: 'A star vanished' },
      { x: 296, y: 150, r: 24, label: 'A lantern changed colour' },
      { x: 250, y: 340, r: 30, label: 'A koi swam away' },
      { x: 430, y: 330, r: 24, label: 'The lily flower changed colour' },
      { x: 120, y: 360, r: 26, label: 'The frog hopped off' },
      { x: 480, y: 170, r: 22, label: 'A dragonfly appeared' },
      { x: 350, y: 208, r: 20, label: 'A bridge post vanished' },
      { x: 563, y: 356, r: 22, label: 'An extra cattail grew' },
      { x: 250, y: 395, r: 24, label: 'A stepping stone changed colour' },
    ],
  },
  {
    id: 'attic',
    name: "The Clockmaker's Attic",
    tagline: 'Clocks, gears, a cat and candles',
    difficulty: 'Medium',
    timeLimit: 150,
    draw: drawAttic,
    diffs: [
      { x: 296, y: 180, r: 42, label: 'The clock hands moved' },
      { x: 296, y: 106, r: 20, label: 'XII vanished from the clock' },
      { x: 100, y: 392, r: 26, label: "The cat's tail vanished" },
      { x: 200, y: 324, r: 22, label: 'A candle went out' },
      { x: 494, y: 79, r: 22, label: 'A book changed colour' },
      { x: 100, y: 60, r: 18, label: 'A window star vanished' },
      { x: 440, y: 352, r: 20, label: 'An extra cup appeared' },
      { x: 480, y: 300, r: 40, label: 'A gear changed colour' },
      { x: 360, y: 94, r: 24, label: 'The caged bird flew away' },
      { x: 150, y: 412, r: 26, label: 'A rug stripe vanished' },
    ],
  },
  {
    id: 'meadow',
    name: 'Starlight Picnic Meadow',
    tagline: 'A tent, a cake, an owl and fireflies',
    difficulty: 'Hard',
    timeLimit: 120,
    draw: drawMeadow,
    diffs: [
      { x: 163, y: 184, r: 22, label: "The tent's flag vanished" },
      { x: 300, y: 338, r: 20, label: 'The cake candle went out' },
      { x: 505, y: 135, r: 24, label: 'A balloon changed colour' },
      { x: 226, y: 400, r: 22, label: "The rabbit's carrot vanished" },
      { x: 96, y: 104, r: 22, label: 'The owl closed its eyes' },
      { x: 516, y: 402, r: 22, label: 'A mushroom vanished' },
      { x: 300, y: 60, r: 20, label: 'An extra firefly appeared' },
      { x: 402, y: 388, r: 26, label: 'The telescope changed colour' },
      { x: 540, y: 240, r: 20, label: 'A kite bow vanished' },
      { x: 247, y: 364, r: 20, label: 'An apple vanished' },
    ],
  },
];
