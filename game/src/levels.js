// VELVET HOUR — the three missions. One job: every level's walls, cover,
// lamps, shadows, patrols, loot and exit. Patrol segments are drawn in open
// lanes only, so a guard walking straight to its next waypoint never meets
// a wall it cannot slide around.

const BORDER = [
  { x: 0, y: 64, w: 1280, h: 16 },
  { x: 0, y: 736, w: 1280, h: 16 },
  { x: 0, y: 64, w: 16, h: 688 },
  { x: 1264, y: 64, w: 16, h: 688 },
];

export const LEVELS = [
  {
    name: 'The Atrium',
    briefing: 'Tutorial wing. Three guards, four artifacts. Learn the cones.',
    par: 150,
    playerStart: { x: 90, y: 660 },
    exit: { x: 1180, y: 110 },
    walls: [
      ...BORDER,
      { x: 430, y: 220, w: 20, h: 160 },
      { x: 830, y: 380, w: 20, h: 160 },
      { x: 560, y: 520, w: 220, h: 20 },
    ],
    paintings: [
      { x: 120, y: 82, w: 90, h: 46, color: '#d94f30', title: 'Sunset Gull' },
      { x: 300, y: 82, w: 70, h: 46, color: '#2e86c1', title: 'Blue Hour' },
      { x: 700, y: 82, w: 90, h: 46, color: '#28b463', title: 'Green Wing' },
      { x: 1000, y: 82, w: 70, h: 46, color: '#af7ac5', title: 'Violet Veil' },
    ],
    lamps: [
      { x: 320, y: 200, r: 120 },
      { x: 960, y: 300, r: 120 },
      { x: 640, y: 560, r: 130 },
    ],
    shadows: [
      { x: 180, y: 480, w: 180, h: 120 },
      { x: 980, y: 480, w: 180, h: 120 },
      { x: 560, y: 120, w: 160, h: 90 },
    ],
    cover: [
      { kind: 'crate', x: 300, y: 300, w: 54, h: 54 },
      { kind: 'crate', x: 900, y: 250, w: 54, h: 54 },
      { kind: 'crate', x: 620, y: 330, w: 54, h: 54 },
      { kind: 'plant', x: 250, y: 620, r: 26 },
      { kind: 'plant', x: 1050, y: 600, r: 26 },
      { kind: 'plant', x: 640, y: 180, r: 24 },
      { kind: 'case', x: 520, y: 150, w: 90, h: 44 },
      { kind: 'case', x: 760, y: 600, w: 90, h: 44 },
    ],
    loot: [
      { x: 300, y: 180, name: 'Gullwing Mask' },
      { x: 980, y: 180, name: 'Amber Idol' },
      { x: 640, y: 640, name: 'Velvet Pearl' },
      { x: 1150, y: 640, name: 'Golden Quill' },
    ],
    guards: [
      { type: 'rook', waypoints: [[200, 200], [200, 500], [500, 500], [500, 200]] },
      { type: 'rook', waypoints: [[800, 150], [1100, 150], [1100, 300], [800, 300]] },
      { type: 'lamp', waypoints: [[640, 400]] },
    ],
    cameras: [],
  },
  {
    name: 'The Vault Wing',
    briefing: 'Six artifacts, a Swift runner and an Eye camera. Mind the vaults.',
    par: 180,
    playerStart: { x: 90, y: 690 },
    exit: { x: 640, y: 100 },
    walls: [
      ...BORDER,
      { x: 340, y: 180, w: 20, h: 200 },
      { x: 940, y: 420, w: 20, h: 200 },
      { x: 600, y: 150, w: 20, h: 120 },
      { x: 180, y: 540, w: 240, h: 20 },
      { x: 880, y: 220, w: 240, h: 20 },
    ],
    paintings: [
      { x: 120, y: 82, w: 90, h: 46, color: '#e67e22', title: 'Ember Gull' },
      { x: 420, y: 82, w: 70, h: 46, color: '#1abc9c', title: 'Teal Tide' },
      { x: 760, y: 82, w: 90, h: 46, color: '#c0392b', title: 'Red Wing' },
      { x: 1020, y: 82, w: 70, h: 46, color: '#f1c40f', title: 'Gold Hour' },
    ],
    lamps: [
      { x: 280, y: 180, r: 120 },
      { x: 1000, y: 180, r: 120 },
      { x: 640, y: 420, r: 130 },
      { x: 1100, y: 600, r: 110 },
    ],
    shadows: [
      { x: 140, y: 380, w: 170, h: 130 },
      { x: 960, y: 520, w: 200, h: 120 },
      { x: 520, y: 640, w: 180, h: 80 },
      { x: 60, y: 120, w: 140, h: 90 },
    ],
    cover: [
      { kind: 'crate', x: 250, y: 300, w: 54, h: 54 },
      { kind: 'crate', x: 700, y: 480, w: 54, h: 54 },
      { kind: 'crate', x: 1020, y: 300, w: 54, h: 54 },
      { kind: 'plant', x: 180, y: 660, r: 26 },
      { kind: 'plant', x: 1120, y: 640, r: 26 },
      { kind: 'plant', x: 640, y: 300, r: 24 },
      { kind: 'case', x: 480, y: 620, w: 90, h: 44 },
      { kind: 'case', x: 820, y: 150, w: 90, h: 44 },
      { kind: 'case', x: 1080, y: 430, w: 90, h: 44 },
    ],
    loot: [
      { x: 240, y: 150, name: 'Jade Scarab' },
      { x: 640, y: 120, name: 'Moon Opal' },
      { x: 1080, y: 150, name: 'Crimson Cameo' },
      { x: 1120, y: 420, name: 'Silver Swan' },
      { x: 340, y: 640, name: 'Ivory Fan' },
      { x: 640, y: 560, name: 'Star Sapphire' },
    ],
    guards: [
      { type: 'rook', waypoints: [[180, 160], [180, 480], [480, 480], [480, 160]] },
      { type: 'rook', waypoints: [[800, 180], [1150, 180], [1150, 400], [800, 400]] },
      { type: 'swift', waypoints: [[640, 220], [640, 640]] },
      { type: 'lamp', waypoints: [[640, 420]] },
    ],
    cameras: [
      { x: 1150, y: 90, angle: 2.2, range: 240, arc: 0.5, sweep: 0.45, sweepArc: 1.1 },
    ],
  },
  {
    name: "The Director's Gallery",
    briefing: 'Final wing. Captain Marlowe, two Eyes — and Curator Voss himself.',
    par: 240,
    playerStart: { x: 90, y: 690 },
    exit: { x: 640, y: 100 },
    walls: [
      ...BORDER,
      { x: 300, y: 180, w: 20, h: 180 },
      { x: 960, y: 180, w: 20, h: 180 },
      { x: 300, y: 500, w: 20, h: 160 },
      { x: 960, y: 500, w: 20, h: 160 },
      { x: 600, y: 320, w: 20, h: 120 },
    ],
    paintings: [
      { x: 120, y: 82, w: 90, h: 46, color: '#d94f30', title: 'Sunset Gull' },
      { x: 300, y: 82, w: 70, h: 46, color: '#2e86c1', title: 'Blue Hour' },
      { x: 520, y: 82, w: 90, h: 46, color: '#28b463', title: 'Green Wing' },
      { x: 740, y: 82, w: 70, h: 46, color: '#af7ac5', title: 'Violet Veil' },
      { x: 940, y: 82, w: 90, h: 46, color: '#e67e22', title: 'Ember Gull' },
      { x: 1120, y: 82, w: 70, h: 46, color: '#f1c40f', title: 'Gold Hour' },
    ],
    lamps: [
      { x: 250, y: 200, r: 120 },
      { x: 1030, y: 200, r: 120 },
      { x: 250, y: 600, r: 120 },
      { x: 1030, y: 600, r: 120 },
      { x: 640, y: 420, r: 140 },
    ],
    shadows: [
      { x: 120, y: 400, w: 170, h: 120 },
      { x: 990, y: 400, w: 170, h: 120 },
      { x: 540, y: 120, w: 200, h: 80 },
      { x: 540, y: 640, w: 200, h: 80 },
    ],
    cover: [
      { kind: 'crate', x: 200, y: 320, w: 54, h: 54 },
      { kind: 'crate', x: 1080, y: 320, w: 54, h: 54 },
      { kind: 'crate', x: 640, y: 620, w: 54, h: 54 },
      { kind: 'crate', x: 420, y: 600, w: 54, h: 54 },
      { kind: 'plant', x: 180, y: 660, r: 26 },
      { kind: 'plant', x: 1120, y: 660, r: 26 },
      { kind: 'plant', x: 640, y: 150, r: 24 },
      { kind: 'plant', x: 420, y: 380, r: 24 },
      { kind: 'case', x: 520, y: 120, w: 90, h: 44 },
      { kind: 'case', x: 760, y: 120, w: 90, h: 44 },
      { kind: 'case', x: 520, y: 660, w: 90, h: 44 },
      { kind: 'case', x: 760, y: 660, w: 90, h: 44 },
    ],
    loot: [
      { x: 200, y: 140, name: 'Gullwing Crown' },
      { x: 460, y: 140, name: 'Velvet Tiara' },
      { x: 820, y: 140, name: 'Golden Gull' },
      { x: 1100, y: 140, name: 'Opal Egg' },
      { x: 200, y: 660, name: 'Bronze Falcon' },
      { x: 460, y: 660, name: 'Pearl Dagger' },
      { x: 820, y: 660, name: 'Ruby Lens' },
      { x: 1100, y: 660, name: 'Emerald Hourglass' },
    ],
    guards: [
      { type: 'rook', waypoints: [[160, 160], [480, 160], [480, 420], [160, 420]] },
      { type: 'rook', waypoints: [[800, 160], [1120, 160], [1120, 420], [800, 420]] },
      { type: 'rook', waypoints: [[480, 560], [800, 560], [800, 680], [480, 680]] },
      { type: 'swift', waypoints: [[640, 200], [640, 640]] },
      { type: 'swift', waypoints: [[360, 640], [920, 640]] },
      { type: 'lamp', waypoints: [[640, 400]] },
      { type: 'captain', waypoints: [[420, 300], [860, 300], [860, 500], [420, 500]] },
      { type: 'voss', waypoints: [[560, 240], [720, 240], [720, 480], [560, 480]] },
    ],
    cameras: [
      { x: 90, y: 90, angle: 0.8, range: 240, arc: 0.5, sweep: 0.5, sweepArc: 1.2 },
      { x: 1190, y: 90, angle: 2.4, range: 240, arc: 0.5, sweep: 0.5, sweepArc: 1.2 },
    ],
  },
];

// Rects that block movement: walls, crates and display cases.
// Plants are soft cover: they block sight, never feet.
export function solidRects(level) {
  const rects = [...level.walls];
  for (const c of level.cover) {
    if (c.kind === 'crate' || c.kind === 'case') rects.push(c);
  }
  return rects;
}

// True when the point sits inside any solid rect (used by line-of-sight).
export function pointBlocked(x, y, level) {
  for (const r of solidRects(level)) {
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return true;
  }
  for (const c of level.cover) {
    if (c.kind === 'plant') {
      const dx = x - c.x;
      const dy = y - c.y;
      if (dx * dx + dy * dy <= c.r * c.r) return true;
    }
  }
  return false;
}
