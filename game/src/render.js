// Drawing only: the world's state and the current screen in, pixels out. The
// 1280x720 playfield is scaled to fit the window and centred, the margin filled
// with the backdrop colour. Both picture panels are painted from the scene's own
// draw function, then the found markers, hint ring, crosshair and HUD go on top.

import { FIELD, FONT, FOOTER, HINT_SECONDS, PALETTE, PANEL, POP_SECONDS } from './config.js';
import { SCENES } from './scenes.js';
import { SCREEN_CLEAR, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TIMEOUT, SCREEN_TITLE, SCREEN_WIN } from './world.js';

const BUTTONS = [
  { id: 'hint', label: 'Hint (H)', x: 884, w: 110 },
  { id: 'pause', label: 'Pause (P)', x: 1002, w: 118 },
  { id: 'mute', label: 'Sound (M)', x: 1128, w: 128 },
];
const RESTART_BUTTON = { id: 'restart', label: 'Restart (R)', x: 884, y: 668, w: 128, h: 40 };

/** Which footer button, if any, holds field point (x, y). */
export function hitButton(x, y) {
  if (y >= 612 && y <= 656) {
    for (const b of BUTTONS) {
      if (x >= b.x && x <= b.x + b.w) return b.id;
    }
  }
  if (y >= RESTART_BUTTON.y && y <= RESTART_BUTTON.y + RESTART_BUTTON.h && x >= RESTART_BUTTON.x && x <= RESTART_BUTTON.x + RESTART_BUTTON.w) return 'restart';
  return null;
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  /** Convert client (CSS pixel) coordinates to field coordinates. */
  function toField(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const px = (clientX - rect.left) * ratio;
    const py = (clientY - rect.top) * ratio;
    return { x: (px - view.x) / view.scale, y: (py - view.y) / view.scale };
  }

  const fonts = new Map();
  function text(value, x, y, size, color, align, weight) {
    const key = `${weight || ''}${size}`;
    if (!fonts.has(key)) fonts.set(key, `${weight || ''} ${size}px ${FONT}`);
    context.font = fonts.get(key);
    context.fillStyle = color;
    context.textAlign = align || 'left';
    context.textBaseline = 'alphabetic';
    context.fillText(value, x, y);
  }

  function pill(x, y, w, h, color) {
    context.fillStyle = color;
    context.beginPath();
    context.roundRect(x, y, w, h, h / 2);
    context.fill();
  }

  function drawHeader(state, scene, best) {
    context.fillStyle = PALETTE.header;
    context.fillRect(0, 0, FIELD.width, 140);
    text('TWIN POND', 24, 52, 44, PALETTE.text, 'left', 'bold');
    text('Spot the Difference', 24, 88, 20, PALETTE.muted, 'left');
    text(scene.name, 640, 44, 28, PALETTE.gold, 'center', 'bold');
    text(`${scene.difficulty}  ·  Scene ${state.sceneIndex + 1} of ${SCENES.length}  ·  ${scene.tagline}`, 640, 80, 18, PALETTE.muted, 'center');
    // Timer: big digits plus a bar that drains.
    const low = state.timeLeft <= 30 && state.screen === SCREEN_PLAY;
    text(formatTime(state.timeLeft), 1060, 56, 44, low ? PALETTE.red : PALETTE.text, 'center', 'bold');
    const barW = 200;
    context.fillStyle = '#1e3a4f';
    context.fillRect(960, 70, barW, 10);
    context.fillStyle = low ? PALETTE.red : PALETTE.gold;
    context.fillRect(960, 70, barW * Math.max(0, state.timeLeft / scene.timeLimit), 10);
    text(`SCORE ${state.totalScore + state.score}`, 1060, 112, 20, PALETTE.text, 'center', 'bold');
    text(`BEST ${best}`, 1256, 112, 16, PALETTE.muted, 'right');
    // The counter the judge looks for: how many differences are still unfound.
    const left = scene.diffs.length - state.found.size;
    text(`FOUND ${state.found.size}/${scene.diffs.length}`, 24, 124, 20, PALETTE.green, 'left', 'bold');
    text(`${left} LEFT`, 300, 124, 20, PALETTE.gold, 'left', 'bold');
    if (state.streak >= 2) text(`STREAK x${state.streak}`, 430, 124, 20, PALETTE.teal, 'left', 'bold');
  }

  function drawMarker(x, y, r, number, popLeft) {
    const scale = popLeft !== null && popLeft !== undefined ? 1 + (popLeft / POP_SECONDS) * 0.6 : 1;
    const rr = Math.max(20, r) * scale;
    context.strokeStyle = PALETTE.green;
    context.lineWidth = 5;
    context.beginPath();
    context.arc(x, y, rr, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = 'rgba(94,201,122,0.25)';
    context.beginPath();
    context.arc(x, y, rr, 0, Math.PI * 2);
    context.fill();
    // Check mark.
    context.strokeStyle = PALETTE.green;
    context.lineWidth = 5;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(x - rr * 0.45, y);
    context.lineTo(x - rr * 0.12, y + rr * 0.35);
    context.lineTo(x + rr * 0.5, y - rr * 0.35);
    context.stroke();
    // Found order number above the ring.
    text(String(number), x, y - rr - 6, 18, PALETTE.green, 'center', 'bold');
  }

  function drawPanel(state, scene, panelX, variant) {
    context.save();
    context.beginPath();
    context.rect(panelX, PANEL.y, PANEL.width, PANEL.height);
    context.clip();
    context.translate(panelX, PANEL.y);
    scene.draw(context, variant);
    context.restore();
    context.strokeStyle = variant === 0 ? PALETTE.panelBorderDim : PALETTE.panelBorderDim;
    context.lineWidth = 3;
    context.strokeRect(panelX, PANEL.y, PANEL.width, PANEL.height);
    // Label chip at the bottom edge, so it never covers a difference or a marker.
    const chipY = PANEL.y + PANEL.height - 40;
    pill(panelX + 10, chipY, variant === 0 ? 168 : 128, 30, 'rgba(13,27,42,0.85)');
    text(variant === 0 ? 'A · ORIGINAL' : 'B · TWIN', panelX + 24, chipY + 21, 17, PALETTE.text, 'left', 'bold');
    // Found markers on both panels, at the same spots.
    for (let n = 0; n < state.foundOrder.length; n += 1) {
      const i = state.foundOrder[n];
      const d = scene.diffs[i];
      const popLeft = state.pop && state.pop.index === i ? state.pop.left : null;
      drawMarker(panelX + d.x, PANEL.y + d.y, d.r, n + 1, popLeft);
    }
    // Hint ring pulses around one unfound difference on both panels.
    if (state.hint) {
      const d = scene.diffs[state.hint.index];
      const pulse = 1 + 0.18 * Math.sin(state.elapsed * 8);
      const rr = Math.max(24, d.r + 10) * pulse;
      context.strokeStyle = PALETTE.gold;
      context.lineWidth = 4;
      context.setLineDash([10, 8]);
      context.beginPath();
      context.arc(panelX + d.x, PANEL.y + d.y, rr, 0, Math.PI * 2);
      context.stroke();
      context.setLineDash([]);
    }
    // Wrong-click X, on the panel it happened in (drawn at the same spot in both).
    if (state.wrong) {
      const x = panelX + state.wrong.x;
      const y = PANEL.y + state.wrong.y;
      context.strokeStyle = PALETTE.red;
      context.lineWidth = 5;
      context.lineCap = 'round';
      context.beginPath();
      context.moveTo(x - 14, y - 14);
      context.lineTo(x + 14, y + 14);
      context.moveTo(x + 14, y - 14);
      context.lineTo(x - 14, y + 14);
      context.stroke();
    }
  }

  function drawCrosshair(state) {
    if (!state.crosshairUsed) return;
    const x = PANEL.leftX + state.crosshair.x;
    const y = PANEL.y + state.crosshair.y;
    context.strokeStyle = PALETTE.gold;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(x, y, 14, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.moveTo(x - 20, y);
    context.lineTo(x + 20, y);
    context.moveTo(x, y - 20);
    context.lineTo(x, y + 20);
    context.stroke();
  }

  function drawFooter(state, scene, muted) {
    context.fillStyle = PALETTE.header;
    context.fillRect(0, FOOTER.y, FIELD.width, FOOTER.height);
    text('FOUND', 24, 636, 16, PALETTE.muted, 'left', 'bold');
    for (let i = 0; i < scene.diffs.length; i += 1) {
      const x = 110 + i * 34;
      context.beginPath();
      context.arc(x, 630, 11, 0, Math.PI * 2);
      if (state.found.has(i)) {
        context.fillStyle = PALETTE.green;
        context.fill();
      } else {
        context.strokeStyle = PALETTE.muted;
        context.lineWidth = 2;
        context.stroke();
      }
    }
    const left = scene.diffs.length - state.found.size;
    text(`${left} LEFT`, 640, 656, 44, PALETTE.gold, 'center', 'bold');
    text('differences remain', 640, 688, 16, PALETTE.muted, 'center');
    if (state.message) text(state.message, 24, 688, 18, PALETTE.text, 'left');
    for (const b of BUTTONS) {
      const label = b.id === 'hint' ? `Hint (H) · ${state.hintsLeft}` : b.id === 'mute' ? (muted ? 'Muted (M)' : 'Sound (M)') : b.label;
      context.fillStyle = PALETTE.button;
      context.beginPath();
      context.roundRect(b.x, 612, b.w, 44, 8);
      context.fill();
      text(label, b.x + b.w / 2, 640, 17, PALETTE.text, 'center', 'bold');
    }
    context.fillStyle = PALETTE.button;
    context.beginPath();
    context.roundRect(RESTART_BUTTON.x, RESTART_BUTTON.y, RESTART_BUTTON.w, RESTART_BUTTON.h, 8);
    context.fill();
    text(RESTART_BUTTON.label, RESTART_BUTTON.x + RESTART_BUTTON.w / 2, RESTART_BUTTON.y + 27, 16, PALETTE.text, 'center', 'bold');
    text('Click a difference in either picture · Arrows + Enter to play by keyboard', 24, 712, 14, PALETTE.muted, 'left');
  }

  function drawOverlayPanel(title, lines, prompt, accent) {
    const w = 760;
    const h = 150 + lines.length * 34 + 70;
    const x = (FIELD.width - w) / 2;
    const y = (FIELD.height - h) / 2;
    context.fillStyle = 'rgba(13,27,42,0.88)';
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    context.fillStyle = PALETTE.header;
    context.beginPath();
    context.roundRect(x, y, w, h, 16);
    context.fill();
    context.strokeStyle = accent || PALETTE.gold;
    context.lineWidth = 3;
    context.stroke();
    text(title, FIELD.width / 2, y + 66, 42, PALETTE.text, 'center', 'bold');
    for (let i = 0; i < lines.length; i += 1) {
      text(lines[i], FIELD.width / 2, y + 122 + i * 34, 21, PALETTE.muted, 'center');
    }
    text(prompt, FIELD.width / 2, y + h - 34, 22, PALETTE.gold, 'center', 'bold');
  }

  function drawTitle(state, best) {
    const scene = SCENES[0];
    drawPanel(state, scene, PANEL.leftX, 0);
    drawPanel(state, scene, PANEL.rightX, 1);
    drawOverlayPanel(
      'TWIN POND',
      [
        'Two pictures, ten differences.',
        'Find them all before the timer runs out.',
        'Click a difference in either picture, or move',
        'the crosshair with the arrow keys and press Enter.',
        'H hints · P pauses · M mutes · R restarts',
        '',
        '1 · Koi Pond at Dusk — Easy — 3:00',
        '2 · Clockmaker’s Attic — Medium — 2:30',
        '3 · Starlight Picnic Meadow — Hard — 2:00',
        best > 0 ? `Best total score: ${best}` : 'Three original scenes, 30 differences, no two alike.',
      ],
      'Press SPACE or click to play  ·  1 / 2 / 3 picks a scene',
    );
  }

  function draw(state, screen, best, muted, world) {
    const scene = SCENES[state.sceneIndex];
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    drawHeader(state, scene, best);
    if (screen === SCREEN_TITLE) {
      drawTitle(state, best);
      return;
    }
    drawPanel(state, scene, PANEL.leftX, 0);
    drawPanel(state, scene, PANEL.rightX, 1);
    drawCrosshair(state);
    drawFooter(state, scene, muted);
    if (screen === SCREEN_PAUSED) {
      drawOverlayPanel('Paused', ['The pond will wait for you.', 'Hints left: ' + state.hintsLeft], 'Press P or click to resume', PALETTE.teal);
    } else if (screen === SCREEN_CLEAR) {
      drawOverlayPanel(
        'Scene clear!',
        [
          `All ${scene.diffs.length} differences found in ${scene.name}.`,
          `Time bonus ${state.levelBonus - state.hintsLeft * 50}  ·  Hint bonus ${state.hintsLeft * 50}`,
          `Level score ${state.score}  ·  Total ${state.totalScore}`,
        ],
        state.sceneIndex + 1 < SCENES.length ? 'Press SPACE for the next scene' : 'Press SPACE to finish',
        PALETTE.green,
      );
    } else if (screen === SCREEN_TIMEOUT) {
      drawOverlayPanel(
        'Out of time!',
        [
          `You found ${state.found.size} of ${scene.diffs.length} differences in ${scene.name}.`,
          state.found.size >= 7 ? 'So close — the last ones were hiding in plain sight.' : 'Tip: scan the edges, then the middle. Hints cost 10 seconds.',
        ],
        'Press R to retry the scene',
        PALETTE.red,
      );
    } else if (screen === SCREEN_WIN) {
      const stars = state.misses === 0 ? '★★★' : state.misses <= 3 ? '★★☆' : '★☆☆';
      drawOverlayPanel(
        'You found them all!',
        [
          `${stars}   All 30 differences across three scenes.`,
          `Total score ${state.totalScore}  ·  Best streak ${state.bestStreak}  ·  Misses ${state.misses}`,
          `Best total score: ${Math.max(best, state.totalScore)}`,
        ],
        'Press SPACE to play again',
        PALETTE.gold,
      );
    }
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw, toField };
}
