// The wheel spins on the wall clock (:00, :15, :30, :45), so the TV and every
// phone on the leaderboard spin together without any server coordination.
export const WHEEL_INTERVAL_MS = 15 * 60 * 1000;

export const nextSpinTime = (now = Date.now()) =>
  Math.floor(now / WHEEL_INTERVAL_MS + 1) * WHEEL_INTERVAL_MS;

/**
 * Deterministic random numbers from a string seed. Seeding with the session
 * and spin time makes every screen pick the same victim and spin the same way.
 */
export function seededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
