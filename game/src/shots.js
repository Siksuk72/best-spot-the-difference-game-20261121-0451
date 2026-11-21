// The screenshot scenes behind ?shot=play|play2|play3|end. Each one sets the world
// to a real mid-game state — found differences marked on both panels, several
// still unfound, the counter and timer visible — by playing the real rules
// (clickAt) rather than painting a fake frame, so the shot is what a real game
// looks like and the same seed always gives the same frame.

import { SCENES } from './scenes.js';
import { SCREEN_CLEAR, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './world.js';

/**
 * Set `world` to the named scene and return the screen to draw and the best
 * score to show. Unknown names stage the title screen.
 */
export function stageShot(name, world) {
  const state = world.state;
  if (name === 'play') {
    world.startGame(0);
    world.clickAt(86, 58); // moon
    world.clickAt(520, 44); // star
    world.clickAt(296, 150); // lantern
    world.clickAt(250, 340); // koi
    state.timeLeft = 151;
    state.score = 430;
    state.streak = 4;
    state.screen = SCREEN_PLAY;
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'play2') {
    world.startGame(1);
    state.totalScore = 1240;
    world.clickAt(296, 180); // clock hands
    world.clickAt(296, 106); // XII
    world.clickAt(200, 324); // candle
    world.clickAt(494, 79); // book
    world.clickAt(100, 60); // window star
    world.clickAt(360, 94); // bird
    state.timeLeft = 88;
    state.score = 660;
    state.streak = 2;
    state.screen = SCREEN_PLAY;
    return { screen: SCREEN_PLAY, best: 1240 };
  }
  if (name === 'play3') {
    world.startGame(2);
    state.totalScore = 2680;
    world.clickAt(163, 184); // flag
    world.clickAt(300, 338); // candle
    world.clickAt(505, 135); // balloon
    state.hint = { index: 5, left: 2.5 }; // hint ring on the mushroom
    state.hintsLeft = 2;
    state.timeLeft = 97;
    state.score = 320;
    state.streak = 3;
    state.screen = SCREEN_PLAY;
    return { screen: SCREEN_PLAY, best: 2680 };
  }
  if (name === 'end') {
    world.startGame(2);
    for (const d of SCENES[2].diffs) world.clickAt(d.x, d.y);
    state.score = 0;
    state.totalScore = 4280;
    state.bestStreak = 10;
    state.misses = 2;
    state.screen = SCREEN_WIN;
    state.message = '';
    return { screen: SCREEN_WIN, best: 4280 };
  }
  world.startGame(0);
  state.screen = SCREEN_TITLE;
  state.timeLeft = SCENES[0].timeLimit;
  return { screen: SCREEN_TITLE, best: 0 };
}

// Keep the screen constants referenced so the shot scenes stay in sync with them.
void SCREEN_CLEAR;
