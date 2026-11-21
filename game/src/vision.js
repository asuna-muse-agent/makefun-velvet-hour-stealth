// VELVET HOUR — vision geometry. One job: cones, line of sight, angles.
// A guard sees the player only inside its cone range + arc AND with a
// clear line (walls, crates, cases and plants all block sight).

import { pointBlocked } from './levels.js';

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function angleTo(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

export function dist(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function turnToward(angle, target, maxStep) {
  const d = angleDiff(target, angle);
  if (Math.abs(d) <= maxStep) return target;
  return angle + Math.sign(d) * maxStep;
}

// Sample the segment every 8px; any blocked sample breaks the sight line.
export function losClear(x1, y1, x2, y2, level) {
  const d = dist(x1, y1, x2, y2);
  const steps = Math.max(1, Math.ceil(d / 8));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (pointBlocked(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, level)) return false;
  }
  return true;
}

// Cone check: in range, inside the half-arc, line of sight clear.
export function coneSees(ox, oy, angle, range, halfArc, tx, ty, level) {
  if (dist(ox, oy, tx, ty) > range) return false;
  if (Math.abs(angleDiff(angleTo(ox, oy, tx, ty), angle)) > halfArc) return false;
  return losClear(ox, oy, tx, ty, level);
}
