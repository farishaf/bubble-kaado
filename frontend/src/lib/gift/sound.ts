let ctx: AudioContext | null = null;
let muted = false;

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, at: number, dur: number, type: OscillatorType, vol: number) {
  const c = ac();
  if (!c || muted) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  const t = c.currentTime + at;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

// Recorded one-shots live in /public/sfx. One <audio> per name: retriggering
// restarts the sample rather than layering it, which is what a puzzle click wants.
const samples: Record<string, HTMLAudioElement> = {};

function sample(name: string, vol: number) {
  if (muted || typeof Audio === 'undefined') return;
  let el = samples[name];
  if (!el) {
    el = new Audio(`/sfx/${name}.mp3`);
    el.preload = 'auto';
    samples[name] = el;
  }
  el.volume = vol;
  el.currentTime = 0;
  // ponytail: a browser that blocks the play() promise just stays silent
  void el.play().catch(() => {});
}

export const giftSound = {
  setMuted(v: boolean) {
    muted = v;
  },
  /** puzzle piece dropped in the right slot */
  right() {
    sample('right', 0.45);
  },
  /** puzzle piece dropped in the wrong slot */
  wrong() {
    sample('wrong', 0.4);
  },
  /** newspaper clippings bursting out of the box */
  paper() {
    sample('paper', 0.5);
  },
  /** gift box hitting the ground */
  thud() {
    tone(90, 0, 0.22, 'sine', 0.12);
    tone(55, 0.02, 0.3, 'triangle', 0.09);
  },
  /** delivery truck pulling away */
  whoosh() {
    tone(220, 0, 0.5, 'sine', 0.03);
    tone(330, 0.08, 0.4, 'sine', 0.02);
  },
  click() {
    tone(660, 0, 0.07, 'triangle', 0.05);
  },
  open() {
    tone(392, 0, 0.12, 'triangle', 0.06);
    tone(587, 0.09, 0.16, 'triangle', 0.06);
  },
  no(count: number) {
    const base = Math.max(160, 340 - count * 36);
    tone(base, 0, 0.13, 'sine', 0.07);
    tone(base * 0.78, 0.12, 0.2, 'sine', 0.07);
  },
  yes() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => tone(f, i * 0.09, 0.22, 'triangle', 0.07));
    tone(1318.5, notes.length * 0.09, 0.4, 'triangle', 0.05);
  },
};
