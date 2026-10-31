// Sounds are synthesized with Web Audio, so there are no files to ship.
// Browsers keep audio locked until the first tap or key press on the page.

let context: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!context) {
    const AudioContextClass =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return null;
    context = new AudioContextClass();
  }
  return context;
}

export const isAudioUnlocked = () => audio()?.state === "running";

/** Resumes audio on the first user gesture; calls back once it's running. */
export function unlockAudioOnGesture(onUnlocked: () => void) {
  const events = ["pointerdown", "keydown", "touchstart"] as const;
  const resume = () => {
    audio()
      ?.resume()
      .then(() => {
        if (!isAudioUnlocked()) return;
        events.forEach((e) => window.removeEventListener(e, resume));
        onUnlocked();
      });
  };
  events.forEach((e) => window.addEventListener(e, resume));
  return () => events.forEach((e) => window.removeEventListener(e, resume));
}

function ready() {
  const ctx = audio();
  return ctx && ctx.state === "running" ? ctx : null;
}

function envelope(
  ctx: AudioContext,
  peak: number,
  start: number,
  attack: number,
  release: number,
) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + attack + release);
  gain.connect(ctx.destination);
  return gain;
}

/** A dry click as the pointer passes a segment. */
export function playTick() {
  const ctx = ready();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(1500, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.03);
  osc.connect(envelope(ctx, 0.18, now, 0.002, 0.04));
  osc.start(now);
  osc.stop(now + 0.06);
}

function organChord(
  ctx: AudioContext,
  freqs: number[],
  start: number,
  length: number,
  peak: number,
) {
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1600;
  filter.connect(envelope(ctx, peak, start, 0.03, length));
  for (const freq of freqs) {
    for (const [type, mult] of [
      ["sawtooth", 1],
      ["square", 0.5],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq * mult;
      osc.detune.value = (Math.random() - 0.5) * 12;
      osc.connect(filter);
      osc.start(start);
      osc.stop(start + length + 0.1);
    }
  }
}

/** Haunted-organ sting as the wheel appears: dun, dun, duuun. */
export function playIntro() {
  const ctx = ready();
  if (!ctx) return;
  const now = ctx.currentTime;
  // D minor with a sharp seventh: the classic creepy organ chord
  const chord = [146.83, 174.61, 220, 277.18];
  organChord(ctx, chord, now, 0.35, 0.09);
  organChord(
    ctx,
    chord.map((f) => f * 0.94),
    now + 0.45,
    0.35,
    0.09,
  );
  organChord(
    ctx,
    chord.map((f) => f * 0.89),
    now + 0.9,
    2.2,
    0.11,
  );
}

/** Thunder, a gong and a ghostly theremin wail for the victim. */
export function playReveal() {
  const ctx = ready();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Thunder: decaying low noise
  const length = 3;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const rumble = ctx.createBiquadFilter();
  rumble.type = "lowpass";
  rumble.frequency.value = 350;
  noise.connect(rumble);
  rumble.connect(envelope(ctx, 0.9, now, 0.02, length));
  noise.start(now);

  // Gong
  for (const [freq, peak] of [
    [98, 0.3],
    [196.5, 0.12],
    [293, 0.06],
  ]) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(envelope(ctx, peak, now, 0.01, 3.5));
    osc.start(now);
    osc.stop(now + 3.6);
  }

  // Theremin: a wobbling glide up and back down
  const theremin = ctx.createOscillator();
  theremin.type = "sine";
  const start = now + 0.4;
  theremin.frequency.setValueAtTime(330, start);
  theremin.frequency.exponentialRampToValueAtTime(880, start + 1.2);
  theremin.frequency.exponentialRampToValueAtTime(260, start + 3);
  const vibrato = ctx.createOscillator();
  vibrato.frequency.value = 6;
  const depth = ctx.createGain();
  depth.gain.value = 14;
  vibrato.connect(depth);
  depth.connect(theremin.frequency);
  theremin.connect(envelope(ctx, 0.12, start, 0.4, 2.8));
  theremin.start(start);
  vibrato.start(start);
  theremin.stop(start + 3.3);
  vibrato.stop(start + 3.3);

  // The organ again, low and final
  organChord(ctx, [73.42, 87.31, 110], now + 0.1, 3, 0.07);
}
