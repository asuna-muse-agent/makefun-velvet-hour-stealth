// VELVET HOUR — HUD, menus and end screens. One job: everything drawn
// over the world — the dense HUD strip, the guard roster, title, briefing,
// WIN/LOSE screens — so every screenshot carries the whole game.

import { VIEW, HUD_H, STRIP_H, GUARD_TYPES } from './config.js';

function text(ctx, s, x, y, font, color, align = 'left') {
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(s, x, y);
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function suspicionColor(v) {
  if (v >= 100) return '#ff2e1f';
  if (v >= 50) return '#ff9f1c';
  return '#ffd640';
}

function drawBar(ctx, x, y, w, h, frac, color) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * Math.max(0, Math.min(1, frac)), h);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

// The top HUD strip: mission, objective (WIN/LOSE spelled out), loot,
// suspicion, score, timer, lives, SAFE/SPOTTED pip.
export function drawHUD(ctx, game) {
  ctx.fillStyle = '#241a33';
  ctx.fillRect(0, 0, VIEW.w, HUD_H);
  ctx.fillStyle = '#e8b64c';
  ctx.fillRect(0, HUD_H - 3, VIEW.w, 3);
  const level = game.level;
  text(ctx, 'VELVET HOUR', 16, 18, '900 16px system-ui, sans-serif', '#e8b64c');
  text(ctx, `MISSION ${game.missionIndex + 1}/3 · ${level.name}`, 16, 42, '600 12px system-ui, sans-serif', '#f7efdd');
  text(
    ctx,
    'WIN: loot + exit    •    LOSE: caught 3×',
    320, 18, '600 12px system-ui, sans-serif', '#cfc4e8',
  );
  text(ctx, 'SUSPICION', 320, 42, '700 11px system-ui, sans-serif', '#f7efdd');
  drawBar(ctx, 400, 36, 170, 12, game.maxSuspicion / 100, suspicionColor(game.maxSuspicion));
  text(ctx, `${Math.round(game.maxSuspicion)}`, 578, 42, '700 12px system-ui, sans-serif', '#f7efdd');
  text(ctx, `LOOT ${game.lootGot}/${game.loot.length} ◆`, 640, 18, '700 14px system-ui, sans-serif', '#ffd94d');
  text(ctx, `SCORE ${game.score}`, 640, 42, '700 13px system-ui, sans-serif', '#f7efdd');
  text(ctx, fmtTime(game.time), 860, 18, '700 15px system-ui, sans-serif', '#f7efdd');
  text(ctx, `PAR ${fmtTime(level.par)}`, 860, 42, '600 11px system-ui, sans-serif', '#cfc4e8');
  const hearts = '♥'.repeat(Math.max(0, game.lives)) + '♡'.repeat(Math.max(0, 3 - game.lives));
  text(ctx, hearts, 960, 30, '18px system-ui, sans-serif', '#ff5a6e');
  // SAFE / SPOTTED pip, tied to the hottest guard.
  const spotted = game.alarmOn;
  const wary = !spotted && game.maxSuspicion >= 25;
  const pip = spotted ? '#ff2e1f' : wary ? '#ff9f1c' : '#39d353';
  const label = spotted ? 'SPOTTED' : wary ? 'WARY' : 'SAFE';
  ctx.beginPath();
  ctx.arc(1090, 30, 9, 0, Math.PI * 2);
  ctx.fillStyle = pip;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  text(ctx, label, 1106, 30, '900 13px system-ui, sans-serif', pip);
  if (game.audio.muted) text(ctx, 'MUTED (M)', 1210, 42, '600 11px system-ui, sans-serif', '#ff9f1c', 'right');
}

