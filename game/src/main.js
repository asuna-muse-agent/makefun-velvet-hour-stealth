// VELVET HOUR — boot + loop. One job: own the game object, the screen
// state machine and the frame loop; every other file does one job each.

import { VIEW } from './config.js';
import { LEVELS } from './levels.js';
import { createRng, rngRange } from './random.js';
import { createInput } from './input.js';
import { createPlayer, updatePlayer } from './player.js';
import { createGuard, createCamera, updateGuard, updateCamera } from './guard.js';
import { updateDetection, investigateNoise, checkCaught } from './detection.js';
import { createLoot, collectLoot, missionScore, rankFor } from './loot.js';
import { createAudio } from './audio.js';
import { drawWorld } from './render.js';
import {
  drawHUD,
  drawRoster,
  drawTitle,
  drawBriefing,
  drawMissionComplete,
  drawGameOver,
  drawVictory,
  drawPause,
} from './hud.js';
import { stageShot } from './shots.js';
import { dist } from './vision.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const game = {
  screen: 'title',
  missionIndex: 0,
  level: LEVELS[0],
  player: null,
  guards: [],
  cameras: [],
  loot: [],
  lootGot: 0,
  exitOpen: false,
  lives: 3,
  score: 0,
  scoreAtMissionStart: 0,
  time: 0,
  ghost: true,
  maxSuspicion: 0,
  closeCall: false,
  alarm: 0,
  alarmOn: false,
  noiseRings: [],
  messages: [],
  lastResult: null,
  animT: 0,
  heartbeatT: 0,
  shot: null,
  input: createInput(canvas),
  audio: createAudio(),
  rng: createRng(1337),
};

function startMission(index) {
  const level = LEVELS[index];
  game.missionIndex = index;
  game.level = level;
  game.rng = createRng(1337 + index * 101);
  game.player = createPlayer(level);
  game.guards = level.guards.map((def, i) => {
    const g = createGuard(def, i);
    g.waitT = rngRange(game.rng, 0, 0.8);
    return g;
  });
  game.cameras = level.cameras.map((def) => createCamera(def));
  game.loot = createLoot(level);
  game.lootGot = 0;
  game.exitOpen = false;
  game.lives = 3;
  game.scoreAtMissionStart = game.score;
  game.time = 0;
  game.ghost = true;
  game.maxSuspicion = 0;
  game.closeCall = false;
  game.alarm = 0;
  game.alarmOn = false;
  game.noiseRings = [];
  game.messages = [];
  game.lastResult = null;
}
game.startMission = startMission;

function handleCaught() {
  game.lives -= 1;
  game.audio.lose();
  game.messages.push({ text: `CAUGHT! — ${game.lives} ${game.lives === 1 ? 'life' : 'lives'} left`, t: 2 });
  if (game.lives <= 0) {
    game.screen = 'gameOver';
    return;
  }
  // Restart the room: Wren back at the start, guards calm down.
  game.player.x = game.level.playerStart.x;
  game.player.y = game.level.playerStart.y;
  for (const g of game.guards) {
    g.suspicion = 20;
    g.state = 'return';
    g.alertT = 0;
  }
  for (const c of game.cameras) c.suspicion = 0;
  game.alarm = 0;
  game.alarmOn = false;
}

function completeMission() {
  const r = missionScore(game);
  game.score = r.total;
  game.lastResult = { ...r, rank: rankFor(game, r) };
  game.audio.win();
  game.screen = 'missionComplete';
}

function update(dt) {
  const input = game.input;
  if (input.pressed('KeyM')) game.audio.toggleMute();
  if (input.anyPressed()) game.audio.unlock();

  if (game.screen === 'title') {
    if (input.pressed('Enter')) {
      game.score = 0;
      startMission(0);
      game.screen = 'briefing';
    }
    return;
  }
  if (game.screen === 'briefing') {
    if (input.pressed('Enter')) game.screen = 'playing';
    return;
  }
  if (game.screen === 'missionComplete') {
    if (input.pressed('Enter')) {
      if (game.missionIndex + 1 < LEVELS.length) {
        startMission(game.missionIndex + 1);
        game.screen = 'briefing';
      } else {
        game.screen = 'victory';
      }
    }
    return;
  }
  if (game.screen === 'gameOver') {
    if (input.pressed('KeyR')) {
      game.score = game.scoreAtMissionStart;
      startMission(game.missionIndex);
      game.screen = 'playing';
    }
    return;
  }
  if (game.screen === 'victory') {
    if (input.pressed('KeyR')) {
      game.score = 0;
      startMission(0);
      game.screen = 'briefing';
    }
    return;
  }
  if (game.screen === 'paused') {
    if (input.pressed('KeyP')) game.screen = 'playing';
    if (input.pressed('KeyR')) {
      game.score = game.scoreAtMissionStart;
      startMission(game.missionIndex);
      game.screen = 'playing';
    }
    return;
  }
  // Playing.
  if (input.pressed('KeyP')) {
    game.screen = 'paused';
    return;
  }
  if (input.pressed('KeyR')) {
    game.score = game.scoreAtMissionStart;
    startMission(game.missionIndex);
    return;
  }
  game.time += dt;
  updatePlayer(game, dt);
  updateDetection(game, dt);
  for (const g of game.guards) updateGuard(game, g, dt);
  for (const c of game.cameras) updateCamera(game, c, dt);
  collectLoot(game);
  for (const ring of game.noiseRings) {
    ring.r += 260 * dt;
    if (!ring.pinged && ring.r >= 60) {
      ring.pinged = true;
      investigateNoise(game, ring.x, ring.y);
    }
  }
  game.noiseRings = game.noiseRings.filter((r) => r.r < r.maxR);
  game.messages = game.messages.filter((m) => (m.t -= dt) > 0);
  if (game.alarm > 0) game.alarm -= dt;
  if (game.closeCall && game.maxSuspicion >= 25 && !game.alarmOn) {
    game.heartbeatT -= dt;
    if (game.heartbeatT <= 0) {
      game.heartbeatT = 0.75;
      game.audio.heartbeat();
    }
  }
  const caught = checkCaught(game);
  if (caught) handleCaught();
  if (game.screen !== 'playing') return;
  if (game.exitOpen && dist(game.player.x, game.player.y, game.level.exit.x, game.level.exit.y) < 34) {
    completeMission();
  }
}

function render() {
  ctx.clearRect(0, 0, VIEW.w, VIEW.h);
  if (game.screen === 'title') {
    drawTitle(ctx, game);
    return;
  }
  if (game.screen === 'briefing') {
    drawBriefing(ctx, game);
    return;
  }
  if (game.screen === 'victory') {
    drawVictory(ctx, game);
    return;
  }
  drawWorld(ctx, game);
  drawHUD(ctx, game);
  drawRoster(ctx, game);
  if (game.screen === 'paused') drawPause(ctx, game);
  else if (game.screen === 'missionComplete') drawMissionComplete(ctx, game);
  else if (game.screen === 'gameOver') drawGameOver(ctx, game);
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  game.animT += dt;
  if (!game.shot) update(dt);
  render();
  game.input.endFrame();
  requestAnimationFrame(frame);
}

// Screenshot staging: ?shot=cover|title|alert|win freezes one pose.
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  game.shot = shot;
  stageShot(game, shot);
  // Freeze the blink prompts at their bright phase for the screenshot.
  game.animT = 0.4;
}

window.__velvet = game;
requestAnimationFrame(frame);
