// VELVET HOUR — tuning, palette and guard types.
// One job: every number the game balances on, in one place.

export const VIEW = { w: 1280, h: 800 };
export const HUD_H = 64; // top HUD bar height
export const STRIP_H = 48; // bottom guard-roster strip height
export const PLAY = { x0: 16, y0: 80, x1: 1264, y1: 736 }; // walkable gallery bounds

export const PALETTE = {
  floorA: '#c89b6a',
  floorB: '#bd8f5c',
  floorLine: '#a87c4c',
  wall: '#f3e6c8',
  wallEdge: '#8a6d3b',
  wallTrim: '#d9b96a',
  player: '#0e7c7b',
  playerDark: '#0a5a59',
  guard: '#c0392b',
  guardDark: '#7e241b',
  gold: '#e8b64c',
  cream: '#f7efdd',
  ink: '#241a12',
  shadow: 'rgba(16, 26, 64, 0.42)',
  lampPool: 'rgba(255, 190, 90, 0.20)',
  coneCalm: 'rgba(255, 214, 64, 0.30)',
  coneWary: 'rgba(255, 150, 40, 0.36)',
  coneAlert: 'rgba(255, 64, 48, 0.40)',
  exitGlow: '#39d353',
  exitDim: '#2c7a3f',
};

// Guard types: label + one-line behaviour (shown on the title roster),
// plus the numbers that drive patrol, vision and suspicion.
export const GUARD_TYPES = {
  rook: {
    label: 'Rook',
    behavior: 'Patrols a fixed loop, steady cone',
    color: '#c0392b',
    speed: 72,
    range: 215,
    arc: 0.55,
    fill: 30,
    radius: 15,
  },
  swift: {
    label: 'Swift',
    behavior: 'Fast runner, short cone, chases noise',
    color: '#d35400',
    speed: 132,
    range: 165,
    arc: 0.62,
    fill: 38,
    radius: 13,
  },
  lamp: {
    label: 'Lamp',
    behavior: 'Sentry, stands and sweeps a long beam',
    color: '#8e44ad',
    speed: 0,
    range: 265,
    arc: 0.42,
    fill: 34,
    radius: 15,
  },
  captain: {
    label: 'Captain Marlowe',
    behavior: 'Wide cone, calls nearby guards when alerted',
    color: '#922b21',
    speed: 84,
    range: 245,
    arc: 0.72,
    fill: 36,
    radius: 16,
  },
  eye: {
    label: 'Eye',
    behavior: 'Camera, fixed rotating cone, raises the alarm',
    color: '#2e4053',
    speed: 0,
    range: 240,
    arc: 0.5,
    fill: 55,
    radius: 12,
  },
  voss: {
    label: 'Curator Voss',
    behavior: 'BOSS — huge cone, calls ALL guards when alerted',
    color: '#5b2c6f',
    speed: 46,
    range: 300,
    arc: 0.85,
    fill: 42,
    radius: 19,
  },
};

export const PLAYER = {
  radius: 14,
  walkSpeed: 178,
  runSpeed: 308,
  noiseRadius: 150,
  noiseEvery: 0.26,
};

export const SUSPICION = {
  warnAt: 50, // "?" — guard investigates
  alertAt: 100, // "!" — guard chases, alarm sounds
  drain: 14, // per second while unseen
  drainShadow: 26, // per second while unseen AND in shadow
  litMult: 1.6, // player standing in a lamp pool
  shadowMult: 0.45, // player hidden in shadow
  closeBonus: 0.35, // extra fill when the guard is close
};

export const SCORE = {
  loot: 100,
  ghostBonus: 500,
  timeBonusPerSec: 5,
};