// The bottom guard-roster strip: every guard type in this mission, with a
// live suspicion bar each — the patrols are learnable at a glance.
export function drawRoster(ctx, game) {
  ctx.fillStyle = '#241a33';
  ctx.fillRect(0, VIEW.h - STRIP_H, VIEW.w, STRIP_H);
  ctx.fillStyle = '#e8b64c';
  ctx.fillRect(0, VIEW.h - STRIP_H, VIEW.w, 3);
  text(ctx, 'GUARDS:', 16, VIEW.h - 24, '900 12px system-ui, sans-serif', '#e8b64c');
  const seen = [];
  for (const g of game.guards) if (!seen.includes(g.type)) seen.push(g.type);
  for (const c of game.cameras) if (!seen.includes('eye')) seen.push('eye');
  let x = 96;
  for (const type of seen) {
    const def = GUARD_TYPES[type];
    const hottest = Math.max(0, ...game.guards.filter((g) => g.type === type).map((g) => g.suspicion),
      ...game.cameras.filter(() => type === 'eye').map((c) => c.suspicion));
    ctx.beginPath();
    ctx.arc(x + 6, VIEW.h - 24, 7, 0, Math.PI * 2);
    ctx.fillStyle = def.color;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    text(ctx, def.label.toUpperCase(), x + 18, VIEW.h - 24, '700 11px system-ui, sans-serif', '#f7efdd');
    drawBar(ctx, x + 18, VIEW.h - 12, 64, 5, hottest / 100, suspicionColor(hottest));
    x += 132;
  }
  text(ctx, 'WASD move · SHIFT run (noisy!) · P pause · M mute · R restart', VIEW.w - 16, VIEW.h - 24, '600 11px system-ui, sans-serif', '#cfc4e8', 'right');
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(20, 12, 36, 0.92)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#e8b64c';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
  ctx.strokeStyle = 'rgba(232,182,76,0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
}

