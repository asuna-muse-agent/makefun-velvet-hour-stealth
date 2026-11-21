// VELVET HOUR — detection. One job: suspicion, alarm and recovery.
// A guard's suspicion fills when its cone holds the player (faster in lamp
// light, slower in shadow, faster up close), drains when it loses you —
// hiding cools the alarm. 50 → "?" investigate, 100 → "!" alert + converge.

import { SUSPICION } from './config.js';
import { coneSees, dist } from './vision.js';

function callForHelp(game, caller) {
  const reach = caller.type === 'voss' ? Infinity : caller.type === 'captain' ? 340 : 260;
  const boost = caller.type === 'voss' ? 70 : caller.type === 'captain' ? 30 : 20;
  for (const g of game.guards) {
    if (g === caller) continue;
    if (dist(g.x, g.y, caller.x, caller.y) > reach) continue;
    g.suspicion = Math.max(g.suspicion, boost);
    g.lastSeenX = game.player.x;
    g.lastSeenY = game.player.y;
    if (g.state === 'patrol') g.state = 'suspicious';
  }
}

export function updateDetection(game, dt) {
  const { player, level } = game;
  let maxS = 0;
  let closeCall = false;
  for (const g of game.guards) {
    const seen = coneSees(g.x, g.y, g.angle, g.def.range, g.def.arc, player.x, player.y, level);
    g.seenNow = seen;
    if (seen) {
      g.lastSeenX = player.x;
      g.lastSeenY = player.y;
      let rate = g.def.fill;
      if (player.lit) rate *= SUSPICION.litMult;
      if (player.hidden) rate *= SUSPICION.shadowMult;
      const d = dist(g.x, g.y, player.x, player.y);
      rate *= 1 + SUSPICION.closeBonus * (1 - d / g.def.range);
      g.suspicion = Math.min(100, g.suspicion + rate * dt);
    } else {
      const drain = player.hidden ? SUSPICION.drainShadow : SUSPICION.drain;
      g.suspicion = Math.max(0, g.suspicion - drain * dt);
      // Near miss: the player sits just outside the cone's edge.
      const d = dist(g.x, g.y, player.x, player.y);
      if (d < g.def.range * 1.2) closeCall = true;
    }
    if (g.suspicion >= SUSPICION.alertAt && g.state !== 'alert') {
      g.state = 'alert';
      g.alertT = 0;
      game.ghost = false;
      game.alarm = 2.5;
      game.audio.alarmSting();
      callForHelp(game, g);
      game.messages.push({ text: 'SPOTTED!', t: 1.6 });
    } else if (g.suspicion >= SUSPICION.warnAt && g.state === 'patrol') {
      g.state = 'suspicious';
      g.lookT = 0;
    } else if (g.suspicion < SUSPICION.warnAt && g.state === 'suspicious' && g.lookT <= 0) {
      g.state = 'return';
    }
    maxS = Math.max(maxS, g.suspicion);
  }
  for (const cam of game.cameras) {
    const seen = coneSees(cam.x, cam.y, cam.angle, cam.range, cam.arc, player.x, player.y, level);
    cam.seenNow = seen;
    if (seen) {
      cam.suspicion = Math.min(100, cam.suspicion + cam.def.fill * dt);
      if (cam.suspicion >= 100 && !game.alarmOn) {
        game.ghost = false;
        game.alarm = 2.5;
        game.audio.alarmSting();
        for (const g of game.guards) {
          g.suspicion = Math.max(g.suspicion, 70);
          g.lastSeenX = player.x;
          g.lastSeenY = player.y;
          if (g.state === 'patrol') g.state = 'suspicious';
        }
        game.messages.push({ text: 'CAMERA ALARM!', t: 1.6 });
      }
    } else {
      cam.suspicion = Math.max(0, cam.suspicion - SUSPICION.drain * dt);
    }
    maxS = Math.max(maxS, cam.suspicion);
  }
  game.maxSuspicion = maxS;
  game.closeCall = closeCall;
  game.alarmOn = game.guards.some((g) => g.state === 'alert');
}

// A running player's noise rings pull guards toward the sound.
export function investigateNoise(game, x, y) {
  for (const g of game.guards) {
    if (dist(g.x, g.y, x, y) > 170) continue;
    g.suspicion = Math.min(100, g.suspicion + 15);
    g.lastSeenX = x;
    g.lastSeenY = y;
    if (g.state === 'patrol') g.state = 'suspicious';
  }
}

// An alerted guard that touches the player catches them. Returns the guard.
export function checkCaught(game) {
  for (const g of game.guards) {
    if (g.state !== 'alert') continue;
    if (dist(g.x, g.y, game.player.x, game.player.y) < 30) return g;
  }
  return null;
}
