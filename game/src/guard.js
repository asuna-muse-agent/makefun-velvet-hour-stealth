// VELVET HOUR — guards and cameras. One job: the patrol state machine.
// patrol → suspicious ("?", walks to the last seen spot) → alert ("!",
// chases, calls for help) → return. Lamps sweep in place; the boss Voss
// patrols slow with a huge cone.

import { GUARD_TYPES } from './config.js';
import { angleDiff, angleTo, dist, turnToward } from './vision.js';
import { tryMoveCircle } from './player.js';

export function createGuard(def, index) {
  const t = GUARD_TYPES[def.type];
  const [sx, sy] = def.waypoints[0];
  return {
    type: def.type,
    def: t,
    x: sx,
    y: sy,
    angle: def.type === 'lamp' ? -Math.PI / 2 : angleTo(sx, sy, def.waypoints[1][0], def.waypoints[1][1]),
    speed: t.speed,
    state: 'patrol',
    suspicion: 0,
    wpIndex: def.waypoints.length > 1 ? 1 : 0,
    waypoints: def.waypoints,
    waitT: 0,
    lookT: 0,
    alertT: 0,
    lastSeenX: sx,
    lastSeenY: sy,
    sweepT: index * 1.3,
    seenNow: false,
    stepT: 0,
  };
}

export function createCamera(def) {
  return {
    type: 'eye',
    def: GUARD_TYPES.eye,
    x: def.x,
    y: def.y,
    angle: def.angle,
    baseAngle: def.angle,
    sweep: def.sweep,
    sweepArc: def.sweepArc,
    range: def.range,
    arc: def.arc,
    suspicion: 0,
    state: 'patrol',
    seenNow: false,
    t: 0,
  };
}

function walkToward(ent, tx, ty, speed, dt, level) {
  const d = dist(ent.x, ent.y, tx, ty);
  if (d < 4) return true;
  const step = Math.min(d, speed * dt);
  const vx = ((tx - ent.x) / d) * step;
  const vy = ((ty - ent.y) / d) * step;
  ent.angle = turnToward(ent.angle, Math.atan2(vy, vx), 6 * dt);
  tryMoveCircle(ent, vx, vy, level);
  return dist(ent.x, ent.y, tx, ty) < 6;
}

export function updateGuard(game, guard, dt) {
  const level = game.level;
  if (guard.type === 'lamp') {
    // Sentry: stands, sweeps a long beam back and forth.
    guard.sweepT += dt;
    guard.angle = -Math.PI / 2 + Math.sin(guard.sweepT * 0.55) * 1.05;
    return;
  }
  if (guard.state === 'patrol') {
    if (guard.waitT > 0) {
      guard.waitT -= dt;
      return;
    }
    const wp = guard.waypoints[guard.wpIndex];
    if (walkToward(guard, wp[0], wp[1], guard.speed, dt, level)) {
      guard.wpIndex = (guard.wpIndex + 1) % guard.waypoints.length;
      guard.waitT = 0.6;
    }
  } else if (guard.state === 'suspicious') {
    if (guard.lookT > 0) {
      guard.lookT -= dt;
      guard.angle += dt * 0.9;
      if (guard.lookT <= 0 && guard.suspicion < 30) guard.state = 'return';
      return;
    }
    if (walkToward(guard, guard.lastSeenX, guard.lastSeenY, guard.speed * 1.3, dt, level)) {
      guard.lookT = 2.0;
    }
  } else if (guard.state === 'alert') {
    walkToward(guard, game.player.x, game.player.y, guard.speed * 1.5, dt, level);
    if (!guard.seenNow) {
      guard.alertT += dt;
      if (guard.alertT > 3.5) {
        guard.suspicion = 60;
        guard.state = 'suspicious';
        guard.alertT = 0;
      }
    } else {
      guard.alertT = 0;
    }
  } else if (guard.state === 'return') {
    // Walk back to the nearest waypoint, then resume the loop.
    let best = guard.waypoints[0];
    let bestD = Infinity;
    for (const wp of guard.waypoints) {
      const d = dist(guard.x, guard.y, wp[0], wp[1]);
      if (d < bestD) {
        bestD = d;
        best = wp;
      }
    }
    if (walkToward(guard, best[0], best[1], guard.speed, dt, level)) {
      guard.state = 'patrol';
      guard.wpIndex = (guard.waypoints.indexOf(best) + 1) % guard.waypoints.length;
    }
  }
  // Guard footsteps, panned by direction, louder when close.
  guard.stepT -= dt;
  if (guard.stepT <= 0 && guard.speed > 0) {
    guard.stepT = 0.42;
    game.audio.guardStep(guard.x, game.player.x);
  }
}

export function updateCamera(game, cam, dt) {
  cam.t += dt;
  cam.angle = cam.baseAngle + Math.sin(cam.t * cam.sweep) * cam.sweepArc;
}