export function drawTitle(ctx, game) {
  const grad = ctx.createLinearGradient(0, 0, 0, VIEW.h);
  grad.addColorStop(0, '#1a0f2e');
  grad.addColorStop(1, '#2c1a4a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  ctx.strokeStyle = '#e8b64c';
  ctx.lineWidth = 3;
  ctx.strokeRect(14, 14, VIEW.w - 28, VIEW.h - 28);
  text(ctx, 'VELVET HOUR', VIEW.w / 2, 110, '900 76px Georgia, serif', '#e8b64c', 'center');
  text(ctx, '— THE GULLWING GALLERY HEIST —', VIEW.w / 2, 168, '600 24px Georgia, serif', '#f7efdd', 'center');
  text(ctx, 'A top-down stealth game: steal, hide, escape unseen.', VIEW.w / 2, 204, '600 15px system-ui, sans-serif', '#cfc4e8', 'center');
  // Missions.
  text(ctx, 'THREE GALLERIES, ONE NIGHT', VIEW.w / 2, 252, '900 15px system-ui, sans-serif', '#e8b64c', 'center');
  const missions = ['1 · The Atrium — learn the cones', '2 · The Vault Wing — Swift + Eye camera', "3 · The Director's Gallery — Captain Marlowe + Curator Voss"];
  missions.forEach((m, i) => text(ctx, m, VIEW.w / 2, 282 + i * 24, '600 14px system-ui, sans-serif', '#f7efdd', 'center'));
  // Guard roster with one-line behaviours.
  panel(ctx, 190, 368, 900, 218);
  text(ctx, 'WHO PATROLS THE GALLERY', 640, 396, '900 15px system-ui, sans-serif', '#e8b64c', 'center');
  const types = ['rook', 'swift', 'lamp', 'captain', 'eye', 'voss'];
  types.forEach((type, i) => {
    const def = GUARD_TYPES[type];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 220 + col * 450;
    const y = 428 + row * 48;
    ctx.beginPath();
    ctx.arc(x + 8, y, 9, 0, Math.PI * 2);
    ctx.fillStyle = def.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    text(ctx, def.label, x + 24, y - 6, '900 14px system-ui, sans-serif', '#f7efdd');
    text(ctx, def.behavior, x + 24, y + 12, '600 12px system-ui, sans-serif', '#cfc4e8');
  });
  const blink = 0.6 + 0.4 * Math.sin(game.animT * 4);
  text(ctx, 'Press ENTER — Wren is waiting', VIEW.w / 2, 636, `900 20px system-ui, sans-serif`, `rgba(247,239,221,${blink})`, 'center');
  text(ctx, 'WASD / arrows move · SHIFT run (loud!) · P pause · M mute · R restart', VIEW.w / 2, 672, '600 13px system-ui, sans-serif', '#cfc4e8', 'center');
  text(ctx, 'Shadow is safe. Lamp light is risky. Running rings the alarm bells.', VIEW.w / 2, 700, '600 13px system-ui, sans-serif', '#cfc4e8', 'center');
}

export function drawBriefing(ctx, game) {
  const level = game.level;
  ctx.fillStyle = '#1a0f2e';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  panel(ctx, 290, 170, 700, 420);
  text(ctx, `MISSION ${game.missionIndex + 1} / 3`, 640, 214, '900 16px system-ui, sans-serif', '#e8b64c', 'center');
  text(ctx, level.name, 640, 258, '900 40px Georgia, serif', '#f7efdd', 'center');
  text(ctx, level.briefing, 640, 306, '600 15px system-ui, sans-serif', '#cfc4e8', 'center');
  const types = [...new Set(game.guards.map((g) => g.type)), ...game.cameras.map(() => 'eye')];
  text(ctx, `ON PATROL: ${types.map((t) => GUARD_TYPES[t].label).join(' · ')}`, 640, 348, '700 14px system-ui, sans-serif', '#ffd94d', 'center');
  text(ctx, `LOOT ${level.loot.length} artifacts  ·  PAR ${fmtTime(level.par)}  ·  3 LIVES`, 640, 384, '700 14px system-ui, sans-serif', '#f7efdd', 'center');
  text(ctx, 'Steal every artifact, then reach the skylight exit unseen.', 640, 424, '600 14px system-ui, sans-serif', '#cfc4e8', 'center');
  text(ctx, 'Caught 3 times and the mission fails. Hiding in shadow cools suspicion.', 640, 450, '600 14px system-ui, sans-serif', '#cfc4e8', 'center');
  const blink = 0.6 + 0.4 * Math.sin(game.animT * 4);
  text(ctx, 'Press ENTER to begin', 640, 530, `900 20px system-ui, sans-serif`, `rgba(247,239,221,${blink})`, 'center');
}

export function drawMissionComplete(ctx, game) {
  const r = game.lastResult;
  ctx.fillStyle = 'rgba(10, 6, 20, 0.72)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  panel(ctx, 340, 150, 600, 470);
  text(ctx, 'MISSION COMPLETE', 640, 206, '900 38px Georgia, serif', '#e8b64c', 'center');
  text(ctx, 'WIN — every artifact is yours.', 640, 248, '600 16px system-ui, sans-serif', '#f7efdd', 'center');
  const rows = [
    [`Loot ${game.lootGot}/${game.loot.length}`, `+${game.lootGot * 100}`],
    ['Time bonus', `+${r.timeBonus}`],
    ['Ghost bonus (never seen)', `+${r.ghostBonus}`],
  ];
  rows.forEach(([label, val], i) => {
    text(ctx, label, 400, 300 + i * 34, '600 16px system-ui, sans-serif', '#f7efdd');
    text(ctx, val, 880, 300 + i * 34, '700 16px system-ui, sans-serif', '#ffd94d', 'right');
  });
  ctx.strokeStyle = 'rgba(232,182,76,0.5)';
  ctx.beginPath();
  ctx.moveTo(400, 410);
  ctx.lineTo(880, 410);
  ctx.stroke();
  text(ctx, 'TOTAL', 400, 440, '900 18px system-ui, sans-serif', '#f7efdd');
  text(ctx, `${r.total}`, 880, 440, '900 20px system-ui, sans-serif', '#ffd94d', 'right');
  // Rank medallion.
  ctx.beginPath();
  ctx.arc(640, 500, 34, 0, Math.PI * 2);
  ctx.fillStyle = r.rank === 'S' ? '#e8b64c' : '#3a2d5c';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  text(ctx, r.rank, 640, 502, '900 34px Georgia, serif', r.rank === 'S' ? '#241a12' : '#fff', 'center');
  text(ctx, `RANK ${r.rank} — ${r.rank === 'S' ? 'Ghost! Never seen.' : 'The gallery remembers you.'}`, 640, 552, '600 14px system-ui, sans-serif', '#cfc4e8', 'center');
  const blink = 0.6 + 0.4 * Math.sin(game.animT * 4);
  text(ctx, game.missionIndex + 1 < 3 ? 'Press ENTER — the next gallery awaits' : 'Press ENTER — the heist is done', 640, 590, `900 18px system-ui, sans-serif`, `rgba(247,239,221,${blink})`, 'center');
}

export function drawGameOver(ctx, game) {
  ctx.fillStyle = 'rgba(20, 4, 8, 0.78)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  panel(ctx, 340, 210, 600, 360);
  text(ctx, 'CAUGHT', 640, 272, '900 52px Georgia, serif', '#ff2e1f', 'center');
  text(ctx, 'MISSION FAILED — the guards found Wren three times.', 640, 326, '600 16px system-ui, sans-serif', '#f7efdd', 'center');
  text(ctx, `The ${game.level.name} keeps its artifacts… for now.`, 640, 360, '600 15px system-ui, sans-serif', '#cfc4e8', 'center');
  text(ctx, `Score kept: ${game.score}`, 640, 404, '700 15px system-ui, sans-serif', '#ffd94d', 'center');
  const blink = 0.6 + 0.4 * Math.sin(game.animT * 4);
  text(ctx, 'Press R to retry the mission', 640, 500, `900 20px system-ui, sans-serif`, `rgba(247,239,221,${blink})`, 'center');
}

export function drawVictory(ctx, game) {
  const grad = ctx.createLinearGradient(0, 0, 0, VIEW.h);
  grad.addColorStop(0, '#1a0f2e');
  grad.addColorStop(1, '#3a2a10');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  ctx.strokeStyle = '#e8b64c';
  ctx.lineWidth = 3;
  ctx.strokeRect(14, 14, VIEW.w - 28, VIEW.h - 28);
  text(ctx, 'THE GULLWING IS YOURS', VIEW.w / 2, 220, '900 56px Georgia, serif', '#e8b64c', 'center');
  text(ctx, 'YOU WIN — every artifact, every gallery, unseen.', VIEW.w / 2, 290, '600 20px system-ui, sans-serif', '#f7efdd', 'center');
  text(ctx, `FINAL SCORE  ${game.score}`, VIEW.w / 2, 370, '900 28px system-ui, sans-serif', '#ffd94d', 'center');
  text(ctx, 'Wren slips into the velvet hour. The gallery never knew she was there.', VIEW.w / 2, 430, '600 16px system-ui, sans-serif', '#cfc4e8', 'center');
  const blink = 0.6 + 0.4 * Math.sin(game.animT * 4);
  text(ctx, 'Press R to play again', VIEW.w / 2, 520, `900 20px system-ui, sans-serif`, `rgba(247,239,221,${blink})`, 'center');
}

export function drawPause(ctx, game) {
  ctx.fillStyle = 'rgba(10, 6, 20, 0.6)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  text(ctx, 'PAUSED', VIEW.w / 2, 360, '900 52px Georgia, serif', '#f7efdd', 'center');
  text(ctx, 'P to resume · M mute · R restart the mission', VIEW.w / 2, 420, '600 16px system-ui, sans-serif', '#cfc4e8', 'center');
}
