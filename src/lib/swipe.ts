export type SwipeDir = 'right' | 'left' | 'up';

export const SWIPE_THRESHOLD = 110;

/** Past ±threshold horizontally the card flings; otherwise it springs back. */
export function swipeDecision(dx: number, threshold = SWIPE_THRESHOLD): SwipeDir | null {
  if (dx > threshold) return 'right';
  if (dx < -threshold) return 'left';
  return null;
}

/** 0..1 progress of a drag towards the threshold, used to lift the cards behind. */
export const dragProgress = (dx: number, threshold = SWIPE_THRESHOLD): number =>
  Math.min(1, Math.abs(dx) / threshold);

/** Resting transform for a card at a (possibly fractional) depth in the stack. */
export function stackTransform(depth: number): string {
  const d = Math.max(0, Math.min(depth, 2));
  return `translate3d(0, ${d * 14}px, 0) scale(${1 - d * 0.05})`;
}

/** Cards deeper than the third fade out of the stack. */
export const stackOpacity = (depth: number): number => Math.max(0, Math.min(1, 3 - depth));
