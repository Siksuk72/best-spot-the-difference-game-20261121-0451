// Boot and the one loop: input is read every frame, the world advances in fixed
// 1/60 s steps (several in a slow frame, none in a fast one), and the renderer
// paints what is there. The game moves between six screens: title, play, paused,
// level clear, timeout and win.
//
// ?seed=N fixes the random seed. ?shot=play|play2|play3|end (with &seed=N) stages
// that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.

import { FIELD, PANEL, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_CLEAR, EVENT_FOUND, EVENT_MISS, EVENT_TIMEOUT, EVENT_WIN, SCREEN_CLEAR, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TIMEOUT, SCREEN_TITLE, SCREEN_WIN } from './world.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_MARK, ACTION_MUTE, ACTION_PAUSE, ACTION_RESTART, ACTION_SCENE_1, ACTION_SCENE_2, ACTION_SCENE_3, createInput } from './input.js';
import { createAudio } from './audio.js';
import { createRenderer, hitButton } from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;
/** Field pixels the crosshair moves per second while an arrow key is held. */
const CROSSHAIR_SPEED = 520;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem('twin-pond.best') ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem('twin-pond.best', String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  // Paint synchronously (twice, as the live loop would) so a headless screenshot
  // taken right after load already holds the finished frame.
  renderer.draw(world.state, scene.screen, scene.best, false, world);
  renderer.draw(world.state, scene.screen, scene.best, false, world);
  window.__shotReady = true;
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  let lastTickSecond = -1;

  // Screen readers (and anyone watching the page's text) hear the screen changes and each find.
  function announce(message) {
    status.textContent = message;
  }

  function startGame(index) {
    world.startGame(index);
    screen = SCREEN_PLAY;
    announce(`Playing ${world.scene().name}. Find ${world.scene().diffs.length} differences.`);
  }

  function finishLevel(events) {
    if (events & EVENT_WIN) {
      screen = SCREEN_WIN;
      if (world.state.totalScore > best) {
        best = world.state.totalScore;
        saveBest(best);
      }
      audio.win();
      announce(`You found them all! Total score ${world.state.totalScore}.`);
    } else if (events & EVENT_CLEAR) {
      screen = SCREEN_CLEAR;
      audio.clear();
      announce(`Scene clear! Bonus ${world.state.levelBonus}. Total ${world.state.totalScore}.`);
    }
  }

  function handleClick(field) {
    audio.unlock();
    if (screen === SCREEN_TITLE || screen === SCREEN_WIN) {
      startGame(0);
      return;
    }
    if (screen === SCREEN_CLEAR) {
      if (world.nextLevel()) screen = SCREEN_PLAY;
      else screen = SCREEN_WIN;
      return;
    }
    if (screen === SCREEN_TIMEOUT) return; // R retries; a click does nothing here.
    if (screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
      return;
    }
    // In play: footer buttons first, then the two picture panels.
    const button = hitButton(field.x, field.y);
    if (button === 'hint') {
      if (world.hint()) audio.hint();
      return;
    }
    if (button === 'pause') {
      screen = SCREEN_PAUSED;
      announce('Paused.');
      return;
    }
    if (button === 'mute') {
      const muted = audio.toggleMute();
      announce(muted ? 'Sound off.' : 'Sound on.');
      return;
    }
    if (button === 'restart') {
      world.resetLevel(world.state.sceneIndex);
      announce('Level restarted.');
      return;
    }
    const panelX = field.x >= PANEL.leftX && field.x <= PANEL.leftX + PANEL.width ? PANEL.leftX : field.x >= PANEL.rightX && field.x <= PANEL.rightX + PANEL.width ? PANEL.rightX : null;
    if (panelX === null) return;
    const lx = field.x - panelX;
    const ly = field.y - PANEL.y;
    if (ly < 0 || ly > PANEL.height) return;
    world.state.crosshair.x = lx;
    world.state.crosshair.y = ly;
    const events = world.clickAt(lx, ly);
    if (events & EVENT_FOUND) {
      audio.find();
      announce(world.state.message);
      finishLevel(events);
    } else if (events & EVENT_MISS) {
      audio.miss();
      announce(world.state.message);
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) {
      const muted = audio.toggleMute();
      announce(muted ? 'Sound off.' : 'Sound on.');
    }
    if (screen === SCREEN_TITLE) {
      if (actions & ACTION_SCENE_1) startGame(0);
      else if (actions & ACTION_SCENE_2) startGame(1);
      else if (actions & ACTION_SCENE_3) startGame(2);
      else if (actions & ACTION_CONFIRM) startGame(0);
      return;
    }
    if (screen === SCREEN_WIN) {
      if (actions & ACTION_CONFIRM) startGame(0);
      return;
    }
    if (screen === SCREEN_CLEAR) {
      if (actions & ACTION_CONFIRM) {
        if (world.nextLevel()) screen = SCREEN_PLAY;
        else screen = SCREEN_WIN;
      }
      return;
    }
    if (screen === SCREEN_TIMEOUT) {
      if (actions & (ACTION_RESTART | ACTION_CONFIRM)) {
        world.resetLevel(world.state.sceneIndex);
        screen = SCREEN_PLAY;
        announce('Level restarted.');
      }
      return;
    }
    if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
      return;
    }
    if (screen !== SCREEN_PLAY) return;
    if (actions & ACTION_HINT) {
      if (world.hint()) audio.hint();
    }
    if (actions & ACTION_RESTART) {
      world.resetLevel(world.state.sceneIndex);
      announce('Level restarted.');
    }
    if (actions & (ACTION_CONFIRM | ACTION_MARK)) {
      const events = world.clickAt(world.state.crosshair.x, world.state.crosshair.y);
      if (events & EVENT_FOUND) {
        audio.find();
        announce(world.state.message);
        finishLevel(events);
      } else if (events & EVENT_MISS) {
        audio.miss();
        announce(world.state.message);
      }
    }
  }

  function step() {
    // Arrow keys steer the crosshair; it appears the first time one is pressed.
    const axes = input.axes();
    if (axes.x !== 0 || axes.y !== 0) {
      world.state.crosshairUsed = true;
      world.state.crosshair.x = Math.min(PANEL.width, Math.max(0, world.state.crosshair.x + axes.x * CROSSHAIR_SPEED * STEP));
      world.state.crosshair.y = Math.min(PANEL.height, Math.max(0, world.state.crosshair.y + axes.y * CROSSHAIR_SPEED * STEP));
    }
    const events = world.step(STEP);
    if (events & EVENT_TIMEOUT) {
      screen = SCREEN_TIMEOUT;
      audio.miss();
      announce('Out of time!');
    }
    // A soft tick in the last ten seconds, so the pressure can be felt.
    const whole = Math.ceil(world.state.timeLeft);
    if (screen === SCREEN_PLAY && whole <= 10 && whole !== lastTickSecond && whole > 0) {
      lastTickSecond = whole;
      audio.tick();
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    for (const click of input.takeClicks()) handleClick(renderer.toField(click.x, click.y));
    handleActions();
    world.state.screen = screen;
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP && screen === SCREEN_PLAY) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
      world.step(STEP);
    }
    renderer.draw(world.state, screen, best, audio.muted, world);
  }

  // Leaving the tab pauses a running game rather than letting the timer run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Twin Pond. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
