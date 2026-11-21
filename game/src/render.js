// VELVET HOUR — canvas renderer. One job: draw the gallery so a single
// frame reads BRIGHT + DENSE + COMPLETE: warm floor, cones, cover, loot,
// exit, HUD strip — every system visible in one shot.

import { VIEW, HUD_H, STRIP_H, PALETTE, GUARD_TYPES } from './config.js';
import { angleTo, dist } from './vision.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, font, color, align = 'left') {
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(s, x, y);
}

function drawCone(ctx, x, y, angle, range, halfArc, color) {
  const grad = ctx.createRadialGradient(x, y, 8, x, y, range);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(255, 220, 90, 0)');
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfArc, angle + halfArc);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + Math.cos(angle - halfArc) * range, y + Math.sin(angle - halfArc) * range);
  ctx.lineTo(x, y);
  ctx.lineTo(x + Math.cos(angle + halfArc) * range, y + Math.sin(angle + halfArc) * range);
  ctx.stroke();
  // Sweep arrow: a chevron on the cone's centre line, showing the timing window.
  const ax = x + Math.cos(angle) * range * 0.62;
  const ay = y + Math.sin(angle) * range * 0.62;
  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(7, 0);
  ctx.lineTo(-4, -6);
  ctx.lineTo(-4, 6);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fill();
  ctx.restore();
}

function coneColor(state) {
  if (state === 'alert') return PALETTE.coneAlert;
  if (state === 'suspicious') return PALETTE.coneWary;
  return PALETTE.coneCalm;
}

function drawPatrolPath(ctx, game, guard) {
  const wps = guard.waypoints;
  if (wps.length < 2) return;
  const hovered = game.input.mouse.inside && dist(game.input.mouse.x, game.input.mouse.y, guard.x, guard.y) < 34;
  ctx.save();
  ctx.setLineDash([1, 10]);
  ctx.lineCap = 'round';
  ctx.lineWidth = hovered ? 4 : 3;
  ctx.strokeStyle = hovered ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.32)';
  ctx.beginPath();
  ctx.moveTo(wps[0][0], wps[0][1]);
  for (let i = 1; i < wps.length; i++) ctx.lineTo(wps[i][0], wps[i][1]);
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);
  // Direction chevrons on each leg.
  for (let i = 0; i < wps.length; i++) {
    const a = wps[i];
    const b = wps[(i + 1) % wps.length];
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const ang = angleTo(a[0], a[1], b[0], b[1]);
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(-4, -5);
    ctx.lineTo(-4, 5);
    ctx.closePath();
    ctx.fillStyle = hovered ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)';
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawGuard(ctx, game, g) {
  const t = g.def;
  // Body: uniform circle, darker rim, white nose showing facing.
  ctx.beginPath();
  ctx.arc(g.x, g.y, t.radius, 0, Math.PI * 2);
  ctx.fillStyle = t.color;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(g.x + Math.cos(g.angle) * t.radius, g.y + Math.sin(g.angle) * t.radius);
  ctx.lineTo(g.x + Math.cos(g.angle + 2.5) * (t.radius - 4), g.y + Math.sin(g.angle + 2.5) * (t.radius - 4));
  ctx.lineTo(g.x + Math.cos(g.angle - 2.5) * (t.radius - 4), g.y + Math.sin(g.angle - 2.5) * (t.radius - 4));
  ctx.closePath();
  ctx.fillStyle = '#fff';
  ctx.fill();
  // Cap: a dark arc on top.
  ctx.beginPath();
  ctx.arc(g.x, g.y, t.radius - 4, g.angle + 2.2, g.angle + 4.1);
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = 4;
  ctx.stroke();
  // Name tag under the guard.
  text(ctx, t.label.toUpperCase(), g.x, g.y + t.radius + 10, '700 9px system-ui, sans-serif', 'rgba(255,255,255,0.9)', 'center');
  // Suspicion bar above the guard.
  const bw = 34;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(g.x - bw / 2, g.y - t.radius - 12, bw, 5);
  ctx.fillStyle = g.suspicion >= 50 ? '#ff5030' : '#ffd640';
  ctx.fillRect(g.x - bw / 2, g.y - t.radius - 12, (bw * g.suspicion) / 100, 5);
  // "?" investigate / "!" alert bubble.
  if (g.state === 'suspicious' || g.state === 'alert') {
    const hot = g.state === 'alert';
    ctx.beginPath();
    ctx.arc(g.x + t.radius, g.y - t.radius - 6, 10, 0, Math.PI * 2);
    ctx.fillStyle = hot ? '#ff2e1f' : '#ff9f1c';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    text(ctx, hot ? '!' : '?', g.x + t.radius, g.y - t.radius - 5, '900 13px system-ui, sans-serif', '#fff', 'center');
  }
}

