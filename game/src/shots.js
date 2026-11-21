// VELVET HOUR — screenshot staging. One job: deterministic poses for the
// four screenshots (?shot=cover|title|alert|win). Every pose is the game's
// own render path with a fixed scene — no compositing, no borrowed pixels.

import { missionScore, rankFor } from './loot.js';
import { updatePlayerLight } from './cover.js';

function stageCover(game) {
  game.startMission(1);
  const p = game.player;
  p.x = 290;
  p.y = 430;
  p.dir = -0.6;
  updatePlayerLight(p, game.level);
  const [rookA, rookB, swift, lamp] = game.guards;
  rookA.x = 200; rookA.y = 300; rookA.angle = 0.96;
  rookB.x = 900; rookB.y = 300; rookB.angle = 2.9;
  swift.x = 640; swift.y = 480; swift.angle = -3.0;
  lamp.angle = -2.2;
  game.cameras[0].angle = 2.6;
  // Four artifacts already stolen, two still glinting, exit glowing green.
  game.loot[0].taken = true;
  game.loot[1].taken = true;
  game.loot[4].taken = true;
  game.loot[5].taken = true;
  game.lootGot = 4;
  game.exitOpen = true;
  game.score = 400;
  game.time = 74;
  game.messages.push({ text: 'SHADOW = SAFE — cones cannot see far', t: 99 });
  game.screen = 'playing';
}

function stageAlert(game) {
  game.startMission(1);
  const p = game.player;
  p.x = 640;
  p.y = 500;
  p.dir = -Math.PI / 2;
  updatePlayerLight(p, game.level);
  const [rookA, rookB, swift, lamp] = game.guards;
  swift.x = 600; swift.y = 455; swift.angle = 0.84;
  swift.state = 'alert';
  swift.suspicion = 100;
  swift.lastSeenX = p.x;
  swift.lastSeenY = p.y;
  rookA.x = 700; rookA.y = 580; rookA.angle = -2.21;
  rookA.state = 'suspicious';
  rookA.suspicion = 55;
  rookA.lastSeenX = p.x;
  rookA.lastSeenY = p.y;
  rookB.x = 900; rookB.y = 300; rookB.angle = 2.9;
  rookB.suspicion = 20;
  lamp.angle = -2.0;
  lamp.suspicion = 30;
  game.cameras[0].suspicion = 40;
  game.alarm = 99;
  game.alarmOn = true;
  game.ghost = false;
  game.maxSuspicion = 100;
  game.loot[0].taken = true;
  game.loot[1].taken = true;
  game.loot[4].taken = true;
  game.lootGot = 3;
  game.score = 400;
  game.time = 96;
  game.messages.push({ text: 'HIDE!', t: 99 });
  game.screen = 'playing';
}

function stageWin(game) {
  game.startMission(1);
  for (const item of game.loot) item.taken = true;
  game.lootGot = game.loot.length;
  game.exitOpen = true;
  game.score = 600;
  game.time = 121;
  game.ghost = true;
  const r = missionScore(game);
  game.lastResult = { ...r, rank: rankFor(game, r) };
  game.screen = 'missionComplete';
}

export function stageShot(game, name) {
  if (name === 'cover') stageCover(game);
  else if (name === 'alert') stageAlert(game);
  else if (name === 'win') stageWin(game);
  else game.screen = 'title';
}
