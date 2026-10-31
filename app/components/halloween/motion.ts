// Fired on window so decorations outside the leaderboard can react to the party
export const SHOT_EVENT = "slurp:shot";
export const THUNDER_EVENT = "slurp:thunder";
export const WHEEL_EVENT = "slurp:wheel";

export const rand = (min: number, max: number) =>
  min + Math.random() * (max - min);

export const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Plays a Web Animation and keeps its end state on the element afterwards, so
 * chained steps start where the previous one ended. Resolves (never rejects)
 * when it finishes or is cancelled.
 */
export function play(
  el: HTMLElement,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
): Promise<void> {
  const animation = el.animate(keyframes, options);
  return animation.finished.then(
    () => {
      const last = keyframes[keyframes.length - 1];
      if (last.transform !== undefined)
        el.style.transform = String(last.transform);
      if (last.opacity !== undefined) el.style.opacity = String(last.opacity);
    },
    () => {},
  );
}
