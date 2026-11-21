// Keyboard and pointer input. One-shot presses (start, hint, pause, restart,
// mark) are queued as bit flags and taken once by the loop, so a press between
// two frames is never lost and never counted twice. Pointer clicks arrive with
// their canvas coordinates, already converted to field coordinates by main.js.

export const ACTION_CONFIRM = 1;
export const ACTION_HINT = 2;
export const ACTION_PAUSE = 4;
export const ACTION_RESTART = 8;
export const ACTION_MARK = 16;
export const ACTION_MUTE = 32;
export const ACTION_SCENE_1 = 64;
export const ACTION_SCENE_2 = 128;
export const ACTION_SCENE_3 = 256;

const CONFIRM = new Set(['Space', 'Enter']);
const HINT = new Set(['KeyH']);
const PAUSE = new Set(['KeyP', 'Escape']);
const RESTART = new Set(['KeyR']);
const MUTE = new Set(['KeyM']);
const ARROWS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);

export function createInput(canvas) {
  let actions = 0;
  const keys = { left: false, right: false, up: false, down: false };
  const clicks = [];

  window.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowLeft') keys.left = true;
    else if (event.code === 'ArrowRight') keys.right = true;
    else if (event.code === 'ArrowUp') keys.up = true;
    else if (event.code === 'ArrowDown') keys.down = true;
    else if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (HINT.has(event.code)) {
      if (!event.repeat) actions |= ACTION_HINT;
    } else if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (RESTART.has(event.code)) {
      if (!event.repeat) actions |= ACTION_RESTART;
    } else if (MUTE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_MUTE;
    } else if (event.code === 'Digit1') {
      if (!event.repeat) actions |= ACTION_SCENE_1;
    } else if (event.code === 'Digit2') {
      if (!event.repeat) actions |= ACTION_SCENE_2;
    } else if (event.code === 'Digit3') {
      if (!event.repeat) actions |= ACTION_SCENE_3;
    } else return;
    if (ARROWS.has(event.code) || CONFIRM.has(event.code)) event.preventDefault();
  });
  window.addEventListener('keyup', (event) => {
    if (event.code === 'ArrowLeft') keys.left = false;
    else if (event.code === 'ArrowRight') keys.right = false;
    else if (event.code === 'ArrowUp') keys.up = false;
    else if (event.code === 'ArrowDown') keys.down = false;
  });
  // A key released while the tab is hidden never sends keyup: let go of everything on blur.
  window.addEventListener('blur', () => {
    keys.left = false;
    keys.right = false;
    keys.up = false;
    keys.down = false;
  });
  canvas.addEventListener('pointerdown', (event) => {
    clicks.push({ x: event.clientX, y: event.clientY });
  });

  return {
    /** -1/0/1 for each axis from the held arrow keys. */
    axes() {
      return {
        x: (keys.right ? 1 : 0) - (keys.left ? 1 : 0),
        y: (keys.down ? 1 : 0) - (keys.up ? 1 : 0),
      };
    },
    /** The one-shot presses since the last call, as ACTION_* flags. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** The pointer clicks since the last call, in client coordinates. */
    takeClicks() {
      const taken = clicks.splice(0, clicks.length);
      return taken;
    },
  };
}
