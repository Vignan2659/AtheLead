export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Quartic ease-out, matching the CSS easing's feel for JS tweens. */
export const easeOutQuart = (k: number): number => 1 - Math.pow(1 - k, 4);

/**
 * Tween a number with requestAnimationFrame. Returns a cancel function.
 * Calls `apply` once with `to` immediately when reduced motion is on.
 */
export function tween(
  from: number,
  to: number,
  duration: number,
  apply: (v: number) => void,
): () => void {
  if (duration <= 0 || prefersReducedMotion() || from === to) {
    apply(to);
    return () => {};
  }
  let raf = 0;
  let start = 0;
  const step = (t: number) => {
    if (!start) start = t;
    const k = Math.min(1, (t - start) / duration);
    apply(from + (to - from) * easeOutQuart(k));
    if (k < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}