export function drawWorld(ctx, game) {
  const { level, player } = game;
  const t = game.animT;
  // --- floor: warm wood planks ---
  ctx.fillStyle = PALETTE.floorA;
  ctx.fillRect(0, HUD_H, VIEW.w, VIEW.h - HUD_H - STRIP_H);
  ctx.strokeStyle = PALETTE.floorLine;
  ctx.lineWidth = 1;
  for (let y = HUD_H + 40; y < VIEW.h - STRIP_H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW.w, y);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(168,124,76,0.5)';
  for (let y = HUD_H, row = 0; y < VIEW.h - STRIP_H; y += 40, row++) {
    for (let x = row % 2 ? 60 : 0; x < VIEW.w; x += 200) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 40);
      ctx.stroke();
    }
  }
  // --- shadow zones: cool, near-black, clearly safe ---
  for (const s of level.shadows) {
    ctx.fillStyle = PALETTE.shadow;
    rr(ctx, s.x, s.y, s.w, s.h, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,150,255,0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  // --- lamp pools: hot, high-saturation warmth ---
  for (const l of level.lamps) {
    const grad = ctx.createRadialGradient(l.x, l.y, 6, l.x, l.y, l.r);
    grad.addColorStop(0, 'rgba(255, 205, 110, 0.34)');
    grad.addColorStop(1, 'rgba(255, 190, 90, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(l.x, l.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd97a';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#8a6d3b';
    ctx.stroke();
  }
  // --- paintings on the top wall ---
  for (const p of level.paintings) {
    ctx.fillStyle = '#7a5c2e';
    ctx.fillRect(p.x - 3, p.y - 3, p.w + 6, p.h + 6);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(p.x + 4, p.y + 4, p.w - 8, 5);
    text(ctx, p.title, p.x + p.w / 2, p.y + p.h + 12, '9px system-ui, sans-serif', 'rgba(60,40,20,0.85)', 'center');
  }
  // --- walls: cream with gold trim ---
  for (const w of level.walls) {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = PALETTE.wallEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x + 1, w.y + 1, w.w - 2, w.h - 2);
  }
  ctx.fillStyle = PALETTE.wallTrim;
  ctx.fillRect(0, HUD_H + 14, VIEW.w, 3);
  // --- dotted patrol paths ---
  for (const g of game.guards) drawPatrolPath(ctx, game, g);
  // --- exit: the skylight ---
  const ex = level.exit;
  const glow = game.exitOpen ? 1 : 0.45;
  const grad = ctx.createRadialGradient(ex.x, ex.y, 4, ex.x, ex.y, 46);
  grad.addColorStop(0, `rgba(57, 211, 83, ${0.55 * glow})`);
  grad.addColorStop(1, 'rgba(57, 211, 83, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(ex.x, ex.y, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ex.x, ex.y, 24, 0, Math.PI * 2);
  ctx.fillStyle = game.exitOpen ? PALETTE.exitGlow : PALETTE.exitDim;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ex.x - 24, ex.y);
  ctx.lineTo(ex.x + 24, ex.y);
  ctx.moveTo(ex.x, ex.y - 24);
  ctx.lineTo(ex.x, ex.y + 24);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.stroke();
  text(ctx, game.exitOpen ? 'EXIT OPEN' : 'EXIT LOCKED', ex.x, ex.y + 38, '700 11px system-ui, sans-serif', game.exitOpen ? '#1d7a33' : '#5a4632', 'center');
  // --- loot: glinting artifacts ---
  for (const item of game.loot) {
    if (item.taken) continue;
    const pulse = 1 + 0.16 * Math.sin(t * 3 + item.glint);
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.scale(pulse, pulse);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#ffd94d';
    ctx.fillRect(-8, -8, 16, 16);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#8a6d3b';
    ctx.strokeRect(-8, -8, 16, 16);
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(item.x, item.y - 16);
    ctx.lineTo(item.x, item.y + 16);
    ctx.moveTo(item.x - 16, item.y);
    ctx.lineTo(item.x + 16, item.y);
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1;
    ctx.stroke();
    text(ctx, item.name, item.x, item.y + 24, '9px system-ui, sans-serif', '#5a4632', 'center');
  }
  // --- cover: crates, plants, display cases ---
  for (const c of level.cover) {
    if (c.kind === 'crate') {
      ctx.fillStyle = '#8a5a2b';
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeStyle = '#5d3a17';
      ctx.lineWidth = 2;
      ctx.strokeRect(c.x, c.y, c.w, c.h);
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x + c.w, c.y + c.h);
      ctx.moveTo(c.x + c.w, c.y);
      ctx.lineTo(c.x, c.y + c.h);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(93,58,23,0.8)';
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(c.x, c.y, c.w, 6);
    } else if (c.kind === 'plant') {
      ctx.beginPath();
      ctx.arc(c.x - 8, c.y + 6, c.r * 0.7, 0, Math.PI * 2);
      ctx.arc(c.x + 9, c.y + 7, c.r * 0.65, 0, Math.PI * 2);
      ctx.arc(c.x, c.y - 8, c.r * 0.75, 0, Math.PI * 2);
      ctx.fillStyle = '#1e7a34';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(c.x, c.y - 4, c.r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#2fae4e';
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(180, 220, 245, 0.5)';
      rr(ctx, c.x, c.y, c.w, c.h, 4);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#e8f4ff';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(c.x + 8, c.y + c.h - 6);
      ctx.lineTo(c.x + c.w - 14, c.y + 6);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(c.x + c.w / 2, c.y + c.h / 2, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd94d';
      ctx.fill();
    }
  }
  // --- noise rings ---
  for (const ring of game.noiseRings) {
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 80, 60, ${0.7 * (1 - ring.r / ring.maxR)})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  // --- vision cones (cameras first, under guards) ---
  for (const cam of game.cameras) {
    drawCone(ctx, cam.x, cam.y, cam.angle, cam.range, cam.arc, coneColor(cam.suspicion >= 100 ? 'alert' : cam.suspicion >= 50 ? 'suspicious' : 'patrol'));
  }
  for (const g of game.guards) {
    drawCone(ctx, g.x, g.y, g.angle, g.def.range, g.def.arc, coneColor(g.state));
  }
  // --- cameras ---
  for (const cam of game.cameras) {
    ctx.beginPath();
    ctx.arc(cam.x, cam.y, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#2e4053';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cam.x + Math.cos(cam.angle) * 6, cam.y + Math.sin(cam.angle) * 6, 4, 0, Math.PI * 2);
    ctx.fillStyle = cam.suspicion >= 50 ? '#ff2e1f' : '#ffd640';
    ctx.fill();
    text(ctx, 'EYE', cam.x, cam.y + 22, '700 9px system-ui, sans-serif', 'rgba(255,255,255,0.9)', 'center');
  }
  // --- guards ---
  for (const g of game.guards) drawGuard(ctx, game, g);
  // --- the player: Wren, teal, with a thief's mask ---
  ctx.beginPath();
  ctx.ellipse(player.x, player.y + 8, 16, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.player;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(player.x + Math.cos(player.dir) * player.r, player.y + Math.sin(player.dir) * player.r);
  ctx.lineTo(player.x + Math.cos(player.dir + 2.6) * (player.r - 5), player.y + Math.sin(player.dir + 2.6) * (player.r - 5));
  ctx.lineTo(player.x + Math.cos(player.dir - 2.6) * (player.r - 5), player.y + Math.sin(player.dir - 2.6) * (player.r - 5));
  ctx.closePath();
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r - 4, player.dir + 0.6, player.dir + Math.PI - 0.6);
  ctx.strokeStyle = PALETTE.playerDark;
  ctx.lineWidth = 4;
  ctx.stroke();
  if (player.hidden) {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r + 5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(120,170,255,0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();
    text(ctx, 'HIDDEN', player.x, player.y - player.r - 14, '700 9px system-ui, sans-serif', '#9db8ff', 'center');
  }
  // --- CLOSE! near-miss flash ---
  if (game.closeCall && game.maxSuspicion >= 25 && !game.alarmOn) {
    const a = 0.55 + 0.45 * Math.sin(t * 6);
    text(ctx, 'CLOSE!', player.x, player.y - 30, '900 16px system-ui, sans-serif', `rgba(255, 159, 28, ${a})`, 'center');
  }
  // --- alarm banner ---
  if (game.alarm > 0) {
    const a = 0.75 + 0.25 * Math.sin(t * 8);
    ctx.fillStyle = `rgba(200, 30, 20, ${a})`;
    ctx.fillRect(0, HUD_H, VIEW.w, 34);
    text(ctx, 'ALARM — HIDE IN SHADOW!', VIEW.w / 2, HUD_H + 18, '900 19px system-ui, sans-serif', '#fff', 'center');
  }
  // --- floating messages (low, clear of the exit and the paintings) ---
  game.messages.forEach((m, i) => {
    const a = Math.min(1, m.t);
    ctx.font = '700 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 4;
    ctx.strokeStyle = `rgba(0,0,0,${0.7 * a})`;
    ctx.strokeText(m.text, VIEW.w / 2, 716 - (game.messages.length - 1 - i) * 24);
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fillText(m.text, VIEW.w / 2, 716 - (game.messages.length - 1 - i) * 24);
  });
}
