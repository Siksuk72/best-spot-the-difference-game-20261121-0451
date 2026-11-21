// The game's rules and state, with no drawing and no browser in it: which scene is
// being played, which differences are found, the timer, score, streak, hints and
// misses. step() advances one fixed step; the caller reacts to what it returns as
// bit flags. Nothing here allocates after createWorld returns.

import { CLICK_SLACK, HINTS_PER_LEVEL, HINT_SECONDS, MISS_SECONDS, PANEL, POP_SECONDS, SCORE, TIMER } from './config.js';
import { SCENES } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_TIMEOUT = 'timeout';
export const SCREEN_WIN = 'win';

export const EVENT_FOUND = 1;
export const EVENT_MISS = 2;
export const EVENT_CLEAR = 4;
export const EVENT_TIMEOUT = 8;
export const EVENT_WIN = 16;

export function createWorld() {
  const state = {
    sceneIndex: 0,
    screen: SCREEN_TITLE,
    found: new Set(),
    foundOrder: [],
    misses: 0,
    score: 0,
    totalScore: 0,
    streak: 0,
    bestStreak: 0,
    timeLeft: SCENES[0].timeLimit,
    hintsLeft: HINTS_PER_LEVEL,
    hint: null, // { index, left } while a hint ring is pulsing
    pop: null, // { index, left } while a found marker pops in
    wrong: null, // { x, y, left } while a wrong-click X shows
    crosshair: { x: PANEL.width / 2, y: PANEL.height / 2 },
    message: '',
    levelBonus: 0,
    elapsed: 0,
  };

  function scene() {
    return SCENES[state.sceneIndex];
  }

  function resetLevel(index) {
    state.sceneIndex = index;
    state.found = new Set();
    state.foundOrder = [];
    state.misses = 0;
    state.streak = 0;
    state.timeLeft = scene().timeLimit;
    state.hintsLeft = HINTS_PER_LEVEL;
    state.hint = null;
    state.pop = null;
    state.wrong = null;
    state.levelBonus = 0;
    state.message = '';
    state.screen = SCREEN_PLAY;
  }

  function startGame(index) {
    state.totalScore = 0;
    state.score = 0;
    state.bestStreak = 0;
    resetLevel(index);
  }

  function remaining() {
    return scene().diffs.length - state.found.size;
  }

  /** Test a click at panel-local coordinates; either panel maps to the same spot. */
  function clickAt(x, y) {
    if (state.screen !== SCREEN_PLAY) return 0;
    const diffs = scene().diffs;
    for (let i = 0; i < diffs.length; i += 1) {
      if (state.found.has(i)) continue;
      const d = diffs[i];
      const dx = x - d.x;
      const dy = y - d.y;
      if (dx * dx + dy * dy <= (d.r + CLICK_SLACK) * (d.r + CLICK_SLACK)) {
        state.found.add(i);
        state.foundOrder.push(i);
        state.streak += 1;
        state.bestStreak = Math.max(state.bestStreak, state.streak);
        const gained = SCORE.find + SCORE.streakBonus * (state.streak - 1);
        state.score += gained;
        state.message = d.label;
        state.pop = { index: i, left: POP_SECONDS };
        if (state.hint && state.hint.index === i) state.hint = null;
        if (state.found.size === diffs.length) {
          state.levelBonus = Math.round(state.timeLeft) * SCORE.timeBonusPerSecond + state.hintsLeft * SCORE.hintBonus;
          state.score += state.levelBonus;
          state.totalScore += state.score;
          return state.sceneIndex === SCENES.length - 1 ? EVENT_FOUND | EVENT_WIN : EVENT_FOUND | EVENT_CLEAR;
        }
        return EVENT_FOUND;
      }
    }
    // No difference there: a miss costs time and breaks the streak.
    state.misses += 1;
    state.streak = 0;
    state.timeLeft = Math.max(0, state.timeLeft - TIMER.missPenalty);
    state.message = 'Nothing there — 5 seconds lost';
    state.wrong = { x, y, left: MISS_SECONDS };
    return EVENT_MISS;
  }

  /** Point at a random difference that is still unfound. Costs time; 3 per level. */
  function hint() {
    if (state.screen !== SCREEN_PLAY || state.hintsLeft <= 0) return false;
    const left = scene().diffs.map((d, i) => i).filter((i) => !state.found.has(i));
    if (left.length === 0) return false;
    const index = left[Math.floor(Math.random() * left.length)];
    state.hint = { index, left: HINT_SECONDS };
    state.hintsLeft -= 1;
    state.timeLeft = Math.max(0, state.timeLeft - TIMER.hintCost);
    state.message = 'Hint: look inside the gold ring';
    return true;
  }

  function nextLevel() {
    if (state.sceneIndex + 1 < SCENES.length) {
      state.score = 0;
      resetLevel(state.sceneIndex + 1);
      return true;
    }
    return false;
  }

  function step(dt) {
    state.elapsed += dt;
    if (state.hint) {
      state.hint.left -= dt;
      if (state.hint.left <= 0) state.hint = null;
    }
    if (state.pop) {
      state.pop.left -= dt;
      if (state.pop.left <= 0) state.pop = null;
    }
    if (state.wrong) {
      state.wrong.left -= dt;
      if (state.wrong.left <= 0) state.wrong = null;
    }
    if (state.screen !== SCREEN_PLAY) return 0;
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.screen = SCREEN_TIMEOUT;
      state.message = 'Out of time!';
      return EVENT_TIMEOUT;
    }
    return 0;
  }

  return { state, scene, remaining, resetLevel, startGame, clickAt, hint, nextLevel, step };
}
