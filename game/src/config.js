// Every tuning number, colour and layout constant in one place. The playfield is a
// fixed 1280x720 logical area; the renderer scales it to the window, so no rule
// below depends on the screen size. Two picture panels sit side by side under a
// header bar, with a footer strip for the found-dots, the counter and the buttons.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** One picture panel, in field coordinates. Both panels show the same scene. */
export const PANEL = { width: 592, height: 440, y: 148, leftX: 24, rightX: 664 };

/** Header bar (title, scene, timer, score) and footer strip (dots, counter, buttons). */
export const HEADER = { height: 140 };
export const FOOTER = { y: 600, height: 120 };

export const TIMER = {
  /** Seconds a wrong click costs, and seconds a hint costs. */
  missPenalty: 5,
  hintCost: 10,
};

export const SCORE = {
  /** Points per difference found, plus a streak bonus per consecutive find. */
  find: 100,
  streakBonus: 10,
  /** Points per second left when a level is cleared. */
  timeBonusPerSecond: 5,
  /** Points per hint left when a level is cleared. */
  hintBonus: 50,
};

export const HINTS_PER_LEVEL = 3;
/** How long a hint ring pulses around a difference, in seconds. */
export const HINT_SECONDS = 2.5;
/** How long a found marker's pop animation lasts, in seconds. */
export const POP_SECONDS = 0.45;
/** How long a wrong-click X stays on screen, in seconds. */
export const MISS_SECONDS = 0.7;
/** Pixels of slack around a difference's radius when testing a click. */
export const CLICK_SLACK = 14;

export const PALETTE = {
  backdrop: '#0d1b2a',
  header: '#12283d',
  panelBorder: '#f4d35e',
  panelBorderDim: '#3d5a73',
  text: '#f7f3e8',
  muted: '#9fb3c8',
  gold: '#f4d35e',
  green: '#5ec97a',
  red: '#e5534b',
  teal: '#4fc3c3',
  button: '#1e4d6b',
  buttonHot: '#2a6a8f',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best total score is kept between visits (this browser only). */
export const BEST_KEY = 'twin-pond.best';
