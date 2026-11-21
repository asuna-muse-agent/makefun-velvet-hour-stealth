// VELVET HOUR — sound. One job: every sound is synthesized with WebAudio,
// no audio files: footsteps, loot chime, alarm sting, win/lose stingers and
// the near-miss heartbeat. Silent until the first key or click unlocks it.

export function createAudio() {
  let ctx = null;
  let master = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.45;
        master.connect(ctx.destination);
      } catch {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') void ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, gain, delay = 0, slideTo = null, pan = 0) {
    if (muted || !ensure()) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    if (p) {
      p.pan.value = Math.max(-1, Math.min(1, pan));
      osc.connect(g).connect(p).connect(master);
    } else {
      osc.connect(g).connect(master);
    }
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  return {
    unlock() {
      ensure();
    },
    get muted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      if (master) master.gain.value = muted ? 0 : 0.45;
      return muted;
    },
    // Soft player step; a touch louder while running.
    step(running, _x) {
      tone(running ? 190 : 150, 0.07, 'triangle', running ? 0.05 : 0.035);
    },
    // Guard step, panned by which side of the player the guard walks on.
    guardStep(guardX, playerX) {
      const pan = Math.max(-0.8, Math.min(0.8, (guardX - playerX) / 500));
      tone(120, 0.08, 'triangle', 0.05, 0, null, pan);
    },
    noiseRing() {
      tone(520, 0.12, 'sine', 0.05, 0, 340);
    },
    chime() {
      tone(880, 0.16, 'sine', 0.12);
      tone(1318, 0.24, 'sine', 0.1, 0.09);
    },
    alarmSting() {
      tone(620, 0.18, 'square', 0.07);
      tone(466, 0.22, 'square', 0.07, 0.16);
      tone(620, 0.26, 'square', 0.07, 0.34);
    },
    heartbeat() {
      tone(70, 0.14, 'sine', 0.16);
      tone(62, 0.16, 'sine', 0.13, 0.18);
    },
    win() {
      [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.3, 'sine', 0.11, i * 0.12));
    },
    lose() {
      [392, 330, 262, 196].forEach((f, i) => tone(f, 0.32, 'triangle', 0.1, i * 0.14));
    },
  };
}
