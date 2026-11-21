// VELVET HOUR — light and shadow. One job: answer where the player
// stands — lamp pool (risky, seen farther), shadow (safe, drains suspicion)
// or open floor — because lighting IS the safety system.

export function inShadow(x, y, level) {
  return level.shadows.some((s) => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h);
}

export function lampAt(x, y, level) {
  for (const l of level.lamps) {
    const dx = x - l.x;
    const dy = y - l.y;
    if (dx * dx + dy * dy <= l.r * l.r) return l;
  }
  return null;
}

export function isLit(x, y, level) {
  return lampAt(x, y, level) !== null;
}

// Refresh the player's lighting flags from its position.
export function updatePlayerLight(player, level) {
  player.hidden = inShadow(player.x, player.y, level);
  player.lit = isLit(player.x, player.y, level);
}
