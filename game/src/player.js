// VELVET HOUR — the thief Wren. One job: movement, noise and collision.
// Walk is silent; SHIFT runs fast and rings the alarm bells — noise rings
// pull every guard in earshot toward where they heard you.

import { PLAYER, PLAY } from './config.js';
import { solidRects } from './levels.js';
import { updatePlayerLight } from './cover.js';

export function createPlayer(level) {
  return {
    x: level.playerStart.x,
    y: level.playerStart.y,
    r: PLAYER.radius,
    dir: -Math.PI / 2,
    moving: false,
    running: false,
    noiseT: 0,
    hidden: false,
    lit: false,
    stepT: 0,
  };
}

function circleHitsRect(cx, cy, r, rect) {
  const nx = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

// Axis-separated slide: try X, then Y; a blocked axis simply does not move.
// Shared by the player and the guards.
export function tryMoveCircle(ent, dx, dy, level) {
  const rects = solidRects(level);
  const nx = ent.x + dx;
  let blockedX = nx - ent.r < PLAY.x0 || nx + ent.r > PLAY.x1;
  if (!blockedX) {
    for (const r of rects) {
      if (circleHitsRect(nx, ent.y, ent.r, r)) {
        blockedX = true;
        break;
      }
    }
  }
  if (!blockedX) ent.x = nx;
  const ny = ent.y + dy;
  let blockedY = ny - ent.r < PLAY.y0 || ny + ent.r > PLAY.y1;
  if (!blockedY) {
    for (const r of rects) {
      if (circleHitsRect(ent.x, ny, ent.r, r)) {
        blockedY = true;
        break;
      }
    }
  }
  if (!blockedY) ent.y = ny;
}

export function updatePlayer(game, dt) {
  const { input, player, level } = game;
  let mx = 0;
  let my = 0;
  if (input.down('KeyW') || input.down('ArrowUp')) my -= 1;
  if (input.down('KeyS') || input.down('ArrowDown')) my += 1;
  if (input.down('KeyA') || input.down('ArrowLeft')) mx -= 1;
  if (input.down('KeyD') || input.down('ArrowRight')) mx += 1;
  player.moving = mx !== 0 || my !== 0;
  player.running = player.moving && (input.down('ShiftLeft') || input.down('ShiftRight'));
  if (player.moving) {
    const len = Math.hypot(mx, my);
    const speed = player.running ? PLAYER.runSpeed : PLAYER.walkSpeed;
    const vx = (mx / len) * speed * dt;
    const vy = (my / len) * speed * dt;
    player.dir = Math.atan2(vy, vx);
    tryMoveCircle(player, vx, vy, level);
    // Footsteps: soft ticks while walking, louder while running.
    player.stepT -= dt;
    if (player.stepT <= 0) {
      player.stepT = player.running ? 0.22 : 0.34;
      game.audio.step(player.running, player.x);
    }
    // Running rings a bell: a noise ring every quarter second.
    if (player.running) {
      player.noiseT -= dt;
      if (player.noiseT <= 0) {
        player.noiseT = PLAYER.noiseEvery;
        game.noiseRings.push({ x: player.x, y: player.y, r: 8, maxR: PLAYER.noiseRadius });
        game.audio.noiseRing();
      }
    }
  }
  updatePlayerLight(player, level);
}
