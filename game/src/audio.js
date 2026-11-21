// Sound, made with the Web Audio API only: no audio files, nothing to download.
// A find is a bright two-note chime, a miss a low buzz, a hint a soft pluck, a
// level clear a rising arpeggio. The context is created on the first user gesture.

export function createAudio() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context) return context;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new AudioContext();
    } catch {
      context = null;
    }
    return context;
  }

  function tone(freq, at, dur, type, gain) {
    const ctx = ensure();
    if (!ctx || muted) return;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0, ctx.currentTime + at);
    amp.gain.linearRampToValueAtTime(gain, ctx.currentTime + at + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + dur);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(ctx.currentTime + at);
    osc.stop(ctx.currentTime + at + dur + 0.05);
  }

  return {
    unlock() {
      const ctx = ensure();
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    get muted() {
      return muted;
    },
    find() {
      tone(880, 0, 0.18, 'sine', 0.18);
      tone(1318, 0.09, 0.28, 'sine', 0.18);
    },
    miss() {
      tone(140, 0, 0.25, 'sawtooth', 0.08);
    },
    hint() {
      tone(660, 0, 0.15, 'triangle', 0.12);
      tone(990, 0.07, 0.2, 'triangle', 0.1);
    },
    clear() {
      [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.3, 'sine', 0.16));
    },
    win() {
      [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => tone(f, i * 0.12, 0.4, 'sine', 0.16));
    },
    tick() {
      tone(1200, 0, 0.05, 'square', 0.04);
    },
  };
}
