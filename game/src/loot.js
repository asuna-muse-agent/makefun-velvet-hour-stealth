// VELVET HOUR — loot and score. One job: artifacts, the skylight exit,
// Ghost bonus and the S/A/B/C rank. Collect every artifact and the exit
// glows green: reach it unseen to finish the mission.

import { SCORE } from './config.js';

export function createLoot(level) {
  return level.loot.map((l, i) => ({ ...l, taken: false, glint: i * 0.9 }));
}

export function collectLoot(game) {
  const { player } = game;
  for (const item of game.loot) {
    if (item.taken) continue;
    const dx = player.x - item.x;
    const dy = player.y - item.y;
    if (dx * dx + dy * dy < 28 * 28) {
      item.taken = true;
      game.lootGot += 1;
      game.score += SCORE.loot;
      game.audio.chime();
      game.messages.push({ text: `+${SCORE.loot}  ${item.name}`, t: 1.4 });
      if (game.lootGot >= game.loot.length) {
        game.exitOpen = true;
        game.messages.push({ text: 'EXIT OPEN — reach the skylight!', t: 2.2 });
      }
    }
  }
}

// Points for finishing a mission: loot + time bonus + Ghost bonus.
export function missionScore(game) {
  const timeBonus = Math.max(0, Math.round((game.level.par - game.time) * SCORE.timeBonusPerSec));
  const ghostBonus = game.ghost ? SCORE.ghostBonus : 0;
  return { timeBonus, ghostBonus, total: game.score + timeBonus + ghostBonus };
}

export function rankFor(game, ms) {
  if (game.ghost && game.time <= game.level.par) return 'S';
  if (game.time <= game.level.par * 1.25) return 'A';
  if (game.time <= game.level.par * 1.6) return 'B';
  return 'C';
}
